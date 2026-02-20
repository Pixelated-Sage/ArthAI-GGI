import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from app.services.chatbot_service import _call_gemini

async def main():
    messages = [{"role": "user", "content": "What is the signal for Reliance?"}]
    system = "You are ArthAI Assistant..."
    try:
        res = await _call_gemini(messages, system)
        print("Response:", res)
    except Exception as e:
        print(f"Test caught: {type(e)} : {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
