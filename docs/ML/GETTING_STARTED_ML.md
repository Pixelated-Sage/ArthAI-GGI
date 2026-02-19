# Getting Started with ML Development - Complete Guide

## 🎯 You Are Here

You've completed **Week 1-2 setup** ✅ and are ready to start **Week 3-4: ML Model Development**.

This guide will walk you through **everything you need to do**, step by step.

---

## 📦 What You've Received

I've created **5 comprehensive documents** for you:

### 1. **ML_MODEL_DEVELOPMENT_GUIDE.md**
- Overview of ML concepts
- Data preparation code
- Feature engineering code
- Complete explanations for beginners

### 2. **ML_LSTM_TRAINING_GUIDE.md**
- LSTM model architecture
- Training process
- Evaluation metrics
- Visualization code

### 3. **train.py**
- Complete automated pipeline
- One command to train models
- Handles everything from data loading to saving

### 4. **Implementation files** (to create):
- `src/data_preparation.py`
- `src/feature_engineering.py`
- `src/sequence_generator.py`
- `src/lstm_model.py`

---

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Your ML Environment

```bash
# Navigate to your ML directory
cd /path/to/FinPredict/ml/

# Create folder structure
mkdir -p data/{raw,processed,models}
mkdir -p src
mkdir -p notebooks

# Create config.py
touch config.py

# Create requirements.txt
touch requirements.txt
```

### Step 2: Install Dependencies

**Option A: Using pip**
```bash
pip install tensorflow==2.15.0 keras==2.15.0 xgboost==2.0.3 \
    scikit-learn==1.4.0 pandas==2.1.4 numpy==1.26.3 \
    psycopg2-binary==2.9.9 python-dotenv==1.0.0 \
    matplotlib==3.8.2 seaborn==0.13.1 joblib==1.3.2 tqdm==4.66.1
```

**Option B: Using the requirements.txt**
```bash
# Copy the requirements from ML_MODEL_DEVELOPMENT_GUIDE.md
# Then run:
pip install -r requirements.txt
```

**For ta-lib (technical indicators):**
```bash
# Linux/Ubuntu
sudo apt-get install ta-lib
pip install ta-lib

# macOS
brew install ta-lib
pip install ta-lib

# Windows (use conda)
conda install -c conda-forge ta-lib
```

### Step 3: Create Your Files

Copy the code from the guides into these files:

```bash
# From ML_MODEL_DEVELOPMENT_GUIDE.md
ml/config.py                    # Configuration
ml/src/data_preparation.py      # Data loading
ml/src/feature_engineering.py   # Technical indicators

# From ML_LSTM_TRAINING_GUIDE.md
ml/src/sequence_generator.py    # Create LSTM sequences
ml/src/lstm_model.py            # LSTM model

# Automated pipeline
ml/train.py                     # Complete training script
```

---

## 📚 Learning Path (Recommended Order)

### Day 1-2: Data Preparation ✅

**Goal**: Load data from TimescaleDB and engineer features

**Tasks:**
1. Read `ML_MODEL_DEVELOPMENT_GUIDE.md` (Step 1-2)
2. Create `config.py` with your database credentials
3. Run `data_preparation.py` to test database connection
4. Load data for AAPL and save to CSV
5. Run `feature_engineering.py` to calculate indicators

**Test Command:**
```bash
python src/data_preparation.py
python src/feature_engineering.py
```

**Expected Result:**
```
✅ Connected to TimescaleDB
✅ Loaded 1258 records for AAPL
💾 Saved to data/raw/AAPL_raw.csv
✅ Feature Engineering Complete!
💾 Features saved to data/processed/AAPL_features.csv
```

**Checkpoint:** You should have these files:
- `data/raw/AAPL_raw.csv`
- `data/processed/AAPL_features.csv`

---

### Day 3-4: Sequence Generation ✅

**Goal**: Prepare data in the format LSTM expects

**Tasks:**
1. Read `ML_LSTM_TRAINING_GUIDE.md` (Step 3)
2. Create `sequence_generator.py`
3. Run it to create sequences
4. Understand what "sequence_length=60" means

**Test Command:**
```bash
python src/sequence_generator.py
```

**Expected Result:**
```
🔧 Preparing sequences (length=60)...
✅ Created 998 sequences
X shape: (998, 60, 41)
💾 Saved sequences to data/processed/AAPL/sequences_horizon_1d.pkl
```

