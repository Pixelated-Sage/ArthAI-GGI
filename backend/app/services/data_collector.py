import yfinance as yf
import pandas as pd
from sqlalchemy import text
from datetime import datetime, timedelta
import time

# Import your DB context manager
from app.db.database import get_db_context  

class DataCollector:
    # STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']
    # CRYPTO = ['BTC-USD', 'ETH-USD', 'BNB-USD'] # yfinance uses -USD for crypto
    STOCKS = []  # For testing, we can reduce the number of symbols
    CRYPTO = ['ETH-USD']  # For testing, we can reduce the number
    def __init__(self):
        pass

    def fetch_data(self, symbol, period="5y", interval="1d"):
        """Fetches OHLCV data from Yahoo Finance"""
        print(f"📥 Fetching {symbol} data ({period})...")
        ticker = yf.Ticker(symbol)
        
        # Download data
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            print(f"⚠️ Warning: No data found for {symbol}")
            return None
            
        # Clean up dataframe
        df.reset_index(inplace=True)
        
        # Standardize column names to match our DB schema
        df.rename(columns={
            'Date': 'timestamp',
            'Open': 'open',
            'High': 'high',
            'Low': 'low',
            'Close': 'close',
            'Volume': 'volume'
        }, inplace=True)
        
        # Add symbol and asset type
        clean_symbol = symbol.replace('-USD', '') # BTC-USD -> BTC
        df['symbol'] = clean_symbol
        df['asset_type'] = 'crypto' if '-USD' in symbol else 'stock'
        
        # Ensure timestamp is timezone-aware (UTC)
        if df['timestamp'].dt.tz is None:
            df['timestamp'] = df['timestamp'].dt.tz_localize('UTC')
        else:
            df['timestamp'] = df['timestamp'].dt.tz_convert('UTC')
            
        return df[['symbol', 'asset_type', 'timestamp', 'open', 'high', 'low', 'close', 'volume']]

    def save_to_db(self, df):
        """Bulk upserts data into PostgreSQL"""
        if df is None or df.empty:
            return

        symbol_name = df['symbol'].iloc[0]
        print(f"💾 Saving {len(df)} records for {symbol_name} to DB...")
        
        # Convert DataFrame to a list of dictionaries
        records = df.to_dict(orient='records')
        
        with get_db_context() as db:
            # Note the ':column' syntax for SQLAlchemy bind parameters
            query = text("""
                INSERT INTO ohlcv_data (symbol, asset_type, timestamp, open, high, low, close, volume)
                VALUES (:symbol, :asset_type, :timestamp, :open, :high, :low, :close, :volume)
                ON CONFLICT (symbol, timestamp) 
                DO UPDATE SET
                    open = EXCLUDED.open,
                    high = EXCLUDED.high,
                    low = EXCLUDED.low,
                    close = EXCLUDED.close,
                    volume = EXCLUDED.volume;
            """)
            
            try:
                # SQLAlchemy handles the list of dicts as a 'bulk execute' 
                # effectively turning this into one network round trip.
                db.execute(query, records)
                db.commit()
                print(f"✅ Successfully synced {symbol_name}")
            except Exception as e:
                print(f"❌ Database Error for {symbol_name}: {e}")
                db.rollback()

    def run_initial_pipeline(self):
        """Runs the full historical data download"""
        print("🚀 Starting Data Collection Pipeline...\n")
        
        # 1. Process Stocks (5 Years)
        for symbol in self.STOCKS:
            df = self.fetch_data(symbol, period="5y")
            self.save_to_db(df)
            time.sleep(1) # Be nice to Yahoo's API
            
        # 2. Process Crypto (3 Years) - yfinance requires slightly different handling
        for symbol in self.CRYPTO:
            df = self.fetch_data(symbol, period="3y")
            self.save_to_db(df)
            time.sleep(1)

        print("\n✨ Pipeline Complete.")

# To run manually:
if __name__ == "__main__":
    collector = DataCollector()
    collector.run_initial_pipeline()