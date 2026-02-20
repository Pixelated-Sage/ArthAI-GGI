"""
Hybrid Ensemble Model: LSTM + XGBoost weighted combination.
Produces final predictions with confidence intervals.
"""

import numpy as np
import pandas as pd
import pickle
import json
from pathlib import Path
from datetime import datetime
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import PREDICTION_HORIZONS

from lstm_model import MultiHorizonLSTM
from xgboost_model import MultiHorizonXGBoost
from utils import DataScaler


class HybridPredictor:
    """
    Ensemble model combining LSTM (temporal patterns) + XGBoost (non-linear features).
    Final prediction = w_lstm * LSTM_pred + w_xgb * XGBoost_pred
    """

    def __init__(self, horizons=None, lstm_weight=0.6, xgb_weight=0.4):
        self.horizons = horizons or PREDICTION_HORIZONS
        self.lstm_weight = lstm_weight
        self.xgb_weight = xgb_weight
        self.lstm_models = None
        self.xgb_models = None
        self.scaler = None
        self.optimized_weights = {}  # {horizon: (lstm_w, xgb_w)} after tuning

    def set_models(self, lstm_models, xgb_models, scaler=None):
        """Set pre-trained models"""
        self.lstm_models = lstm_models
        self.xgb_models = xgb_models
        self.scaler = scaler

    def predict(self, X_lstm, X_xgb_dict, inverse_scale=True):
        """
        Generate ensemble predictions for all horizons.

        Args:
            X_lstm: LSTM input (3D sequences)
            X_xgb_dict: {horizon: XGBoost features DataFrame}
            inverse_scale: Whether to inverse-transform predictions

        Returns:
            predictions: {horizon: {
                'lstm': array, 'xgb': array, 'ensemble': array,
                'confidence': array
            }}
        """
        predictions = {}

        for horizon in self.horizons:
            # LSTM prediction
            lstm_pred = self.lstm_models.models[horizon].predict(X_lstm)

            # XGBoost prediction
            xgb_pred = self.xgb_models.models[horizon].predict(X_xgb_dict[horizon])

            # Match lengths
            min_len = min(len(lstm_pred), len(xgb_pred))
            lstm_pred = lstm_pred[:min_len]
            xgb_pred = xgb_pred[:min_len]

            # CRITICAL FIX: Inverse transform LSTM to raw cumulative return before combining
            if self.scaler:
                lstm_pred = self.scaler.inverse_transform_target_cumulative(lstm_pred, horizon)

            # Get weights (use optimized if available)
            if horizon in self.optimized_weights:
                w_lstm, w_xgb = self.optimized_weights[horizon]
            else:
                w_lstm, w_xgb = self.lstm_weight, self.xgb_weight

            # Weighted ensemble (now both are raw prices)
            ensemble_pred = (w_lstm * lstm_pred) + (w_xgb * xgb_pred)

            # Confidence based on agreement between models
            # Higher agreement = higher confidence
            diff = np.abs(lstm_pred - xgb_pred) / np.abs(ensemble_pred + 1e-8)
            confidence = np.clip(1 - diff, 0.3, 0.95)  # 30-95% range

            # Note: No need to inverse_scale ensemble_pred as we did it internally above
            
            predictions[horizon] = {
                "lstm": lstm_pred,
                "xgb": xgb_pred,
                "ensemble": ensemble_pred,
                "confidence": confidence,
                "weights": {"lstm": w_lstm, "xgb": w_xgb},
            }

        return predictions

    def optimize_weights(self, X_lstm, y_dict, X_xgb_dict, y_xgb_dict):
        """
        Find optimal weights per horizon using validation data.
        Grid search over weight combinations.

        Args:
            X_lstm: LSTM validation sequences
            y_dict: {horizon: y_true} for LSTM (scaled)
            X_xgb_dict: {horizon: X_features}
            y_xgb_dict: {horizon: y_true} for XGBoost
        """
        print("\n🔧 Optimizing ensemble weights...")

        for horizon in self.horizons:
            lstm_pred = self.lstm_models.models[horizon].predict(X_lstm)
            xgb_pred = self.xgb_models.models[horizon].predict(X_xgb_dict[horizon])

            # Match lengths
            min_len = min(len(lstm_pred), len(xgb_pred))
            lstm_pred = lstm_pred[:min_len]
            xgb_pred = xgb_pred[:min_len]
            
            # Use RAW target from XGBoost dict as ground truth
            y_true = y_xgb_dict[horizon][:min_len]

            # Inverse transform LSTM to raw scale
            if self.scaler:
                 lstm_pred = self.scaler.inverse_transform_target_cumulative(lstm_pred, horizon)

            best_mse = float("inf")
            best_w = (0.5, 0.5)

            # Grid search
            for w in np.arange(0.0, 1.05, 0.05):
                ensemble = w * lstm_pred + (1 - w) * xgb_pred
                # Calculate MSE on raw prices
                mse = np.mean((ensemble - y_true) ** 2)
                if mse < best_mse:
                    best_mse = mse
                    best_w = (round(w, 2), round(1 - w, 2))

            self.optimized_weights[horizon] = best_w
            print(f"   {horizon}d: LSTM={best_w[0]:.2f}, XGB={best_w[1]:.2f} (MSE: {best_mse:.6f})")

    def predict_single(self, X_lstm_single, X_xgb_single_dict, inverse_scale=True):
        """
        Predict for a single input (for API inference).

        Args:
            X_lstm_single: Single LSTM sequence (1, timesteps, features)
            X_xgb_single_dict: {horizon: single row of XGBoost features}

        Returns:
            dict: {horizon: {'price': float, 'confidence': float}}
        """
        result = {}

        for horizon in self.horizons:
            lstm_pred = self.lstm_models.models[horizon].predict(X_lstm_single)
            xgb_pred = self.xgb_models.models[horizon].predict(X_xgb_single_dict[horizon])
            
            # CRITICAL FIX: Inverse transform LSTM to raw cumulative return before combining
            if self.scaler:
                lstm_pred = self.scaler.inverse_transform_target_cumulative(lstm_pred, horizon)

            if horizon in self.optimized_weights:
                w_lstm, w_xgb = self.optimized_weights[horizon]
            else:
                w_lstm, w_xgb = self.lstm_weight, self.xgb_weight

            # Combine raw prices
            ensemble = w_lstm * lstm_pred[0] + w_xgb * xgb_pred[0]

            # Confidence from model agreement
            diff = abs(lstm_pred[0] - xgb_pred[0]) / (abs(ensemble) + 1e-8)
            confidence = float(np.clip(1 - diff, 0.3, 0.95))

            # Result is already in raw price
            result[horizon] = {
                "price": float(ensemble),
                "confidence": confidence,
            }

        return result

    def save(self, save_dir):
        """Save hybrid model state"""
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)

        state = {
            "lstm_weight": self.lstm_weight,
            "xgb_weight": self.xgb_weight,
            "optimized_weights": self.optimized_weights,
            "horizons": self.horizons,
        }

        with open(save_dir / "hybrid_config.json", "w") as f:
            json.dump(state, f, indent=2, default=str)

        print(f"💾 Hybrid config saved to {save_dir}")

    def load(self, save_dir):
        """Load hybrid model state"""
        config_path = Path(save_dir) / "hybrid_config.json"
        if config_path.exists():
            with open(config_path) as f:
                state = json.load(f)
            self.lstm_weight = state["lstm_weight"]
            self.xgb_weight = state["xgb_weight"]
            self.optimized_weights = {
                int(k): tuple(v) for k, v in state.get("optimized_weights", {}).items()
            }
            print(f"✅ Hybrid config loaded, weights: {self.optimized_weights}")


class PredictionResult:
    """Structured prediction output for API consumption"""

    def __init__(self, symbol, predictions, current_price=None, reasoning=None):
        self.symbol = symbol
        self.predictions = predictions
        self.current_price = current_price
        self.timestamp = datetime.now().isoformat()
        self.reasoning = reasoning

    def to_dict(self):
        """Convert to API-ready dictionary"""
        result = {
            "symbol": self.symbol,
            "current_price": self.current_price,
            "timestamp": self.timestamp,
            "reasoning": self.reasoning,
            "predictions": {},
        }

        for horizon, pred in self.predictions.items():
            predicted_price = pred["price"]
            change = None
            change_pct = None
            if self.current_price:
                change = predicted_price - self.current_price
                change_pct = (change / self.current_price) * 100

            result["predictions"][f"{horizon}d"] = {
                "price": round(predicted_price, 2),
                "change": round(change, 2) if change else None,
                "change_percent": round(change_pct, 2) if change_pct else None,
                "confidence": round(pred["confidence"], 3),
                "signal": pred.get("signal", "NEUTRAL")
            }

        return result

    def to_json(self):
        return json.dumps(self.to_dict(), indent=2)


if __name__ == "__main__":
    print("Hybrid model module loaded successfully.")
