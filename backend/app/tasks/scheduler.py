
import asyncio
import logging
from typing import List
from datetime import datetime, timedelta
from app.services.prediction_service import prediction_service
from app.api.v1.endpoints.historical import get_historical_data

logger = logging.getLogger(__name__)

# List of active stocks to track
TRACKED_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "HINDUNILVR.NS", "ITC.NS", "BHARTIARTL.NS", "SBIN.NS", "LICI.NS",
    "LT.NS", "BAJFINANCE.NS", "MARUTI.NS", "ASIANPAINT.NS", "AXISBANK.NS",
    "TITAN.NS", "SUNPHARMA.NS", "ULTRACEMCO.NS", "NTPC.NS"
]

async def update_predictions():
    """
    Background task to refresh predictions for all tracked symbols.
    Runs every 15 minutes.
    """
    logger.info("🔄 Starting background prediction update...")
    start_time = datetime.now()
    
    success_count = 0
    
    for symbol in TRACKED_SYMBOLS:
        try:
            logger.info(f"Updating {symbol}...")
            # This call will trigger the ML server inference and cache the result
            # We force a refresh by skipping cache check? No, just clear cache before run?
            # Actually, get_prediction logic checks cache. We need a way to force update.
            # But simpler: just calling it will hydrate the cache if expired.
            # If not expired, it returns cached. But we want to ensure it's fresh.
            
            # For now, let's just call it. If cache is < 5 mins, it returns.
            # But this runs every 15 mins. So cache will be expired.
            await prediction_service.get_prediction(symbol)
            success_count += 1
            
            # Small delay to yield to other requests and prevent GPU spike
            await asyncio.sleep(2) 
            
        except Exception as e:
            logger.error(f"Failed to update {symbol}: {e}")

    duration = datetime.now() - start_time
    logger.info(f"✅ Background update complete. Updated {success_count}/{len(TRACKED_SYMBOLS)} in {duration.seconds}s")

async def scheduler_loop():
    """
    Main loop for background tasks.
    """
    logger.info("📅 Scheduler started.")
    while True:
        try:
            await update_predictions()
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        
        # Wait 15 minutes
        logger.info("Scheduler sleeping for 15 minutes...")
        await asyncio.sleep(900) 
