from app.core.celery_app import celery_app
from app.services.data_collector import DataCollector
from celery.schedules import crontab

@celery_app.task(name="daily_market_data_update")
def update_market_data():
    """Celery task to fetch daily data updates (runs daily)"""
    print("⏰ Celery: Starting daily market data update...")
    collector = DataCollector()
    
    # For daily updates, we only need the last 2 days to catch any recent closes
    # (Stocks don't trade on weekends, but crypto does)
    
    # Update Stocks
    for symbol in collector.STOCKS:
        df = collector.fetch_data(symbol, period="5d") # Fetch last 5 days just to be safe
        collector.save_to_db(df)

    # Update Crypto
    for symbol in collector.CRYPTO:
        df = collector.fetch_data(symbol, period="5d")
        collector.save_to_db(df)
        
    print("✅ Celery: Daily update complete.")