**Checkpoint:** You should have:
- `data/processed/AAPL/sequences_horizon_1d.pkl`

**Understanding Check:**
- Can you explain what shape (998, 60, 41) means?
  - 998 = number of samples
  - 60 = days of history (sequence length)
  - 41 = number of features

---

### Day 5-7: LSTM Training 🎯

**Goal**: Train your first ML model!

**Tasks:**
1. Read `ML_LSTM_TRAINING_GUIDE.md` (Step 4)
2. Create `lstm_model.py`
3. Train LSTM model for AAPL
4. Evaluate performance
5. Visualize results

**Test Command:**
```bash
python src/lstm_model.py
```

**Expected Result:**
```
🏗️  Building LSTM model...
🎯 Training LSTM model...
Epoch 1/50 - loss: 0.0245 - val_loss: 0.0189
...
✅ Training complete!

📈 Test Results:
   MAPE: 6.23%  ← YOUR TARGET
   R²:   0.8234
   Direction Accuracy: 62.35%

💾 Model saved to data/models/AAPL/lstm_h1d.h5
```

**Success Criteria:**
- ✅ MAPE < 7%
- ✅ R² > 0.75
- ✅ Direction Accuracy > 60%

---

### Day 8: Use the Automated Pipeline 🚀

**Goal**: Train models for all symbols with one command

**Tasks:**
1. Copy `train.py` to your `ml/` directory
2. Make it executable: `chmod +x train.py`
3. Train for one symbol first
4. Then train for all symbols

**Commands:**
```bash
# Train AAPL only (1-day prediction)
python train.py --symbol AAPL --horizon 1

# Train AAPL for 7-day prediction
python train.py --symbol AAPL --horizon 7

# Train all symbols (1-day prediction)
python train.py --all

# Train all symbols, all horizons (1, 7, 30 days)
python train.py --all --all-horizons
```

**Expected Output:**
```
############################################################
# ML TRAINING PIPELINE
# Symbol: AAPL
# Horizon: 1 days
############################################################

STEP 1: Loading data for AAPL
...
STEP 5: Evaluating model
...

============================================================
✅ PIPELINE COMPLETE!
============================================================
Duration: 245.67 seconds (4.09 minutes)

📊 Final Metrics:
   MAPE: 6.23%
   R²:   0.8234
   Direction Accuracy: 62.35%

🎉 EXCELLENT! MAPE < 7% target achieved!
```

---

## 🎯 Your Current Task List

Here's what you need to do **RIGHT NOW**:

### Today (Day 1)
- [ ] Read `ML_MODEL_DEVELOPMENT_GUIDE.md` completely
- [ ] Setup folder structure in `ml/`
- [ ] Install all dependencies
- [ ] Create `config.py` with your database credentials
- [ ] Test database connection

### Tomorrow (Day 2)
- [ ] Create `data_preparation.py` file
- [ ] Load data for AAPL from TimescaleDB
- [ ] Save to CSV
- [ ] Create `feature_engineering.py`
- [ ] Calculate technical indicators
- [ ] Verify you have CSV files in `data/raw/` and `data/processed/`

### Day After (Day 3)
- [ ] Read `ML_LSTM_TRAINING_GUIDE.md`
- [ ] Create `sequence_generator.py`
- [ ] Generate sequences for AAPL
- [ ] Understand sequence shapes

### Next Week (Day 4-7)
- [ ] Create `lstm_model.py`
- [ ] Train your first LSTM model
- [ ] Check if MAPE < 7%
- [ ] Celebrate! 🎉

### After First Success
- [ ] Use `train.py` to train all symbols
- [ ] Compare results across different stocks
- [ ] Document your findings

---

## 📊 Understanding Your Data

### What is in your database?

You already have this data in TimescaleDB:

**Stocks:**
- AAPL (Apple)
- MSFT (Microsoft)
- GOOGL (Google)
- TSLA (Tesla)
- NVDA (Nvidia)

**Crypto:**
- BTC (Bitcoin)
- ETH (Ethereum)
- BNB (Binance Coin)

**Data Structure:**
```sql
ohlcv_data table:
- timestamp (when)
- open (opening price)
- high (highest price that day)
- low (lowest price that day)
- close (closing price)
- volume (how many shares/coins traded)
```

