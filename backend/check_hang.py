import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from app.services.chatbot_service import _fetch_stock_context, chat
from app.services.prediction_service import prediction_service

async def main():
    print("Testing direct prediction service call...")
    try:
        pred = await prediction_service.get_prediction("RELIANCE.NS")
        print(f"Prediction result: {pred is not None}")
    except Exception as e:
        print(f"Prediction service error: {e}")

    print("\nTesting _fetch_stock_context...")
    try:
        context = await _fetch_stock_context(["RELIANCE.NS"])
        print(f"Context fetched: {len(context)} characters")
        print(context)
    except Exception as e:
        print(f"Context error: {e}")

    print("\nTesting chat (calls LLMs)...")
    try:
        task = asyncio.create_task(chat("What is the signal for Reliance?"))
        # Timeout after 20 seconds so we know if it hangs
        res = await asyncio.wait_for(task, timeout=20.0)
        print(f"Chat response: {res}")
    except asyncio.TimeoutError:
        print("Chat timed out after 20 seconds!")
    except Exception as e:
        print(f"Chat error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
