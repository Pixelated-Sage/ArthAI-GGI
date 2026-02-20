import yfinance as yf
import pandas as pd
import sys
import json
import argparse

def fetch_data(symbol, period="2y"):
    try:
        # Use yf.download with threads=False for safety
        df = yf.download(symbol, period=period, interval="1d", progress=False, threads=False)
        
        if df.empty:
            print(json.dumps({"error": "No data found"}))
            return

        # Handle MultiIndex
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
            
        df.columns = [c.lower() for c in df.columns]
        
        # Convert index to string for JSON serialization
        df.index = df.index.strftime('%Y-%m-%d %H:%M:%S%z')
        
        # Reset index to make 'date' a column
        df = df.reset_index()
        df.rename(columns={'index': 'date', 'Date': 'date'}, inplace=True)
        
        # Output as JSON
        print(df.to_json(orient="records"))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("symbol", type=str)
    args = parser.parse_args()
    fetch_data(args.symbol)
