"""
LSTM Model for FinPredict price prediction.
2-layer LSTM with dropout, built on TensorFlow/Keras.
"""

import numpy as np
import json
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import LSTM_CONFIG, PREDICTION_HORIZONS

# Suppress TF warnings
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ReduceLROnPlateau,
    ModelCheckpoint,
)
from tensorflow.keras.metrics import MeanAbsoluteError
import keras.backend as K

def directional_loss(y_true, y_pred):
    """
    Custom loss function that penalizes direction errors.
    """
    # Standard MSE
    mse = tf.reduce_mean(tf.square(y_pred - y_true), axis=-1)
    
    # Direction penalty: 1 if signs differ, 0 if signs match
    # Calculate signs
    sign_true = tf.sign(y_true)
    sign_pred = tf.sign(y_pred)
    
    # Check if signs are different
    sign_diff = tf.cast(tf.not_equal(sign_true, sign_pred), dtype='float32')
    
    # Apply penalty factor (e.g. 2.0x squared error when direction is wrong)
    penalty = sign_diff * mse * 2.0
    
    return tf.reduce_mean(mse + penalty)

class LSTMPredictor:
    """Single horizon LSTM model"""

    def __init__(self, horizon, config=None):
        self.horizon = horizon
        self.config = config or LSTM_CONFIG
        self.model = None
        self.history = None

    def build_model(self, input_shape):
        """Build LSTM architecture with directional loss"""
        model = Sequential([
            # Layer 1
            LSTM(
                self.config["lstm_units"],
                input_shape=input_shape,
                return_sequences=True,
                kernel_regularizer=tf.keras.regularizers.l2(0.001)
            ),
            BatchNormalization(),
            Dropout(self.config["dropout"]),

            # Layer 2
            LSTM(
                self.config["lstm_units"] // 2,
                return_sequences=False,
                kernel_regularizer=tf.keras.regularizers.l2(0.001)
            ),
            BatchNormalization(),
            Dropout(self.config["dropout"]),

            # Output
            Dense(32, activation='relu'),
            Dropout(0.2),
            Dense(1)  # Linear activation for regression
        ])

        optimizer = tf.keras.optimizers.Adam(learning_rate=self.config["learning_rate"])
        
        model.compile(
            loss=directional_loss, 
            optimizer=optimizer, 
            metrics=['mae']
        )
        self.model = model
        print(f"\n🧠 LSTM Model built:")
        print(f"   Input shape: {input_shape}")
        print(f"   Parameters: {model.count_params():,}")
        model.summary()

        return model

    def train(self, X_train, y_train, X_val, y_val, checkpoint_dir=None):
        """
        Train the LSTM model.

        Args:
            X_train: Training sequences (samples, timesteps, features)
            y_train: Training targets
            X_val: Validation sequences
            y_val: Validation targets
            checkpoint_dir: Directory to save checkpoints

        Returns:
            history: Training history
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")

        callbacks = [
            EarlyStopping(
                monitor="val_loss",
                patience=10,
                restore_best_weights=True,
                verbose=1,
            ),
            ReduceLROnPlateau(
                monitor="val_loss",
                factor=0.5,
                patience=5,
                min_lr=1e-6,
                verbose=1,
            ),
        ]

        if checkpoint_dir:
            Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)
            callbacks.append(
                ModelCheckpoint(
                    filepath=str(Path(checkpoint_dir) / "best_model.keras"),
                    monitor="val_loss",
                    save_best_only=True,
                    verbose=1,
                )
            )

        print(f"\n🏋️ Training LSTM...")
        print(f"   Epochs: {self.config['epochs']}")
        print(f"   Batch size: {self.config['batch_size']}")
        print(f"   Train samples: {len(X_train)}")
        print(f"   Val samples: {len(X_val)}")

        self.history = self.model.fit(
            X_train,
            y_train,
            epochs=self.config["epochs"],
            batch_size=self.config["batch_size"],
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            verbose=1,
        )

        # Get best metrics
        best_epoch = np.argmin(self.history.history["val_loss"])
        best_val_loss = self.history.history["val_loss"][best_epoch]
        best_val_mae = self.history.history["val_mae"][best_epoch]

        print(f"\n✅ Training complete!")
        print(f"   Best epoch: {best_epoch + 1}")
        print(f"   Best val_loss: {best_val_loss:.6f}")
        print(f"   Best val_mae: {best_val_mae:.6f}")

        return self.history

    def predict(self, X):
        """Generate predictions"""
        if self.model is None:
            raise ValueError("Model not loaded or trained.")
        return self.model.predict(X, verbose=0).flatten()

    def save(self, filepath):
        """Save model to file"""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        self.model.save(str(filepath))
        print(f"💾 LSTM model saved to {filepath}")

    def load(self, filepath):
        """Load trained model with custom objects"""
        self.model = load_model(str(filepath), custom_objects={'directional_loss': directional_loss})
        print(f"✅ LSTM model loaded from {filepath}")

    def get_training_history(self):
        """Return training metrics as dict"""
        if self.history is None:
            return None
        return {
            "loss": self.history.history["loss"],
            "val_loss": self.history.history["val_loss"],
            "mae": self.history.history["mae"],
            "val_mae": self.history.history["val_mae"],
            "epochs_trained": len(self.history.history["loss"]),
        }


class MultiHorizonLSTM:
    """Wrapper to train separate LSTM models for each prediction horizon"""

    def __init__(self, horizons=None, config=None):
        self.horizons = horizons or PREDICTION_HORIZONS
        self.models = {}  # {horizon: LSTMPredictor}
        self.config = config or LSTM_CONFIG

    def train_all(self, X_train, y_train_dict, X_val, y_val_dict, save_dir=None):
        """
        Train one LSTM per horizon.

        Args:
            X_train: Training sequences
            y_train_dict: {horizon: y_train_array}
            X_val: Validation sequences
            y_val_dict: {horizon: y_val_array}
            save_dir: Directory to save models
        """
        results = {}

        for horizon in self.horizons:
            print(f"\n{'='*60}")
            print(f"📈 Training LSTM for {horizon}-day prediction")
            print(f"{'='*60}")

            predictor = LSTMPredictor(self.config)
            predictor.build_model(input_shape=(X_train.shape[1], X_train.shape[2]))

            checkpoint_dir = None
            if save_dir:
                checkpoint_dir = Path(save_dir) / f"lstm_{horizon}d_checkpoints"

            predictor.train(
                X_train,
                y_train_dict[horizon],
                X_val,
                y_val_dict[horizon],
                checkpoint_dir=checkpoint_dir,
            )

            self.models[horizon] = predictor
            results[horizon] = predictor.get_training_history()

            # Save individual model
            if save_dir:
                model_path = Path(save_dir) / f"lstm_{horizon}d.keras"
                predictor.save(model_path)

        return results

    def predict_all(self, X):
        """Generate predictions for all horizons"""
        predictions = {}
        for horizon, predictor in self.models.items():
            predictions[horizon] = predictor.predict(X)
        return predictions

    def load_all(self, save_dir):
        """Load all horizon models from directory"""
        for horizon in self.horizons:
            model_path = Path(save_dir) / f"lstm_{horizon}d.keras"
            if model_path.exists():
                predictor = LSTMPredictor(self.config)
                predictor.load(model_path)
                self.models[horizon] = predictor
            else:
                print(f"⚠️  Model not found for {horizon}d: {model_path}")


if __name__ == "__main__":
    print("LSTM model module loaded successfully.")
    print(f"TensorFlow version: {tf.__version__}")
    print(f"GPU available: {len(tf.config.list_physical_devices('GPU')) > 0}")
