import React, { createContext, useContext, useState } from 'react';
import { analyticsAPI, tokensAPI } from '../services/api';

// Create context
const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [tokenAnalysis, setTokenAnalysis] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Analyze token
  const analyzeToken = async (tokenAddress) => {
    if (!tokenAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyticsAPI.analyzeToken(tokenAddress);
      setTokenAnalysis(response.data);
    } catch (err) {
      console.error('Failed to analyze token:', err);
      setError('Failed to analyze token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get market overview
  const getMarketOverview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analyticsAPI.getMarketOverview();
      setMarketOverview(response.data);
    } catch (err) {
      console.error('Failed to get market overview:', err);
      setError('Failed to get market overview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get trending tokens
  const getTrendingTokens = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tokensAPI.getTrendingTokens();
      setTrendingTokens(response.data.tokens || []);
    } catch (err) {
      console.error('Failed to get trending tokens:', err);
      setError('Failed to get trending tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search tokens
  const searchTokens = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await tokensAPI.searchTokens(query);
      setSearchResults(response.data.results || []);
    } catch (err) {
      console.error('Failed to search tokens:', err);
      setError('Failed to search tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get token info
  const getTokenInfo = async (address) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tokensAPI.getTokenInfo(address);
      return response.data;
    } catch (err) {
      console.error('Failed to get token info:', err);
      setError('Failed to get token info. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear analysis
  const clearAnalysis = () => {
    setTokenAnalysis(null);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        tokenAnalysis,
        marketOverview,
        trendingTokens,
        searchResults,
        isLoading,
        error,
        analyzeToken,
        getMarketOverview,
        getTrendingTokens,
        searchTokens,
        getTokenInfo,
        clearAnalysis,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook to use the analytics context
export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext; 