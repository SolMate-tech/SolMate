import React, { createContext, useState, useContext, useCallback } from 'react';
import { riskAPI } from '../services/api';
import { handleApiError } from '../services/api';
import { useWalletContext } from './WalletContext';

// Create context
const RiskContext = createContext();

export const RiskProvider = ({ children }) => {
  const { isAuthenticated } = useWalletContext();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  
  /**
   * Analyze token risk
   * @param {string} tokenAddress - Token address to analyze
   */
  const analyzeTokenRisk = useCallback(async (tokenAddress) => {
    if (!isAuthenticated) {
      setError('Authentication required to analyze token risk');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await riskAPI.analyzeToken(tokenAddress);
      setCurrentAnalysis(response.data.data);
      return response.data.data;
    } catch (error) {
      handleApiError(error, setError, setLoading);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  /**
   * Get risk factors
   */
  const getRiskFactors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await riskAPI.getRiskFactors();
      setRiskFactors(response.data.data.factors);
      return response.data.data.factors;
    } catch (error) {
      handleApiError(error, setError, setLoading);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Compare token risks
   * @param {Array<string>} tokenAddresses - Array of token addresses to compare
   */
  const compareTokenRisks = useCallback(async (tokenAddresses) => {
    if (!isAuthenticated) {
      setError('Authentication required to compare token risks');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await riskAPI.compareTokens(tokenAddresses);
      setComparisonData(response.data.data);
      return response.data.data;
    } catch (error) {
      handleApiError(error, setError, setLoading);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  /**
   * Get historical risk data
   * @param {string} tokenAddress - Token address
   * @param {number} days - Number of days of historical data
   */
  const getHistoricalRisk = useCallback(async (tokenAddress, days = 30) => {
    if (!isAuthenticated) {
      setError('Authentication required to get historical risk data');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await riskAPI.getHistoricalRisk(tokenAddress, days);
      setHistoricalData(response.data.data);
      return response.data.data;
    } catch (error) {
      handleApiError(error, setError, setLoading);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  /**
   * Clear current analysis
   */
  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setComparisonData(null);
    setHistoricalData(null);
    setError(null);
  }, []);
  
  // Context value
  const value = {
    loading,
    error,
    currentAnalysis,
    riskFactors,
    comparisonData,
    historicalData,
    analyzeTokenRisk,
    getRiskFactors,
    compareTokenRisks,
    getHistoricalRisk,
    clearAnalysis
  };
  
  return (
    <RiskContext.Provider value={value}>
      {children}
    </RiskContext.Provider>
  );
};

export const useRiskContext = () => {
  const context = useContext(RiskContext);
  if (context === undefined) {
    throw new Error('useRiskContext must be used within a RiskProvider');
  }
  return context;
};

export default RiskContext; 