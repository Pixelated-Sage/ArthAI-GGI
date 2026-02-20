import sys
import os
import json
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import mean_squared_error, mean_absolute_error
import argparse

# Add ml/ paths
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent / "src"))

# Import from ml.config if running from root, or local config
try:
    from config import STOCK_SYMBOLS, DATA_DIR, MODEL_SAVE_DIR, PREDICTION_HORIZONS, TEST_SPLIT, LSTM_CONFIG
except ImportError:
    # Fallback if running from ml/ dir
    sys.path.append(str(Path(__file__).parent))
    from config import STOCK_SYMBOLS, DATA_DIR, MODEL_SAVE_DIR, PREDICTION_HORIZONS, TEST_SPLIT, LSTM_CONFIG

from src.utils import DataScaler, get_feature_columns, split_data, load_processed_data
from src.sequence_generator import SequenceGenerator
from src.lstm_model import MultiHorizonLSTM
from src.xgboost_model import MultiHorizonXGBoost
from src.hybrid_model import HybridPredictor

def calculate_directional_accuracy(y_true, y_pred):
    """
    Calculate the percentage of times the prediction direction matches the actual direction.
    """
    matches = (np.sign(y_true) == np.sign(y_pred))
    return np.mean(matches) * 100

def predict_ensemble(hybrid, h, X_lstm, X_xgb):
    """Manual ensemble prediction since HybridPredictor doesn't have predict_horizon"""
    # 1. Individual Predictions
    # Access models directly from hybrid instance
    lstm_pred = hybrid.lstm_models.models[h].predict(X_lstm)
    xgb_pred = hybrid.xgb_models.models[h].predict(X_xgb)
    
    # 2. Match lengths
    min_len = min(len(lstm_pred), len(xgb_pred))
    lstm_pred = lstm_pred[:min_len]
    xgb_pred = xgb_pred[:min_len]
    
    # 3. Inverse Transform LSTM (it comes scaled)
    if hybrid.scaler:
        lstm_pred = hybrid.scaler.inverse_transform_target_cumulative(lstm_pred, h)
    
    # 4. Get Weights
    w_lstm, w_xgb = 0.5, 0.5
    if h in hybrid.optimized_weights:
        w_lstm, w_xgb = hybrid.optimized_weights[h]
    else:
        # Fallback to defaults
        w_lstm = getattr(hybrid, 'lstm_weight', 0.6)
        w_xgb = getattr(hybrid, 'xgb_weight', 0.4)
            
    # 5. Ensemble (Weighted Average)
    # XGBoost predicts raw values (unscaled CUMULATIVE returns)
    # LSTM is now inverse-transformed to raw CUMULATIVE returns
    ensemble_pred = (w_lstm * lstm_pred) + (w_xgb * xgb_pred)
    
    return ensemble_pred.flatten()



