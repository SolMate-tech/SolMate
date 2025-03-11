import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletContext } from '../contexts/WalletContext';
import { useChatContext } from '../contexts/ChatContext';
import StreamingChatMessage from '../components/StreamingChatMessage';

const Chat = () => {
  const { connected } = useWallet();
  const { isAuthenticated } = useWalletContext();
  const { 
    messages, 
    loading, 
    error, 
    sendMessage, 
    sendStreamingMessage,
    clearHistory, 
    isStreaming,
    streamingMessageId,
    handleStreamComplete
  } = useChatContext();
  
  const [input, setInput] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const message = input.trim();
    setInput('');
    
    if (useStreaming) {
      await sendStreamingMessage(message);
    } else {
      await sendMessage(message);
    }
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your chat history? This action cannot be undone.')) {
      await clearHistory();
    }
  };
  
  // Function to render message content with any visualizations
  const renderMessageContent = (message) => {
    const { role, message: content, data, visualType } = message;
    
    // Basic message content
    let renderedContent = <p className="message-text">{content}</p>;
    
    // Add visualizations based on visualType
    if (role === 'assistant' && visualType) {
      switch (visualType) {
        case 'risk_summary':
          if (data && data.riskScore !== undefined) {
            renderedContent = (
              <>
                {renderedContent}
                <div className="visualization risk-summary">
                  <div className="risk-meter">
                    <div 
                      className="risk-indicator" 
                      style={{ 
                        width: `${data.riskScore}%`,
                        backgroundColor: getRiskColor(data.riskScore)
                      }}
                    />
                  </div>
                  <div className="risk-label">
                    Risk Score: {data.riskScore}/100 ({data.riskCategory})
                  </div>
                </div>
              </>
            );
          }
          break;
          
        case 'price_info':
          if (data && data.price) {
            renderedContent = (
              <>
                {renderedContent}
                <div className="visualization price-info">
                  <div className="price-value">${data.price}</div>
                  <div className={`price-change ${parseFloat(data.change24h) >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(data.change24h) >= 0 ? '↑' : '↓'} {Math.abs(data.change24h)}%
                  </div>
                </div>
              </>
            );
          }
          break;
          
        case 'market_overview':
        case 'token_info':
        case 'transaction_info':
        case 'strategy_outline':
          // Render these visualization types as needed
          break;
          
        default:
          break;
      }
    }
    
    return renderedContent;
  };
  
  // Helper function to get color based on risk score
  const getRiskColor = (score) => {
    if (score < 20) return '#4CAF50'; // green
    if (score < 40) return '#8BC34A'; // light green
    if (score < 60) return '#FFC107'; // amber
    if (score < 80) return '#FF9800'; // orange
    return '#F44336'; // red
  };
  
  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Please connect your Solana wallet to access the AI chat assistant.
        </p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>Chat with Solmate AI</h1>
        <div className="chat-actions">
          <button
            className="clear-history-button"
            onClick={handleClearHistory}
            disabled={loading || messages.length <= 1}
          >
            Clear History
          </button>
          <label className="streaming-toggle">
            <input
              type="checkbox"
              checked={useStreaming}
              onChange={() => setUseStreaming(!useStreaming)}
              disabled={loading}
            />
            <span className="toggle-label">Streaming Mode</span>
          </label>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map(message => (
            <StreamingChatMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.id === streamingMessageId}
              onStreamComplete={handleStreamComplete}
            />
          ))}
          
          {loading && !isStreaming && (
            <div className="loading-indicator">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={loading}
            rows={1}
            className="chat-input"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!input.trim() || loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 