import pandas as pd
import numpy as np
import talib
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import RAW_DATA_DIR, PROCESSED_DATA_DIR

class FeatureEngineer:
    """Calculate technical indicators from OHLCV data"""
    
    def __init__(self, df, market_df=None):
        """
        Args:
            df (pd.DataFrame): OHLCV data with columns [open, high, low, close, volume]
            market_df (pd.DataFrame, optional): Market OHLCV data for relative features. Defaults to None.
        """
        self.df = df.copy()
        self.market_df = market_df.copy() if market_df is not None else None
        # Ensure timestamp index is datetime
        if not isinstance(self.df.index, pd.DatetimeIndex):
            self.df.index = pd.to_datetime(self.df.index)
        
        if self.market_df is not None and not isinstance(self.market_df.index, pd.DatetimeIndex):
            self.market_df.index = pd.to_datetime(self.market_df.index)

        self.features = pd.DataFrame(index=self.df.index)
        # Initialize basic features from raw data
        self.features['open'] = self.df['open']
        self.features['high'] = self.df['high']
        self.features['low'] = self.df['low']
        self.features['close'] = self.df['close']
        self.features['volume'] = self.df['volume'] # Keep original volume for now, pct_change will be added later if needed
        self.features['price_change_30d'] = self.df['close'].pct_change(periods=30)
        
        # High-Low spread
        self.features['hl_spread'] = (self.df['high'] - self.df['low']) / self.df['close']
    
    def add_price_features(self):
        """Add price-based features"""
        print("📈 Adding price features...")
        
        # Price changes
        self.features['price_change'] = self.df['close'].pct_change()
        self.features['price_change_1d'] = self.df['close'].pct_change(periods=1)
        self.features['price_change_7d'] = self.df['close'].pct_change(periods=7)
        # self.features['price_change_30d'] is already initialized in __init__
        
        # High-Low spread is already initialized in __init__
        
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
        # We DO NOT keep raw upper/middle/lower as they are non-stationary prices
        # self.features['bb_upper'] = upper
        # self.features['bb_middle'] = middle
        # self.features['bb_lower'] = lower
        
        # Stationary BB features
        self.features['bb_width'] = (upper - lower) / middle
        self.features['bb_position'] = (self.df['close'] - lower) / (upper - lower)
        
        # Normalized Average True Range (NATR) - Stationary volatility
        self.features['natr'] = talib.NATR(
            self.df['high'],
            self.df['low'],
            self.df['close'],
            timeperiod=14
        )
        
        # Historical Volatility (standard deviation of log returns)
        # Log returns are better for statistical analysis
        self.features['log_return'] = np.log(self.df['close'] / self.df['close'].shift(1))
        self.features['volatility_20'] = self.features['log_return'].rolling(window=20).std()
        
        print("   ✅ Added 5 stationary volatility indicators")
    
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
    
    def add_market_features(self):
        """Add market correlation features (Beta, Relative Strength)"""
        if self.market_df is None:
            return

        print("🌐 Adding market correlation features...")
        
        # Align market data to stock data
        market = self.market_df.reindex(self.features.index).ffill() 
        
        # Calculate Market Log Returns
        market_log_ret = np.log(market['close'] / market['close'].shift(1))
        
        # Add Market Return as feature
        self.features['market_return'] = market_log_ret
        
        # Ensure stock log returns exist (they are added in volatility)
        if 'log_return' not in self.features:
             self.features['log_return'] = np.log(self.df['close'] / self.df['close'].shift(1))

        # 1. Rolling Beta (Covariance / Variance)
        # Beta measures how much the stock moves vs the market
        rolling_cov = self.features['log_return'].rolling(window=60).cov(market_log_ret)
        rolling_var = market_log_ret.rolling(window=60).var()
        self.features['beta_60d'] = rolling_cov / (rolling_var + 1e-8)
        
        # 2. Relative Strength (Stock Return - Market Return)
        # Positive = Outperforming market
        self.features['market_relative_strength'] = self.features['log_return'] - market_log_ret
        
        # CRITICAL: Fill NaN market features to avoid dropping valid stock history
        # Beta default = 1.0 (moves with market), RS default = 0.0 (performs same as market)
        self.features['beta_60d'] = self.features['beta_60d'].fillna(1.0)
        self.features['market_relative_strength'] = self.features['market_relative_strength'].fillna(0.0)
        # Also fill market return with 0 if missing
        self.features['market_return'] = self.features['market_return'].fillna(0.0)

        print("   ✅ Added Market Beta and Relative Strength")

    def clean_missing_values(self):
        """Handle missing values (NaN, Inf) after indicator calculations."""
        original_length = len(self.features)
        self.features.replace([np.inf, -np.inf], np.nan, inplace=True)
        self.features.dropna(inplace=True)
        dropped = original_length - len(self.features)
        if dropped > 0:
            print(f"   ⚠️ Dropped {dropped} rows due to NaN/Inf values after calculations.")

    def run(self):
        """Run full feature engineering pipeline"""
        print(f"🛠️ Starting feature engineering for {len(self.df)} rows...")
        
        self.add_price_features()
        self.add_moving_averages()
        self.add_momentum_indicators()
        self.add_volatility_indicators()
        self.add_volume_indicators()
        
        if self.market_df is not None:
             self.add_market_features()
             
        # Check for NaNs before dropping
        if self.features.iloc[-1].isna().any():
             print("⚠️ Last row contains NaNs! Debugging:")
             print(self.features.iloc[-1][self.features.iloc[-1].isna()])
             
        self.clean_missing_values()
        
        print(f"✅ Feature engineering complete. Features: {self.features.shape[1]}")
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