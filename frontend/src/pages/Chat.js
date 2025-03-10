import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useChatContext } from '../contexts/ChatContext';
import { useWalletContext } from '../contexts/WalletContext';

const Chat = () => {
  const { connected } = useWallet();
  const { isAuthenticated } = useWalletContext();
  const { messages, isLoading, error, sendMessage, clearChat } = useChatContext();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput('');
  };

  const handleClearChat = () => {
    clearChat();
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
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Chat Assistant</h1>
          <p className="text-gray-300">
            Ask me anything about Solana trading, token analysis, or strategy building.
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="flex-grow bg-gray-800 rounded-lg p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.role === 'system'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {message.message || message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm">
                {error}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Solana tokens, trading strategies, or market analysis..."
          className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg px-4 py-2 font-medium"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 