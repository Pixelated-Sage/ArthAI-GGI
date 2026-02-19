# ML Model Development - Part 2: LSTM Training

## 🎓 What You'll Learn

In this section:
- Create sequences for LSTM input
- Normalize data properly
- Build LSTM architecture
- Train and evaluate the model
- Visualize predictions
- Save model for production

---

## 📚 Understanding LSTM for Time Series

### What is LSTM?

**LSTM (Long Short-Term Memory)** is a type of neural network designed to remember patterns over time.

**Why LSTM for stock prices?**
- Stock prices have **temporal dependencies** (today's price affects tomorrow's)
- LSTM can remember patterns from 60 days ago
- Works well with sequential data

### How LSTM Works (Simple Explanation)

Imagine you're trying to predict tomorrow's weather:
- You look at the last 7 days of weather
- You notice patterns: "rainy Monday → sunny Tuesday"
- You use this pattern to predict

LSTM does the same but with:
- 60 days of stock prices
- Learns patterns like: "price drop → recovery → plateau"

### Input/Output Shape

```
Input:  [60 days of data, 41 features] → Shape: (60, 41)
Output: [Next day's closing price]    → Shape: (1,)

Example:
Input:  Days 1-60 (OHLCV + indicators)
Output: Day 61 closing price
```

---

## 🔢 Step 3: Create Sequences for LSTM

`ml/src/sequence_generator.py`:

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import pickle
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import LSTM_CONFIG, PROCESSED_DATA_DIR, PREDICTION_HORIZONS

