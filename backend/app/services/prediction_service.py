import logging
import json
import subprocess
from pathlib import Path
from typing import Optional
from app.schemas.prediction import PredictionResponse

# Configure logging
logger = logging.getLogger(__name__)

# ML Paths
ML_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "ml"
ML_PYTHON = Path("/data/venvs/FinpredictML/bin/python")
INFERENCE_SCRIPT = ML_ROOT / "inference.py"

import asyncio
from datetime import datetime, timedelta

# ... imports ...

from app.db.redis import redis_client

class PredictionService:
    def __init__(self):
        # Limit concurrent ML subprocesses to 1 to prevent GPU OOM
        self._semaphore = asyncio.Semaphore(1)
        # We will use Redis for caching now, so no local _cache dict needed
        self._cache_ttl = 300 # 5 minutes in seconds

    async def get_prediction(self, symbol: str) -> Optional[PredictionResponse]:
        """
        Run inference script via subprocess with concurrency control and caching.
        """
        symbol = symbol.upper()
        cache_key = f"prediction:{symbol}"
        
        # 1. Check Redis Cache
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Returning cached prediction from Redis for {symbol}")
                return PredictionResponse.parse_raw(cached_data)
        except Exception as e:
            logger.warning(f"Redis cache check failed for {symbol}: {e}")

        # 2. Concurrency Control
        async with self._semaphore:
             return await self._run_inference(symbol)

    async def _run_inference(self, symbol: str) -> Optional[PredictionResponse]:
        try:
            import httpx
            
            async with httpx.AsyncClient(timeout=180.0) as client:
                try:
                    response = await client.get(f"http://localhost:8001/predict/{symbol}")
                    response.raise_for_status()
                    data = response.json()
                except httpx.ConnectError:
                    logger.error("Failed to connect to ML Server at port 8001. Is it running?")
                    return None
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                         logger.warning(f"Model not found for {symbol}")
                         return None
                    logger.error(f"ML Server error: {e}")
                    return None

            # Transform to schema (Same logic as before)
            predictions = {}
            main_signal = "NEUTRAL"
            main_confidence = 0.0
            
            for horizon, pred in data["predictions"].items():
                
                # Frontend expects "1d", "7d", etc.
                key = f"{horizon}d" if not str(horizon).endswith("d") else str(horizon)
                
                predictions[key] = {
                    "price": pred["price"],
                    "change": pred.get("change"),
                    "change_percent": pred.get("change_percent"),
                    "confidence": pred.get("confidence")
                }
                
                if str(horizon) == "7" or str(horizon) == "7d":
                    main_signal = pred.get("signal", "NEUTRAL")
                    main_confidence = pred.get("confidence", 0.0)
                elif (str(horizon) == "1" or str(horizon) == "1d") and main_signal == "NEUTRAL":
                     main_signal = pred.get("signal", "NEUTRAL")
                     main_confidence = pred.get("confidence", 0.0)

            response = PredictionResponse(
                symbol=data["symbol"],
                current_price=data.get("current_price", 0.0),
                timestamp=data.get("timestamp", datetime.now().isoformat()),
                signal=main_signal,
                overall_confidence=main_confidence,
                reasoning=data.get("reasoning"),
                predictions=predictions
            )
            # Cache the result in Redis
            cache_key = f"prediction:{symbol}"
            try:
                await redis_client.setex(
                    cache_key, 
                    self._cache_ttl, 
                    response.json()
                )
            except Exception as e:
                logger.warning(f"Failed to set Redis cache for {symbol}: {e}")
                
            return response

        except Exception as e:
            logger.error(f"Prediction service error: {e}")
            return None

    async def refresh_models(self):
        """Clear all prediction keys from Redis"""
        try:
            keys = await redis_client.keys("prediction:*")
            if keys:
                await redis_client.delete(*keys)
            logger.info(f"Cleared {len(keys)} prediction keys from Redis")
        except Exception as e:
            logger.error(f"Failed to clear Redis model cache: {e}")

prediction_service = PredictionService()
