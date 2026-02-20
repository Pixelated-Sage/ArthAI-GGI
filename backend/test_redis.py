import asyncio
from redis.asyncio import from_url

url = "redis://:91QYDDeyyiG8cHgtEe8KhLZ0YyovfU4d@redis-19855.c15.us-east-1-2.ec2.cloud.redislabs.com:19855/0"

async def main():
    try:
        r = from_url(url, encoding="utf-8", decode_responses=True)
        print("Connecting...")
        pong = await asyncio.wait_for(r.ping(), timeout=5)
        print("Ping:", pong)
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
