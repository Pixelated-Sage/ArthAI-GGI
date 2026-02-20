from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from starlette.concurrency import run_in_threadpool
from app.api import deps
from app.services.prediction_service import prediction_service
from app.schemas.prediction import PredictionResponse

router = APIRouter()

@router.get("/{symbol}", response_model=PredictionResponse)
async def get_prediction(symbol: str) -> Any:
    """
    Get latest prediction for a symbol using the ML pipeline.
    
    - **symbol**: Ticker symbol (e.g. AAPL, BTC)
    """
    # Service handles concurrency and caching
    prediction = await prediction_service.get_prediction(symbol)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction for {symbol} not found. Ensure model is trained."
        )

    return prediction

@router.post("/refresh")
async def refresh_models(
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Clear model cache (requires auth).
    """
    await prediction_service.refresh_models()
    return {"message": "Model cache cleared"}
