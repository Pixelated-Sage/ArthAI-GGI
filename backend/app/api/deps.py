from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_maker
from app.db.firebase import get_firebase_db
from app.db.redis import get_redis as _get_redis
from loguru import logger

security = HTTPBearer()

async def get_db() -> Generator:
    async with async_session_maker() as session:
        yield session

async def get_redis() -> Generator:
    async for redis in _get_redis():
        yield redis

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Invalid Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_premium(user: dict = Depends(get_current_user)):
    # Firebase custom claims or firestore check
    # For now, let's just return the user
    return user
