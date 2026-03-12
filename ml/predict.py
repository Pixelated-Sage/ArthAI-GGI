"""
FinPredict — Terminal Prediction Tool
======================================
Fetch live data and generate predictions for any stock.

Usage:
    python predict.py                       # Interactive picker
    python predict.py RELIANCE.NS           # Direct symbol
    python predict.py RELIANCE.NS --v1      # Use V1 models
"""

import argparse
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent / "src"))

from inference import FinPredictInference, MODEL_DIR

BASE_DIR = Path(__file__).parent
V1_DIR = BASE_DIR / "models" / "finpredict"
V2_DIR = BASE_DIR / "models" / "finpredict_v2"


def get_available_symbols(model_dir):
    """List all symbols with trained models in a directory."""
    if not model_dir.exists():
        return []
    return sorted([
        d.name for d in model_dir.iterdir()
        if d.is_dir() and (d / "scaler.pkl").exists()
    ])


def pick_symbol(symbols):
    """Interactive symbol picker."""
    print("\n┌─────────────────────────────────────────┐")
    print("│    📈 FinPredict — Stock Selector       │")
    print("└─────────────────────────────────────────┘\n")

    cols = 3
    for i, sym in enumerate(symbols, 1):
        tag = sym.replace(".NS", "")
        end = "\n" if i % cols == 0 else ""
        print(f"  [{i:2d}] {tag:<16}", end=end)
    if len(symbols) % cols != 0:
        print()

    print()
    while True:
        choice = input("  Select stock (number or symbol): ").strip()
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(symbols):
                return symbols[idx]
        else:
            sym = choice.upper()
            if not sym.endswith(".NS"):
                sym += ".NS"
            if sym in symbols:
                return sym
        print("  ❌ Invalid choice, try again.")


def display_prediction(result, symbol, version):
    """Pretty-print prediction result."""
    print(f"\n{'═'*60}")
    print(f"  📊 PREDICTION: {symbol}  [Model: {version}]")
    print(f"  🕐 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'═'*60}")

    current = result.get("current_price")
    if current:
        print(f"\n  💰 Current Price: ₹{current:,.2f}")

    horizons = result.get("predictions", result)
    for key in ["1d", "7d", "30d", 1, 7, 30]:
        pred = horizons.get(key)
        if not pred:
            continue

        h_label = f"{key}" if isinstance(key, str) else f"{key}d"
        signal = pred.get("signal", "N/A")
        change = pred.get("change_percent", 0)
        conf = pred.get("confidence", 0)
        predicted = pred.get("predicted_price")

        # Color-coded signal
        if "BUY" in str(signal):
            icon = "🟢"
        elif "SELL" in str(signal):
            icon = "🔴"
        else:
            icon = "🟡"

        print(f"\n  ── {h_label} Forecast ──")
        print(f"     {icon} Signal:     {signal}")
        if predicted:
            print(f"     📍 Target:     ₹{predicted:,.2f}")
        print(f"     📈 Change:     {change:+.2f}%")
        print(f"     🎯 Confidence: {conf*100:.0f}%")

    reasoning = result.get("reasoning")
    if reasoning:
        print(f"\n  ── AI Reasoning ──")
        # Wrap text
        words = reasoning.split()
        line = "     "
        for w in words:
            if len(line) + len(w) > 58:
                print(line)
                line = "     "
            line += w + " "
        if line.strip():
            print(line)

    print(f"\n{'═'*60}\n")


def main():
    parser = argparse.ArgumentParser(description="FinPredict Terminal Prediction")
    parser.add_argument("symbol", nargs="?", help="Stock symbol (e.g. RELIANCE.NS)")
    parser.add_argument("--v1", action="store_true", help="Use V1 models (default: V2)")
    args = parser.parse_args()

    # Select model directory
    if args.v1:
        model_dir = V1_DIR
        version = "V1"
    else:
        model_dir = V2_DIR
        version = "V2"

    symbols = get_available_symbols(model_dir)
    if not symbols:
        # Fallback to other version
        alt = V1_DIR if version == "V2" else V2_DIR
        alt_v = "V1" if version == "V2" else "V2"
        symbols = get_available_symbols(alt)
        if symbols:
            print(f"⚠️  No {version} models found. Falling back to {alt_v}.")
            model_dir = alt
            version = alt_v
        else:
            print("❌ No trained models found in either finpredict/ or finpredict_v2/")
            sys.exit(1)

    # Pick symbol
    if args.symbol:
        symbol = args.symbol.upper()
        if not symbol.endswith(".NS"):
            symbol += ".NS"
        if symbol not in symbols:
            print(f"❌ No model for {symbol}. Available: {', '.join(symbols[:10])}...")
            sys.exit(1)
    else:
        symbol = pick_symbol(symbols)

    print(f"\n🔮 Running prediction for {symbol} using {version} models...")

    # Monkey-patch MODEL_DIR for this run
    import inference
    inference.MODEL_DIR = model_dir

    predictor = FinPredictInference(symbol)
    predictor.load_models()
    result = predictor.predict_live()

    display_prediction(result, symbol, version)

    # Save result
    out = model_dir / symbol / "last_prediction.json"
    with open(out, "w") as f:
        json.dump(result, f, indent=2, default=str)
    print(f"💾 Saved to {out}")


if __name__ == "__main__":
    main()
