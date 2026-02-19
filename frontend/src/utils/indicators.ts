
/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(0, period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const k = 2 / (period + 1);
  let ema = data[data.length - period]; // Start with SMA (approx)
  // Or start from beginning correctly
  // Simple approach: data[0] is newest. We need oldest first for EMA calc
  const reversed = [...data].reverse(); 
  ema = reversed[0];
  for (let i = 1; i < reversed.length; i++) {
      ema = (reversed[i] * k) + (ema * (1 - k));
  }
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param prices Array of prices (newest first)
 * @param period Standard 14
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;

  // Reverse to chronological order (oldest -> newest) for calculation
  const data = [...prices].reverse();
  
  let gains = 0;
  let losses = 0;

  // First RSI Calculation
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Subsequent calculations (Wilder's Smoothing)
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate Volatility (Standard Deviation of log returns * sqrt(252))
 * annualized volatility estimate
 */
export function calculateVolatility(prices: number[], period: number = 20): number {
    if (prices.length < period + 1) return 0;
    
    const returns = [];
    for(let i=0; i < Math.min(prices.length - 1, period); i++) {
        returns.push(Math.log(prices[i] / prices[i+1]));
    }
    
    const mean = returns.reduce((a,b) => a+b, 0) / returns.length;
    const variance = returns.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
}
