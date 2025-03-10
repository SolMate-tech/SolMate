import React, { useState, useRef, useEffect } from 'react';

const ConversationalInterface = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'system', 
      text: 'Hello! I am SolMate, your AI trading assistant on Solana. How can I help you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // In a real application, this would call a backend API for AI response
    // Simulating AI response for demonstration
    setTimeout(() => {
      processUserInput(userMessage.text);
      setLoading(false);
    }, 1000);
  };

  const processUserInput = (text) => {
    // Simple intent detection for demonstration
    let response = "I'm not sure I understand. Could you rephrase that?";
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('risk') && lowerText.includes('token')) {
      response = "I can analyze token risk for you. Please provide a token address, and I'll check various risk factors like liquidity, code vulnerabilities, and holder concentration.";
    } else if (lowerText.includes('price') || lowerText.includes('chart')) {
      response = "I can show you price charts and technical analysis. Which token would you like to analyze?";
    } else if (lowerText.includes('strategy') || lowerText.includes('trade')) {
      response = "I can help build and optimize trading strategies based on your preferences. What type of strategy are you interested in? DCA, momentum, or something else?";
    } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      response = "Hello! How can I assist with your Solana trading today?";
    } else if (lowerText.includes('thank')) {
      response = "You're welcome! Is there anything else I can help with?";
    }
    
    const aiMessage = {
      id: messages.length + 2,
      sender: 'assistant',
      text: response
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="conversational-interface">
      <div className="chat-container">
        <div className="messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              {message.sender === 'system' && <div className="avatar system">SolMate</div>}
              {message.sender === 'assistant' && <div className="avatar assistant">AI</div>}
              {message.sender === 'user' && <div className="avatar user">You</div>}
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="avatar assistant">AI</div>
              <div className="message-content loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about Solana trading..."
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationalInterface; 