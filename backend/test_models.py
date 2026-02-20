import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from app.core.config import settings
import google.generativeai as genai

async def main():
    genai.configure(api_key=settings.Gemini_API_KEY)
    
    models_to_test = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-pro-latest"
    ]
    
    for m in models_to_test:
        print(f"Testing {m}...")
        try:
            model = genai.GenerativeModel(m)
            response = await model.generate_content_async("Say 'hello test'")
            print(f"Success with {m}: {response.text}")
            break
        except Exception as e:
            print(f"Failed {m}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
