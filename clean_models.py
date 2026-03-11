
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "ml" / "models" / "finpredict"
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
