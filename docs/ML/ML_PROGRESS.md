# FinPredict ML — Development Progress

## Status: 🟢 Core Implementation Complete

**Last Updated:** 2026-02-11

---

## Pipeline Overview

```
Data (TimescaleDB) → Feature Engineering (TA-Lib) → Sequences → LSTM + XGBoost → Hybrid Ensemble → Evaluation
```

## Files Implemented

| File                         | Description                                | Status  |
| ---------------------------- | ------------------------------------------ | ------- |
| `config.py`                  | Config, hyperparameters, DB connection     | ✅ Done |
| `src/data_preparation.py`    | Load OHLCV from TimescaleDB, clean data    | ✅ Done |
| `src/feature_engineering.py` | 36 technical indicators via TA-Lib         | ✅ Done |
| `src/utils.py`               | DataScaler, split_data, helpers            | ✅ Done |
| `src/sequence_generator.py`  | LSTM 3D sequences + XGBoost flat features  | ✅ Done |
| `src/lstm_model.py`          | 2-layer LSTM with BatchNorm, EarlyStopping | ✅ Done |
| `src/xgboost_model.py`       | XGBoost with feature importance            | ✅ Done |
| `src/hybrid_model.py`        | Weighted ensemble + confidence scoring     | ✅ Done |
| `src/evaluation.py`          | RMSE, MAE, MAPE, R², direction accuracy    | ✅ Done |
| `train.py`                   | Master training orchestrator (7 steps)     | ✅ Done |
| `inference.py`               | Model loading + prediction serving         | ✅ Done |

## Architecture

### LSTM Model

- 2 stacked LSTM layers (128 units each)
- Dropout (0.2) + BatchNormalization
- Dense head: 64 → 32 → 1
- Separate model per horizon (1d, 7d, 30d)
- EarlyStopping (patience=10) + ReduceLROnPlateau

### XGBoost Model

- 100 trees, max_depth=6, lr=0.1
- Lag features (1, 3, 5, 7, 14, 30 days)
- Rolling statistics (mean, std for windows 5, 10, 20)
- Separate model per horizon

### Hybrid Ensemble

- Weighted: w_lstm × LSTM + w_xgb × XGBoost
- Weights optimized via grid search on validation set
- Confidence = model agreement score (0.30 - 0.95)

### Features (36 indicators)

- **Price**: change (1d, 7d, 30d), HL spread, OC spread
- **Moving Averages**: SMA (5, 10, 20, 50, 200), EMA (12, 26, 50), distance from MAs
- **Momentum**: RSI, MACD (3 lines), Stochastic (K, D), ROC, CCI
- **Volatility**: Bollinger Bands (upper, mid, lower, width, position), ATR, HV
- **Volume**: SMA, ratio, OBV, A/D line

## Training Command

```bash
# Activate venv
source /data/venvs/FinpredictML/bin/activate

# Train all symbols
python ml/train.py

# Train single symbol
python ml/train.py --symbol AAPL

# Train with cached data (skip DB fetch)
python ml/train.py --symbol AAPL --skip-data

# Train specific symbols
python ml/train.py --symbols AAPL MSFT BTC
```

## Model Storage

```
/data/models/custom/finpredict/
├── AAPL/
│   ├── lstm_1d.keras          # LSTM for 1-day prediction
│   ├── lstm_7d.keras          # LSTM for 7-day prediction
│   ├── lstm_30d.keras         # LSTM for 30-day prediction
│   ├── xgboost_1d.pkl         # XGBoost for 1-day
│   ├── xgboost_7d.pkl         # XGBoost for 7-day
│   ├── xgboost_30d.pkl        # XGBoost for 30-day
│   ├── scaler.pkl             # MinMaxScaler state
│   ├── hybrid_config.json     # Ensemble weights
│   ├── evaluation_report.json # Metrics report
│   └── training_metadata.json # Training info
├── MSFT/
│   └── ... (same structure)
├── BTC/
│   └── ...
└── training_progress.json     # Overall progress
```

## Target Metrics

| Metric             | Target | Grade         |
| ------------------ | ------ | ------------- |
| MAPE               | < 5%   | 🟢 Excellent  |
| MAPE               | < 7%   | 🟡 Good       |
| MAPE               | < 10%  | 🟠 Acceptable |
| Direction Accuracy | > 60%  | ✅ Pass       |
| R²                 | > 0.85 | Good          |

## Next Steps

- [x] **Run training pipeline** (Fixed `KeyError: 7` in hybrid evaluation)
- [x] **Integrate inference.py with backend FastAPI**
  - [x] Solved dependency mismatch using `subprocess` call to `FinpredictML` venv.
  - [x] Implemented robust `PredictionService` with JSON parsing.
- [ ] **Train all 8 symbols** (In Progress - Running in background)
- [ ] Tune hyperparameters (improve direction accuracy from ~50% to >60%)
- [ ] Frontend Integration (Connect React UI to API)
- [ ] Add sentiment analysis integration (FinGPT)
- [ ] Setup model retraining scheduler (Celery)
