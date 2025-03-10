import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWalletContext } from './WalletContext';
import api from '../utils/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { isAuthenticated } = useWalletContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // LLM相关状态
  const [llmProviders, setLlmProviders] = useState([]);
  const [llmProvidersLoading, setLlmProvidersLoading] = useState(false);
  const [preferredProvider, setPreferredProvider] = useState(null);
  const [preferredModel, setPreferredModel] = useState(null);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  // 初始化聊天
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
      fetchLlmPreferences();
    } else {
      setMessages([{
        id: 'welcome',
        role: 'system',
        content: 'Welcome to SolMate! Please connect your wallet to start interacting.',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isAuthenticated]);
  
  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/history');
      
      if (response.data.success) {
        setMessages(response.data.data || []);
      } else {
        throw new Error(response.data.error || '获取聊天历史失败');
      }
    } catch (error) {
      setError(error.message);
      console.error('获取聊天历史出错:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 发送消息
  const sendMessage = async (content) => {
    try {
      // 添加用户消息到界面
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setLoading(true);
      
      // 发送消息到API
      const response = await api.post('/chat/message', { message: content });
      
      if (!response.data.success) {
        throw new Error(response.data.error || '发送消息失败');
      }
      
      // 添加AI回复
      const aiMessage = {
        id: response.data.data.id,
        role: 'assistant',
        content: response.data.data.content,
        timestamp: response.data.data.timestamp,
        metadata: {
          provider: response.data.data.metadata?.provider,
          model: response.data.data.metadata?.model
        }
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      setError(error.message);
      console.error('发送消息出错:', error);
      
      // 添加错误消息
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `发送消息时出错: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // 清除聊天历史
  const clearHistory = async () => {
    try {
      setLoading(true);
      const response = await api.delete('/chat/history');
      
      if (response.data.success) {
        setMessages([{
          id: 'history-cleared',
          role: 'system',
          content: '聊天历史已清除。',
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(response.data.error || '清除聊天历史失败');
      }
    } catch (error) {
      setError(error.message);
      console.error('清除聊天历史出错:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取LLM提供商列表
  const fetchLlmProviders = async () => {
    try {
      setLlmProvidersLoading(true);
      const response = await api.get('/llm/providers');
      
      if (response.data.success) {
        setLlmProviders(response.data.data || []);
      } else {
        throw new Error(response.data.error || '获取LLM提供商列表失败');
      }
    } catch (error) {
      console.error('获取LLM提供商列表出错:', error);
    } finally {
      setLlmProvidersLoading(false);
    }
  };
  
  // 获取用户的LLM偏好设置
  const fetchLlmPreferences = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/llm/preferences');
      
      if (response.data.success) {
        setPreferredProvider(response.data.data.provider);
        setPreferredModel(response.data.data.model);
      }
    } catch (error) {
      console.error('获取LLM偏好设置出错:', error);
    }
  };
  
  // 更新用户的LLM偏好设置
  const setPreferredLLMProvider = async (provider, model, apiKey) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const data = { provider, model };
      if (apiKey) data.apiKey = apiKey;
      
      const response = await api.post('/llm/preferences', data);
      
      if (response.data.success) {
        setPreferredProvider(provider);
        setPreferredModel(model);
        
        // 添加系统消息通知设置已更新
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `system-${Date.now()}`,
            role: 'system',
            content: `AI助手设置已更新为: ${response.data.data.provider} - ${response.data.data.model}`,
            timestamp: new Date().toISOString()
          }
        ]);
        
        return true;
      } else {
        throw new Error(response.data.error || '更新LLM偏好设置失败');
      }
    } catch (error) {
      setError(error.message);
      console.error('更新LLM偏好设置出错:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Send message with streaming response
   * @param {string} content - Message content
   */
  const sendStreamingMessage = async (content) => {
    try {
      // Add user message to UI
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      // Add placeholder for assistant response
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        streamContent: '',
        streamComplete: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage, assistantMessage]);
      setIsStreaming(true);
      setStreamingMessageId(assistantMessageId);
      setLoading(true);
      
      // First make the POST request to trigger streaming
      await api.post('/llm/stream', {
        message: content
      });
      
      // Then set up SSE connection for receiving the stream
      // EventSource doesn't support headers in the constructor, so use URL params for authentication
      const token = localStorage.getItem('token');
      const eventSource = new EventSource(`${api.defaults.baseURL}/llm/stream-events?token=${token}`);
      
      // Handle incoming message chunks
      let accumulatedContent = '';
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            // Handle error in the stream
            setError(data.error);
            eventSource.close();
            setIsStreaming(false);
            setLoading(false);
            return;
          }
          
          if (data.done) {
            // Stream is complete
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: accumulatedContent,
                      streamComplete: true,
                      metadata: data.metadata
                    }
                  : msg
              )
            );
            
            eventSource.close();
            setIsStreaming(false);
            setLoading(false);
            setStreamingMessageId(null);
            return;
          }
          
          if (data.chunk) {
            // Received a chunk of the response
            accumulatedContent += data.chunk;
            
            // Update the streaming message
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      streamContent: accumulatedContent
                    }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error('Error processing stream data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsStreaming(false);
        setLoading(false);
        
        // Add error message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: `error-${Date.now()}`,
            role: 'system',
            content: `Error during streaming: Connection lost`,
            timestamp: new Date().toISOString(),
            isError: true
          }
        ]);
      };
      
    } catch (error) {
      setError(error.message);
      console.error('Error sending streaming message:', error);
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `Error sending message: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
      
      setIsStreaming(false);
      setLoading(false);
    }
  };
  
  /**
   * Handle stream completion
   * @param {string} messageId - ID of the completed message
   */
  const handleStreamComplete = (messageId) => {
    if (messageId === streamingMessageId) {
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  };
  
  // 暴露的值
  const contextValue = {
    messages,
    loading,
    error,
    sendMessage,
    sendStreamingMessage,
    clearHistory,
    llmProviders,
    llmProvidersLoading,
    fetchLlmProviders,
    preferredProvider,
    preferredModel,
    setPreferredLLMProvider,
    isStreaming,
    streamingMessageId,
    handleStreamComplete
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);

export default ChatContext; 