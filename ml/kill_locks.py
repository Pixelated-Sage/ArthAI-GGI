import sys
from pathlib import Path
import psycopg2

sys.path.append(str(Path(__file__).parent.parent))
from ml.config import DB_CONFIG

def kill_locks():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Find stuck PIDs
        cur.execute("""
            SELECT pid, query FROM pg_stat_activity 
            WHERE state IN ('idle in transaction', 'active') 
            AND query NOT LIKE '%pg_stat_activity%';
        """)
        pids = cur.fetchall()
        
        if not pids:
            print("✅ No stuck queries found.")
            return

        print(f"🔪 Found {len(pids)} stuck queries. Killing them...")
        for pid, query in pids:
            try:
                # Use pg_terminate_backend
                print(f"   Killing PID {pid}: {query[:50]}...")
                cur.execute(f"SELECT pg_terminate_backend({pid});")
            except Exception as e:
                print(f"   ⚠️ Failed to kill {pid}: {e}")
        
        conn.commit()
        print("✅ Terminated stuck backends.")
        conn.close()
        
    except Exception as e:
        print(f"❌ Failed to clear locks: {e}")

if __name__ == "__main__":
    kill_locks()
