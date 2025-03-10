import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { useWalletContext } from './WalletContext';

// Create context
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isAuthenticated } = useWalletContext();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load chat history when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
    } else {
      // Reset messages when not authenticated
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          message: 'Hello! I\'m SolMate, your AI trading assistant for Solana. Please connect your wallet to get started.',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isAuthenticated]);

  // Fetch chat history
  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getHistory();
      setMessages(response.data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      setError('Failed to load chat history. Please try again.');
      // Set default welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          message: 'Hello! I\'m SolMate, your AI trading assistant for Solana. How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to AI
  const sendMessage = async (message, context = {}) => {
    if (!message.trim()) return;

    // Add user message to state immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API
      const response = await chatAPI.sendMessage(message, context);
      
      // Add AI response to state
      const aiMessage = {
        id: response.data.id || `ai-${Date.now()}`,
        role: 'assistant',
        message: response.data.message,
        timestamp: response.data.timestamp || new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get a response. Please try again.');
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        message: 'Chat history cleared. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        refreshHistory: fetchChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext; 