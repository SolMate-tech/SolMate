import React, { useState, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';

const LLMProviderSelector = () => {
  const {
    llmProviders,
    llmProvidersLoading,
    fetchLlmProviders,
    preferredProvider,
    preferredModel,
    setPreferredLLMProvider
  } = useChatContext();
  
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  
  // Load LLM providers list (if not already loaded)
  useEffect(() => {
    if (llmProviders.length === 0 && !llmProvidersLoading) {
      fetchLlmProviders();
    }
  }, [llmProviders, llmProvidersLoading, fetchLlmProviders]);
  
  // Set initial values
  useEffect(() => {
    if (preferredProvider) {
      setSelectedProvider(preferredProvider);
    }
    if (preferredModel) {
      setSelectedModel(preferredModel);
    }
  }, [preferredProvider, preferredModel]);
  
  // When selected provider changes, update available models list
  useEffect(() => {
    if (selectedProvider && llmProviders.length > 0) {
      const provider = llmProviders.find(p => p.id === selectedProvider);
      if (provider && provider.models) {
        setAvailableModels(provider.models);
        
        // If current selected model is not in the new provider's models list, select the first available model
        if (provider.models.length > 0 && !provider.models.includes(selectedModel)) {
          setSelectedModel(provider.models[0]);
        }
      }
    }
  }, [selectedProvider, llmProviders, selectedModel]);
  
  // Handle provider change
  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
  };
  
  // Handle model change
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };
  
  // Handle API key change
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };
  
  // Apply changes
  const handleApply = async () => {
    if (!selectedProvider || !selectedModel) {
      setMessage('Please select a provider and model');
      return;
    }
    
    setUpdating(true);
    setMessage('');
    
    try {
      const success = await setPreferredLLMProvider(selectedProvider, selectedModel, apiKey);
      
      if (success) {
        setMessage('Settings updated');
        setApiKey(''); // Clear API key input
        setApiKeyVisible(false);
      } else {
        setMessage('Failed to update settings');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };
  
  // Toggle API key visibility
  const toggleApiKeyVisibility = () => {
    setApiKeyVisible(!apiKeyVisible);
  };
  
  return (
    <div className="llm-provider-selector">
      <h3>Select AI Model</h3>
      
      <div className="form-group">
        <label htmlFor="provider-select">Provider:</label>
        <select
          id="provider-select"
          value={selectedProvider}
          onChange={handleProviderChange}
          disabled={llmProvidersLoading || updating}
        >
          <option value="">-- Select Provider --</option>
          {llmProviders.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="model-select">Model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={handleModelChange}
          disabled={!selectedProvider || llmProvidersLoading || updating}
        >
          <option value="">-- Select Model --</option>
          {availableModels.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group api-key-input">
        <label htmlFor="api-key-input">API Key (Optional):</label>
        <div className="api-key-container">
          <input
            id="api-key-input"
            type={apiKeyVisible ? "text" : "password"}
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your API key (if customizing)"
            disabled={updating}
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={toggleApiKeyVisibility}
          >
            {apiKeyVisible ? "Hide" : "Show"}
          </button>
        </div>
        <p className="help-text">
          If you don't provide an API key, the system default will be used.
        </p>
      </div>
      
      <div className="current-settings">
        <h4>Current Settings</h4>
        <p>
          Provider: <strong>{preferredProvider ? llmProviders.find(p => p.id === preferredProvider)?.name || preferredProvider : 'Default'}</strong>
        </p>
        <p>
          Model: <strong>{preferredModel || 'Default'}</strong>
        </p>
      </div>
      
      <div className="actions">
        <button
          className="apply-button"
          onClick={handleApply}
          disabled={updating || llmProvidersLoading}
        >
          {updating ? 'Updating...' : 'Apply Settings'}
        </button>
      </div>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      {llmProvidersLoading && <div className="loading">Loading providers...</div>}
    </div>
  );
};

export default LLMProviderSelector; 