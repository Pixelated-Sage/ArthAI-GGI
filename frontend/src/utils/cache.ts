export const CACHE_KEYS = {
  DASHBOARD_LIST: 'fin_dashboard_list_v2',
  prediction: (symbol: string) => `fin_pred_${symbol}_v2`,
  history: (symbol: string) => `fin_hist_${symbol}_v2`,
  watchlist: 'fin_watchlist_v2'
};

export const loadFromCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Error loadFromCache', error);
    return null;
  }
};

export const saveToCache = (key: string, data: any): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saveToCache', error);
  }
};
