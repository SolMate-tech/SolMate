import React, { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import LLMProviderSelector from '../components/LLMProviderSelector';
import ModelComparisonTool from '../components/ModelComparisonTool';

const Settings = () => {
  const { isAuthenticated, user, logout } = useWalletContext();
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!isAuthenticated) {
    return (
      <div className="settings-page not-authenticated">
        <div className="auth-message">
          <h1>Settings</h1>
          <p>Please connect your wallet to access settings.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      
      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            className={`tab-button ${activeTab === 'ai-models' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-models')}
          >
            AI Models
          </button>
          <button
            className={`tab-button ${activeTab === 'model-comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('model-comparison')}
          >
            Model Comparison
          </button>
          <button
            className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              
              <div className="profile-info">
                <p>
                  <strong>Username:</strong> {user?.username || 'Not set'}
                </p>
                <p>
                  <strong>Wallet Address:</strong> {user?.publicKey}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email || 'Not set'}
                </p>
                <p>
                  <strong>Member Since:</strong> {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <button onClick={logout} className="logout-button">
                Disconnect Wallet
              </button>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Preferences</h2>
              
              <div className="form-group">
                <label htmlFor="theme-select">Theme:</label>
                <select
                  id="theme-select"
                  value={user?.preferences?.theme || 'dark'}
                  disabled
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="currency-select">Currency:</label>
                <select
                  id="currency-select"
                  value={user?.preferences?.currency || 'USD'}
                  disabled
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="risk-tolerance-select">Risk Tolerance:</label>
                <select
                  id="risk-tolerance-select"
                  value={user?.preferences?.riskTolerance || 'medium'}
                  disabled
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <p className="settings-note">
                Note: Preference settings are coming soon.
              </p>
            </div>
          )}
          
          {activeTab === 'ai-models' && (
            <div className="settings-section">
              <h2>AI Model Settings</h2>
              <LLMProviderSelector />
            </div>
          )}
          
          {activeTab === 'model-comparison' && (
            <div className="settings-section">
              <h2>Model Comparison Tool</h2>
              <p className="settings-description">
                Compare different AI models side-by-side to find which one works best for your use case.
              </p>
              <ModelComparisonTool />
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              
              <div className="form-group checkbox-group">
                <label htmlFor="share-analytics-checkbox">
                  <input
                    type="checkbox"
                    id="share-analytics-checkbox"
                    checked={user?.privacy?.shareAnalytics}
                    disabled
                  />
                  Share anonymous usage analytics
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label htmlFor="store-history-checkbox">
                  <input
                    type="checkbox"
                    id="store-history-checkbox"
                    checked={user?.privacy?.storeHistory}
                    disabled
                  />
                  Store chat history
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label htmlFor="local-execution-checkbox">
                  <input
                    type="checkbox"
                    id="local-execution-checkbox"
                    checked={user?.privacy?.localExecution}
                    disabled
                  />
                  Use local execution when possible
                </label>
              </div>
              
              <p className="settings-note">
                Note: Privacy settings are coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 