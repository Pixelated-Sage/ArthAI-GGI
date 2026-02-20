import asyncio
import traceback
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def test_db():
    print(f"Connecting to: {settings.SQLALCHEMY_DATABASE_URI.replace(settings.POSTGRES_PASSWORD, 'xxx') if settings.POSTGRES_PASSWORD else settings.SQLALCHEMY_DATABASE_URI}")
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)
    
    try:
        async with asyncio.timeout(30):
            async with engine.begin() as conn:
                res = await conn.execute(text("SELECT 1"))
                print("Result:", res.scalar())
        print("✅ Postgres connected (Async)")
    except Exception as e:
        print("❌ Postgres connection failed:")
        print(repr(e))
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_db())
