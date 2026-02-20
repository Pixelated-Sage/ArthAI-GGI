from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinPredict AI"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081", "http://localhost:3001"]
    
    # Database
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "changeme"
    POSTGRES_DB: str = "finpredict"
    POSTGRES_PORT: str = "5432"
    TIMESCALEDB_URL: str | None = None

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "config/serviceAccountKey.json"

    # LLM / Chatbot
    Gemini_API_KEY: str | None = None
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"

    # Security
    SECRET_KEY: str = "change_this_to_a_secure_random_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.TIMESCALEDB_URL:
             # Ensure async driver for asyncpg
            url = self.TIMESCALEDB_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
            
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = str(Path(__file__).resolve().parent.parent.parent.parent / ".env")
        extra = "ignore"

settings = Settings()
