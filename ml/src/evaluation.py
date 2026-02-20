"""
Model Evaluation for FinPredict.
Calculates RMSE, MAE, MAPE, R², direction accuracy, and generates reports.
"""

import numpy as np
import pandas as pd
import json
from pathlib import Path
from datetime import datetime
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import PREDICTION_HORIZONS

from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    mean_absolute_percentage_error,
    r2_score,
)


class ModelEvaluator:
    """Evaluate prediction models with financial-domain metrics"""

    def __init__(self):
        self.results = {}

    def evaluate(self, y_true, y_pred, model_name="model", horizon=1):
        """
        Compute all evaluation metrics.

        Args:
            y_true: Actual prices
            y_pred: Predicted prices
            model_name: Identifier for the model
            horizon: Prediction horizon in days

        Returns:
            dict: All metrics
        """
        y_true = np.array(y_true).flatten()
        y_pred = np.array(y_pred).flatten()

        # Ensure same length
        min_len = min(len(y_true), len(y_pred))
        y_true = y_true[:min_len]
        y_pred = y_pred[:min_len]

        # Core regression metrics
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        mae = float(mean_absolute_error(y_true, y_pred))
        mape = float(mean_absolute_percentage_error(y_true, y_pred) * 100)
        r2 = float(r2_score(y_true, y_pred))

        # Direction accuracy (did we predict up/down correctly?)
        if len(y_true) > 1:
            actual_direction = np.diff(y_true) > 0  # True = up
            pred_direction = np.diff(y_pred) > 0
            direction_acc = float(np.mean(actual_direction == pred_direction) * 100)
        else:
            direction_acc = 0.0

        # Max error
        max_error = float(np.max(np.abs(y_true - y_pred)))

        # Profit simulation: buy when predicted up, sell when predicted down
        if len(y_true) > 1:
            returns = np.diff(y_true) / y_true[:-1]
            strategy_returns = returns * np.where(np.diff(y_pred) > 0, 1, -1)
            cumulative_strategy = float(np.sum(strategy_returns) * 100)
            cumulative_baseline = float(((y_true[-1] / y_true[0]) - 1) * 100)
        else:
            cumulative_strategy = 0.0
            cumulative_baseline = 0.0

        metrics = {
            "model_name": model_name,
            "horizon": f"{horizon}d",
            "samples": int(min_len),
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "mape": round(mape, 2),
            "r2": round(r2, 4),
            "direction_accuracy": round(direction_acc, 2),
            "max_error": round(max_error, 4),
            "strategy_return": round(cumulative_strategy, 2),
            "baseline_return": round(cumulative_baseline, 2),
            "strategy_vs_baseline": round(cumulative_strategy - cumulative_baseline, 2),
        }

        key = f"{model_name}_{horizon}d"
        self.results[key] = metrics

        return metrics

    def compare_models(self, evaluations):
        """
        Create comparison table from multiple evaluations.

        Args:
            evaluations: list of metric dicts

        Returns:
            pd.DataFrame
        """
        df = pd.DataFrame(evaluations)
        df = df.sort_values("mape", ascending=True)
        return df

    def print_report(self, metrics):
        """Pretty-print evaluation results"""
        print(f"\n{'='*60}")
        print(f"📊 Evaluation Report: {metrics['model_name']} ({metrics['horizon']})")
        print(f"{'='*60}")
        print(f"  Samples:            {metrics['samples']}")
        print(f"  RMSE:               {metrics['rmse']}")
        print(f"  MAE:                {metrics['mae']}")
        print(f"  MAPE:               {metrics['mape']}%")
        print(f"  R²:                 {metrics['r2']}")
        print(f"  Direction Accuracy: {metrics['direction_accuracy']}%")
        print(f"  Max Error:          {metrics['max_error']}")
        print(f"  Strategy Return:    {metrics['strategy_return']}%")
        print(f"  Baseline Return:    {metrics['baseline_return']}%")
        print(f"  Alpha:              {metrics['strategy_vs_baseline']}%")

        # Quality assessment
        if metrics["mape"] < 5:
            print(f"  Grade: 🟢 EXCELLENT (MAPE < 5%)")
        elif metrics["mape"] < 7:
            print(f"  Grade: 🟡 GOOD (MAPE < 7%)")
        elif metrics["mape"] < 10:
            print(f"  Grade: 🟠 ACCEPTABLE (MAPE < 10%)")
        else:
            print(f"  Grade: 🔴 NEEDS IMPROVEMENT (MAPE >= 10%)")

        if metrics["direction_accuracy"] > 60:
            print(f"  Direction: ✅ PASS (> 60%)")
        else:
            print(f"  Direction: ❌ FAIL (< 60%)")

    def save_report(self, filepath):
        """Save all evaluation results to JSON"""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)

        report = {
            "generated_at": datetime.now().isoformat(),
            "evaluations": self.results,
        }

        with open(filepath, "w") as f:
            json.dump(report, f, indent=2, default=str)

        print(f"💾 Evaluation report saved to {filepath}")

    def generate_summary(self):
        """Generate a summary across all evaluated models"""
        if not self.results:
            print("No evaluations to summarize.")
            return None

        df = pd.DataFrame(self.results.values())

        print(f"\n{'='*70}")
        print(f"📋 EVALUATION SUMMARY")
        print(f"{'='*70}")

        # Best model per horizon
        for horizon in df["horizon"].unique():
            subset = df[df["horizon"] == horizon]
            best = subset.loc[subset["mape"].idxmin()]
            print(f"\n  Best for {horizon}: {best['model_name']} (MAPE: {best['mape']}%)")

        print(f"\n  Overall Average MAPE: {df['mape'].mean():.2f}%")
        print(f"  Overall Direction Accuracy: {df['direction_accuracy'].mean():.2f}%")
        print(f"{'='*70}")

        return df


if __name__ == "__main__":
    # Quick test with random data
    evaluator = ModelEvaluator()

    y_true = np.array([100, 102, 101, 105, 103, 108, 107, 110, 112, 115])
    y_pred = np.array([101, 103, 100, 104, 105, 107, 108, 111, 113, 114])

    metrics = evaluator.evaluate(y_true, y_pred, model_name="test_model", horizon=1)
    evaluator.print_report(metrics)
