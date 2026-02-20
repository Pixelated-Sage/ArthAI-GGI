
from pathlib import Path
import sys

MODEL_DIR = Path("/data/models/custom/finpredict")
SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "HINDUNILVR.NS", "ITC.NS", "BHARTIARTL.NS", "SBIN.NS", "LICI.NS",
    "LT.NS", "BAJFINANCE.NS", "MARUTI.NS", "ASIANPAINT.NS", "AXISBANK.NS",
    "TITAN.NS", "SUNPHARMA.NS", "ULTRACEMCO.NS", "NTPC.NS"
]

print(f"Checking {len(SYMBOLS)} symbols in {MODEL_DIR}...")
valid = []
invalid = []

for sym in SYMBOLS:
    d = MODEL_DIR / sym
    # Check for hybrid config and scaler
    has_config = (d / "hybrid_config.json").exists()
    has_scaler = (d / "scaler.pkl").exists()
    
    if d.exists() and has_config and has_scaler:
        valid.append(sym)
    else:
        invalid.append(f"{sym} (Exists: {d.exists()}, Config: {has_config}, Scaler: {has_scaler})")

print("\n✅ VALID MODELS:")
for s in valid:
    print(s)

print("\n❌ INVALID/UNTRAINED MODELS:")
for s in invalid:
    print(s)
