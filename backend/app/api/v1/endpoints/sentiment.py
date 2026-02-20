from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.schemas import financials as schemas
import random
from datetime import datetime

router = APIRouter()

@router.get("/{symbol}", response_model=schemas.SentimentResponse)
async def get_sentiment(
    symbol: str, 
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    Get recent sentiment analysis for a symbol.
    """
    # This should call your FinGPT service or fetch from Firestore
    # For now, it's a simulated response
    score = random.uniform(-1, 1)
    label = "Bullish" if score > 0.3 else "Bearish" if score < -0.3 else "Neutral"
    
    return {
        "symbol": symbol.upper(),
        "sentiment_score": round(score, 2),
        "label": label,
        "timestamp": datetime.utcnow()
    }