def evaluate_symbol(symbol):
    print(f"\n🔍 Analyzing {symbol}...")
    
    # 1. Load Processed Data
    features_df = load_processed_data(symbol)
    if features_df is None:
        print(f"⏩ Skipping {symbol}: No data found.")
        return None

    # 2. Reproduce Train/Test Split
    _, _, test_df = split_data(features_df, train_ratio=0.7, val_ratio=0.15)
    
    if len(test_df) < LSTM_CONFIG["sequence_length"] + max(PREDICTION_HORIZONS):
         print(f"⚠️ Test set too small ({len(test_df)} rows). Skipping.")
         return None

    # 3. Load Models & Scaler
    model_dir = MODEL_SAVE_DIR / symbol
    if not model_dir.exists():
        print(f"⏩ Skipping {symbol}: No model found (likely failed training).")
        return None
        
    scaler = DataScaler()
    try:
        scaler.load(model_dir / "scaler.pkl")
    except Exception as e:
        print(f"❌ Failed to load scaler: {e}")
        return None
        
    # 4. Prepare Test Sequences
    # Scale Features for LSTM
    feature_cols = get_feature_columns(test_df)
    try:
        test_scaled_np = scaler.feature_scaler.transform(test_df[feature_cols].values)
        test_scaled_df = pd.DataFrame(test_scaled_np, columns=feature_cols, index=test_df.index)
        
        # Ensure target col is present in scaled df for y generation
        if "log_return" not in test_scaled_df.columns:
            # Maybe it was excluded from features?
            # It should be there if it was used for training.
            # If not, let's copy it from test_df and transform it?
            # Or just use test_df['log_return'] if we don't care about y_lstm (we do need y_lstm for true label validation)
            pass
            
            # Actually, calculate y_true manually to be safe
            
    except Exception as e:
        print(f"❌ Data transform failed: {e}")
        return None
        
    # Generate Sequences
    gen = SequenceGenerator(sequence_length=LSTM_CONFIG["sequence_length"])
    
    # LSTM Sequences (X_test, y_test)
    # y_test here is SCALED log_return
    X_lstm, y_lstm_scaled_dict, dates = gen.create_sequences(test_scaled_df, target_col="log_return", horizons=PREDICTION_HORIZONS)
    
    # XGBoost Features (UNSCALED)
    X_xgb = {}
    y_xgb_raw_dict = {} 
    
    for h in PREDICTION_HORIZONS:
        try:
            # Use test_df (UNSCALED)
            bx, by, bdates = gen.create_xgboost_features(test_df, target_col="log_return", horizon=h)
            
            bx_df = pd.DataFrame(bx, index=bdates)
            by_series = pd.Series(by, index=bdates)
            
            # Intersection with LSTM dates
            common_dates = [d for d in dates if d in bx_df.index]
            
            if not common_dates:
                 print(f"⚠️ No common dates for horizon {h}")
                 continue

            X_xgb[h] = bx_df.loc[common_dates].values
            y_xgb_raw_dict[h] = by_series.loc[common_dates].values
            
        except Exception as e:
            print(f"⚠️ XGB prep failed for h={h}: {e}")
            # continue
            return None

    # Load Hybrid (Weights)
    hybrid = HybridPredictor()
    hybrid.load(model_dir)
    
    # Load Sub-models
    lstm_model = MultiHorizonLSTM()
    lstm_model.load_all(model_dir)
    xgb_model = MultiHorizonXGBoost()
    xgb_model.load_all(model_dir)
    
    hybrid.set_models(lstm_model, xgb_model, scaler)
    
    # Predict & Evaluate
    metrics = {}
    
    print(f"   📊 Evaluating on ~{len(dates)} samples...")
    
    # Get Log Return stats for manual inverse transform (Actually handled by scaler now, but let's keep it safe or remove it)
    pass

    for h in PREDICTION_HORIZONS:
        if h not in X_xgb: continue
        
        # ... (Same date alignment logic) ...
        # Get dates for XGB
        _, _, bdates = gen.create_xgboost_features(test_df, target_col="log_return", horizon=h)
        bdates_set = set(bdates)
        
        # Indices in LSTM
        valid_indices = [i for i, d in enumerate(dates) if d in bdates_set]
        
        if not valid_indices:
             continue
             
        curr_X_lstm = X_lstm[valid_indices]
        curr_y_true_scaled = y_lstm_scaled_dict[h][valid_indices]
        
        # Get XGB corresponding rows
        bx, _, bdates = gen.create_xgboost_features(test_df, target_col="log_return", horizon=h)
        bx_df = pd.DataFrame(bx, index=bdates)
        
        # Get common dates from valid_indices
        target_dates = [dates[i] for i in valid_indices]
        curr_X_xgb = bx_df.loc[target_dates].values
        
        # Metrics
        # Check if models exist for this horizon
        if h not in hybrid.lstm_models.models or h not in hybrid.xgb_models.models:
             print(f"⚠️ Skipping h={h}: Model missing.")
             continue
             
        # 1. Individual Predictions
        lstm_pred_scaled = hybrid.lstm_models.models[h].predict(curr_X_lstm)
        xgb_pred_raw = hybrid.xgb_models.models[h].predict(curr_X_xgb) 
        # XGB is trained on unscaled targets if we aren't careful? 
        # create_xgboost_features uses raw df. 
        # But wait, create_xgboost_features returns y from the column. 
        # If passed df is test_df (unscaled log_return), then XGB predicts unscaled log_return.
        # So xgb_pred_raw is Real Log Return.
        
        # LSTM predicts Scaled CUMULATIVE Log Return (Z-score sum).
        # We must unscale LSTM to Real CUMULATIVE Log Return.
        # Use the scaler method we added
        lstm_pred_real = scaler.inverse_transform_target_cumulative(lstm_pred_scaled, h)
        
        # Weights
        w_lstm, w_xgb = 0.5, 0.5
        if h in hybrid.optimized_weights:
            w_lstm, w_xgb = hybrid.optimized_weights[h]
            
        # Ensemble (Both are now Real Log Returns)
        # Ensure shapes match
        min_len = min(len(lstm_pred_real), len(xgb_pred_raw))
        preds_real = (w_lstm * lstm_pred_real[:min_len]) + (w_xgb * xgb_pred_raw[:min_len])
        preds_real = preds_real.flatten()
        
        # True values (from LSTM scaled y)
        y_true_real = scaler.inverse_transform_target_cumulative(curr_y_true_scaled[:min_len], h)
        y_true_real = y_true_real.flatten()
        
        # Metrics on LOG RETURNS
        rmse = np.sqrt(mean_squared_error(y_true_real, preds_real))
        mae = mean_absolute_error(y_true_real, preds_real)
        dir_acc = calculate_directional_accuracy(y_true_real, preds_real)
        
        metrics[h] = {
            "RMSE": round(rmse, 6),
            "MAE_LogReturn": round(mae, 6),
            "Directional_Acc": round(dir_acc, 2)
        }
        
    return metrics

def generate_report(all_metrics):
    report_path = Path("ml/model_accuracy_report.md")
    
    content = "# FinPredict Model Accuracy Report\n\n"
    content += f"Generated: {pd.Timestamp.now()}\n\n"
    
    content += "## Summary\n"
    content += "| Symbol | Horizon | Directional Acc (%) | MAE (LogReturn) | RMSE |\n"
    content += "|--------|---------|---------------------|-----------------|------|\n"
    
    for symbol, horizons in all_metrics.items():
        for h, m in horizons.items():
            icon = "✅" if m['Directional_Acc'] > 55 else "⚠️" if m['Directional_Acc'] < 50 else "➖"
            content += f"| **{symbol}** | {h}d | {icon} {m['Directional_Acc']}% | {m['MAE_LogReturn']} | {m['RMSE']} |\n"
        content += "| | | | | |\n" 
            
    with open(report_path, "w") as f:
        f.write(content)
        
    print(f"\n📝 Report saved to {report_path}")

def main():
    all_metrics = {}
    symbols = STOCK_SYMBOLS
    
    for symbol in symbols:
        metrics = evaluate_symbol(symbol)
        if metrics:
            all_metrics[symbol] = metrics
            
    generate_report(all_metrics)

if __name__ == "__main__":
    main()
