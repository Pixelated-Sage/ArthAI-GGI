"""
Utility functions for FinPredict ML pipeline.
Handles data normalization, saving/loading, and common helpers.
"""

import numpy as np
import pandas as pd
import pickle
import json
from pathlib import Path
from datetime import datetime
from sklearn.preprocessing import StandardScaler
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from config import PROCESSED_DATA_DIR

class DataScaler:
    """StandardScaler wrapper with save/load for inference"""

    def __init__(self):
        self.scalers = {}  # {column_name: StandardScaler}
        self.feature_scaler = None
        self.target_scaler = None

    def fit_transform_features(self, df, feature_columns):
        """Standardize features (mean=0, std=1)"""
        self.feature_scaler = StandardScaler()
        scaled = self.feature_scaler.fit_transform(df[feature_columns].values)
        return pd.DataFrame(scaled, columns=feature_columns, index=df.index)

    def transform_features(self, df, feature_columns):
        """Transform features using already-fitted scaler"""
        if self.feature_scaler is None:
            raise ValueError("Feature scaler not fitted. Call fit_transform_features first.")
        scaled = self.feature_scaler.transform(df[feature_columns].values)
        return pd.DataFrame(scaled, columns=feature_columns, index=df.index)

    def fit_transform_target(self, values):
        """Standardize target variable"""
        self.target_scaler = StandardScaler()
        values = np.array(values).reshape(-1, 1)
        scaled = self.target_scaler.fit_transform(values)
        return scaled.flatten()

    def transform_target(self, values):
        """Transform target using already-fitted scaler"""
        values = np.array(values).reshape(-1, 1)
        return self.target_scaler.transform(values).flatten()

    def inverse_transform_target(self, values):
        """Reverse-scale target back to original price range"""
        values = np.array(values).reshape(-1, 1)
        return self.target_scaler.inverse_transform(values).flatten()

    def inverse_transform_target_cumulative(self, values, horizon):
        """
        Reverse-scale cumulative target (sum of scaled returns).
        Sum(y_scaled) = (Sum(y_real) - H*mean) / std
        Sum(y_real) = Sum(y_scaled)*std + H*mean
        """
        values = np.array(values).flatten()
        mean = self.target_scaler.mean_[0]
        std = self.target_scaler.scale_[0]
        
        return (values * std) + (horizon * mean)

    def save(self, filepath):
        """Save scaler state"""
        state = {
            "feature_scaler": self.feature_scaler,
            "target_scaler": self.target_scaler,
        }
        with open(filepath, "wb") as f:
            pickle.dump(state, f)

    def load(self, filepath):
        """Load scaler state"""
        with open(filepath, "rb") as f:
            state = pickle.load(f)
        self.feature_scaler = state["feature_scaler"]
        self.target_scaler = state["target_scaler"]


def split_data(df, train_ratio=0.7, val_ratio=0.15):
    """
    Split time-series data chronologically (no shuffle).

    Args:
        df: DataFrame sorted by time
        train_ratio: fraction for training
        val_ratio: fraction for validation
        (remaining goes to test)

    Returns:
        train_df, val_df, test_df
    """
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))

    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]

    print(f"📊 Data split:")
    print(f"   Train: {len(train_df)} rows ({train_df.index.min()} → {train_df.index.max()})")
    print(f"   Val:   {len(val_df)} rows ({val_df.index.min()} → {val_df.index.max()})")
    print(f"   Test:  {len(test_df)} rows ({test_df.index.min()} → {test_df.index.max()})")

    return train_df, val_df, test_df


def get_feature_columns(df, exclude=None):
    """Get feature columns, excluding OHLCV and specified columns"""
    if exclude is None:
        exclude = []
    
    # Always exclude raw OHLCV (we keep engineered versions)
    base_exclude = ["open", "high", "low", "close", "volume"]
    
    # Exclude non-stationary raw price indicators (absolute values)
    # We only want ratios, percentages, and oscillators [0-100]
    non_stationary = [
        "sma_5", "sma_10", "sma_20", "sma_50", "sma_200",
        "ema_12", "ema_26", "ema_50",
        "macd", "macd_signal", "macd_hist",  # MACD is absolute price difference
        "obv", "ad", "volume_sma_20"         # Volume cumulations are non-stationary
    ]
    
    all_exclude = set(base_exclude + non_stationary + exclude)
    
    return [col for col in df.columns if col not in all_exclude]


def save_model_metadata(symbol, model_type, metrics, save_dir):
    """Save model training metadata as JSON"""
    metadata = {
        "symbol": symbol,
        "model_type": model_type,
        "trained_at": datetime.now().isoformat(),
        "metrics": metrics,
        "python_version": sys.version,
    }

    filepath = Path(save_dir) / f"{symbol}_{model_type}_metadata.json"
    with open(filepath, "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    print(f"💾 Metadata saved to {filepath}")
    return metadata


def load_processed_data(symbol, directory=PROCESSED_DATA_DIR):
    """Load processed feature-engineered data"""
    filepath = Path(directory) / f"{symbol}_features.csv"
    if not filepath.exists():
        print(f"❌ Processed data not found: {filepath}")
        return None

    df = pd.read_csv(filepath, index_col=0, parse_dates=True)
    print(f"✅ Loaded {len(df)} rows of processed data for {symbol}")
    return df


def ensure_dir(path):
    """Create directory if it doesn't exist"""
    Path(path).mkdir(parents=True, exist_ok=True)
    return Path(path)
