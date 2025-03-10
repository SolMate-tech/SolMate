const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const cacheService = require('./cacheService');

/**
 * LLMService provides a unified interface for interacting with various LLM providers
 */
class LLMService {
  constructor() {
    // Initialize available LLM providers
    this.providers = {
      OPENAI: 'openai',
      DEEPSEEK: 'deepseek',
      ANTHROPIC: 'anthropic',
      LLAMA: 'llama',
      MISTRAL: 'mistral'
    };
    
    // Set default provider from config or fallback to OpenAI
    this.defaultProvider = config.DEFAULT_LLM_PROVIDER || this.providers.OPENAI;
    
    // Initialize API keys from environment variables
    this.apiKeys = {
      [this.providers.OPENAI]: config.OPENAI_API_KEY,
      [this.providers.DEEPSEEK]: config.DEEPSEEK_API_KEY,
      [this.providers.ANTHROPIC]: config.ANTHROPIC_API_KEY,
      [this.providers.LLAMA]: config.LLAMA_API_KEY,
      [this.providers.MISTRAL]: config.MISTRAL_API_KEY
    };
    
    // Initialize API endpoints
    this.apiEndpoints = {
      [this.providers.OPENAI]: 'https://api.openai.com/v1/chat/completions',
      [this.providers.DEEPSEEK]: 'https://api.deepseek.com/v1/chat/completions',
      [this.providers.ANTHROPIC]: 'https://api.anthropic.com/v1/messages',
      [this.providers.LLAMA]: config.LLAMA_API_ENDPOINT || 'http://localhost:8000/v1/chat/completions',
      [this.providers.MISTRAL]: 'https://api.mistral.ai/v1/chat/completions'
    };
    
    // Map provider to model names
    this.defaultModels = {
      [this.providers.OPENAI]: 'gpt-4',
      [this.providers.DEEPSEEK]: 'deepseek-chat',
      [this.providers.ANTHROPIC]: 'claude-3-opus-20240229',
      [this.providers.LLAMA]: 'llama-3-70b-chat',
      [this.providers.MISTRAL]: 'mistral-large-latest'
    };
    
    // Available models for each provider
    this.availableModels = {
      [this.providers.OPENAI]: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
      [this.providers.DEEPSEEK]: ['deepseek-chat', 'deepseek-coder'],
      [this.providers.ANTHROPIC]: ['claude-2', 'claude-instant-1', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      [this.providers.LLAMA]: ['llama-3-8b-chat', 'llama-3-70b-chat'],
      [this.providers.MISTRAL]: ['mistral-small', 'mistral-medium', 'mistral-large-latest']
    };
    
    // Performance metrics for monitoring
    this.metrics = {
      totalCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      averageResponseTime: 0,
      totalResponseTime: 0
    };
    
    logger.info('LLM service initialized');
  }

  /**
   * Generate a response using the specified LLM provider
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options like temperature, max_tokens, etc.
   * @param {string} provider - LLM provider to use (defaults to configured default)
   * @returns {Promise<Object>} LLM response
   */
  async generateResponse(messages, options = {}, provider = null) {
    try {
      this.metrics.totalCalls++;
      const startTime = Date.now();
      
      // Determine which provider to use
      const selectedProvider = provider || this.defaultProvider;
      
      // Check if provider is supported
      if (!Object.values(this.providers).includes(selectedProvider)) {
        throw new Error(`Unsupported LLM provider: ${selectedProvider}`);
      }
      
      // Check if API key is available
      const apiKey = options.apiKey || this.apiKeys[selectedProvider];
      if (!apiKey) {
        throw new Error(`API key not configured for provider: ${selectedProvider}`);
      }
      
      // Determine model to use
      const model = options.model || this.defaultModels[selectedProvider];
      
      // Check if caching is enabled and the request is cacheable
      const shouldCache = config.cache?.enabled && 
                         !options.disableCache && 
                         messages.length === 1 && 
                         messages[0].role === 'user';
      
      // Generate cache key if caching is enabled
      let cacheKey = null;
      if (shouldCache) {
        cacheKey = cacheService.generateKey(
          messages[0].content, 
          selectedProvider, 
          model, 
          {
            temperature: options.temperature,
            maxTokens: options.max_tokens,
            topP: options.top_p
          }
        );
        
        // Check cache first
        const cachedResponse = cacheService.get(cacheKey);
        if (cachedResponse) {
          this.metrics.cacheHits++;
          logger.debug(`Cache hit for provider: ${selectedProvider}, model: ${model}`);
          
          // Update performance metrics
          const responseTime = Date.now() - startTime;
          this.updatePerformanceMetrics(responseTime);
          
          return cachedResponse;
        }
        
        this.metrics.cacheMisses++;
        logger.debug(`Cache miss for provider: ${selectedProvider}, model: ${model}`);
      }
      
      logger.info(`Generating response using ${selectedProvider} provider, model: ${model}`);
      
      // Generate response using the appropriate provider
      let response;
      switch (selectedProvider) {
        case this.providers.OPENAI:
          response = await this.generateOpenAIResponse(messages, { ...options, model, apiKey });
          break;
        case this.providers.DEEPSEEK:
          response = await this.generateDeepSeekResponse(messages, { ...options, model, apiKey });
          break;
        case this.providers.ANTHROPIC:
          response = await this.generateAnthropicResponse(messages, { ...options, model, apiKey });
          break;
        case this.providers.LLAMA:
          response = await this.generateLlamaResponse(messages, { ...options, model, apiKey });
          break;
        case this.providers.MISTRAL:
          response = await this.generateMistralResponse(messages, { ...options, model, apiKey });
          break;
        default:
          throw new Error(`Provider implementation not found: ${selectedProvider}`);
      }
      
      // Cache the response if caching is enabled
      if (shouldCache && cacheKey && response) {
        cacheService.set(cacheKey, response);
      }
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime);
      
      return response;
    } catch (error) {
      this.metrics.errors++;
      logger.error(`Error generating LLM response: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update performance metrics
   * @param {number} responseTime - Response time in milliseconds
   */
  updatePerformanceMetrics(responseTime) {
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / 
      (this.metrics.totalCalls - this.metrics.errors);
  }
  
  /**
   * Get performance metrics
   * @returns {Object} - Current performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheStats: cacheService.getStats()
    };
  }

  /**
   * Generate a response using OpenAI API
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options like temperature, max_tokens, etc.
   * @returns {Promise<Object>} OpenAI response
   */
  async generateOpenAIResponse(messages, options = {}) {
    try {
      // Set default model if not provided
      const model = options.model || this.defaultModels[this.providers.OPENAI];
      
      // Prepare the request payload
      const payload = {
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
        frequency_penalty: options.frequency_penalty || 0,
        presence_penalty: options.presence_penalty || 0,
      };
      
      // Make the API request
      const response = await axios.post(
        this.apiEndpoints[this.providers.OPENAI],
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKeys[this.providers.OPENAI]}`
          }
        }
      );
      