### What features will you create?

From the raw OHLCV data, you'll create **41 features**:

**Price Features (6):**
- price_change, price_change_1d, price_change_7d, price_change_30d
- hl_spread, oc_spread

**Moving Averages (10):**
- SMA: 5, 10, 20, 50, 200 days
- EMA: 12, 26, 50 days
- Distance from SMA 20, 50

**Momentum Indicators (9):**
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Stochastic Oscillator
- ROC (Rate of Change)
- CCI (Commodity Channel Index)

**Volatility Indicators (7):**
- Bollinger Bands (upper, middle, lower, width, position)
- ATR (Average True Range)
- Historical Volatility

**Volume Indicators (4):**
- Volume SMA, Volume Ratio
- OBV (On-Balance Volume)
- Accumulation/Distribution Line

---

## 🔍 Debugging Guide

### Issue 1: Can't connect to TimescaleDB

**Symptom:**
```
❌ Database connection failed
```

**Solution:**
```python
# Check your config.py has correct credentials:
DB_CONFIG = {
    "host": "your-timescale-host.railway.app",  # Check this!
    "port": 5432,
    "database": "railway",  # Check this!
    "user": "postgres",
    "password": "your-password",  # Check this!
}

# Test connection separately:
import psycopg2
conn = psycopg2.connect(**DB_CONFIG)
print("✅ Connected!")
```

### Issue 2: ta-lib not installing

**Symptom:**
```
ERROR: Could not install ta-lib
```

**Solution:**
```bash
# Linux
sudo apt-get install build-essential
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install
pip install ta-lib

# macOS
brew install ta-lib
pip install ta-lib

# Windows (easiest)
conda install -c conda-forge ta-lib
```

### Issue 3: Out of memory during training

**Symptom:**
```
ResourceExhaustedError: OOM when allocating tensor
```

**Solution:**
```python
# In config.py, reduce batch_size:
LSTM_CONFIG = {
    ...
    "batch_size": 16,  # Was 32
    ...
}
```

### Issue 4: Training is very slow

**Symptom:**
```
Each epoch takes 5+ minutes
```

**Solution:**
```python
# Option 1: Reduce sequence length
LSTM_CONFIG = {
    "sequence_length": 30,  # Was 60
    ...
}

# Option 2: Reduce epochs
LSTM_CONFIG = {
    ...
    "epochs": 25,  # Was 50
}

# Option 3: Use Google Colab (free GPU!)
# Upload your code to Colab and run there
```

---

## 📈 What Success Looks Like

After completing Week 3-4, you should have:

### Files Created ✅
```
ml/
├── config.py
├── train.py
├── requirements.txt
├── data/
│   ├── raw/
│   │   ├── AAPL_raw.csv
│   │   ├── MSFT_raw.csv
│   │   └── ... (8 files total)
│   ├── processed/
│   │   ├── AAPL_features.csv
│   │   ├── AAPL/
│   │   │   └── sequences_horizon_1d.pkl
│   │   └── ... (8 symbols)
│   └── models/
│       ├── AAPL/
│       │   ├── lstm_h1d.h5
│       │   ├── metrics_h1d.pkl
│       │   ├── training_history_h1d.png
│       │   └── predictions_h1d.png
│       └── ... (8 symbols)
└── src/
    ├── data_preparation.py
    ├── feature_engineering.py
    ├── sequence_generator.py
    └── lstm_model.py
```

### Metrics Achieved ✅
```
Symbol   | MAPE   | R²     | Direction Acc
---------|--------|--------|---------------
AAPL     | 6.23%  | 0.8234 | 62.35%
MSFT     | 5.87%  | 0.8456 | 64.12%
GOOGL    | 6.91%  | 0.8123 | 61.23%
TSLA     | 8.45%  | 0.7654 | 58.67%  ← May need tuning
NVDA     | 5.45%  | 0.8678 | 65.43%
BTC      | 7.23%  | 0.7923 | 60.12%
ETH      | 6.78%  | 0.8034 | 61.89%
BNB      | 7.45%  | 0.7812 | 59.45%
```

### Skills Learned ✅
- [x] Load and clean financial data
- [x] Calculate technical indicators
- [x] Prepare sequential data for LSTM
- [x] Build and train LSTM models
- [x] Evaluate model performance
- [x] Save and load trained models
- [x] Create data visualizations

