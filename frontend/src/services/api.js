import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  verifyWallet: (publicKey, signature, message) => 
    api.post('/auth/verify-wallet', { publicKey, signature, message }),
  getUser: () => api.get('/auth/user'),
};

// Chat API
export const chatAPI = {
  sendMessage: (message, context) => api.post('/chat/message', { message, context }),
  getHistory: () => api.get('/chat/history'),
};

// Analytics API
export const analyticsAPI = {
  analyzeToken: (tokenAddress) => api.post('/analytics/token', { tokenAddress }),
  getMarketOverview: () => api.get('/analytics/market'),
};

// Strategies API
export const strategiesAPI = {
  createStrategy: (description, parameters) => 
    api.post('/strategies/create', { description, parameters }),
  getStrategies: () => api.get('/strategies'),
  getStrategy: (id) => api.get(`/strategies/${id}`),
};

// Tokens API
export const tokensAPI = {
  getTokenInfo: (address) => api.get(`/tokens/info/${address}`),
  getTrendingTokens: () => api.get('/tokens/trending'),
  searchTokens: (query) => api.get('/tokens/search', { params: { query } }),
};

export default api; 