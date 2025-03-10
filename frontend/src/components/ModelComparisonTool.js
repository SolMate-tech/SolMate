import React, { useState, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useWalletContext } from '../contexts/WalletContext';
import api from '../utils/api';

/**
 * ModelComparisonTool component allows users to compare responses from multiple LLM models
 * for the same prompt, helping to assess which model performs best for specific tasks.
 */
const ModelComparisonTool = () => {
  const { isAuthenticated } = useWalletContext();
  const { llmProviders, llmProvidersLoading, fetchLlmProviders } = useChatContext();
  
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [availableModels, setAvailableModels] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const [comparing, setComparing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Load LLM providers on mount if not already loaded
  useEffect(() => {
    if (llmProviders.length === 0 && !llmProvidersLoading) {
      fetchLlmProviders();
    }
  }, [llmProviders, llmProvidersLoading, fetchLlmProviders]);
  
  // Extract available models for each provider
  useEffect(() => {
    const modelsMap = {};
    llmProviders.forEach(provider => {
      modelsMap[provider.id] = provider.models || [];
    });
    setAvailableModels(modelsMap);
  }, [llmProviders]);
  
  /**
   * Handle prompt input changes
   */
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  
  /**
   * Toggle model selection
   */
  const toggleModelSelection = (provider, model) => {
    setSelectedModels(prevModels => {
      const modelKey = `${provider}:${model}`;
      const exists = prevModels.some(m => m.provider === provider && m.model === model);
      
      if (exists) {
        return prevModels.filter(m => !(m.provider === provider && m.model === model));
      } else {
        return [...prevModels, { provider, model }];
      }
    });
  };
  
  /**
   * Check if a model is selected
   */
  const isModelSelected = (provider, model) => {
    return selectedModels.some(m => m.provider === provider && m.model === model);
  };
  
  /**
   * Compare responses from selected models
   */
  const compareModels = async () => {
    if (!prompt.trim()) {
      setErrors({ general: 'Please enter a prompt' });
      return;
    }
    
    if (selectedModels.length === 0) {
      setErrors({ general: 'Please select at least one model' });
      return;
    }
    
    setComparing(true);
    setErrors({});
    setResults({});
    
    try {
      const response = await api.post('/llm/compare', {
        message: prompt,
        models: selectedModels
      });
      
      if (response.data.success) {
        setResults(response.data.data.results || {});
        if (response.data.data.errors) {
          setErrors(response.data.data.errors);
        }
        setShowResults(true);
      } else {
        setErrors({ general: response.data.error || 'Failed to compare models' });
      }
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.error || error.message || 'Error comparing models' 
      });
    } finally {
      setComparing(false);
    }
  };
  
  /**
   * Reset the comparison tool
   */
  const resetComparison = () => {
    setShowResults(false);
    setResults({});
    setErrors({});
  };
  
  /**
   * Format model key for display
   */
  const formatModelKey = (key) => {
    const [provider, model] = key.split('-');
    const providerName = llmProviders.find(p => p.id === provider)?.name || provider;
    return `${providerName} - ${model}`;
  };
  
  /**
   * Calculate average response time
   */
  const getAverageResponseTime = () => {
    const times = Object.values(results)
      .filter(r => r.responseTime)
      .map(r => r.responseTime);
    
    if (times.length === 0) return 0;
    return (times.reduce((acc, time) => acc + time, 0) / times.length).toFixed(0);
  };
  
  // Render model selection checkboxes
  const renderModelSelections = () => {
    return llmProviders.map(provider => (
      <div key={provider.id} className="model-provider-group">
        <h4>{provider.name}</h4>
        <div className="model-options">
          {(availableModels[provider.id] || []).map(model => (
            <label key={`${provider.id}-${model}`} className="model-option">
              <input
                type="checkbox"
                checked={isModelSelected(provider.id, model)}
                onChange={() => toggleModelSelection(provider.id, model)}
                disabled={comparing}
              />
              <span className="model-name">{model}</span>
            </label>
          ))}
        </div>
      </div>
    ));
  };
  
  // Render comparison results
  const renderResults = () => {
    if (!showResults) return null;
    
    const resultKeys = Object.keys(results);
    
    if (resultKeys.length === 0) {
      return (
        <div className="no-results">
          <p>No results returned. Please check for errors and try again.</p>
        </div>
      );
    }
    
    return (
      <div className="comparison-results">
        <div className="results-header">
          <h3>Comparison Results</h3>
          <span className="avg-time">
            Average response time: {getAverageResponseTime()}ms
          </span>
          <button 
            className="reset-button" 
            onClick={resetComparison}
          >
            New Comparison
          </button>
        </div>
        
        {resultKeys.map(key => (
          <div key={key} className="result-card">
            <div className="result-header">
              <h4>{formatModelKey(key)}</h4>
              <span className="response-time">
                {results[key].responseTime}ms
              </span>
            </div>
            <div className="result-content">
              <pre>{results[key].response}</pre>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render error messages
  const renderErrors = () => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return null;
    
    return (
      <div className="errors-container">
        {errorKeys.map(key => (
          <div key={key} className="error-message">
            {key === 'general' ? '' : `${formatModelKey(key)}: `}
            {errors[key]}
          </div>
        ))}
      </div>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <div className="model-comparison-tool not-authenticated">
        <p>Please connect your wallet to use the model comparison tool.</p>
      </div>
    );
  }
  
  return (
    <div className="model-comparison-tool">
      <h2>LLM Model Comparison Tool</h2>
      <p className="tool-description">
        Compare responses from different language models to see which performs best for your needs.
      </p>
      
      {!showResults ? (
        <div className="comparison-setup">
          <div className="prompt-section">
            <label htmlFor="comparison-prompt">Enter a prompt to compare:</label>
            <textarea
              id="comparison-prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter a prompt to test across multiple models..."
              rows={6}
              disabled={comparing}
            />
          </div>
          
          <div className="models-selection">
            <h3>Select models to compare:</h3>
            {llmProvidersLoading ? (
              <div className="loading">Loading available models...</div>
            ) : (
              renderModelSelections()
            )}
          </div>
          
          {renderErrors()}
          
          <div className="actions">
            <button
              className="compare-button"
              onClick={compareModels}
              disabled={comparing || !prompt.trim() || selectedModels.length === 0}
            >
              {comparing ? 'Comparing...' : 'Compare Models'}
            </button>
            <div className="selection-count">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
            </div>
          </div>
        </div>
      ) : (
        renderResults()
      )}
    </div>
  );
};

export default ModelComparisonTool; 