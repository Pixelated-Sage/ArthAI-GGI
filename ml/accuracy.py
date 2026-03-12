"""
FinPredict — Accuracy Checker
==============================
Compares model predictions against actual market data to calculate
real-world accuracy metrics.

Usage:
    python accuracy.py                          # Check all symbols (V2)
    python accuracy.py RELIANCE.NS              # Single symbol
    python accuracy.py --v1                     # Check V1 models
    python accuracy.py --compare                # Compare V1 vs V2
"""

import argparse
import sys
import json
import numpy as np
import pandas as pd
import yfinance as yf
from pathlib import Path
from datetime import datetime, timedelta

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent / "src"))

BASE_DIR = Path(__file__).parent
V1_DIR = BASE_DIR / "models" / "finpredict"
V2_DIR = BASE_DIR / "models" / "finpredict_v2"


def get_symbols(model_dir):
    if not model_dir.exists():
        return []
    return sorted([
        d.name for d in model_dir.iterdir()
        if d.is_dir() and (d / "scaler.pkl").exists()
    ])


def check_accuracy(symbol, model_dir, version_label):
    """
    Backtest: Load model, predict on recent data, compare to actual prices.
    Uses walk-forward validation on the last 30 trading days.
    """
    import inference
    inference.MODEL_DIR = model_dir

    from inference import FinPredictInference

    try:
        predictor = FinPredictInference(symbol)
        predictor.load_models()
    except Exception as e:
        return {"symbol": symbol, "version": version_label, "error": str(e)}

    # Download recent data (2 years — need 200+ rows for EMA-200 warmup)
    print(f"  📥 Downloading data for {symbol}...")
    df = yf.download(symbol, period="2y", interval="1d", progress=False)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df.columns = [c.lower() for c in df.columns]

    if len(df) < 100:
        return {"symbol": symbol, "version": version_label, "error": "Insufficient data"}

    print(f"  📊 Downloaded {len(df)} rows (date range: {df.index[0].date()} → {df.index[-1].date()})")

    # Get NIFTY 50 market data for context
    nifty = yf.download("^NSEI", period="2y", interval="1d", progress=False)
    if isinstance(nifty.columns, pd.MultiIndex):
        nifty.columns = nifty.columns.get_level_values(0)
    nifty.columns = [c.lower() for c in nifty.columns]

    # Walk-forward: predict on data up to day T, compare to actual at T+1, T+7, T+30
    results_1d = []
    results_7d = []

    # Use the last 20 trading days as test points
    test_days = 20
    total_rows = len(df)
    errors = 0

    for i in range(test_days, 0, -1):
        cutoff = total_rows - i
        if cutoff < 250:  # Need at least 250 days for EMA-200 warmup + sequence
            continue

        historical = df.iloc[:cutoff].copy()
        actual_close_at_cutoff = historical['close'].iloc[-1]

        try:
            result = predictor.predict_from_dataframe(historical, market_df=nifty)
        except Exception as e:
            errors += 1
            if errors <= 3:  # Show first 3 errors
                print(f"  ⚠️ Test point {i}: {type(e).__name__}: {e}")
            continue

        preds = result.get("predictions", result)

        # 1-day accuracy
        p1 = preds.get(1) or preds.get("1d")
        if p1 and cutoff < total_rows:
            actual_1d = df['close'].iloc[cutoff]
            predicted_change = p1.get("change_percent", 0) / 100.0
            predicted_price = actual_close_at_cutoff * (1 + predicted_change)
            actual_change = (actual_1d - actual_close_at_cutoff) / actual_close_at_cutoff

            # Direction accuracy
            direction_correct = (predicted_change > 0) == (actual_change > 0)
            # Price error
            price_error = abs(predicted_price - actual_1d) / actual_1d * 100

            results_1d.append({
                "direction_correct": direction_correct,
                "price_error_pct": price_error,
                "predicted_change": predicted_change * 100,
                "actual_change": actual_change * 100,
            })

        # 7-day accuracy
        p7 = preds.get(7) or preds.get("7d")
        if p7 and (cutoff + 6) < total_rows:
            actual_7d = df['close'].iloc[cutoff + 6]
            predicted_change = p7.get("change_percent", 0) / 100.0
            predicted_price = actual_close_at_cutoff * (1 + predicted_change)
            actual_change = (actual_7d - actual_close_at_cutoff) / actual_close_at_cutoff

            direction_correct = (predicted_change > 0) == (actual_change > 0)
            price_error = abs(predicted_price - actual_7d) / actual_7d * 100

            results_7d.append({
                "direction_correct": direction_correct,
                "price_error_pct": price_error,
                "predicted_change": predicted_change * 100,
                "actual_change": actual_change * 100,
            })

    # Aggregate
    metrics = {
        "symbol": symbol,
        "version": version_label,
        "test_points": len(results_1d),
    }

    if results_1d:
        metrics["1d_direction_accuracy"] = sum(r["direction_correct"] for r in results_1d) / len(results_1d) * 100
        metrics["1d_avg_price_error"] = np.mean([r["price_error_pct"] for r in results_1d])
        metrics["1d_mae"] = np.mean([abs(r["predicted_change"] - r["actual_change"]) for r in results_1d])

    if results_7d:
        metrics["7d_direction_accuracy"] = sum(r["direction_correct"] for r in results_7d) / len(results_7d) * 100
        metrics["7d_avg_price_error"] = np.mean([r["price_error_pct"] for r in results_7d])
        metrics["7d_mae"] = np.mean([abs(r["predicted_change"] - r["actual_change"]) for r in results_7d])

    return metrics


