import pandas as pd
import numpy as np
import psycopg2
import yfinance as yf
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import pickle
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import DB_CONFIG, RAW_DATA_DIR, PROCESSED_DATA_DIR

class DataLoader:
    """Load OHLCV data from TimescaleDB"""
    
    def __init__(self, db_config=DB_CONFIG):
        self.db_config = db_config
        self.conn = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            print("✅ Connected to TimescaleDB")
        except Exception as e:
            # Fallback for when DB connection fails (e.g. bad host)
            print(f"❌ Database connection failed: {e}")
            # raise # Don't raise, allowing fallback to yfinance download without DB calls if needed?
            # But clean_database needs DB.
            raise
            
    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("✅ Database connection closed")

    def clean_database(self):
        """Truncate stock_prices table to remove old data"""
        if not self.conn:
            self.connect()
        try:
            with self.conn.cursor() as cur:
                print("🧹 Cleaning database (truncating stock_prices)...")
                # Ensure table exists first? truncate is safe.
                # Use cascade to clean dependent tables if any
                cur.execute("TRUNCATE TABLE ohlcv_data CASCADE;")
                self.conn.commit()
            print("✅ Database cleaned.")
        except Exception as e:
            print(f"❌ Error cleaning database: {e}")
            self.conn.rollback()
    
    def load_symbol_data(self, symbol, start_date=None, end_date=None, save_to_db=True):
        """
        Load OHLCV data for a specific symbol.
        Fetches from DB first. If missing, downloads from Yahoo Finance.
        """
        if not self.conn:
            try:
                self.connect()
            except:
                pass # Proceed to try download if DB fails
        
        # 1. Try loading from DB
        df = None
        if self.conn:
            try:
                # Default date range: max available
                query = "SELECT * FROM ohlcv_data WHERE symbol = %s"
                params = [symbol]
                
                if start_date:
                    query += " AND timestamp >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND timestamp <= %s"
                    params.append(end_date)
                
                query += " ORDER BY timestamp ASC"
                
                df = pd.read_sql(query, self.conn, params=tuple(params), index_col="timestamp", parse_dates=True)
            except Exception as e:
                print(f"⚠️ DB Read failed: {e}")

        # 2. If DB empty or failed, Download from Yahoo Finance
        if df is None or df.empty:
            print(f"📥 Downloading max history for {symbol} from Yahoo Finance...")
            try:
                # Download max history
                df = yf.download(symbol, period="max", interval="1d", progress=False)
                
                if df.empty:
                    print(f"❌ No data found for {symbol} on Yahoo Finance")
                    return None
                
                # Flatten MultiIndex columns if present (yfinance specific issue)
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = df.columns.get_level_values(0)

                # Rename columns to match schema (lowercase)
                df.rename(columns={
                    "Open": "open", "High": "high", "Low": "low", 
                    "Close": "close", "Volume": "volume"
                }, inplace=True)
                
                # Keep only OHLCV
                if "Adj Close" in df.columns:
                    # Use Adj Close as Close? Or keep raw? 
                    # Usually Adj Close is better for ML. Let's stick to Close for now or standard mapping.
                    pass
                
                df = df[["open", "high", "low", "close", "volume"]]
                df.index.name = "timestamp"
                
                print(f"✅ Downloaded {len(df)} records for {symbol}")
                
                # 3. Save to DB
                if self.conn and save_to_db:
                    self.save_to_db(symbol, df)
                    
            except Exception as e:
                print(f"❌ Download failed for {symbol}: {e}")
                return None
        else:
             print(f"✅ Loaded {len(df)} records from DB for {symbol}")

        return df

    def save_to_db(self, symbol, df):
        """Save DataFrame to TimescaleDB"""
        if not self.conn:
            return
            
        try:
            print(f"💾 Saving {len(df)} rows to database...")
            with self.conn.cursor() as cur:
                # Batch insert
                # Convert DataFrame to list of tuples
                # Ensure index is time
                from psycopg2.extras import execute_values
                
                # Robust data conversion
                clean_data = []
                for index, row in df.iterrows():
                    # Handle NaNs safely
                    open_val = float(row['open']) if pd.notna(row['open']) else 0.0
                    high_val = float(row['high']) if pd.notna(row['high']) else 0.0
                    low_val = float(row['low']) if pd.notna(row['low']) else 0.0
                    close_val = float(row['close']) if pd.notna(row['close']) else 0.0
                    vol_val = int(row['volume']) if pd.notna(row['volume']) else 0
                    
                    clean_data.append((
                        index,
                        symbol,
                        'stock',
                        open_val, high_val, low_val, close_val, vol_val
                    ))
                
                # Use execute_values which is much faster and generates a single query
                insert_query = """
                INSERT INTO ohlcv_data (timestamp, symbol, asset_type, open, high, low, close, volume)
                VALUES %s
                ON CONFLICT (timestamp, symbol) DO UPDATE 
                SET open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low, 
                    close=EXCLUDED.close, volume=EXCLUDED.volume;
                """
                
                print(f"   Batch inserting {len(clean_data)} rows...")
                execute_values(cur, insert_query, clean_data)
                self.conn.commit()
                print("   ✅ Data saved to DB (fast batch)")
                return # Exit successfully
            
            print("✅ Data saved to DB")
        except Exception as e:
            print(f"❌ Failed to save to DB: {e}")
            self.conn.rollback()

    # Legacy method wrapper
    def save_to_csv(self, symbol, df, directory=RAW_DATA_DIR):
        """Save DataFrame to CSV"""
        filepath = Path(directory) / f"{symbol}_raw.csv"
        df.to_csv(filepath)
        print(f"💾 Saved to {filepath}")
        
    def load_from_csv(self, symbol, directory=RAW_DATA_DIR):
        """Load DataFrame from CSV"""
        filepath = Path(directory) / f"{symbol}_raw.csv"
        if not filepath.exists():
            print(f"❌ File not found: {filepath}")
            return None
        df = pd.read_csv(filepath, index_col='timestamp', parse_dates=True)
        print(f"✅ Loaded {len(df)} records from {filepath}")
        return df


