# test_supabase_connection.py
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Get connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(DATABASE_URL)

# Test connection
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        print("✅ Connected to PostgreSQL!")
        print(f"Version: {result.fetchone()[0]}")
        
        # Test tables exist
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result.fetchall()]
        print(f"\n✅ Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table}")
            
        # Test sample data
        result = conn.execute(text("SELECT COUNT(*) FROM ohlcv_data"))
        count = result.fetchone()[0]
        print(f"\n✅ OHLCV data has {count} records")
        
except Exception as e:
    print(f"❌ Connection failed: {e}")