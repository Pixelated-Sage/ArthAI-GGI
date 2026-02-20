import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("TIMESCALEDB_URL")
if url and url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = url

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is what your data_collector.py is looking for
@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    try:
        with get_db_context() as db:
            db.execute(text("SELECT 1"))
            print("✅ TimescaleDB connected!")
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False