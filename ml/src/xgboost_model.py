"""
XGBoost Model for FinPredict price prediction.
Handles non-linear relationships and provides feature importance.
"""

import numpy as np
import pandas as pd
import pickle
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import XGBOOST_CONFIG, PREDICTION_HORIZONS

import xgboost as xgb
from sklearn.metrics import mean_squared_error, mean_absolute_error


class XGBoostPredictor:
    """XGBoost model for tabular price prediction"""

    def __init__(self, config=None):
        self.config = config or XGBOOST_CONFIG
        self.model = None
        self.feature_importance = None
        self.feature_names = None

    def build_model(self):
        """Initialize XGBoost regressor"""
        self.model = xgb.XGBRegressor(
            max_depth=self.config["max_depth"],
            learning_rate=self.config["learning_rate"],
            n_estimators=self.config["n_estimators"],
            subsample=self.config["subsample"],
            colsample_bytree=self.config["colsample_bytree"],
            objective="reg:squarederror",
            booster="gbtree",
            random_state=42,
            n_jobs=-1,
            verbosity=1,
        )
        print("🌲 XGBoost model initialized")
        return self.model

    def train(self, X_train, y_train, X_val, y_val):
        """
        Train XGBoost model.

        Args:
            X_train (pd.DataFrame or np.ndarray): Training features
            y_train (np.ndarray): Training targets
            X_val: Validation features
            y_val: Validation targets

        Returns:
            dict: Training metrics
        """
        if self.model is None:
            self.build_model()

        # Store feature names
        if isinstance(X_train, pd.DataFrame):
            self.feature_names = list(X_train.columns)

        print(f"\n🏋️ Training XGBoost...")
        print(f"   Train samples: {len(X_train)}")
        print(f"   Val samples: {len(X_val)}")
        print(f"   Features: {X_train.shape[1]}")

        self.model.fit(
            X_train,
            y_train,
            eval_set=[(X_train, y_train), (X_val, y_val)],
            verbose=10,
        )

        # Get feature importance
        self.feature_importance = self.model.feature_importances_

        # Evaluate
        train_pred = self.model.predict(X_train)
        val_pred = self.model.predict(X_val)

        metrics = {
            "train_rmse": float(np.sqrt(mean_squared_error(y_train, train_pred))),
            "train_mae": float(mean_absolute_error(y_train, train_pred)),
            "val_rmse": float(np.sqrt(mean_squared_error(y_val, val_pred))),
            "val_mae": float(mean_absolute_error(y_val, val_pred)),
            "best_iteration": int(self.model.best_iteration) if hasattr(self.model, 'best_iteration') else self.config["n_estimators"],
        }

        print(f"\n✅ Training complete!")
        print(f"   Train RMSE: {metrics['train_rmse']:.4f}")
        print(f"   Val RMSE: {metrics['val_rmse']:.4f}")
        print(f"   Val MAE: {metrics['val_mae']:.4f}")

        return metrics

    def predict(self, X):
        """Generate predictions"""
        if self.model is None:
            raise ValueError("Model not loaded or trained.")
        return self.model.predict(X)

    def get_top_features(self, n=20):
        """Get top N most important features"""
        if self.feature_importance is None or self.feature_names is None:
            return None

        importance_df = pd.DataFrame({
            "feature": self.feature_names,
            "importance": self.feature_importance,
        }).sort_values("importance", ascending=False)

        return importance_df.head(n)

    def save(self, filepath):
        """Save model to pickle"""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        state = {
            "model": self.model,
            "feature_importance": self.feature_importance,
            "feature_names": self.feature_names,
            "config": self.config,
        }
        with open(filepath, "wb") as f:
            pickle.dump(state, f)
        print(f"💾 XGBoost model saved to {filepath}")

    def load(self, filepath):
        """Load model from pickle"""
        with open(filepath, "rb") as f:
            state = pickle.load(f)
        self.model = state["model"]
        self.feature_importance = state["feature_importance"]
        self.feature_names = state["feature_names"]
        self.config = state["config"]
        print(f"✅ XGBoost model loaded from {filepath}")


class MultiHorizonXGBoost:
    """Train separate XGBoost models per prediction horizon"""

    def __init__(self, horizons=None, config=None):
        self.horizons = horizons or PREDICTION_HORIZONS
        self.models = {}  # {horizon: XGBoostPredictor}
        self.config = config or XGBOOST_CONFIG

    def train_all(self, data_dict, save_dir=None):
        """
        Train XGBoost for each horizon.

        Args:
            data_dict: {horizon: (X_train, y_train, X_val, y_val)}
            save_dir: Directory to save models
        """
        results = {}

        for horizon in self.horizons:
            if horizon not in data_dict:
                print(f"⚠️  No data for {horizon}d horizon, skipping")
                continue

            print(f"\n{'='*60}")
            print(f"🌲 Training XGBoost for {horizon}-day prediction")
            print(f"{'='*60}")

            X_train, y_train, X_val, y_val = data_dict[horizon]

            predictor = XGBoostPredictor(self.config)
            metrics = predictor.train(X_train, y_train, X_val, y_val)

            self.models[horizon] = predictor
            results[horizon] = metrics

            # Print top features
            top_features = predictor.get_top_features(10)
            if top_features is not None:
                print(f"\n📊 Top 10 features for {horizon}d:")
                for _, row in top_features.iterrows():
                    print(f"   {row['feature']}: {row['importance']:.4f}")

            # Save
            if save_dir:
                model_path = Path(save_dir) / f"xgboost_{horizon}d.pkl"
                predictor.save(model_path)

        return results

    def predict_all(self, X_dict):
        """
        Predict for all horizons.

        Args:
            X_dict: {horizon: X_features} or single X if all use same features
        """
        predictions = {}
        for horizon, predictor in self.models.items():
            X = X_dict[horizon] if isinstance(X_dict, dict) else X_dict
            predictions[horizon] = predictor.predict(X)
        return predictions

    def load_all(self, save_dir):
        """Load all horizon models"""
        for horizon in self.horizons:
            model_path = Path(save_dir) / f"xgboost_{horizon}d.pkl"
            if model_path.exists():
                predictor = XGBoostPredictor(self.config)
                predictor.load(model_path)
                self.models[horizon] = predictor
            else:
                print(f"⚠️  XGBoost model not found for {horizon}d: {model_path}")


if __name__ == "__main__":
    print("XGBoost model module loaded successfully.")
    print(f"XGBoost version: {xgb.__version__}")
