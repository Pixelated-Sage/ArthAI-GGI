import redis
import os
from dotenv import load_dotenv

# Load env variables if not already loaded
load_dotenv()

class RedisClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance.client = None
        return cls._instance

    def connect(self):
        """Initializes the Redis connection"""
        try:
            self.client = redis.Redis(
                host=os.getenv("REDIS_HOST"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                password=os.getenv("REDIS_PASSWORD"),
                decode_responses=True,  # Returns strings instead of bytes
                socket_timeout=5        # Don't hang forever if connection fails
            )
            # Quick Ping to verify connection
            self.client.ping()
            print("✅ Redis: Connection established successfully.")
        except redis.ConnectionError as e:
            print(f"❌ Redis: Connection failed! {e}")
            self.client = None

    def get_client(self):
        if not self.client:
            self.connect()
        return self.client

# Singleton instance
redis_service = RedisClient()