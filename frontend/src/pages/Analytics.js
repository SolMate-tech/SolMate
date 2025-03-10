import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { useWalletContext } from '../contexts/WalletContext';

const Analytics = () => {
  const { connected } = useWallet();
  const { isAuthenticated } = useWalletContext();
  const { 
    tokenAnalysis, 
    trendingTokens, 
    isLoading, 
    error, 
    analyzeToken, 
    getTrendingTokens,
    clearAnalysis
  } = useAnalyticsContext();
  
  const [tokenAddress, setTokenAddress] = useState('');

  // Load trending tokens on component mount
  useEffect(() => {
    if (connected) {
      getTrendingTokens();
    }
  }, [connected, getTrendingTokens]);

  const handleAnalyzeToken = (e) => {
    e.preventDefault();
    
    if (!tokenAddress.trim()) return;
    
    analyzeToken(tokenAddress);
  };

  const handleClearAnalysis = () => {
    clearAnalysis();
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Please connect your Solana wallet to access the token analytics.
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
        <h1 className="text-3xl font-bold mb-4">Token Analytics</h1>
        <p className="text-gray-300">
          Analyze any Solana token for risk assessment, market metrics, and predictive signals.
        </p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <form onSubmit={handleAnalyzeToken} className="flex gap-4">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter token address or name"
            className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg px-6 py-2 font-medium"
            disabled={isLoading || !tokenAddress.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-600 text-white rounded-lg p-4 mb-8">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p>Analyzing token data and calculating risk metrics...</p>
        </div>
      )}
      
      {tokenAnalysis && !isLoading && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{tokenAnalysis.name} ({tokenAnalysis.symbol})</h2>
              <p className="text-gray-400 text-sm">{tokenAnalysis.address}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-2xl font-bold">${tokenAnalysis.price.usd.toFixed(6)}</div>
                <div className={`${tokenAnalysis.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tokenAnalysis.change24h >= 0 ? '+' : ''}{tokenAnalysis.change24h.toFixed(2)}% (24h)
                </div>
              </div>
              <button
                onClick={handleClearAnalysis}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Risk Score</h3>
              <div className="flex items-center">
                <div className="text-xl font-bold">{tokenAnalysis.riskScore}/100</div>
                <div className="ml-2 px-2 py-1 text-xs rounded bg-yellow-600 text-white">{tokenAnalysis.riskLevel} Risk</div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Market Cap</h3>
              <div className="text-xl font-bold">${tokenAnalysis.marketCap.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">24h Volume</h3>
              <div className="text-xl font-bold">${tokenAnalysis.volume24h.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Liquidity</h3>
              <div className="text-xl font-bold">{tokenAnalysis.metrics.liquidity}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Holder Concentration</h3>
              <div className="text-xl font-bold">{tokenAnalysis.metrics.holderConcentration}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Audit Status</h3>
              <div className="text-xl font-bold">{tokenAnalysis.metrics.auditStatus}</div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">AI Analysis Summary</h3>
            <p className="mb-4">{tokenAnalysis.analysis.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {tokenAnalysis.analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-red-400 font-medium mb-2">Weaknesses</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {tokenAnalysis.analysis.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 mr-2">
              Download Report
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">
              Share Analysis
            </button>
          </div>
        </div>
      )}
      
      {!tokenAnalysis && !isLoading && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Trending Tokens</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Token</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">24h Change</th>
                  <th className="pb-2">24h Volume</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {trendingTokens.map((token) => (
                  <tr key={token.address} className="hover:bg-gray-700">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="ml-2">
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-400">{token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">${token.price.toFixed(token.price < 0.01 ? 8 : 2)}</td>
                    <td className={`py-3 ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </td>
                    <td className="py-3">${token.volume24h.toLocaleString()}</td>
                    <td className="py-3">
                      <button
                        onClick={() => {
                          setTokenAddress(token.address);
                          analyzeToken(token.address);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 text-sm"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 