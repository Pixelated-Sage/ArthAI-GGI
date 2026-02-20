import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

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

if __name__ == "__main__":
    asyncio.run(main())