      // Extract and return the generated text
      const result = {
        provider: this.providers.OPENAI,
        model: model,
        content: response.data.choices[0].message.content,
        raw: response.data
      };
      
      return result;
    } catch (error) {
      logger.error(`OpenAI API error: ${error.message}`);
      if (error.response) {
        logger.error(`OpenAI API status: ${error.response.status}`);
        logger.error(`OpenAI API data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Generate a response using DeepSeek API
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options like temperature, max_tokens, etc.
   * @returns {Promise<Object>} DeepSeek response
   */
  async generateDeepSeekResponse(messages, options = {}) {
    try {
      // Set default model if not provided
      const model = options.model || this.defaultModels[this.providers.DEEPSEEK];
      
      // Prepare the request payload
      const payload = {
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
      };
      
      // Make the API request
      const response = await axios.post(
        this.apiEndpoints[this.providers.DEEPSEEK],
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKeys[this.providers.DEEPSEEK]}`
          }
        }
      );
      
      // Extract and return the generated text
      const result = {
        provider: this.providers.DEEPSEEK,
        model: model,
        content: response.data.choices[0].message.content,
        raw: response.data
      };
      
      return result;
    } catch (error) {
      logger.error(`DeepSeek API error: ${error.message}`);
      if (error.response) {
        logger.error(`DeepSeek API status: ${error.response.status}`);
        logger.error(`DeepSeek API data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }

  /**
   * Generate a response using Anthropic API
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options like temperature, max_tokens, etc.
   * @returns {Promise<Object>} Anthropic response
   */
  async generateAnthropicResponse(messages, options = {}) {
    try {
      // Set default model if not provided
      const model = options.model || this.defaultModels[this.providers.ANTHROPIC];
      
      // Convert messages to Anthropic format
      const convertedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : 'system',
        content: msg.content
      }));
      
      // Prepare the request payload
      const payload = {
        model,
        messages: convertedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
      };
      
      // Make the API request
      const response = await axios.post(
        this.apiEndpoints[this.providers.ANTHROPIC],
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKeys[this.providers.ANTHROPIC],
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      // Extract and return the generated text
      const result = {
        provider: this.providers.ANTHROPIC,
        model: model,
        content: response.data.content[0].text,
        raw: response.data
      };
      
      return result;
    } catch (error) {
      logger.error(`Anthropic API error: ${error.message}`);
      if (error.response) {
        logger.error(`Anthropic API status: ${error.response.status}`);
        logger.error(`Anthropic API data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Generate a response using Llama API
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options like temperature, max_tokens, etc.
   * @returns {Promise<Object>} Llama response
   */
  async generateLlamaResponse(messages, options = {}) {
    try {
      // Set default model if not provided
      const model = options.model || this.defaultModels[this.providers.LLAMA];
      
      // Prepare the request payload
      const payload = {
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
      };
      
      // Make the API request
      const response = await axios.post(
        this.apiEndpoints[this.providers.LLAMA],
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKeys[this.providers.LLAMA]}`
          }
        }
      );
      
      // Extract and return the generated text
      const result = {
        provider: this.providers.LLAMA,
        model: model,
        content: response.data.choices[0].message.content,
        raw: response.data
      };
      
      return result;
    } catch (error) {
      logger.error(`Llama API error: ${error.message}`);
      if (error.response) {
        logger.error(`Llama API status: ${error.response.status}`);
        logger.error(`Llama API data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Llama API error: ${error.message}`);
    }
  }

  /**
   * Generate a response using Mistral API
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options like temperature, max_tokens, etc.
   * @returns {Promise<Object>} Mistral response
   */
  async generateMistralResponse(messages, options = {}) {
    try {
      // Set default model if not provided
      const model = options.model || this.defaultModels[this.providers.MISTRAL];
      
      // Prepare the request payload
      const payload = {
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
      };
      
      // Make the API request
      const response = await axios.post(
        this.apiEndpoints[this.providers.MISTRAL],
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKeys[this.providers.MISTRAL]}`
          }
        }
      );
      
      // Extract and return the generated text
      const result = {
        provider: this.providers.MISTRAL,
        model: model,
        content: response.data.choices[0].message.content,
        raw: response.data
      };
      
      return result;
    } catch (error) {
      logger.error(`Mistral API error: ${error.message}`);
      if (error.response) {
        logger.error(`Mistral API status: ${error.response.status}`);
        logger.error(`Mistral API data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Mistral API error: ${error.message}`);
    }
  }

  /**
   * Get available LLM providers
   * @returns {Array} Array of available provider objects
   */
  getAvailableProviders() {
    // Return only providers that have API keys configured
    const providers = Object.values(this.providers)
      .filter(provider => this.apiKeys[provider])
      .map(id => {
        return {
          id,
          name: this.formatProviderName(id),
          hasApiKey: !!this.apiKeys[id],
          defaultModel: this.defaultModels[id]
        };
      });
    
    return providers;
  }
  
  /**
   * Format provider ID into a readable name
   * @param {string} providerId - Provider ID
   * @returns {string} Formatted provider name
   */
  formatProviderName(providerId) {
    switch (providerId) {
      case this.providers.OPENAI:
        return 'OpenAI';
      case this.providers.DEEPSEEK:
        return 'DeepSeek';
      case this.providers.ANTHROPIC:
        return 'Anthropic';
      case this.providers.LLAMA:
        return 'Llama';
      case this.providers.MISTRAL:
        return 'Mistral';
      default:
        return providerId.charAt(0).toUpperCase() + providerId.slice(1);
    }
  }

  /**
   * Get available models for a provider
   * @param {string} provider - Provider ID
   * @returns {Array} Array of model names
   */
  getAvailableModels(provider) {
    if (!provider || !this.availableModels[provider]) {
      return [];
    }
    
    return this.availableModels[provider];
  }

  /**
   * Generate a streaming response from an LLM provider
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options (model, apiKey, etc.)
   * @param {string} provider - LLM provider to use
   * @param {Function} onChunk - Callback for each chunk of the response
   * @param {Function} onComplete - Callback for when the response is complete
   * @param {Function} onError - Callback for when an error occurs
   */
  async generateStreamingResponse(messages, options = {}, provider = null, onChunk, onComplete, onError) {
    if (!onChunk || typeof onChunk !== 'function') {
      throw new Error('onChunk callback is required and must be a function');
    }
    
    if (!onComplete || typeof onComplete !== 'function') {
      throw new Error('onComplete callback is required and must be a function');
    }
    
    if (!onError || typeof onError !== 'function') {
      throw new Error('onError callback is required and must be a function');
    }
    
    try {
      this.metrics.totalCalls++;
      const startTime = Date.now();
      
      // Determine which provider to use
      const selectedProvider = provider || this.defaultProvider;
      
      // Check if provider is supported
      if (!Object.values(this.providers).includes(selectedProvider)) {
        throw new Error(`Unsupported LLM provider: ${selectedProvider}`);
      }
      
      // Check if API key is available
      const apiKey = options.apiKey || this.apiKeys[selectedProvider];
      if (!apiKey) {
        throw new Error(`API key not configured for provider: ${selectedProvider}`);
      }
      
      // Determine model to use
      const model = options.model || this.defaultModels[selectedProvider];
      
      // For streaming responses, we can't use caching
      // We don't want to cache partial responses or read from cache
      
      logger.info(`Generating streaming response using ${selectedProvider} provider, model: ${model}`);
      
      // Generate complete response content for tracking
      let fullResponse = '';
      
      // Stream response using the appropriate provider
      switch (selectedProvider) {
        case this.providers.OPENAI:
          await this.streamOpenAIResponse(messages, options, onChunk, (chunk) => {
            fullResponse += chunk;
          }, onError);
          break;
        case this.providers.ANTHROPIC:
          await this.streamAnthropicResponse(messages, options, onChunk, (chunk) => {
            fullResponse += chunk;
          }, onError);
          break;
        case this.providers.MISTRAL:
          await this.streamMistralResponse(messages, options, onChunk, (chunk) => {
            fullResponse += chunk;
          }, onError);
          break;
        // For providers that don't support streaming natively, we simulate it
        default:
          // Generate the full response first
          const response = await this.generateResponse(messages, options, selectedProvider);
          
          // Simulate streaming by breaking the response into chunks
          const words = response.split(' ');
          const chunks = [];
          const chunkSize = 5; // words per chunk
          
          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            chunks.push(chunk);
          }
          
          // Send chunks with a small delay to simulate streaming
          for (const chunk of chunks) {
            onChunk(chunk);
            fullResponse += chunk + ' ';
            // Small delay between chunks to simulate network latency
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          break;
      }
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(responseTime);
      
      // Signal completion with the full response and metadata
      onComplete(fullResponse.trim(), {
        provider: this.formatProviderName(selectedProvider),
        model
      });
      
    } catch (error) {
      this.metrics.errors++;
      logger.error(`Error generating streaming LLM response: ${error.message}`);
      onError(error);
    }
  }
  
  /**
   * Generate a streaming response from OpenAI
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Options including model and API key
   * @param {Function} onChunk - Callback for each chunk of text
   * @param {Function} onText - Callback for accumulating full text
   * @param {Function} onError - Callback for errors
   */
  async streamOpenAIResponse(messages, options = {}, onChunk, onText, onError) {
    try {
      const model = options.model || this.defaultModels[this.providers.OPENAI];
      const apiKey = options.apiKey || this.apiKeys[this.providers.OPENAI];
      
      if (!apiKey) {
        throw new Error('OpenAI API key is required');
      }
      
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      
      const requestData = {
        model: model,
        messages: messages,
        stream: true,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        top_p: options.top_p || 1
      };
      
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(this.apiEndpoints[this.providers.OPENAI], {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI API Error: ${response.statusText}`);
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;
          
          // Process each line (SSE format: "data: {...}")
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6)); // Remove "data: " prefix
              if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
                const textChunk = jsonData.choices[0].delta.content;
                onChunk(textChunk);
                onText(textChunk);
              }
            } catch (e) {
              logger.debug(`Error parsing JSON from OpenAI stream: ${e.message}`);
              // Continue processing other lines
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error in OpenAI streaming: ${error.message}`);
      onError(error);
    }
  }
  
  /**
   * Generate a streaming response from Anthropic
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Options including model and API key
   * @param {Function} onChunk - Callback for each chunk of text
   * @param {Function} onText - Callback for accumulating full text
   * @param {Function} onError - Callback for errors
   */
  async streamAnthropicResponse(messages, options = {}, onChunk, onText, onError) {
    try {
      const model = options.model || this.defaultModels[this.providers.ANTHROPIC];
      const apiKey = options.apiKey || this.apiKeys[this.providers.ANTHROPIC];
      
      if (!apiKey) {
        throw new Error('Anthropic API key is required');
      }
      
      // Convert messages format from OpenAI to Anthropic format if needed
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      };
      
      const requestData = {
        model: model,
        messages: formattedMessages,
        stream: true,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7
      };
      
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(this.apiEndpoints[this.providers.ANTHROPIC], {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Anthropic API Error: ${response.statusText}`);
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;
          
          // Process each line (SSE format: "data: {...}")
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6)); // Remove "data: " prefix
              if (jsonData.type === 'content_block_delta' && jsonData.delta?.text) {
                const textChunk = jsonData.delta.text;
                onChunk(textChunk);
                onText(textChunk);
              }
            } catch (e) {
              logger.debug(`Error parsing JSON from Anthropic stream: ${e.message}`);
              // Continue processing other lines
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error in Anthropic streaming: ${error.message}`);
      onError(error);
    }
  }
  
  /**
   * Generate a streaming response from Mistral
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Options including model and API key
   * @param {Function} onChunk - Callback for each chunk of text
   * @param {Function} onText - Callback for accumulating full text
   * @param {Function} onError - Callback for errors
   */
  async streamMistralResponse(messages, options = {}, onChunk, onText, onError) {
    try {
      const model = options.model || this.defaultModels[this.providers.MISTRAL];
      const apiKey = options.apiKey || this.apiKeys[this.providers.MISTRAL];
      
      if (!apiKey) {
        throw new Error('Mistral API key is required');
      }
      
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      
      const requestData = {
        model: model,
        messages: messages,
        stream: true,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048,
        top_p: options.top_p || 1
      };
      
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(this.apiEndpoints[this.providers.MISTRAL], {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Mistral API Error: ${response.statusText}`);
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;
          
          // Process each line (SSE format: "data: {...}")
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6)); // Remove "data: " prefix
              if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
                const textChunk = jsonData.choices[0].delta.content;
                onChunk(textChunk);
                onText(textChunk);
              }
            } catch (e) {
              logger.debug(`Error parsing JSON from Mistral stream: ${e.message}`);
              // Continue processing other lines
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error in Mistral streaming: ${error.message}`);
      onError(error);
    }
  }
}

// Create singleton instance
const llmService = new LLMService();

module.exports = llmService; 