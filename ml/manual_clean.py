import sys
from pathlib import Path
import psycopg2

sys.path.append(str(Path(__file__).parent))
from src.data_preparation import DataLoader

def clean_now():
    print("🧹 Starting manual DB clean...")
    loader = DataLoader()
    try:
        loader.connect()
        with loader.conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE ohlcv_data CASCADE;")
            loader.conn.commit()
        print("✅ TRUNCATE complete.")
    finally:
        loader.disconnect()

if __name__ == "__main__":
    clean_now()
