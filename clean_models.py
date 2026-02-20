
import shutil
from pathlib import Path

MODEL_DIR = Path("/data/models/custom/finpredict")
unwanted = [
    "AAPL", "BNB", "BTC", "ETH", "GOOGL", "MSFT", "NVDA", "TSLA",
    "TATAMOTORS.NS" 
]

print(f"Cleaning unwanted models from {MODEL_DIR}...")

for stock in unwanted:
    path = MODEL_DIR / stock
    if path.exists():
        try:
            shutil.rmtree(path)
            print(f"✅ Removed {stock}")
        except Exception as e:
            print(f"❌ Failed to remove {stock}: {e}")
    else:
        print(f"ℹ️ {stock} not found (already clean)")

print("\nModel directory cleanup complete.")
