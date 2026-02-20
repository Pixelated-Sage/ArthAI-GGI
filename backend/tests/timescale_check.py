import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 1. Load the URL from your .env file
load_dotenv()
DATABASE_URL = os.getenv("TIMESCALEDB_URL")

if not DATABASE_URL:
    print("❌ Error: TIMESCALEDB_URL not found in environment variables.")
    sys.exit(1)

# 2. Setup SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_connection():
    print("🔄 Attempting to connect to Railway...")
    
    # We use a context manager to ensure the session closes properly
    db = SessionLocal()
    try:
        # We wrap the string in text() for SQLAlchemy 2.0 compatibility
        result = db.execute(text("SELECT NOW();")).fetchone()
        
        if result:
            print(f"✅ Connected successfully!")
            print(f"🕒 Database Time: {result[0]}")
        else:
            print("⚠️ Connected, but query returned no data.")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()