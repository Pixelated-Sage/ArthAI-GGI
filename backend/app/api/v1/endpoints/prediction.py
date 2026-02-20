from fastapi import APIRouter, HTTPException, Depends
from starlette.concurrency import run_in_threadpool

from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import prediction_service

router = APIRouter()

@router.get("/{symbol}", response_model=PredictionResponse)
async def get_prediction(symbol: str):
    """
    Get price predictions for a given symbol (stock or crypto).
    
    - **symbol**: Ticker symbol (e.g. AAPL, BTC, ETH)
    """
    prediction = await prediction_service.get_prediction(symbol)
    
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail=f"Prediction not found for symbol {symbol}. Ensure model is trained and data is available."
        )
    
    return prediction

@router.post("/refresh")
async def refresh_models():
    """
    Clear the model cache. Use this after retraining models.
    """
    await prediction_service.refresh_models()
    return {"message": "Model cache cleared"}