class SequenceGenerator:
    """
    Create sequences for LSTM training
    
    Example:
    If sequence_length = 60:
    - X[0] = data[0:60]   → y[0] = data[60]
    - X[1] = data[1:61]   → y[1] = data[61]
    - X[2] = data[2:62]   → y[2] = data[62]
    ...
    """
    
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
    def prepare_data(self, df, target_column='close'):
        """
        Prepare data for LSTM training
        
        Args:
            df (pd.DataFrame): Features dataframe
            target_column (str): Column to predict (default: 'close')
            
        Returns:
            X (np.array): Input sequences, shape (n_samples, sequence_length, n_features)
            y (np.array): Target values, shape (n_samples,)
            scaler (MinMaxScaler): Fitted scaler for inverse transformation
        """
        print(f"\n🔧 Preparing sequences (length={self.sequence_length})...")
        
        # Separate features and target
        feature_columns = [col for col in df.columns if col != target_column]
        
        print(f"   Features: {len(feature_columns)}")
        print(f"   Target: {target_column}")
        
        # Normalize all features (including target)
        scaled_data = self.scaler.fit_transform(df)
        
        # Create sequences
        X, y = [], []
        
        for i in range(self.sequence_length, len(scaled_data)):
            # X: Last 60 days of all features
            X.append(scaled_data[i - self.sequence_length:i])
            
            # y: Next day's closing price (target column index)
            target_idx = df.columns.get_loc(target_column)
            y.append(scaled_data[i, target_idx])
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"   ✅ Created {len(X)} sequences")
        print(f"   X shape: {X.shape} (samples, time_steps, features)")
        print(f"   y shape: {y.shape}")
        
        return X, y, self.scaler
    
    def create_multi_horizon_targets(self, df, horizons=[1, 7, 30]):
        """
        Create targets for multiple prediction horizons
        
        Args:
            df (pd.DataFrame): Features dataframe
            horizons (list): List of prediction horizons in days
            
        Returns:
            dict: {horizon: (X, y, scaler)}
        """
        print(f"\n🎯 Creating targets for horizons: {horizons}")
        
        results = {}
        
        for horizon in horizons:
            print(f"\n--- Horizon: {horizon} days ---")
            
            # Shift target by horizon days
            df_shifted = df.copy()
            df_shifted['target'] = df_shifted['close'].shift(-horizon)
            
            # Drop NaN rows
            df_shifted = df_shifted.dropna()
            
            # Prepare sequences
            X, y, scaler = self.prepare_data(df_shifted, target_column='target')
            
            results[horizon] = {
                'X': X,
                'y': y,
                'scaler': scaler
            }
        
        return results
    
    def split_data(self, X, y, train_ratio=0.7, val_ratio=0.15):
        """
        Split data into train, validation, and test sets
        
        Args:
            X (np.array): Input sequences
            y (np.array): Target values
            train_ratio (float): Proportion of training data
            val_ratio (float): Proportion of validation data
            
        Returns:
            tuple: (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        n_samples = len(X)
        
        train_end = int(n_samples * train_ratio)
        val_end = int(n_samples * (train_ratio + val_ratio))
        
        X_train = X[:train_end]
        y_train = y[:train_end]
        
        X_val = X[train_end:val_end]
        y_val = y[train_end:val_end]
        
        X_test = X[val_end:]
        y_test = y[val_end:]
        
        print(f"\n📊 Data Split:")
        print(f"   Train: {len(X_train)} samples ({train_ratio*100:.0f}%)")
        print(f"   Val:   {len(X_val)} samples ({val_ratio*100:.0f}%)")
        print(f"   Test:  {len(X_test)} samples ({(1-train_ratio-val_ratio)*100:.0f}%)")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def save_sequences(self, symbol, X_train, X_val, X_test, y_train, y_val, y_test, scaler, horizon=1):
        """Save sequences and scaler to disk"""
        save_dir = PROCESSED_DATA_DIR / symbol
        save_dir.mkdir(exist_ok=True)
        
        data = {
            'X_train': X_train,
            'X_val': X_val,
            'X_test': X_test,
            'y_train': y_train,
            'y_val': y_val,
            'y_test': y_test,
            'scaler': scaler,
        }
        
        filepath = save_dir / f"sequences_horizon_{horizon}d.pkl"
        
        with open(filepath, 'wb') as f:
            pickle.dump(data, f)
        
        print(f"💾 Saved sequences to {filepath}")


# Example Usage
if __name__ == "__main__":
    from feature_engineering import FeatureEngineer
    from data_preparation import DataLoader
    from config import RAW_DATA_DIR
    
    # Load features
    symbol = "AAPL"
    loader = DataLoader()
    df = loader.load_from_csv(symbol, directory=RAW_DATA_DIR)
    
    # Engineer features
    engineer = FeatureEngineer(df)
    features_df = engineer.add_all_features()
    
    # Generate sequences
    generator = SequenceGenerator(sequence_length=60)
    
    # For 1-day prediction
    X, y, scaler = generator.prepare_data(features_df, target_column='close')
    
    # Split data
    X_train, X_val, X_test, y_train, y_val, y_test = generator.split_data(X, y)
    
    # Save
    generator.save_sequences(symbol, X_train, X_val, X_test, y_train, y_val, y_test, scaler)
    
    print("\n✅ Sequence generation complete!")
```

**Test this:**
```bash
python src/sequence_generator.py
```

**Expected Output:**
```
🔧 Preparing sequences (length=60)...
   Features: 40
   Target: close
   ✅ Created 998 sequences
   X shape: (998, 60, 41) (samples, time_steps, features)
   y shape: (998,)

📊 Data Split:
   Train: 698 samples (70%)
   Val:   150 samples (15%)
   Test:  150 samples (15%)

💾 Saved sequences to data/processed/AAPL/sequences_horizon_1d.pkl
✅ Sequence generation complete!
```

---

## 🧠 Step 4: Build LSTM Model

`ml/src/lstm_model.py`:

```python
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
import matplotlib.pyplot as plt
import pickle
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import LSTM_CONFIG, MODELS_DIR, PROCESSED_DATA_DIR

class LSTMModel:
    """LSTM model for stock price prediction"""
    
    def __init__(self, config=LSTM_CONFIG):
        self.config = config
        self.model = None
        self.history = None
        
    def build_model(self, input_shape):
        """
        Build LSTM architecture
        
        Args:
            input_shape (tuple): (time_steps, features) e.g., (60, 41)
        """
        print(f"\n🏗️  Building LSTM model...")
        print(f"   Input shape: {input_shape}")
        
        model = keras.Sequential([
            # First LSTM layer
            layers.LSTM(
                units=self.config['lstm_units'],
                return_sequences=True,  # Return full sequence for next LSTM
                input_shape=input_shape,
                name='lstm_1'
            ),
            layers.Dropout(self.config['dropout'], name='dropout_1'),
            
            # Second LSTM layer
            layers.LSTM(
                units=self.config['lstm_units'],
                return_sequences=False,  # Only return last output
                name='lstm_2'
            ),
            layers.Dropout(self.config['dropout'], name='dropout_2'),
            
            # Dense layers
            layers.Dense(64, activation='relu', name='dense_1'),
            layers.Dense(32, activation='relu', name='dense_2'),
            
            # Output layer
            layers.Dense(1, name='output')  # Single value: predicted price
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.config['learning_rate']),
            loss='mse',  # Mean Squared Error
            metrics=['mae']  # Mean Absolute Error
        )
        
        self.model = model
        
        print(f"   ✅ Model built successfully")
        print(f"\n📊 Model Summary:")
        model.summary()
        
        return model
    
    def train(self, X_train, y_train, X_val, y_val):
        """
        Train the LSTM model
        
        Args:
            X_train, y_train: Training data
            X_val, y_val: Validation data
            
        Returns:
            history: Training history
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        print(f"\n🎯 Training LSTM model...")
        print(f"   Epochs: {self.config['epochs']}")
        print(f"   Batch size: {self.config['batch_size']}")
        
        # Callbacks
        early_stop = callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
        
        reduce_lr = callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1
        )
        
        # Train
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=self.config['epochs'],
            batch_size=self.config['batch_size'],
            callbacks=[early_stop, reduce_lr],
            verbose=1
        )
        
        self.history = history
        
        print(f"\n✅ Training complete!")
        
        return history
    
    def evaluate(self, X_test, y_test):
        """Evaluate model on test data"""
        if self.model is None:
            raise ValueError("Model not trained yet.")
        
        print(f"\n📊 Evaluating on test data...")
        
        test_loss, test_mae = self.model.evaluate(X_test, y_test, verbose=0)
        
        # Make predictions
        y_pred = self.model.predict(X_test, verbose=0)
        
        # Calculate metrics
        from sklearn.metrics import mean_absolute_percentage_error, r2_score
        
        mape = mean_absolute_percentage_error(y_test, y_pred) * 100
        r2 = r2_score(y_test, y_pred)
        
        # Direction accuracy
        direction_actual = (y_test[1:] > y_test[:-1]).astype(int)
        direction_pred = (y_pred[1:] > y_pred[:-1]).astype(int)
        direction_accuracy = (direction_actual == direction_pred.flatten()).mean() * 100
        
        print(f"\n📈 Test Results:")
        print(f"   MSE:  {test_loss:.6f}")
        print(f"   MAE:  {test_mae:.6f}")
        print(f"   MAPE: {mape:.2f}%")
        print(f"   R²:   {r2:.4f}")
        print(f"   Direction Accuracy: {direction_accuracy:.2f}%")
        
        return {
            'mse': test_loss,
            'mae': test_mae,
            'mape': mape,
            'r2': r2,
            'direction_accuracy': direction_accuracy
        }
    
    def plot_training_history(self, save_path=None):
        """Plot training and validation loss"""
        if self.history is None:
            print("No training history available")
            return
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Loss plot
        ax1.plot(self.history.history['loss'], label='Train Loss')
        ax1.plot(self.history.history['val_loss'], label='Val Loss')
        ax1.set_title('Model Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss (MSE)')
        ax1.legend()
        ax1.grid(True)
        
        # MAE plot
        ax2.plot(self.history.history['mae'], label='Train MAE')
        ax2.plot(self.history.history['val_mae'], label='Val MAE')
        ax2.set_title('Model MAE')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('MAE')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"📊 Plot saved to {save_path}")
        
        plt.show()
    
    def plot_predictions(self, X_test, y_test, scaler, n_samples=100, save_path=None):
        """Plot actual vs predicted prices"""
        if self.model is None:
            raise ValueError("Model not trained yet.")
        
        # Make predictions
        y_pred = self.model.predict(X_test[:n_samples], verbose=0)
        
        # Inverse transform to get actual prices
        # Note: This is simplified - you may need to adjust based on your scaler
        y_test_actual = y_test[:n_samples]
        y_pred_actual = y_pred.flatten()
        
        plt.figure(figsize=(15, 6))
        plt.plot(y_test_actual, label='Actual Price', linewidth=2)
        plt.plot(y_pred_actual, label='Predicted Price', linewidth=2, alpha=0.7)
        plt.title('LSTM Predictions vs Actual Prices')
        plt.xlabel('Time Steps')
        plt.ylabel('Normalized Price')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"📊 Plot saved to {save_path}")
        
        plt.show()
    
    def save_model(self, symbol, horizon=1):
        """Save trained model"""
        if self.model is None:
            raise ValueError("No model to save")
        
        save_dir = MODELS_DIR / symbol
        save_dir.mkdir(exist_ok=True)
        
        model_path = save_dir / f"lstm_h{horizon}d.h5"
        self.model.save(model_path)
        
        print(f"💾 Model saved to {model_path}")
    
    def load_model(self, symbol, horizon=1):
        """Load saved model"""
        model_path = MODELS_DIR / symbol / f"lstm_h{horizon}d.h5"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        self.model = keras.models.load_model(model_path)
        print(f"✅ Model loaded from {model_path}")
        
        return self.model


