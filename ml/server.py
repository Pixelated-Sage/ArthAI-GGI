import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Optional
import logging
import asyncio
from datetime import datetime

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import inference logic
from inference import FinPredictInference

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MLServer")

import threading

# ... imports ...

# Global state
class ModelManager:
    def __init__(self, max_models: int = 50):  # Increased cache size
        self.models: Dict[str, FinPredictInference] = {}
        self.max_models = max_models
        self.access_history = []  # For LRU eviction
        self._lock = threading.Lock()
        self._loading_locks: Dict[str, threading.Lock] = {}
        self._keys_lock = threading.Lock() # For managing loading locks

    def get_predictor(self, symbol: str) -> FinPredictInference:
        symbol = symbol.upper()
        
        # 1. Fast Path: Check if model exists
        with self._lock:
            if symbol in self.models:
                # Move to end of access history (recently used)
                if symbol in self.access_history:
                    self.access_history.remove(symbol)
                self.access_history.append(symbol)
                return self.models[symbol]

        # 2. Slow Path: Load model
        # Get or create a lock specifically for this symbol to prevent duplicate loads
        with self._keys_lock:
            if symbol not in self._loading_locks:
                self._loading_locks[symbol] = threading.Lock()
            symbol_lock = self._loading_locks[symbol]

        with symbol_lock:
             # Double check after acquiring symbol lock
             with self._lock:
                if symbol in self.models:
                     return self.models[symbol]

             logger.info(f"Loading model for {symbol}...")
             try:
                 predictor = FinPredictInference(symbol)
                 predictor.load_models()
             except Exception as e:
                 logger.error(f"Failed to load model for {symbol}: {e}")
                 # Cleanup lock
                 with self._keys_lock:
                     if symbol in self._loading_locks:
                         del self._loading_locks[symbol]
                 raise HTTPException(status_code=500, detail=f"Model load failed: {str(e)}")

             with self._lock:
                 # Evict if full
                 if len(self.models) >= self.max_models:
                     lru_symbol = self.access_history.pop(0)
                     if lru_symbol in self.models:
                         logger.info(f"Evicting model for {lru_symbol}")
                         del self.models[lru_symbol]
                         import gc
                         gc.collect()
    
                 self.models[symbol] = predictor
                 self.access_history.append(symbol)

             # Cleanup lock
             with self._keys_lock:
                 if symbol in self._loading_locks:
                     del self._loading_locks[symbol]
                     
             return predictor

model_manager = ModelManager(max_models=50)

async def preload_models():
    # Top 5 NIFTY 50 by weight/popularity
    top_stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"]
    logger.info("🚀 Triggering background model preload...")
    for symbol in top_stocks:
        try:
            # Run in thread to not block event loop
            await asyncio.to_thread(model_manager.get_predictor, symbol)
            logger.info(f"✅ Preloaded {symbol}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to preload {symbol}: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ML Model Server...")
    # Start preloading task
    asyncio.create_task(preload_models())
    yield
    logger.info("Shutting down ML Model Server...")

app = FastAPI(lifespan=lifespan)

class PredictionRequest(BaseModel):
    symbol: str

@app.get("/health")
async def health():
    return {"status": "ok", "models_loaded": list(model_manager.models.keys())}

@app.get("/predict/{symbol}")
async def predict(symbol: str):
    try:
        predictor = model_manager.get_predictor(symbol)
        
        # Run prediction (blocking call, run in threadpool)
        loop = asyncio.get_event_loop()
        # Use predict_live for fresh data
        result = await loop.run_in_executor(None, predictor.predict_live)
        
        return result
    except HTTPException as he:
        # Rethrow HTTP exceptions
        raise he
    except ValueError as ve:
         # Likely "No trained models found"
         raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction error for {symbol}: {e}")
        # Return 503 if overloaded or 500 otherwise
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=False)
