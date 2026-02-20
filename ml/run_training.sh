#!/bin/bash
# FinPredict Training Pipeline
# This script handles cleaning DB (optional), downloading data, and training models.

# If you get DB hangs during 'Saving...', use --no-save-db
# Usage: ./run_training.sh [--clean-db] [--no-save-db]


echo "🚀 Starting FinPredict Training..."
python train.py "$@"
