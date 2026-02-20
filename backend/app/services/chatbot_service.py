"""
ArthAI Chatbot Service — Gemini + Ollama Fallback with RAG
"""
import re
import json
import uuid
import httpx
from pathlib import Path
from typing import Optional
from datetime import datetime
from collections import OrderedDict
from loguru import logger
from app.core.config import settings

# ── Knowledge Base ────────────────────────────────────────────────────
LEARN_HUB_DIR = Path(__file__).resolve().parent.parent.parent.parent / "learn_hub"

STOCK_SYMBOLS = [
    ("RELIANCE.NS", "Reliance Industries"),
    ("TCS.NS", "Tata Consultancy Services"),
    ("HDFCBANK.NS", "HDFC Bank"),
    ("INFY.NS", "Infosys"),
    ("ICICIBANK.NS", "ICICI Bank"),
    ("HINDUNILVR.NS", "Hindustan Unilever"),
    ("ITC.NS", "ITC Limited"),
    ("BHARTIARTL.NS", "Bharti Airtel"),
    ("SBIN.NS", "State Bank of India"),
    ("LICI.NS", "LIC India"),
    ("LT.NS", "Larsen & Toubro"),
    ("BAJFINANCE.NS", "Bajaj Finance"),
    ("MARUTI.NS", "Maruti Suzuki"),
    ("ASIANPAINT.NS", "Asian Paints"),
    ("AXISBANK.NS", "Axis Bank"),
    ("TITAN.NS", "Titan Company"),
    ("SUNPHARMA.NS", "Sun Pharma"),
    ("ULTRACEMCO.NS", "UltraTech Cement"),
    ("NTPC.NS", "NTPC"),
]

# Build name→symbol lookup (lowercase for matching)
_NAME_TO_SYMBOL: dict[str, str] = {}
for sym, name in STOCK_SYMBOLS:
    _NAME_TO_SYMBOL[name.lower()] = sym
    # Also add short versions: "reliance", "tcs", "hdfc"
    short = sym.split(".")[0].lower()
    _NAME_TO_SYMBOL[short] = sym
    # Also first word of name
    first_word = name.split()[0].lower()
    if first_word not in ("state", "larsen"):  # avoid ambiguous
        _NAME_TO_SYMBOL[first_word] = sym


def _load_knowledge_base() -> str:
    """Load all markdown files from learn_hub as RAG context."""
    chunks = []
    if not LEARN_HUB_DIR.exists():
        logger.warning(f"LearnHub dir not found at {LEARN_HUB_DIR}")
        return ""

    for md_file in sorted(LEARN_HUB_DIR.glob("*.md")):
        try:
            content = md_file.read_text(encoding="utf-8")
            # Trim to first 2000 chars per file to save tokens
            chunks.append(f"### {md_file.stem}\n{content[:2000]}")
        except Exception as e:
            logger.error(f"Failed to read {md_file}: {e}")

    return "\n\n".join(chunks)


KNOWLEDGE_BASE = _load_knowledge_base()

SYSTEM_PROMPT = f"""You are ArthAI Assistant — the AI helper for the FinPredict stock prediction platform.

## Your Capabilities
- Answer questions about stocks, trading, investing, and financial concepts
- Provide information about stocks tracked on the platform
- Explain AI predictions and confidence scores
- Teach trading concepts from beginner to advanced level
- Give investment suggestions with proper disclaimers

## Tracked Stocks
{chr(10).join(f"- {name} ({sym})" for sym, name in STOCK_SYMBOLS)}

## Platform Knowledge
{KNOWLEDGE_BASE[:6000]}

## Rules
1. Be concise but helpful. Use bullet points and formatting.
2. When discussing specific stocks, reference real data if provided in the context.
3. Always add a disclaimer when giving investment advice: "This is AI-generated analysis, not financial advice."
4. If you don't know something, say so honestly.
5. Keep responses under 300 words unless the user asks for detailed explanations.
6. Use emojis sparingly for readability (📈 📉 💡 ⚠️).
"""


def _detect_stock_mentions(message: str) -> list[str]:
    """Detect stock symbols mentioned in user message."""
    msg_lower = message.lower()
    detected = []
    for name_key, sym in _NAME_TO_SYMBOL.items():
        if name_key in msg_lower and sym not in detected:
            detected.append(sym)
    return detected[:3]  # Max 3 stocks per query


