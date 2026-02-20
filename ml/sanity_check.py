import sys
import argparse
from pathlib import Path
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime

# Add src to path
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent / "src"))

# Import your inference engine
# Note: Adjust import path if needed based on your folder structure
from inference import FinPredictInference

def check_ticker(symbol):
    print(f"\n" + "="*50)
    print(f"🔍 Running Sanity Check for {symbol}...")
    print("="*50)
    
    try:
        # 1. Fetch recent data (enough for 200d + 90d sequence)
        print(f"📥 Loading recent data for {symbol}...")
        df = yf.download(symbol, period="2y", interval="1d", progress=False)
        
        if df.empty:
            print(f"❌ No data found for {symbol}")
            return

        # Handle MultiIndex columns (Yahoo Finance quirk)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        
        # Clean column names
        df.columns = [c.lower() for c in df.columns]
        
        # Get Current Price
        current_price = df['close'].iloc[-1]
        print(f"📊 Current Price: ₹{current_price:.2f}")

        # 2. Initialize Inference
        inference = FinPredictInference(symbol)
        
        # 3. Run Prediction
        print("🤖 Generating predictions...")
        # The inference engine handles fetching market context (Nifty) internally
        result = inference.predict_from_dataframe(df)
        
        # 4. Print Results
        print(f"\n🔮 Predictions for {symbol}:")

        # Unwrap API-style response if present
        if isinstance(result, dict) and "predictions" in result:
             result = result["predictions"]

        # Helper Function to print cleanly
        def print_prediction(p, label):
            try:
                # Case 1: Standard Dictionary Format (New)
                if isinstance(p, dict):
                    price = p.get('price')
                    change_pct = p.get('change_percent')
                    conf = p.get('confidence', 0.0)
                    signal = p.get('signal', 'NEUTRAL')
                    
                    if price and change_pct is not None:
                        color = "🟢" if change_pct > 0 else "🔴"
                        # Extra icon for Signal
                        sig_icon = "⚪"
                        if "STRONG BUY" in signal: sig_icon = "🚀"
                        elif "BUY" in signal: sig_icon = "⬆️"
                        elif "STRONG SELL" in signal: sig_icon = "📉"
                        elif "SELL" in signal: sig_icon = "⬇️"
                        
                        print(f"   📅 {label}: Price ₹{price:,.2f} ({color} {change_pct:+.2f}%)")
                        print(f"      {sig_icon} Signal: {signal} (Conf: {conf:.1%})")
                        return

                # Case 2: Fallback / Old Formats
                if isinstance(p, (float, int, np.floating)):
                    # Assume simple return float
                     print(f"   📅 {label}: Return {p:+.2%}")
                else:
                     print(f"   ⚠️  Raw Output: {p}")

            except Exception as e:
                print(f"   ❌ Error printing {label}: {e}")

        # Dispatcher
        if isinstance(result, dict):
            for horizon, data in result.items():
                label = f"{horizon}d" if str(horizon).isdigit() else str(horizon)
                print_prediction(data, label)
        else:
            print(f"Raw Result: {result}")

        print(f"✅ Check complete for {symbol}")

    except Exception as e:
        print(f"❌ Failed to check {symbol}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Check model predictions")
    parser.add_argument("--ticker", type=str, help="Specific ticker to check (e.g., TCS.NS)")
    parser.add_argument("--all", action="store_true", help="Check all trained models")
    
    args = parser.parse_args()

    # List of stocks to check
    # Check all actively trained stocks
    trained_universe = [
        "RELIANCE.NS",
        "TCS.NS",
        "HDFCBANK.NS",
        "INFY.NS", 
        "ICICIBANK.NS", 
        "SBIN.NS"
    ]

    if args.ticker:
        check_ticker(args.ticker)
    elif args.all:
        for ticker in trained_universe:
            check_ticker(ticker)
    else:
        print("ℹ️  Usage: python ml/sanity_check.py --ticker TCS.NS")
        print("\n🚀 Defaulting to checking TCS.NS...")
        check_ticker("TCS.NS")