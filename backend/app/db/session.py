from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,  # significantly reduces log noise
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,  # Handles dropped connections gracefully
    pool_recycle=3600,
)

async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db():
    async with async_session_maker() as session:
        yield session
