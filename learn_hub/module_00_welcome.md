# Module 0: Welcome to FinPredict Learn Hub

**Welcome to the arthAI FinPredict Curriculum.**
This Learn Hub is designed to take you from zero knowledge of financial data science to building production-ready stock prediction systems using advanced machine learning and deep learning.

---

## 🎯 Learning Objectives

By the end of this curriculum, you will be able to:

1.  Navigate financial datasets (OHLCV, tick data) and understand market microstructure.
2.  Perform rigorous Technical Analysis (TA) using Python.
3.  Engineer robust features for ML models (lag features, rolling windows, volatility).
4.  Build and evaluate predictive models using XGBoost and LSTM/Transformers.
5.  Deploy models in a production-like environment with Docker, FastAPI, and TimescaleDB.

---

## 🛤️ Choose Your Track

### 1. The Quantitative Trader Track

_Focus: Strategy, Backtesting, Risk Management_

- **Key Modules**: 1, 2, 7, 8
- **Goal**: develop profitable trading strategies and backtest them.

### 2. The ML Engineer Track

_Focus: Model Architecture, MLOps, Deployment_

- **Key Modules**: 3, 4, 5, 6, 9
- **Goal**: Deploy scalable AI services for financial inference.

---

## ⏱️ Curriculum Overview & Time Estimates

| Module | Topic                       | Est. Time | Focus                                |
| :----- | :-------------------------- | :-------- | :----------------------------------- |
| **00** | **Welcome & Setup**         | 30 min    | Environment Setup                    |
| **01** | **Stock Market Essentials** | 2 hours   | OHLCV, Candlesticks, Visualization   |
| **02** | **Technical Analysis**      | 3 hours   | Indicators (RSI, MACD), Trends       |
| **03** | **Data Engineering**        | 4 hours   | Cleaning, TimescaleDB, Ingestion     |
| **04** | **Feature Engineering**     | 5 hours   | Lags, Rolling Stats, Stationarity    |
| **05** | **ML Forecasting**          | 6 hours   | XGBoost, LSTM, Evaluation Metrics    |
| **06** | **Hybrid Production**       | 4 hours   | Ensembling, Model Serving            |
| **07** | **Backtesting**             | 5 hours   | Vectorized Backtesting, Walk-Forward |
| **08** | **Explainability & Risk**   | 3 hours   | SHAP, Value at Risk (VaR)            |
| **09** | **Deployment & Monitoring** | 4 hours   | Docker, FastAPI, Drift Detection     |

---

## 🛠️ Prerequisites & Setup

### Option A: Local Development (Recommended)

You will need **Docker** and **Python 3.10+**.

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/arthAI/finpredict.git
    cd finpredict/learn_hub
    ```

2.  **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3.  **Start Infrastructure (Optional/Advanced)**:
    ```bash
    cd docker
    docker-compose up -d
    ```
    _This starts TimescaleDB, Redis, and a Jupyter Lab instance._

### Option B: Google Colab

Most notebooks can be run directly in Google Colab.

- Upload the `.ipynb` files from the `notebooks/` directory to your Google Drive.
- Upload `demo_data/nifty50_sample.csv` to the Colab runtime.

---

## 🚀 Getting Started

Proceed to **[Module 01: Stock Market Essentials](./module_01_stock_essentials.md)** to begin your journey.
