import axios from 'axios';
import { auth } from './firebase';

// Get API URL from env or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Configure Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional, good for error handling/logging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       // Optionally redirect to login or clear session
       console.error("Unauthorized API call");
    }
    console.error('API Error:', error.response?.data?.detail || error.message);
    return Promise.reject(error);
  }
);

// --- API Service Methods ---

export const PredictionService = {
  /**
   * Get latest prediction for a symbol
   * @param symbol Ticker symbol (e.g. AAPL)
   */
  getPrediction: async (symbol: string) => {
    const response = await api.get(`/predictions/${symbol.toUpperCase()}`);
    return response.data;
  },

  /**
   * Refresh/Clear models cache
   */
  refreshModels: async () => {
    const response = await api.post('/predictions/refresh');
    return response.data;
  }
};

export const HistoricalService = {
  getOHLCV: async (symbol: string, limit = 100) => {
    const response = await api.get(`/historical/${symbol.toUpperCase()}`, {
      params: { limit }
    });
    return response.data;
  }
};

export const WatchlistService = {
  getWatchlist: async () => {
    const response = await api.get('/watchlist/');
    return response.data;
  },
  
  addSymbol: async (symbol: string) => {
     const response = await api.post(`/watchlist/add/${symbol.toUpperCase()}`);
     return response.data;
  },
  
  removeSymbol: async (symbol: string) => {
    const response = await api.delete(`/watchlist/remove/${symbol.toUpperCase()}`);
    return response.data;
  }
};
export const ChatService = {
  sendMessage: async (message: string, sessionId?: string | null) => {
    const response = await api.post('/chatbot/chat', {
      message,
      session_id: sessionId,
    });
    return response.data;
  },
};

export default api;
