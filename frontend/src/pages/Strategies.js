import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useStrategiesContext } from '../contexts/StrategiesContext';
import { useWalletContext } from '../contexts/WalletContext';

const Strategies = () => {
  const { connected } = useWallet();
  const { isAuthenticated } = useWalletContext();
  const { 
    strategies, 
    currentStrategy, 
    isLoading, 
    error, 
    createStrategy, 
    clearCurrentStrategy 
  } = useStrategiesContext();
  
  const [strategyInput, setStrategyInput] = useState('');

  const handleCreateStrategy = (e) => {
    e.preventDefault();
    
    if (!strategyInput.trim()) return;
    
    createStrategy(strategyInput);
  };

  const handleClearStrategy = () => {
    clearCurrentStrategy();
    setStrategyInput('');
  };

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Please connect your Solana wallet to access the strategy builder.
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
        <h1 className="text-3xl font-bold mb-4">Strategy Builder</h1>
        <p className="text-gray-300">
          Create and manage trading strategies through natural conversation.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-600 text-white rounded-lg p-4 mb-8">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Strategy</h2>
            <p className="text-gray-300 mb-4">
              Describe your strategy in plain language, and our AI will convert it into executable trading rules.
            </p>
            
            <form onSubmit={handleCreateStrategy}>
              <textarea
                value={strategyInput}
                onChange={(e) => setStrategyInput(e.target.value)}
                placeholder="Example: I want to buy when the price drops 5% from ATH and then sell half when it rebounds 10% and the rest when it reaches 20% profit. Use a 7% stop loss."
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] mb-4"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg px-6 py-2 font-medium"
                disabled={isLoading || !strategyInput.trim()}
              >
                {isLoading ? 'Processing...' : 'Create Strategy'}
              </button>
            </form>
          </div>
          
          {isLoading && (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p>Analyzing strategy parameters and running backtests...</p>
            </div>
          )}
          
          {currentStrategy && !isLoading && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{currentStrategy.name}</h2>
                  <p className="text-gray-400 text-sm">Created: {new Date(currentStrategy.created).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 rounded-full bg-green-600 text-white text-sm">
                    {currentStrategy.status}
                  </div>
                  <button
                    onClick={handleClearStrategy}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Strategy Description</h3>
                <p className="text-gray-300">{currentStrategy.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Parameters</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <ul className="divide-y divide-gray-600">
                    {currentStrategy.parameters.map((param, index) => (
                      <li key={index} className="py-2 flex justify-between">
                        <span className="text-gray-300">{param.name}</span>
                        <span className="font-medium">{param.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Backtest Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Period</div>
                    <div className="font-semibold">{currentStrategy.backtest.period}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Profit</div>
                    <div className="font-semibold text-green-500">{currentStrategy.backtest.profit}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Max Drawdown</div>
                    <div className="font-semibold text-red-500">{currentStrategy.backtest.drawdown}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Win Rate</div>
                    <div className="font-semibold">{currentStrategy.backtest.winRate}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2">
                  Deploy Strategy
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2">
                  Edit Parameters
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Strategies</h2>
            
            {strategies.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                You haven't created any strategies yet. Create your first strategy to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {strategies.map((strat) => (
                  <div key={strat.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{strat.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        strat.status === 'Active' ? 'bg-green-600' : 
                        strat.status === 'Paused' ? 'bg-yellow-600' : 'bg-gray-600'
                      } text-white`}>
                        {strat.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{strat.description}</p>
                    {strat.performance && (
                      <div className="text-sm mb-3">
                        <span className="text-gray-400">Performance: </span>
                        <span className={strat.performance.profit.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                          {strat.performance.profit}
                        </span>
                        <span className="text-gray-400"> ({strat.performance.timeframe})</span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button className="text-purple-400 hover:text-purple-300 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {strategies.length > 0 && (
              <div className="mt-4 text-center">
                <button className="text-purple-400 hover:text-purple-300 text-sm">
                  View All Strategies
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strategies; 