import asyncio
from app.services.chatbot_service import _call_gemini
import logging
logging.basicConfig(level=logging.DEBUG)

async def main():
    messages = [{"role": "user", "content": "Hello"}]
    system = "You are a helpful assistant."
    try:
        res = await _call_gemini(messages, system)
        print("Response:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
