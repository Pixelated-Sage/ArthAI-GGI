import sys
from pathlib import Path
import pandas as pd
import yfinance as yf
import psycopg2

# Add ml to path
sys.path.append(str(Path(__file__).parent))
# Add ml/src to path
sys.path.append(str(Path(__file__).parent / "src"))

from src.data_preparation import DataLoader
from config import DB_CONFIG

def debug_db_insert():
    print("🐞 Starting DB Debug...")
    
    loader = DataLoader()
    try:
        loader.connect()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    symbol = 'RELIANCE.NS'
    print(f"📥 Downloading 1 day of data for {symbol}...")
    df = yf.download(symbol, period="1d", interval="1d", progress=False)
    
    # Flatten MultiIndex (yfinance fix)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df.columns = [c.lower() for c in df.columns]
    
    print(f"✅ Downloaded {len(df)} rows.")
    print(df.head())
    
    print("\n💾 Attempting save_to_db...")
    try:
        loader.save_to_db(symbol, df)
        print("✅ save_to_db completed successfully.")
    except Exception as e:
        print(f"❌ save_to_db crashed: {e}")
        import traceback
        traceback.print_exc()
    
    loader.disconnect()
    print("🏁 Debug complete.")

if __name__ == "__main__":
    debug_db_insert()
