from typing import Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger
from app.api import deps
from app.schemas import financials as schemas
from app.models import financials as models

router = APIRouter()

@router.get("/{symbol}", response_model=List[schemas.OHLCV])
async def get_historical_data(
    symbol: str,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(deps.get_db),
    redis = Depends(deps.get_redis) # Redis dependency
) -> Any:
    """
    Get historical OHLCV data for a symbol.
    """
    # ... logic ...
    symbol = symbol.upper()
    cache_key = f"ohlcv_v3:{symbol}:{limit}"
    
    # Try cache
    try:
        if redis:
            cached = await redis.get(cache_key)
            if cached:
                logger.info(f"Cache hit for {cache_key}")
                import json
                try:
                    data = json.loads(cached)
                    return data 
                except Exception as e:
                    pass 
    except Exception as e:
        pass 

    # DB Fetch
    try:
        # Check latest date in DB first
        latest_query = select(models.OHLCVData.timestamp).where(
            models.OHLCVData.symbol == symbol
        ).order_by(models.OHLCVData.timestamp.desc()).limit(1)
        
        latest_result = await db.execute(latest_query)
        latest_date = latest_result.scalar_one_or_none()
        
        from datetime import datetime, timedelta
        import pytz
        
        now = datetime.now(pytz.utc)
        is_stale = True
        
        if latest_date:
             # If data is less than 24 hours old (approx), consider it fresh
             # (Allows for weekend/market close gaps, but ensures broad freshness)
             if (now - latest_date.replace(tzinfo=pytz.utc)) < timedelta(hours=24):
                 is_stale = False

        if not is_stale:
            # Fetch from DB
            query = select(models.OHLCVData).where(
                models.OHLCVData.symbol == symbol
            ).order_by(models.OHLCVData.timestamp.desc()).limit(limit)
            
            result = await db.execute(query)
            data = result.scalars().all()
            if not data:
                is_stale = True # Fallback if empty
            else:
                try:
                    if redis:
                        import json
                        # Prepare data for Redis cache serialization
                        data_to_cache = [
                            {
                                "symbol": d.symbol,
                                "timestamp": d.timestamp.isoformat() if hasattr(d.timestamp, 'isoformat') else str(d.timestamp),
                                "open": float(d.open),
                                "high": float(d.high),
                                "low": float(d.low),
                                "close": float(d.close),
                                "volume": int(d.volume),
                                "asset_type": d.asset_type
                            }
                            for d in data
                        ]
                        await redis.setex(cache_key, 3600, json.dumps(data_to_cache))
                        logger.info(f"Cached DB result for {symbol} in Redis")
                except Exception as e:
                    logger.warning(f"Failed to cache DB result in Redis: {e}")
        
        if is_stale:
             logger.info(f"Data for {symbol} is stale or missing. Fetching live...")
             raise Exception("Stale Data")

    except Exception as e:
        # DB Connection failure, empty data, or stale data -> Fallback to YFinance
        if str(e) != "Stale Data":
             logger.warning(f"DB Fetch failed for {symbol}: {e}. Falling back to yfinance.")
        
        try:
            import yfinance as yf
            import pandas as pd
            
            # Fetch from Yahoo Finance using subprocess to avoid hanging/threading issues
            import subprocess
            import sys
            import json
            from pathlib import Path

            script_path = Path("/home/abhishek/Documents/C02/Products/Finpredict/ml/fetch_data.py")
            
            # Using current python executable (assuming yfinance/pandas installed here too)
            # If not, use specific venv python. Backend venv has them.
            cmd = [sys.executable, str(script_path), symbol]
            
            # Run in thread pool to avoid blocking
            import asyncio
            loop = asyncio.get_event_loop()
            
            def run_fetch():
                 return subprocess.run(cmd, capture_output=True, text=True)

            result = await loop.run_in_executor(None, run_fetch)
            
            if result.returncode != 0:
                 logger.error(f"Fetch script failed: {result.stderr}")
                 return []
            
            output = result.stdout.strip()
            if not output or "error" in output and output.startswith('{"error"'):
                 logger.error(f"Fetch script error: {output}")
                 return []
            
            import pandas as pd
            import io
            df = pd.read_json(io.StringIO(output))
            
            if 'date' in df.columns:
                 df['timestamp'] = pd.to_datetime(df['date'])
            elif 'Date' in df.columns:
                 df['timestamp'] = pd.to_datetime(df['Date'])
            
            if df.empty:
                return []
                
            # Filter and Sort: sort descending (newest first)
            df = df.sort_values('timestamp', ascending=False).head(limit)
            
            # Convert to schema format
            data = []
            for _, row in df.iterrows():
                data.append({
                    "symbol": symbol,
                    "timestamp": row["timestamp"].isoformat(),
                    "open": float(row["open"]),
                    "high": float(row["high"]),
                    "low": float(row["low"]),
                    "close": float(row["close"]),
                    "volume": int(row["volume"]),
                    "asset_type": "stock" 
                })
            
            # Cache result in Redis for 1 hour to prevent spamming YF
            try:
                if redis:
                    import json
                    await redis.setex(cache_key, 3600, json.dumps(data)) 
            except:
                pass
                
            return data
            
        except Exception as yf_error:
            logger.error(f"YFinance fallback failed: {yf_error}")
            return []

    return data
