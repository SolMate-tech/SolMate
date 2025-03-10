import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Analytics = () => {
  const { connected } = useWallet();
  const [tokenAddress, setTokenAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyzeToken = (e) => {
    e.preventDefault();
    
    if (!tokenAddress.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate token analysis (in a real app, this would be an API call)
    setTimeout(() => {
      setAnalysisResult({
        name: 'Example Token',
        symbol: 'EXT',
        address: tokenAddress,
        price: '$0.0123',
        marketCap: '$1,234,567',
        volume24h: '$345,678',
        riskScore: 72,
        liquidity: 'Medium',
        holderConcentration: 'High',
        auditStatus: 'Unaudited',
        creationDate: '2023-09-15',
        socialSentiment: 'Neutral',
        technicalSignals: 'Bullish',
        whaleActivity: 'Increasing',
      });
      
      setIsAnalyzing(false);
    }, 2000);
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
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg px-6 py-2 font-medium"
            disabled={isAnalyzing || !tokenAddress.trim()}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>
      
      {isAnalyzing && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p>Analyzing token data and calculating risk metrics...</p>
        </div>
      )}
      
      {analysisResult && !isAnalyzing && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{analysisResult.name} ({analysisResult.symbol})</h2>
              <p className="text-gray-400 text-sm">{analysisResult.address}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{analysisResult.price}</div>
              <div className="text-green-500">+5.67% (24h)</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Risk Score</h3>
              <div className="flex items-center">
                <div className="text-xl font-bold">{analysisResult.riskScore}/100</div>
                <div className="ml-2 px-2 py-1 text-xs rounded bg-yellow-600 text-white">Medium Risk</div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Market Cap</h3>
              <div className="text-xl font-bold">{analysisResult.marketCap}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">24h Volume</h3>
              <div className="text-xl font-bold">{analysisResult.volume24h}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Liquidity</h3>
              <div className="text-xl font-bold">{analysisResult.liquidity}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Holder Concentration</h3>
              <div className="text-xl font-bold">{analysisResult.holderConcentration}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-sm mb-1">Audit Status</h3>
              <div className="text-xl font-bold">{analysisResult.auditStatus}</div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">AI Analysis Summary</h3>
            <p>
              This token shows medium risk with high holder concentration. The technical signals are bullish, but the lack of audit is a concern. 
              Whale activity has been increasing over the past week, which could indicate accumulation. Social sentiment remains neutral.
            </p>
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
    </div>
  );
};

export default Analytics; 