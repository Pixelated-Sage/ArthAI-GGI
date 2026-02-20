import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))  # Add project root to path
from ml.config import DB_CONFIG
import psycopg2

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()
cur.execute("""
    SELECT pid, state, query, age(query_start) as duration
    FROM pg_stat_activity
    WHERE state != 'idle' AND query NOT LIKE '%pg_stat_activity%';
""")
activity = cur.fetchall()
if activity:
    print("🔒 Activity detected:")
    for row in activity:
        print(row)
else:
    print("✅ No active queries.")
conn.close()