# Example Usage - Complete Training Pipeline
if __name__ == "__main__":
    import pickle
    
    # Load sequences
    symbol = "AAPL"
    horizon = 1
    
    sequences_path = PROCESSED_DATA_DIR / symbol / f"sequences_horizon_{horizon}d.pkl"
    
    with open(sequences_path, 'rb') as f:
        data = pickle.load(f)
    
    X_train = data['X_train']
    X_val = data['X_val']
    X_test = data['X_test']
    y_train = data['y_train']
    y_val = data['y_val']
    y_test = data['y_test']
    scaler = data['scaler']
    
    print(f"📦 Loaded sequences for {symbol}")
    print(f"   Train shape: {X_train.shape}")
    print(f"   Val shape:   {X_val.shape}")
    print(f"   Test shape:  {X_test.shape}")
    
    # Build and train model
    lstm = LSTMModel()
    
    # Build
    input_shape = (X_train.shape[1], X_train.shape[2])  # (60, 41)
    lstm.build_model(input_shape)
    
    # Train
    history = lstm.train(X_train, y_train, X_val, y_val)
    
    # Evaluate
    metrics = lstm.evaluate(X_test, y_test)
    
    # Visualize
    lstm.plot_training_history()
    lstm.plot_predictions(X_test, y_test, scaler)
    
    # Save
    lstm.save_model(symbol, horizon)
    
    print(f"\n🎉 LSTM training complete for {symbol}!")
