import React, { useState, useEffect, useRef } from 'react';
import { formatDistance } from 'date-fns';

/**
 * StreamingChatMessage component displays messages with typewriter effect
 * for streaming AI responses
 */
const StreamingChatMessage = ({ message, isStreaming, onStreamComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(null);
  const previousStreamingState = useRef(isStreaming);
  const previousMessageId = useRef(message.id);
  
  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedContent]);
  
  // Reset state when message changes
  useEffect(() => {
    // Check if the message ID changed
    if (previousMessageId.current !== message.id) {
      previousMessageId.current = message.id;
      
      if (message.role === 'user' || !isStreaming) {
        setDisplayedContent(message.content || '');
        setIsComplete(true);
      } else {
        setDisplayedContent('');
        setIsComplete(false);
      }
    }
  }, [message.id, message.role, isStreaming]);
  
  // Handle streaming updates
  useEffect(() => {
    // If it's an assistant message and we're streaming
    if (message.role === 'assistant') {
      if (isStreaming) {
        // Check if streaming content is available
        if (message.streamContent !== undefined) {
          setDisplayedContent(message.streamContent);
        }
        
        // Check if streaming is complete
        if (message.streamComplete && !isComplete) {
          setIsComplete(true);
          if (onStreamComplete) {
            onStreamComplete(message.id);
          }
        }
      } else if (previousStreamingState.current && !isStreaming) {
        // If we were streaming but stopped
        setIsComplete(true);
        setDisplayedContent(message.content || message.streamContent || '');
      } else if (message.content) {
        // For non-streaming assistant messages
        setDisplayedContent(message.content);
        setIsComplete(true);
      }
    }
    
    previousStreamingState.current = isStreaming;
  }, [
    message.role, 
    message.streamContent, 
    message.content, 
    message.streamComplete, 
    message.id, 
    isStreaming, 
    isComplete, 
    onStreamComplete
  ]);
  
  // Format the timestamp
  const formattedTime = message.timestamp 
    ? formatDistance(new Date(message.timestamp), new Date(), { addSuffix: true })
    : '';
  
  return (
    <div className={`chat-message ${message.role}`}>
      <div className="message-header">
        <span className="role-badge">
          {message.role === 'user' ? 'You' : 'AI Assistant'}
          {message.metadata?.provider && message.metadata?.model && (
            <span className="model-info">
              {message.metadata.provider} - {message.metadata.model}
            </span>
          )}
        </span>
        <span className="timestamp">{formattedTime}</span>
      </div>
      
      <div className="message-content">
        {displayedContent.split('\n').map((line, i) => (
          line ? <p key={i}>{line}</p> : <br key={i} />
        ))}
        
        {message.role === 'assistant' && !isComplete && (
          <span className="cursor-blink">▌</span>
        )}
        
        <div ref={contentRef} className="scroll-anchor"></div>
      </div>
      
      {message.role === 'assistant' && message.metadata?.responseTime && (
        <div className="message-footer">
          <span className="response-time">
            Response time: {message.metadata.responseTime}ms
          </span>
        </div>
      )}
    </div>
  );
};

export default StreamingChatMessage; 