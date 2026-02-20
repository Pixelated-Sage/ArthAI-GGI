from redis.asyncio import Redis, from_url
from app.core.config import settings

redis_client = from_url(
    f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
    if settings.REDIS_PASSWORD
    else f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}",
    encoding="utf-8",
    decode_responses=True,
)

async def get_redis():
    yield redis_client
