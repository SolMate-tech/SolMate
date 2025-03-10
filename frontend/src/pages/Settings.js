import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Settings = () => {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState({
    profile: {
      username: 'SolTrader',
      email: 'user@example.com',
      notifications: true,
    },
    preferences: {
      theme: 'dark',
      currency: 'USD',
      riskTolerance: 'medium',
      defaultSlippage: '1.0',
    },
    privacy: {
      shareAnalytics: true,
      storeHistory: true,
      localExecution: false,
    },
    api: {
      apiKey: 'sk-••••••••••••••••••••••••',
      rpcEndpoint: 'https://api.mainnet-beta.solana.com',
    },
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value,
      },
    });
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend/localStorage
    alert('Settings saved successfully!');
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Please connect your Solana wallet to access settings.
        </p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-gray-300">
          Customize your SolMate experience and manage your account.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
            <div className="mb-6 text-center">
              <div className="inline-block rounded-full bg-gray-700 p-8 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold">{settings.profile.username}</h3>
              <p className="text-gray-400 text-sm truncate">{publicKey?.toBase58()}</p>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'profile', name: 'Profile Settings' },
                { id: 'preferences', name: 'Preferences' },
                { id: 'privacy', name: 'Privacy & Security' },
                { id: 'api', name: 'API Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2">
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:w-3/4">
          <div className="bg-gray-800 rounded-lg p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={settings.profile.username}
                      onChange={(e) => handleSettingChange('profile', 'username', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={settings.profile.notifications}
                      onChange={(e) => handleSettingChange('profile', 'notifications', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="notifications" className="ml-2 text-gray-300">
                      Enable email notifications
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Theme</label>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Display Currency</label>
                    <select
                      value={settings.preferences.currency}
                      onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Risk Tolerance</label>
                    <select
                      value={settings.preferences.riskTolerance}
                      onChange={(e) => handleSettingChange('preferences', 'riskTolerance', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Default Slippage (%)</label>
                    <input
                      type="number"
                      value={settings.preferences.defaultSlippage}
                      onChange={(e) => handleSettingChange('preferences', 'defaultSlippage', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0.1"
                      max="5.0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Privacy & Security</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="shareAnalytics"
                      checked={settings.privacy.shareAnalytics}
                      onChange={(e) => handleSettingChange('privacy', 'shareAnalytics', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="shareAnalytics" className="ml-2 text-gray-300">
                      Share anonymous usage analytics
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="storeHistory"
                      checked={settings.privacy.storeHistory}
                      onChange={(e) => handleSettingChange('privacy', 'storeHistory', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="storeHistory" className="ml-2 text-gray-300">
                      Store conversation history
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="localExecution"
                      checked={settings.privacy.localExecution}
                      onChange={(e) => handleSettingChange('privacy', 'localExecution', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="localExecution" className="ml-2 text-gray-300">
                      Enable local execution mode (advanced)
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2">
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'api' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">API Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">API Key</label>
                    <div className="flex">
                      <input
                        type="password"
                        value={settings.api.apiKey}
                        onChange={(e) => handleSettingChange('api', 'apiKey', e.target.value)}
                        className="flex-grow bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="bg-gray-600 hover:bg-gray-500 text-white rounded-r-lg px-4">
                        Show
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Solana RPC Endpoint</label>
                    <input
                      type="text"
                      value={settings.api.rpcEndpoint}
                      onChange={(e) => handleSettingChange('api', 'rpcEndpoint', e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg px-6 py-2 font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 