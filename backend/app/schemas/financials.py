from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class PredictionBase(BaseModel):
    symbol: str = Field(..., example="AAPL")
    predicted_price: float
    confidence_score: Optional[float] = None
    target_date: datetime

class PredictionCreate(PredictionBase):
    pass

class Prediction(PredictionBase):
    id: int
    prediction_date: datetime
    model_version: Optional[str] = None

    class Config:
        from_attributes = True

class OHLCV(BaseModel):
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

    class Config:
        from_attributes = True

class SentimentResponse(BaseModel):
    symbol: str
    sentiment_score: float # -1 to 1
    label: str # Bearish, Neutral, Bullish
    timestamp: datetime
