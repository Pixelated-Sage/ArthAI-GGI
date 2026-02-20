from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.chatbot_service import chat as chatbot_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    source: str  # "gemini" | "ollama" | "error"
    stocks_referenced: list[str] = []
    timestamp: str


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """
    Send a message to ArthAI Assistant.
    Supports stock queries, trading education, and investment guidance.
    """
    try:
        result = await chatbot_chat(
            message=req.message,
            session_id=req.session_id,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
