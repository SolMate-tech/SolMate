import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { authAPI } from '../services/api';

// Create context
const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && connected && publicKey) {
      fetchUserProfile();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [connected, publicKey]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getUser();
      setUser(response.data);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to fetch user profile');
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate with wallet
  const authenticateWithWallet = async () => {
    if (!connected || !publicKey || !signMessage) {
      setError('Wallet not connected or does not support signing');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create message to sign
      const message = `Sign this message to authenticate with SolMate: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Request signature from wallet
      const signature = await signMessage(encodedMessage);
      const signatureBase64 = Buffer.from(signature).toString('base64');

      // Verify signature with backend
      const response = await authAPI.verifyWallet(
        publicKey.toString(),
        signatureBase64,
        message
      );

      // Save token and user data
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Authentication failed:', err);
      setError('Authentication failed. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    disconnect();
  };

  return (
    <WalletContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        authenticateWithWallet,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext; 