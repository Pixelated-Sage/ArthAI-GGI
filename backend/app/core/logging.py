import sys
from loguru import logger
from app.core.config import settings

def setup_logging():
    logger.remove()
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO",
    )
    # Add file logging
    logger.add(
        f"/data/logs/{settings.PROJECT_NAME.lower().replace(' ', '_')}.log",
        rotation="10 MB",
        retention="10 days",
        level="INFO",
    )

setup_logging()
