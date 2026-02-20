from pydantic import BaseModel
from typing import Dict, Optional

class PredictionDetail(BaseModel):
    price: float
    change: Optional[float] = None
    change_percent: Optional[float] = None
    confidence: float

class PredictionResponse(BaseModel):
    symbol: str
    current_price: float
    timestamp: str
    signal: Optional[str] = "NEUTRAL"
    overall_confidence: Optional[float] = 0.0
    reasoning: Optional[str] = None
    predictions: Dict[str, PredictionDetail]
