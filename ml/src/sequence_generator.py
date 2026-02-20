"""
Sequence Generator for LSTM and XGBoost input.
Standardizes data windows to ensure perfect alignment between models.
"""

import numpy as np
import pandas as pd
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import LSTM_CONFIG, PREDICTION_HORIZONS


class SequenceGenerator:
    """Create LSTM and XGBoost features from feature-engineered data"""

    def __init__(self, sequence_length=None):
        self.sequence_length = sequence_length or LSTM_CONFIG["sequence_length"]

    def create_sequences(self, data, target_col="close", horizons=None):
        """
        Create sliding window sequences for multi-horizon LSTM prediction.
        Target date D is predicted using history [D-60, ..., D-1].

        Returns:
            X (np.ndarray): Shape (samples, sequence_length, features)
            y (dict): {horizon: np.ndarray} for each prediction horizon
            dates (list): The actual dates being predicted (target dates)
        """
        if horizons is None:
            horizons = PREDICTION_HORIZONS

        max_horizon = max(horizons)
        all_feature_cols = list(data.columns)
        values = data[all_feature_cols].values
        
        # We start at sequence_length to have enough history.
        # We end at len - max_horizon to ensure all horizons have a target.
        X = []
        y = {h: [] for h in horizons}
        dates = []

        target_col_idx = list(data.columns).index(target_col)

        for i in range(self.sequence_length, len(values) - max_horizon + 1):
            # Input: sequence_length days of history (X ends at i-1)
            X.append(values[i - self.sequence_length : i])

            # Target for horizon 1 is at index i (the very next day)
            # Target for horizon H is at index i + H - 1
            # Target for horizon H is cumulative return over H days
            # From index i (t+1) to i+h-1 (t+h)
            for h in horizons:
                # Sum of log returns = log(Price(t+h)/Price(t))
                # Note: values[i:i+h] includes indices i, i+1, ... i+h-1
                y[h].append(np.sum(values[i : i+h, target_col_idx]))

            # The date identifying this prediction is the 1-day target date (index i)
            dates.append(data.index[i])

        X = np.array(X)
        for h in horizons:
            y[h] = np.array(y[h])

        print(f"📦 LSTM Sequences created: {len(dates)} samples")
        return X, y, dates

    def create_xgboost_features(self, data, target_col="close", horizon=1, inference=False):
        """
        Create flat features for XGBoost, perfectly aligned with LSTM.
        Uses lag features and rolling stats. 
        Ensures the first sample corresponds to the same target date as LSTM.
        """
        df = data.copy()
        
        # Add lag features (relative to 'now')
        for lag in [1, 3, 5, 7, 14, 30]:
            df[f"close_lag_{lag}"] = df[target_col].shift(lag)

        # Add rolling statistics
        for window in [5, 10, 20]:
            df[f"close_roll_mean_{window}"] = df[target_col].rolling(window).mean()
            df[f"close_roll_std_{window}"] = df[target_col].rolling(window).std()

        if inference:
             # For inference, we don't need targets. We just want the latest features.
             # We drop NaNs at the beginning (due to lags), but keep the end.
             df.dropna(inplace=True)
             
             # Exclude target column to match training features
             if target_col in df.columns:
                 df = df.drop(columns=[target_col])
             
             # We return the whole dataframe as X. Dates are the index.
             # Note: For inference, we typically only need the last row.
             return df, None, df.index

        # Define targets: Cumulative Return from T to T+H
        # This aligns with LSTM logic above.
        target_name = f"target_{horizon}d"
        
        # rolling(window=h).sum() calculates sum of [t-h+1 ... t]
        # We want sum of [t+1 ... t+h]
        # If we take rolling(h).sum() at t+h, it covers [t+1 ... t+h].
        # So we shift back by h.
        # df.shift(-horizon) puts value from t+h at t.
        df[target_name] = df[target_col].rolling(horizon).sum().shift(-horizon)
        
        # Important: XGBoost features at row T-1 contain 'close_lag_1' which is row T-2.
        # But wait, technical indicators like RSI are already at row T-1.
        
        # Drop NaN caused by lags/rolling/targets
        df.dropna(inplace=True)
        
        # Filter to ensure we start at the SAME date as LSTM (self.sequence_length)
        # Original data index [sequence_length] is the first target date.
        # So we need features from [sequence_length - 1].
        
        # We will filter the resulting dataframe to match dates with LSTM
        # LSTM dates start at original_index[sequence_length]
        # XGBoost row 'T-1' predicts target 'T' (horizon 1)
        # So XGBoost index should be target_date - 1.
        
        # Let's verify start point
        first_lstm_target_date = data.index[self.sequence_length]
        
        # Find features such that target date matches first_lstm_target_date
        # For horizon 1, target is at index i. For horizon H, target is i + H - 1.
        # So for a given row in df, the target date is index + horizon. NO.
        # In our df: df.loc[idx, target_name] is for target_date = data.index[data.index.get_loc(idx) + horizon]
        
        # Re-align:
        X_cols = [c for c in df.columns if c not in [target_name, target_col]]
        
        X_final = []
        y_final = []
        dates_final = []
        
        # We iterate over the exact range used by LSTM to ensure identity
        data_indices = {date: i for i, date in enumerate(data.index)}
        
        for i in range(self.sequence_length, len(data) - max(PREDICTION_HORIZONS) + 1):
            target_date = data.index[i]
            # Characteristics at i-1
            feature_date = data.index[i-1]
            
            if feature_date in df.index:
                # We need features from i-1 to predict i + horizon - 1
                # But wait, XGBoost typically uses 'most recent' data.
                # If we are at i-1, we want to predict i+h-1.
                # The 'target' we shifted earlier: df.loc[i-1, target_name] is data.loc[i-1 + horizon]
                # If horizon=1, it is data.loc[i]. Correct!
                
                X_final.append(df.loc[feature_date, X_cols].values)
                y_final.append(df.loc[feature_date, target_name])
                dates_final.append(target_date) # Identify by target date
                
        X = pd.DataFrame(X_final, columns=X_cols, index=dates_final)
        y = np.array(y_final)
        
        print(f"📦 XGBoost features (horizon={horizon}d): {len(dates_final)} samples")
        return X, y, dates_final
