export interface Prediction {
  symbol: string;
  current_price: number;
  timestamp: string;
  signal?: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  overall_confidence?: number;
  predictions: {
    [key: string]: {
      price: number;
      change?: number;
      change_percent?: number;
      confidence?: number;
    }
  };
}

export interface OHLCV {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
