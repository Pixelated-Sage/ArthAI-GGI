from celery import Celery
from celery.schedules import crontab  # <--- Added missing import
import os
from dotenv import load_dotenv

load_dotenv()

# Build Redis URL from your .env
# Using redis-py compatible URL format
REDIS_URL = f"redis://:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}/0"

celery_app = Celery(
    "finpredict_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Ensure Celery looks specifically into the services directory for tasks.py
celery_app.autodiscover_tasks(["app.services"])

# Schedule Configuration
celery_app.conf.beat_schedule = {
    "daily-market-data": {
        "task": "app.services.tasks.update_market_data", # Use full path for reliability
        "schedule": crontab(hour=21, minute=0), # 9:00 PM UTC (4:00 PM EST)
    },
}