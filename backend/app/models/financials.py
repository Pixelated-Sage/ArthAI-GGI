from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from app.db.base import Base
import datetime

class OHLCVData(Base):
    __tablename__ = "ohlcv_data"

    # Composite primary key on symbol and timestamp since 'id' doesn't exist in DB
    symbol = Column(String, primary_key=True, index=True, nullable=False)
    asset_type = Column(String, nullable=True) # Added field found in DB
    timestamp = Column(DateTime, primary_key=True, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    __table_args__ = (
        Index("ix_ohlcv_symbol_timestamp", "symbol", "timestamp"),
    )

class ModelPrediction(Base):
    __tablename__ = "model_predictions_log"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)
    prediction_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_date = Column(DateTime, nullable=False)
    predicted_price = Column(Float, nullable=False)
    confidence_score = Column(Float)
    model_version = Column(String)

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    asset_symbol = Column(String, index=True)
    metric_name = Column(String, nullable=False) # RMSE, MAE, etc.
    metric_value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
