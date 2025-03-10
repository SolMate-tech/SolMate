import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout for requests
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true,
        originalError: error
      });
    }
    
    // Handle token expiration
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      // Add a small delay to prevent immediate reload loops
      setTimeout(() => window.location.reload(), 100);
      return Promise.reject({
        message: 'Session expired. Please log in again.',
        isAuthError: true,
        originalError: error
      });
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        isServerError: true,
        originalError: error
      });
    }
    
    // Handle other errors
    return Promise.reject({
      message: error.response.data?.error || 'An error occurred',
      status: error.response.status,
      originalError: error
    });
  }
);

// Auth API
export const authAPI = {
  verifyWallet: (publicKey, signature, message) => 
    api.post('/auth/verify-wallet', { publicKey, signature, message }),
  getUser: () => api.get('/auth/user'),
  updateUser: (userData) => api.put('/auth/user', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

// Chat API
export const chatAPI = {
  sendMessage: (message, context) => api.post('/chat/message', { message, context }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
};

// Analytics API
export const analyticsAPI = {
  analyzeToken: (tokenAddress) => api.post('/analytics/token', { tokenAddress }),
  getMarketOverview: () => api.get('/analytics/market'),
  getTrending: () => api.get('/analytics/trending'),
  getRiskFactors: (tokenAddress) => api.get(`/analytics/risk/${tokenAddress}`),
  getHistoricalData: (tokenAddress, timeframe) => 
    api.get(`/analytics/historical/${tokenAddress}`, { params: { timeframe } }),
};

// Strategies API
export const strategiesAPI = {
  createStrategy: (description, parameters) => 
    api.post('/strategies/create', { description, parameters }),
  getStrategies: () => api.get('/strategies'),
  getStrategy: (id) => api.get(`/strategies/${id}`),
  updateStrategy: (id, data) => api.put(`/strategies/${id}`, data),
  deleteStrategy: (id) => api.delete(`/strategies/${id}`),
  executeStrategy: (id) => api.post(`/strategies/${id}/execute`),
  pauseStrategy: (id) => api.post(`/strategies/${id}/pause`),
};

// Tokens API
export const tokensAPI = {
  getTokenInfo: (address) => api.get(`/tokens/info/${address}`),
  getTrendingTokens: () => api.get('/tokens/trending'),
  searchTokens: (query) => api.get('/tokens/search', { params: { query } }),
  getTokenPrice: (address) => api.get(`/tokens/price/${address}`),
  getTokenMetadata: (address) => api.get(`/tokens/metadata/${address}`),
};

/**
 * Helper function to handle API errors in components
 * @param {Error} error - The error from an API call
 * @param {Function} setError - State setter for error message
 * @param {Function} setLoading - State setter for loading state
 */
export const handleApiError = (error, setError, setLoading) => {
  if (setLoading) setLoading(false);
  const message = error.message || 'An unexpected error occurred';
  if (setError) setError(message);
  return message;
};

export default api; 