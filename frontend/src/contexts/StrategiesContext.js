import React, { createContext, useContext, useState, useEffect } from 'react';
import { strategiesAPI } from '../services/api';
import { useWalletContext } from './WalletContext';

// Create context
const StrategiesContext = createContext();

export const StrategiesProvider = ({ children }) => {
  const { isAuthenticated } = useWalletContext();
  const [strategies, setStrategies] = useState([]);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load strategies when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStrategies();
    } else {
      setStrategies([]);
      setCurrentStrategy(null);
    }
  }, [isAuthenticated]);

  // Fetch strategies
  const fetchStrategies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await strategiesAPI.getStrategies();
      setStrategies(response.data.strategies || []);
    } catch (err) {
      console.error('Failed to fetch strategies:', err);
      setError('Failed to load strategies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get strategy by ID
  const getStrategy = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await strategiesAPI.getStrategy(id);
      setCurrentStrategy(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to get strategy:', err);
      setError('Failed to load strategy. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create strategy
  const createStrategy = async (description, parameters = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await strategiesAPI.createStrategy(description, parameters);
      setCurrentStrategy(response.data);
      
      // Add to strategies list
      setStrategies((prevStrategies) => [response.data, ...prevStrategies]);
      
      return response.data;
    } catch (err) {
      console.error('Failed to create strategy:', err);
      setError('Failed to create strategy. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current strategy
  const clearCurrentStrategy = () => {
    setCurrentStrategy(null);
  };

  return (
    <StrategiesContext.Provider
      value={{
        strategies,
        currentStrategy,
        isLoading,
        error,
        fetchStrategies,
        getStrategy,
        createStrategy,
        clearCurrentStrategy,
      }}
    >
      {children}
    </StrategiesContext.Provider>
  );
};

// Custom hook to use the strategies context
export const useStrategiesContext = () => {
  const context = useContext(StrategiesContext);
  if (!context) {
    throw new Error('useStrategiesContext must be used within a StrategiesProvider');
  }
  return context;
};

export default StrategiesContext; 