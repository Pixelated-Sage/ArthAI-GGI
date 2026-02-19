# ML Model Development Guide - Step by Step

## 🎯 Learning Objectives

By the end of this guide, you will:
- Understand how to prepare financial time-series data
- Build an LSTM model from scratch
- Create an XGBoost model
- Combine both into a hybrid model
- Evaluate model performance
- Save and load trained models

---

## 📚 Before You Start

### Understanding the Problem

**What are we predicting?**
- Stock/crypto prices 1, 7, and 30 days into the future
- Direction of price movement (up/down)

**Why LSTM + XGBoost?**
- **LSTM**: Captures temporal patterns (e.g., "prices tend to rise after a dip")
- **XGBoost**: Captures feature relationships (e.g., "when RSI > 70, prices usually drop")
- **Hybrid**: Best of both worlds

**Input Features:**
1. Historical prices (OHLCV)
2. Technical indicators (RSI, MACD, etc.)
3. Sentiment scores (we'll add this later)

**Output:**
- Predicted price for next 1/7/30 days
- Confidence score

---

## 🗂️ Project Structure

Create this folder structure in your `ml/` directory:

```
ml/
├── data/                   # Raw and processed data
│   ├── raw/               # CSV files from TimescaleDB
│   ├── processed/         # Normalized, sequenced data
│   └── models/            # Saved model files
├── notebooks/             # Jupyter notebooks for experimentation
├── src/
│   ├── data_preparation.py    # Step 1: Data loading & cleaning
│   ├── feature_engineering.py # Step 2: Technical indicators
│   ├── lstm_model.py          # Step 3: LSTM implementation
│   ├── xgboost_model.py       # Step 4: XGBoost implementation
│   ├── hybrid_model.py        # Step 5: Ensemble model
│   ├── evaluation.py          # Step 6: Metrics & visualization
│   └── utils.py               # Helper functions
├── config.py              # Configuration (paths, hyperparameters)
├── requirements.txt       # ML dependencies
└── train.py              # Main training script
```

---

## 📦 Step 0: Install Dependencies

Create `ml/requirements.txt`:

```txt
# Core ML Libraries
tensorflow==2.15.0
keras==2.15.0
xgboost==2.0.3
scikit-learn==1.4.0

# Data Processing
pandas==2.1.4
numpy==1.26.3
ta-lib==0.4.28  # Technical indicators

# Database
psycopg2-binary==2.9.9
python-dotenv==1.0.0

# Visualization
matplotlib==3.8.2
seaborn==0.13.1
plotly==5.18.0

# Utilities
joblib==1.3.2
tqdm==4.66.1

# Optional: GPU support (if you have NVIDIA GPU)
# tensorflow[and-cuda]==2.15.0
```

Install:
```bash
cd ml/
pip install -r requirements.txt
```

**Note on ta-lib:**
If you get errors installing ta-lib, use:
```bash
# On Ubuntu/Linux
sudo apt-get install ta-lib

# On macOS
brew install ta-lib

# On Windows (use conda)
conda install -c conda-forge ta-lib
```

---

## 📋 Step 1: Data Preparation

### 1.1 Create Configuration File

`ml/config.py`:
```python
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = DATA_DIR / "models"

# Create directories
for dir_path in [RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Database Configuration
DB_CONFIG = {
    "host": os.getenv("TIMESCALE_HOST"),
    "port": os.getenv("TIMESCALE_PORT", 5432),
    "database": os.getenv("TIMESCALE_DB"),
    "user": os.getenv("TIMESCALE_USER"),
    "password": os.getenv("TIMESCALE_PASSWORD"),
}

# Symbols to train on
STOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"]
CRYPTO_SYMBOLS = ["BTC", "ETH", "BNB"]
ALL_SYMBOLS = STOCK_SYMBOLS + CRYPTO_SYMBOLS

# Model Hyperparameters
LSTM_CONFIG = {
    "sequence_length": 60,  # Use 60 days of history
    "lstm_units": 128,
    "dropout": 0.2,
    "epochs": 50,
    "batch_size": 32,
    "learning_rate": 0.001,
}

XGBOOST_CONFIG = {
    "max_depth": 6,
    "learning_rate": 0.1,
    "n_estimators": 100,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
}

# Training Configuration
TRAIN_SPLIT = 0.7
VALIDATION_SPLIT = 0.15
TEST_SPLIT = 0.15

# Prediction Horizons (days)
PREDICTION_HORIZONS = [1, 7, 30]
```

### 1.2 Create Data Loading Script

`ml/src/data_preparation.py`:
```python
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import pickle
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import DB_CONFIG, RAW_DATA_DIR, PROCESSED_DATA_DIR

class DataLoader:
    """Load OHLCV data from TimescaleDB"""
    
    def __init__(self, db_config=DB_CONFIG):
        self.db_config = db_config
        self.conn = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            print("✅ Connected to TimescaleDB")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise
            
    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("✅ Database connection closed")
    
    def load_symbol_data(self, symbol, start_date=None, end_date=None):
        """
        Load OHLCV data for a specific symbol
        
        Args:
            symbol (str): Stock/crypto symbol (e.g., 'AAPL', 'BTC')
            start_date (str): Start date in 'YYYY-MM-DD' format
            end_date (str): End date in 'YYYY-MM-DD' format
            
        Returns:
            pd.DataFrame: OHLCV data
        """
        if not self.conn:
            self.connect()
        
        # Default date range: last 5 years
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
        
        query = """
            SELECT 
                timestamp,
                open,
                high,
                low,
                close,
                volume
            FROM ohlcv_data
            WHERE symbol = %s
                AND timestamp >= %s
                AND timestamp <= %s
            ORDER BY timestamp ASC
        """
        
        try:
            df = pd.read_sql_query(
                query,
                self.conn,
                params=(symbol, start_date, end_date),
                parse_dates=['timestamp']
            )
            
            if df.empty:
                print(f"⚠️  No data found for {symbol}")
                return None
            
            # Set timestamp as index
            df.set_index('timestamp', inplace=True)
            
            print(f"✅ Loaded {len(df)} records for {symbol}")
            print(f"   Date range: {df.index.min()} to {df.index.max()}")
            
            return df
            
        except Exception as e:
            print(f"❌ Error loading data for {symbol}: {e}")
            return None
    
    def save_to_csv(self, symbol, df, directory=RAW_DATA_DIR):
        """Save DataFrame to CSV"""
        filepath = Path(directory) / f"{symbol}_raw.csv"
        df.to_csv(filepath)
        print(f"💾 Saved to {filepath}")
        
    def load_from_csv(self, symbol, directory=RAW_DATA_DIR):
        """Load DataFrame from CSV"""
        filepath = Path(directory) / f"{symbol}_raw.csv"
        if not filepath.exists():
            print(f"❌ File not found: {filepath}")
            return None
        df = pd.read_csv(filepath, index_col='timestamp', parse_dates=True)
        print(f"✅ Loaded {len(df)} records from {filepath}")
        return df


class DataCleaner:
    """Clean and validate OHLCV data"""
    
    @staticmethod
    def check_missing_dates(df):
        """Check for missing dates and forward-fill"""
        original_length = len(df)
        
        # Create complete date range
        full_range = pd.date_range(
            start=df.index.min(),
            end=df.index.max(),
            freq='D'
        )
        
        # Reindex and forward-fill
        df = df.reindex(full_range)
        df.fillna(method='ffill', inplace=True)
        
        missing_count = len(df) - original_length
        
        if missing_count > 0:
            print(f"⚠️  Found {missing_count} missing dates, forward-filled")
        else:
            print("✅ No missing dates")
            
        return df
    
    @staticmethod
    def remove_outliers(df, columns=['close'], threshold=3):
        """Remove outliers using Z-score method"""
        from scipy import stats
        
        df_clean = df.copy()
        
        for col in columns:
            z_scores = np.abs(stats.zscore(df[col]))
            outliers = z_scores > threshold
            outlier_count = outliers.sum()
            
            if outlier_count > 0:
                print(f"⚠️  Found {outlier_count} outliers in {col}, removing...")
                df_clean = df_clean[~outliers]
        
        return df_clean
    
    @staticmethod
    def validate_ohlc(df):
        """Validate OHLC relationship: Low <= Open, Close <= High"""
        invalid_rows = (
            (df['low'] > df['open']) |
            (df['low'] > df['close']) |
            (df['high'] < df['open']) |
            (df['high'] < df['close'])
        )
        
        invalid_count = invalid_rows.sum()
        
        if invalid_count > 0:
            print(f"⚠️  Found {invalid_count} invalid OHLC rows, removing...")
            df = df[~invalid_rows]
        else:
            print("✅ OHLC validation passed")
        
        return df


# Example Usage
if __name__ == "__main__":
    # Initialize loader
    loader = DataLoader()
    
    # Load data for AAPL
    symbol = "AAPL"
    df = loader.load_symbol_data(symbol)
    
    if df is not None:
        # Clean data
        cleaner = DataCleaner()
        df = cleaner.check_missing_dates(df)
        df = cleaner.validate_ohlc(df)
        df = cleaner.remove_outliers(df)
        
        # Save to CSV
        loader.save_to_csv(symbol, df)
        
        print("\n📊 Data Summary:")
        print(df.describe())
        print("\n📈 First 5 rows:")
        print(df.head())
    
    loader.disconnect()
```

**Test this script:**
```bash
cd ml/
python src/data_preparation.py
```

**Expected Output:**
```
✅ Connected to TimescaleDB
✅ Loaded 1258 records for AAPL
   Date range: 2020-01-29 to 2025-01-29
✅ No missing dates
✅ OHLC validation passed
💾 Saved to data/raw/AAPL_raw.csv

📊 Data Summary:
              open         high          low        close        volume
count  1258.000000  1258.000000  1258.000000  1258.000000  1.258000e+03
mean    145.234567   147.123456   143.456789   145.678901  8.765432e+07
...
```

---

## 📊 Step 2: Feature Engineering (Technical Indicators)

### 2.1 Calculate Technical Indicators

`ml/src/feature_engineering.py`:
```python
import pandas as pd
import numpy as np
import talib
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import RAW_DATA_DIR, PROCESSED_DATA_DIR

class FeatureEngineer:
    """Calculate technical indicators from OHLCV data"""
    
    def __init__(self, df):
        """
        Args:
            df (pd.DataFrame): OHLCV data with columns [open, high, low, close, volume]
        """
        self.df = df.copy()
        self.features = df.copy()
    
    def add_price_features(self):
        """Add price-based features"""
        print("📈 Adding price features...")
        
        # Price changes
        self.features['price_change'] = self.df['close'].pct_change()
        self.features['price_change_1d'] = self.df['close'].pct_change(periods=1)
        self.features['price_change_7d'] = self.df['close'].pct_change(periods=7)
        self.features['price_change_30d'] = self.df['close'].pct_change(periods=30)
        
        # High-Low spread
        self.features['hl_spread'] = (self.df['high'] - self.df['low']) / self.df['close']
        
        # Open-Close spread
        self.features['oc_spread'] = (self.df['close'] - self.df['open']) / self.df['open']
        
        print("   ✅ Added 6 price features")
    
    def add_moving_averages(self):
        """Add moving average indicators"""
        print("📊 Adding moving averages...")
        
        # Simple Moving Averages (SMA)
        self.features['sma_5'] = talib.SMA(self.df['close'], timeperiod=5)
        self.features['sma_10'] = talib.SMA(self.df['close'], timeperiod=10)
        self.features['sma_20'] = talib.SMA(self.df['close'], timeperiod=20)
        self.features['sma_50'] = talib.SMA(self.df['close'], timeperiod=50)
        self.features['sma_200'] = talib.SMA(self.df['close'], timeperiod=200)
        
        # Exponential Moving Averages (EMA)
        self.features['ema_12'] = talib.EMA(self.df['close'], timeperiod=12)
        self.features['ema_26'] = talib.EMA(self.df['close'], timeperiod=26)
        self.features['ema_50'] = talib.EMA(self.df['close'], timeperiod=50)
        
        # Distance from moving averages
        self.features['dist_sma_20'] = (self.df['close'] - self.features['sma_20']) / self.features['sma_20']
        self.features['dist_sma_50'] = (self.df['close'] - self.features['sma_50']) / self.features['sma_50']
        
        print("   ✅ Added 10 moving average features")
    
    def add_momentum_indicators(self):
        """Add momentum indicators (RSI, MACD, etc.)"""
        print("🚀 Adding momentum indicators...")
        
        # RSI (Relative Strength Index)
        self.features['rsi_14'] = talib.RSI(self.df['close'], timeperiod=14)
        
        # MACD (Moving Average Convergence Divergence)
        macd, macd_signal, macd_hist = talib.MACD(
            self.df['close'],
            fastperiod=12,
            slowperiod=26,
            signalperiod=9
        )
        self.features['macd'] = macd
        self.features['macd_signal'] = macd_signal
        self.features['macd_hist'] = macd_hist
        
        # Stochastic Oscillator
        slowk, slowd = talib.STOCH(
            self.df['high'],
            self.df['low'],
            self.df['close'],
            fastk_period=14,
            slowk_period=3,
            slowd_period=3
        )
        self.features['stoch_k'] = slowk
        self.features['stoch_d'] = slowd
        
        # Rate of Change (ROC)
        self.features['roc_10'] = talib.ROC(self.df['close'], timeperiod=10)
        
        # Commodity Channel Index (CCI)
        self.features['cci_14'] = talib.CCI(
            self.df['high'],
            self.df['low'],
            self.df['close'],
            timeperiod=14
        )
        
        print("   ✅ Added 9 momentum indicators")
    
    def add_volatility_indicators(self):
        """Add volatility indicators (Bollinger Bands, ATR)"""
        print("📉 Adding volatility indicators...")
        
        # Bollinger Bands
        upper, middle, lower = talib.BBANDS(
            self.df['close'],
            timeperiod=20,
            nbdevup=2,
            nbdevdn=2
        )
        self.features['bb_upper'] = upper
        self.features['bb_middle'] = middle
        self.features['bb_lower'] = lower
        self.features['bb_width'] = (upper - lower) / middle
        self.features['bb_position'] = (self.df['close'] - lower) / (upper - lower)
        
        # Average True Range (ATR)
        self.features['atr_14'] = talib.ATR(
            self.df['high'],
            self.df['low'],
            self.df['close'],
            timeperiod=14
        )
        
        # Historical Volatility (standard deviation of returns)
        self.features['volatility_20'] = self.df['close'].pct_change().rolling(20).std()
        
        print("   ✅ Added 7 volatility indicators")
    
    def add_volume_indicators(self):
        """Add volume-based indicators"""
        print("📦 Adding volume indicators...")
        
        # Volume moving averages
        self.features['volume_sma_20'] = talib.SMA(self.df['volume'], timeperiod=20)
        self.features['volume_ratio'] = self.df['volume'] / self.features['volume_sma_20']
        
        # On-Balance Volume (OBV)
        self.features['obv'] = talib.OBV(self.df['close'], self.df['volume'])
        
        # Accumulation/Distribution Line
        self.features['ad'] = talib.AD(
            self.df['high'],
            self.df['low'],
            self.df['close'],
            self.df['volume']
        )
        
        print("   ✅ Added 4 volume indicators")
    
    def add_all_features(self):
        """Calculate all technical indicators"""
        print("\n🔧 Engineering Features...\n")
        
        self.add_price_features()
        self.add_moving_averages()
        self.add_momentum_indicators()
        self.add_volatility_indicators()
        self.add_volume_indicators()
        
        # Drop rows with NaN (from indicator calculations)
        original_length = len(self.features)
        self.features.dropna(inplace=True)
        dropped = original_length - len(self.features)
        
        print(f"\n📊 Feature Engineering Complete!")
        print(f"   Total features: {len(self.features.columns)}")
        print(f"   Dropped {dropped} rows due to NaN (from indicators)")
        print(f"   Final dataset: {len(self.features)} rows")
        
        return self.features
    
    def save_features(self, symbol, directory=PROCESSED_DATA_DIR):
        """Save engineered features to CSV"""
        filepath = Path(directory) / f"{symbol}_features.csv"
        self.features.to_csv(filepath)
        print(f"\n💾 Features saved to {filepath}")


# Example Usage
if __name__ == "__main__":
    from data_preparation import DataLoader
    
    # Load raw data
    loader = DataLoader()
    symbol = "AAPL"
    df = loader.load_from_csv(symbol, directory=RAW_DATA_DIR)
    
    if df is not None:
        # Engineer features
        engineer = FeatureEngineer(df)
        features_df = engineer.add_all_features()
        
        # Save
        engineer.save_features(symbol)
        
        # Display sample
        print("\n📋 Sample Features:")
        print(features_df[['close', 'sma_20', 'rsi_14', 'macd', 'bb_position']].tail())
```

**Test this script:**
```bash
python src/feature_engineering.py
```

**Expected Output:**
```
✅ Loaded 1258 records from data/raw/AAPL_raw.csv

🔧 Engineering Features...

📈 Adding price features...
   ✅ Added 6 price features
📊 Adding moving averages...
   ✅ Added 10 moving average features
🚀 Adding momentum indicators...
   ✅ Added 9 momentum indicators
📉 Adding volatility indicators...
   ✅ Added 7 volatility indicators
📦 Adding volume indicators...
   ✅ Added 4 volume indicators

📊 Feature Engineering Complete!
   Total features: 41 features
   Dropped 200 rows due to NaN (from indicators)
   Final dataset: 1058 rows

💾 Features saved to data/processed/AAPL_features.csv
```

---

## ✅ Checkpoint 1: Verify Your Progress

Before moving to model training, verify:

```bash
# Check your folder structure
tree ml/data/

# Should show:
# data/
# ├── raw/
# │   └── AAPL_raw.csv
# ├── processed/
# │   └── AAPL_features.csv
# └── models/
```

**Next Steps Preview:**
- Step 3: Create sequences for LSTM
- Step 4: Build & train LSTM model
- Step 5: Build & train XGBoost model
- Step 6: Create hybrid ensemble

---

## 📝 Homework Before Next Session

1. Run data preparation for ALL symbols:
```python
symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "BTC", "ETH", "BNB"]
for symbol in symbols:
    # Load, clean, and save
    # Engineer features
```

2. Understand the features:
   - What is RSI? (Google it)
   - What is MACD? (Watch a 5-min YouTube video)
   - What is Bollinger Bands?

3. Questions to think about:
   - Why do we need 60 days of history?
   - What does "sequence_length=60" mean?
   - How will LSTM use this data differently than XGBoost?

---

**Next Document**: I'll create Step 3-6 (LSTM, XGBoost, Hybrid Model) once you've completed this checkpoint!

Let me know when you're ready to continue! 🚀