async def _fetch_stock_context(symbols: list[str]) -> str:
    """Fetch live stock data from the internal prediction service."""
    if not symbols:
        return ""

    context_parts = []
    from app.services.prediction_service import prediction_service
    
    for sym in symbols:
        try:
            pred = await prediction_service.get_prediction(sym)
            if pred:
                context_parts.append(
                    f"**{sym} Live Data:**\n"
                    f"- Current Price: ₹{pred.current_price}\n"
                    f"- Signal: {pred.signal}\n"
                    f"- Confidence: {pred.overall_confidence}%\n"
                    f"- Predictions: {json.dumps({k: v.model_dump() for k, v in pred.predictions.items()}, indent=2)}"
                )
            else:
                context_parts.append(f"**{sym}:** Prediction data not available.")
        except Exception as e:
            logger.debug(f"Failed to fetch data for {sym}: {e}")
            context_parts.append(f"**{sym}:** Unable to fetch live data.")

    return "\n\n".join(context_parts)


# ── Session Memory ────────────────────────────────────────────────────
class _SessionStore:
    """Simple in-memory conversation store with LRU eviction."""

    def __init__(self, max_sessions: int = 200, max_messages: int = 10):
        self._store: OrderedDict[str, list[dict]] = OrderedDict()
        self._max_sessions = max_sessions
        self._max_messages = max_messages

    def get(self, session_id: str) -> list[dict]:
        if session_id in self._store:
            self._store.move_to_end(session_id)
            return self._store[session_id]
        return []

    def add(self, session_id: str, role: str, content: str):
        if session_id not in self._store:
            if len(self._store) >= self._max_sessions:
                self._store.popitem(last=False)  # evict oldest
            self._store[session_id] = []
        
        self._store[session_id].append({"role": role, "content": content})
        # Trim to max messages
        if len(self._store[session_id]) > self._max_messages:
            self._store[session_id] = self._store[session_id][-self._max_messages:]
        self._store.move_to_end(session_id)


_sessions = _SessionStore()


# ── LLM Backends ─────────────────────────────────────────────────────
async def _call_gemini(messages: list[dict], system: str) -> Optional[str]:
    """Call Google Gemini API."""
    api_key = settings.Gemini_API_KEY
    if not api_key:
        logger.warning("Gemini API key not configured")
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
                "gemini-2.5-flash",
            system_instruction=system,
        )

        # Build Gemini chat history
        history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            history.append({"role": role, "parts": [msg["content"]]})

        import asyncio
        chat = model.start_chat(history=history)
        response = await asyncio.wait_for(
            chat.send_message_async(messages[-1]["content"]),
            timeout=15.0
        )
        return response.text

    except Exception as e:
        logger.exception(f"Gemini API error: {e}")
        return None


async def _call_ollama(messages: list[dict], system: str) -> Optional[str]:
    """Call local Ollama as fallback."""
    try:
        ollama_messages = [{"role": "system", "content": system}]
        for msg in messages:
            ollama_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        async with httpx.AsyncClient(timeout=300.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_HOST}/api/chat",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "messages": ollama_messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 512,
                    }
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("message", {}).get("content", "")

    except Exception as e:
        logger.error(f"Ollama error: {e}")
        return None


# ── Public API ────────────────────────────────────────────────────────
async def chat(message: str, session_id: Optional[str] = None) -> dict:
    """
    Process a chat message with RAG context, Gemini primary, Ollama fallback.
    Returns: { reply, session_id, source, stocks_referenced }
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    # 1. Detect stock mentions and fetch live data
    mentioned_stocks = _detect_stock_mentions(message)
    stock_context = await _fetch_stock_context(mentioned_stocks)

    # 2. Build augmented system prompt
    augmented_system = SYSTEM_PROMPT
    if stock_context:
        augmented_system += f"\n\n## Live Stock Data (just fetched)\n{stock_context}"

    # 3. Get conversation history + append new user message
    _sessions.add(session_id, "user", message)
    history = _sessions.get(session_id)

    # 4. Try Gemini first, fallback to Ollama
    source = "gemini"
    reply = await _call_gemini(history, augmented_system)

    if reply is None:
        source = "ollama"
        logger.info("Gemini failed, falling back to Ollama...")
        reply = await _call_ollama(history, augmented_system)

    if reply is None:
        reply = "I'm sorry, I'm having trouble connecting to my AI backends right now. Please try again in a moment. 🔧"
        source = "error"

    # 5. Store assistant reply in session
    _sessions.add(session_id, "assistant", reply)

    return {
        "reply": reply,
        "session_id": session_id,
        "source": source,
        "stocks_referenced": mentioned_stocks,
        "timestamp": datetime.now().isoformat(),
    }
