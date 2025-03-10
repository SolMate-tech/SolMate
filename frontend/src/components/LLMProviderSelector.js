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
  
  // 加载LLM提供商列表（如果尚未加载）
  useEffect(() => {
    if (llmProviders.length === 0 && !llmProvidersLoading) {
      fetchLlmProviders();
    }
  }, [llmProviders, llmProvidersLoading, fetchLlmProviders]);
  
  // 设置初始值
  useEffect(() => {
    if (preferredProvider) {
      setSelectedProvider(preferredProvider);
    }
    if (preferredModel) {
      setSelectedModel(preferredModel);
    }
  }, [preferredProvider, preferredModel]);
  
  // 当选择的提供商变化时，更新可用的模型列表
  useEffect(() => {
    if (selectedProvider && llmProviders.length > 0) {
      const provider = llmProviders.find(p => p.id === selectedProvider);
      if (provider && provider.models) {
        setAvailableModels(provider.models);
        
        // 如果当前选择的模型不在新提供商的模型列表中，则选择第一个可用的模型
        if (provider.models.length > 0 && !provider.models.includes(selectedModel)) {
          setSelectedModel(provider.models[0]);
        }
      }
    }
  }, [selectedProvider, llmProviders, selectedModel]);
  
  // 处理提供商变化
  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
  };
  
  // 处理模型变化
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };
  
  // 处理API密钥变化
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };
  
  // 应用变更
  const handleApply = async () => {
    if (!selectedProvider || !selectedModel) {
      setMessage('请选择提供商和模型');
      return;
    }
    
    setUpdating(true);
    setMessage('');
    
    try {
      const success = await setPreferredLLMProvider(selectedProvider, selectedModel, apiKey);
      
      if (success) {
        setMessage('设置已更新');
        setApiKey(''); // 清除输入框中的API密钥
        setApiKeyVisible(false);
      } else {
        setMessage('更新设置失败');
      }
    } catch (error) {
      setMessage(`错误: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };
  
  // 切换API密钥可见性
  const toggleApiKeyVisibility = () => {
    setApiKeyVisible(!apiKeyVisible);
  };
  
  return (
    <div className="llm-provider-selector">
      <h3>选择AI模型</h3>
      
      <div className="form-group">
        <label htmlFor="provider-select">提供商:</label>
        <select
          id="provider-select"
          value={selectedProvider}
          onChange={handleProviderChange}
          disabled={llmProvidersLoading || updating}
        >
          <option value="">-- 选择提供商 --</option>
          {llmProviders.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="model-select">模型:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={handleModelChange}
          disabled={!selectedProvider || llmProvidersLoading || updating}
        >
          <option value="">-- 选择模型 --</option>
          {availableModels.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group api-key-input">
        <label htmlFor="api-key-input">API密钥 (可选):</label>
        <div className="api-key-container">
          <input
            id="api-key-input"
            type={apiKeyVisible ? "text" : "password"}
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="输入您的API密钥（如需自定义）"
            disabled={updating}
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={toggleApiKeyVisibility}
          >
            {apiKeyVisible ? "隐藏" : "显示"}
          </button>
        </div>
        <p className="help-text">
          如果您不提供API密钥，将使用系统默认密钥。
        </p>
      </div>
      
      <div className="current-settings">
        <h4>当前设置</h4>
        <p>
          提供商: <strong>{preferredProvider ? llmProviders.find(p => p.id === preferredProvider)?.name || preferredProvider : '默认'}</strong>
        </p>
        <p>
          模型: <strong>{preferredModel || '默认'}</strong>
        </p>
      </div>
      
      <div className="actions">
        <button
          className="apply-button"
          onClick={handleApply}
          disabled={updating || llmProvidersLoading}
        >
          {updating ? '正在更新...' : '应用设置'}
        </button>
      </div>
      
      {message && (
        <div className={`message ${message.includes('错误') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      {llmProvidersLoading && <div className="loading">正在加载提供商...</div>}
    </div>
  );
};

export default LLMProviderSelector; 