import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = Path("/data/datasets/finpredict")
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = Path(__file__).parent / "data" / "models"  # Local model architecture code
MODEL_SAVE_DIR = Path("/data/models/custom/finpredict")  # Trained weights (on /data partition)

# Create directories
for dir_path in [RAW_DATA_DIR, PROCESSED_DATA_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Database Configuration
from dotenv import load_dotenv

# Load .env file from the project root (one level up from ml/)
load_dotenv(Path(__file__).parent.parent / ".env")

# Database Configuration
# Prioritize connection string if available
timescale_url = os.getenv("TIMESCALEDB_URL")
if timescale_url:
    DB_CONFIG = {"dsn": timescale_url}
else:
    DB_CONFIG = {
        "host": os.getenv("TIMESCALE_HOST"),
        "port": os.getenv("TIMESCALE_PORT", 5432),
        "database": os.getenv("TIMESCALE_DB"),
        "user": os.getenv("TIMESCALE_USER"),
        "password": os.getenv("TIMESCALE_PASSWORD"),
    }

# Symbols to train on
# Symbols to train on (Indian Market - NIFTY 50 Focus)
STOCK_SYMBOLS = [
    # "RELIANCE.NS",  # Reliance Industries
    "TCS.NS",       # Tata Consultancy Services
    # "HDFCBANK.NS",  # HDFC Bank
    # "INFY.NS",      # Infosys
    # "ICICIBANK.NS", # ICICI Bank
    "HINDUNILVR.NS",# Hindustan Unilever
    "ITC.NS",       # ITC Limited
    "BHARTIARTL.NS",# Bharti Airtel
    # "SBIN.NS",      # State Bank of India
    "LICI.NS",      # LIC India
    "LT.NS",        # Larsen & Toubro
    "BAJFINANCE.NS",# Bajaj Finance
    "MARUTI.NS",    # Maruti Suzuki
    "ASIANPAINT.NS",# Asian Paints
    "AXISBANK.NS",  # Axis Bank
    "TITAN.NS",     # Titan Company
    "SUNPHARMA.NS", # Sun Pharma
    "ULTRACEMCO.NS",# UltraTech Cement
    "NTPC.NS",      # NTPC
]
# Keep crypto or remove? User said "Indian stock market only for now".
CRYPTO_SYMBOLS = [] 
ALL_SYMBOLS = STOCK_SYMBOLS

# Model Hyperparameters
LSTM_CONFIG = {
    "sequence_length": 90,  # 90 days history
    "lstm_units": 256,      # Increased complexity for single stock
    "dropout": 0.3,         # Increased dropout to prevent overfitting with larger model
    "epochs": 200,          # "Try harder" - long training
    "batch_size": 32,
    "learning_rate": 0.0005, # Lower LR for finer convergence
}

XGBOOST_CONFIG = {
    "n_estimators": 500,
    "learning_rate": 0.01,
    "max_depth": 3,  # Reduced from default/6 to prevent overfitting
    "subsample": 0.6,  # Train on 60% of data per tree to reduce variance
    "colsample_bytree": 0.8,  # Select 80% of features per tree
    "early_stopping_rounds": 50,
    "n_jobs": -1,
    "random_state": 42
}

# Training Configuration
TRAIN_SPLIT = 0.7
VALIDATION_SPLIT = 0.15
TEST_SPLIT = 0.15

# Prediction Horizons (days)
PREDICTION_HORIZONS = [1, 7, 30]