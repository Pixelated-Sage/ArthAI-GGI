import sys
import os

# Add the project root to python path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.redis import redis_service

def test_redis_connection():
    print("🔌 Testing Redis Cloud Connection...")
    
    # 1. Connect
    r = redis_service.get_client()
    
    if not r:
        print("❌ Could not get Redis client.")
        return

    # 2. Test Write
    try:
        r.set("finpredict_test_key", "Hello from Arch Linux!")
        print("✅ Write Success: Set 'finpredict_test_key'")
    except Exception as e:
        print(f"❌ Write Failed: {e}")
        return

    # 3. Test Read
    try:
        value = r.get("finpredict_test_key")
        print(f"✅ Read Success: Got '{value}'")
        
        if value == "Hello from Arch Linux!":
            print("🎉 Redis Integration Verified!")
        else:
            print("⚠️ Value mismatch.")
            
    except Exception as e:
        print(f"❌ Read Failed: {e}")

    # 4. Clean up
    r.delete("finpredict_test_key")

if __name__ == "__main__":
    test_redis_connection()