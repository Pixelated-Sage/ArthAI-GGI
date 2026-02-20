# Module 01: Stock Market Essentials

**Focus**: Understanding financial data structures, OHLCV format, and basic visualization.

---

## 🎯 Learning Objectives

- Understand the standard **OHLCV** data format.
- Visualize stock price movements using **Candlestick Charts**.
- Calculate and plot simple **Moving Averages (SMA)**.
- Differentiate between **Log Returns** vs. **Simple Returns**.

---

## 📚 Core Concepts

### 1. OHLCV Data

Financial data is typically aggregated into time buckets (candles).

- **Open**: Price at the start of the interval.
- **High**: Highest price during the interval.
- **Low**: Lowest price during the interval.
- **Close**: Price at the end of the interval.
- **Volume**: Total number of shares traded.

### 2. Candlestick Charts

A candlestick displays the OHLC data.

- **Body**: The range between Open and Close.
  - _Green/White_: Close > Open (Bullish)
  - _Red/Black_: Close < Open (Bearish)
- **Wick (Shadow)**: The High and Low points outside the body.

### 3. Log Returns vs. Simple Returns

For ML models, we often use **Log Returns** because they are time-additive and symmetric.

$$ r*{log} = \ln(\frac{P_t}{P*{t-1}}) $$

---

## 💻 Hands-On Exercise

We will load NIFTY 50 sample data and plot a candlestick chart with a 20-day Simple Moving Average (SMA).

### Step 1: minimal Python Setup

```python
import pandas as pd
import plotly.graph_objects as go

# Load Data
df = pd.read_csv('../demo_data/nifty50_sample.csv', parse_dates=['Date'])
df.set_index('Date', inplace=True)

# Calculate SMA-20
df['SMA_20'] = df['Close'].rolling(window=20).mean()

print(df.tail())
```

### Step 2: Visualization

_(See the accompanying notebook `notebooks/01_stock_essentials.ipynb` for the interactive plot)_

---

## 🧠 Quiz: Test Your Knowledge

**Question 1: What does the 'wick' of a candlestick represent?**
A) The opening price.
B) The closing price.
C) The highest and lowest prices during the interval.
D) The volume traded.

**Question 2: Why do we often use Log Returns in financial ML?**
A) They are easier to calculate.
B) They are time-additive and typically more normally distributed.
C) They always show positive values.
D) They remove the trend component completely.

**Question 3: If the Close price is lower than the Open price, the candle is typically:**
A) Green
B) Red
C) Blue
D) Invisible

---

## ⏭️ Next Steps

Proceed to the **[Hands-on Notebook](./notebooks/01_stock_essentials.ipynb)** to run the code.
Then, move to **[Module 02: Technical Analysis](./module_02_technical_analysis.md)** to learn about RSI, MACD, and Bollinger Bands.