class DataCleaner:
    """Clean and validate OHLCV data"""
    
    @staticmethod
    def check_missing_dates(df):
        """Check for missing dates and forward-fill"""
        original_length = len(df)
        
        # Create complete date range
        full_range = pd.date_range(
            start=df.index.min(),
            end=df.index.max(),
            freq='D'
        )
        
        # Reindex and forward-fill
        df = df.reindex(full_range)
        df.ffill(inplace=True)
        
        missing_count = len(df) - original_length
        
        if missing_count > 0:
            print(f"⚠️  Found {missing_count} missing dates, forward-filled")
        else:
            print("✅ No missing dates")
            
        return df
    
    @staticmethod
    def remove_outliers(df, columns=['close'], threshold=3):
        """Remove outliers using Z-score method"""
        from scipy import stats
        
        df_clean = df.copy()
        
        for col in columns:
            z_scores = np.abs(stats.zscore(df[col]))
            outliers = z_scores > threshold
            outlier_count = outliers.sum()
            
            if outlier_count > 0:
                print(f"⚠️  Found {outlier_count} outliers in {col}, removing...")
                df_clean = df_clean[~outliers]
        
        return df_clean
    
    @staticmethod
    def validate_ohlc(df):
        """Validate OHLC relationship: Low <= Open, Close <= High"""
        invalid_rows = (
            (df['low'] > df['open']) |
            (df['low'] > df['close']) |
            (df['high'] < df['open']) |
            (df['high'] < df['close'])
        )
        
        invalid_count = invalid_rows.sum()
        
        if invalid_count > 0:
            print(f"⚠️  Found {invalid_count} invalid OHLC rows, removing...")
            df = df[~invalid_rows]
        else:
            print("✅ OHLC validation passed")
        
        return df


# Example Usage
if __name__ == "__main__":
    # Initialize loader
    loader = DataLoader()
    
    # Load data for AAPL
    symbol = "AAPL"
    df = loader.load_symbol_data(symbol)
    
    if df is not None:
        # Clean data
        cleaner = DataCleaner()
        df = cleaner.check_missing_dates(df)
        df = cleaner.validate_ohlc(df)
        df = cleaner.remove_outliers(df)
        
        # Save to CSV
        loader.save_to_csv(symbol, df)
        
        print("\n📊 Data Summary:")
        print(df.describe())
        print("\n📈 First 5 rows:")
        print(df.head())
    
    loader.disconnect()