def display_results(all_metrics):
    """Pretty-print accuracy table."""
    print(f"\n{'═'*80}")
    print(f"  📊 ACCURACY REPORT — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'═'*80}\n")

    # Header
    print(f"  {'Symbol':<16} {'Ver':>3}  {'1D Dir%':>8} {'1D Err%':>8} {'7D Dir%':>8} {'7D Err%':>8}  {'Tests':>5}")
    print(f"  {'─'*14}   {'─'*3}  {'─'*8} {'─'*8} {'─'*8} {'─'*8}  {'─'*5}")

    for m in all_metrics:
        if "error" in m:
            print(f"  {m['symbol']:<16} {m['version']:>3}  {'ERROR':>8}  {m['error'][:30]}")
            continue

        d1 = f"{m.get('1d_direction_accuracy', 0):.1f}%" if '1d_direction_accuracy' in m else "  N/A"
        e1 = f"{m.get('1d_avg_price_error', 0):.2f}%" if '1d_avg_price_error' in m else "  N/A"
        d7 = f"{m.get('7d_direction_accuracy', 0):.1f}%" if '7d_direction_accuracy' in m else "  N/A"
        e7 = f"{m.get('7d_avg_price_error', 0):.2f}%" if '7d_avg_price_error' in m else "  N/A"
        tests = m.get("test_points", 0)

        print(f"  {m['symbol']:<16} {m['version']:>3}  {d1:>8} {e1:>8} {d7:>8} {e7:>8}  {tests:>5}")

    # Averages
    valid = [m for m in all_metrics if "error" not in m and "1d_direction_accuracy" in m]
    if len(valid) > 1:
        avg_d1 = np.mean([m["1d_direction_accuracy"] for m in valid])
        avg_e1 = np.mean([m["1d_avg_price_error"] for m in valid])
        print(f"\n  {'AVERAGE':<16} {'':>3}  {avg_d1:.1f}%  {avg_e1:.2f}%")

    print(f"\n{'═'*80}\n")


def main():
    parser = argparse.ArgumentParser(description="FinPredict Accuracy Checker")
    parser.add_argument("symbol", nargs="?", help="Stock symbol (e.g. RELIANCE.NS)")
    parser.add_argument("--v1", action="store_true", help="Check V1 models")
    parser.add_argument("--compare", action="store_true", help="Compare V1 vs V2 side by side")
    parser.add_argument("--top", type=int, default=5, help="Number of stocks to check (default: 5)")
    args = parser.parse_args()

    if args.compare:
        # Run both V1 and V2 on common symbols
        v1_syms = set(get_symbols(V1_DIR))
        v2_syms = set(get_symbols(V2_DIR))
        common = sorted(v1_syms & v2_syms)[:args.top]

        if not common:
            print("❌ No common symbols between V1 and V2 models.")
            sys.exit(1)

        print(f"\n🔬 Comparing V1 vs V2 on {len(common)} symbols: {', '.join(common)}\n")
        all_metrics = []
        for sym in common:
            print(f"\n── {sym} ──")
            m1 = check_accuracy(sym, V1_DIR, "V1")
            m2 = check_accuracy(sym, V2_DIR, "V2")
            all_metrics.extend([m1, m2])

        display_results(all_metrics)
        return

    # Single version mode
    if args.v1:
        model_dir, version = V1_DIR, "V1"
    else:
        model_dir, version = V2_DIR, "V2"
        if not get_symbols(V2_DIR):
            model_dir, version = V1_DIR, "V1"
            print("⚠️  No V2 models, falling back to V1")

    symbols = get_symbols(model_dir)
    if not symbols:
        print("❌ No trained models found.")
        sys.exit(1)

    if args.symbol:
        sym = args.symbol.upper()
        if not sym.endswith(".NS"):
            sym += ".NS"
        targets = [sym] if sym in symbols else []
        if not targets:
            print(f"❌ No model for {sym}")
            sys.exit(1)
    else:
        targets = symbols[:args.top]

    print(f"\n🔬 Checking accuracy for {len(targets)} symbol(s) [{version}]...\n")
    all_metrics = []
    for sym in targets:
        print(f"\n── {sym} ──")
        metrics = check_accuracy(sym, model_dir, version)
        all_metrics.append(metrics)

    display_results(all_metrics)

    # Save report
    report_path = model_dir / "accuracy_report.json"
    with open(report_path, "w") as f:
        json.dump(all_metrics, f, indent=2, default=str)
    print(f"💾 Report saved to {report_path}")


if __name__ == "__main__":
    main()