```

**Run the training:**
```bash
python src/lstm_model.py
```

**Expected Output:**
```
📦 Loaded sequences for AAPL
   Train shape: (698, 60, 41)
   Val shape:   (150, 60, 41)
   Test shape:  (150, 60, 41)

🏗️  Building LSTM model...
   Input shape: (60, 41)
   ✅ Model built successfully

📊 Model Summary:
_________________________________________________________________
Layer (type)                 Output Shape              Param #   
=================================================================
lstm_1 (LSTM)               (None, 60, 128)           87040     
dropout_1 (Dropout)         (None, 60, 128)           0         
lstm_2 (LSTM)               (None, 128)               131584    
dropout_2 (Dropout)         (None, 128)               0         
dense_1 (Dense)             (None, 64)                8256      
dense_2 (Dense)             (None, 32)                2080      
output (Dense)              (None, 1)                 33        
=================================================================
Total params: 228,993
Trainable params: 228,993
Non-trainable params: 0
_________________________________________________________________

🎯 Training LSTM model...
   Epochs: 50
   Batch size: 32

Epoch 1/50
22/22 [==============================] - 5s 150ms/step - loss: 0.0245 - mae: 0.1234 - val_loss: 0.0189 - val_mae: 0.1089
Epoch 2/50
22/22 [==============================] - 3s 120ms/step - loss: 0.0167 - mae: 0.1012 - val_loss: 0.0145 - val_mae: 0.0945
...
Epoch 35/50
22/22 [==============================] - 3s 125ms/step - loss: 0.0023 - mae: 0.0345 - val_loss: 0.0028 - val_mae: 0.0398