---

## 🎓 Learning Resources

If you get stuck or want to learn more:

### Understanding LSTM
- [YouTube: LSTM Explained (StatQuest)](https://www.youtube.com/watch?v=8HyCNIVRbSU)
- [Colah's Blog: Understanding LSTM](https://colah.github.io/posts/2015-08-Understanding-LSTMs/)

### Technical Indicators
- [Investopedia: RSI](https://www.investopedia.com/terms/r/rsi.asp)
- [Investopedia: MACD](https://www.investopedia.com/terms/m/macd.asp)
- [Investopedia: Bollinger Bands](https://www.investopedia.com/terms/b/bollingerbands.asp)

### TensorFlow/Keras
- [Official Keras Documentation](https://keras.io/)
- [TensorFlow Time Series Tutorial](https://www.tensorflow.org/tutorials/structured_data/time_series)

### Python Data Science
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [NumPy Documentation](https://numpy.org/doc/)

---

## 🚀 Next Steps After ML Training

Once you complete LSTM training, you'll move to:

### Week 5-6: Backend API
- Create FastAPI endpoints
- Integrate your trained models
- Build prediction API
- Add caching with Redis

### Week 7-8: Frontend
- Build Next.js dashboard
- Display predictions
- Interactive charts
- User authentication

---

## 💡 Tips for Success

### 1. Start Small
Don't try to train all symbols at once. Start with AAPL, get it working, then expand.

### 2. Verify Each Step
After each script, check that files were created:
```bash
ls -lh data/raw/
ls -lh data/processed/
ls -lh data/models/
```

### 3. Keep Notes
Document your process:
- What worked?
- What errors did you encounter?
- How did you fix them?
- What were your final metrics?

### 4. Ask for Help
If stuck for >30 minutes, ask for help:
- Stack Overflow
- Reddit r/MachineLearning
- Discord ML communities
- Me! (Claude)

### 5. Celebrate Small Wins
- ✅ Database connected? Celebrate!
- ✅ First feature engineered? Celebrate!
- ✅ First model trained? BIG celebrate! 🎉

---

## 📞 Getting Help

### Common Questions:

**Q: How long should training take?**
A: 5-15 minutes per symbol on a modern laptop. Use Google Colab if slower.

**Q: What if my MAPE is >10%?**
A: Try:
1. More training data
2. Different hyperparameters
3. More features
4. Better data cleaning

**Q: Can I use a different database?**
A: Yes! Modify `data_preparation.py` to load from CSV files instead.

**Q: Do I need a GPU?**
A: No, but it helps. Use Google Colab for free GPU access.

**Q: What if I don't understand the math?**
A: That's OK! Focus on:
1. Running the code
2. Understanding inputs/outputs
3. Learning the concepts gradually

---

## ✅ Completion Checklist

Before moving to Week 5-6 (Backend), ensure:

- [ ] All 8 symbols have trained models
- [ ] MAPE < 7% for at least 5 symbols
- [ ] Direction accuracy > 60% for at least 5 symbols
- [ ] All files are organized properly
- [ ] You can load and use a saved model
- [ ] You understand the basic ML workflow
- [ ] You've documented your results

---

## 🎯 Your Mission (Week 3-4)

**Goal**: Train LSTM models for stock/crypto price prediction

**Success Metrics:**
- 8 trained models (5 stocks + 3 crypto)
- MAPE < 7% average
- Models saved and ready for API integration
- Understanding of ML workflow

**Timeline**: 10-14 days (2 weeks)

**Difficulty**: 6/10 (Moderate)

**Resume Impact**: High! You'll be able to say:
*"Built and trained LSTM models achieving <7% MAPE for financial time-series forecasting"*

---

## 🎉 Ready to Start?

**Your first command:**
```bash
cd ml/
python src/data_preparation.py
```

**Expected result:**
```
✅ Connected to TimescaleDB
✅ Loaded 1258 records for AAPL
💾 Saved to data/raw/AAPL_raw.csv
```

**If you see this, you're on the right track!** 🚀

Good luck! Let me know when you hit your first checkpoint! 💪

---

**Document Created**: January 29, 2025
**For**: BTech 3rd Year ML Project
**Difficulty**: Beginner-friendly with step-by-step guidance