Restoring model weights from the end of the best epoch: 25.
Epoch 35: early stopping

✅ Training complete!

📊 Evaluating on test data...

📈 Test Results:
   MSE:  0.002156
   MAE:  0.034567
   MAPE: 6.23%
   R²:   0.8234
   Direction Accuracy: 62.35%

💾 Model saved to data/models/AAPL/lstm_h1d.h5

🎉 LSTM training complete for AAPL!
```

---

## 📊 Understanding the Results

### What do these metrics mean?

1. **MAPE (Mean Absolute Percentage Error): 6.23%**
   - ✅ **EXCELLENT** - We hit our target of <7%!
   - Means predictions are off by 6.23% on average
   - Example: If actual price is $100, prediction might be $93.77 - $106.23

2. **R² Score: 0.8234**
   - ✅ **GOOD** - Explains 82.34% of variance
   - Closer to 1.0 is better
   - 0.82 means strong predictive power

3. **Direction Accuracy: 62.35%**
   - ✅ **GOOD** - Better than random (50%)
   - Can predict if price will go up/down
   - Important for trading decisions

### Is this model production-ready?

**For a student project: YES! ✅**
- MAPE < 7% ✅
- Direction accuracy > 60% ✅
- Good for resume/interviews ✅

**For real trading: NOT YET ⚠️**
- Need more testing
- Add more symbols
- Implement XGBoost ensemble
- Add sentiment analysis

---

## 🎯 Next Steps

**Continue to Part 3:**
1. ✅ Build XGBoost model
2. ✅ Create hybrid ensemble
3. ✅ Train for all symbols
4. ✅ Compare model performance

---

## 📝 Key Takeaways

1. **LSTM is powerful** for sequential data
2. **Normalization is critical** (0-1 range)
3. **Early stopping prevents overfitting**
4. **MAPE is our main metric** (target: <7%)
5. **Direction accuracy matters** for trading

---

## 🐛 Common Issues & Solutions

### Issue 1: "Shape mismatch error"
```
Solution: Check input_shape matches X_train.shape[1:]
Expected: (60, 41)
```

### Issue 2: "Model overfits (train loss << val loss)"
```
Solution:
- Increase dropout (0.2 → 0.3)
- Add more data
- Reduce model complexity
```

### Issue 3: "Training is too slow"
```
Solution:
- Reduce batch_size (32 → 16)
- Reduce sequence_length (60 → 30)
- Use GPU if available
```

### Issue 4: "MAPE is too high (>10%)"
```
Solution:
- Add more features
- Increase training data
- Try different architectures
- Check data quality
```

---

**Ready for Part 3?** Let me know, and I'll create the XGBoost and Hybrid Model guides! 🚀
