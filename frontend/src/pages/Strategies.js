import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Strategies = () => {
  const { connected } = useWallet();
  const [strategyInput, setStrategyInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const handleCreateStrategy = (e) => {
    e.preventDefault();
    
    if (!strategyInput.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate strategy creation (in a real app, this would be an API call)
    setTimeout(() => {
      setStrategy({
        id: 'strat-' + Math.random().toString(36).substr(2, 9),
        name: 'Custom Strategy',
        description: strategyInput,
        created: new Date().toISOString(),
        backtest: {
          period: '3 months',
          profit: '+32.5%',
          drawdown: '-12.3%',
          winRate: '68%',
          sharpeRatio: '1.8',
        },
        parameters: [
          { name: 'Entry Threshold', value: '5% drop from ATH' },
          { name: 'Exit Strategy', value: 'Sell half at 10% profit, remainder at 20%' },
          { name: 'Stop Loss', value: '7% below entry' },
          { name: 'Position Size', value: '10% of portfolio' },
        ],
        status: 'Ready to deploy',
      });
      
      setIsProcessing(false);
    }, 2000);
  };

  const sampleStrategies = [
    {
      id: 'strat-1',
      name: 'DCA Weekly',
      description: 'Automatically purchase $100 of SOL every week regardless of price',
      status: 'Active',
    },
    {
      id: 'strat-2',
      name: 'Volatility Responsive',
      description: 'Buy more when volatility is low, sell when volatility spikes',
      status: 'Paused',
    },
    {
      id: 'strat-3',
      name: 'Whale Tracker',
      description: 'Follow large wallet movements and mirror their trades with 24h delay',
      status: 'Draft',
    },
  ];

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
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg px-6 py-2 font-medium"
                disabled={isProcessing || !strategyInput.trim()}
              >
                {isProcessing ? 'Processing...' : 'Create Strategy'}
              </button>
            </form>
          </div>
          
          {isProcessing && (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p>Analyzing strategy parameters and running backtests...</p>
            </div>
          )}
          
          {strategy && !isProcessing && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{strategy.name}</h2>
                  <p className="text-gray-400 text-sm">Created: {new Date(strategy.created).toLocaleDateString()}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-600 text-white text-sm">
                  {strategy.status}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Strategy Description</h3>
                <p className="text-gray-300">{strategy.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Parameters</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <ul className="divide-y divide-gray-600">
                    {strategy.parameters.map((param, index) => (
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
                    <div className="font-semibold">{strategy.backtest.period}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Profit</div>
                    <div className="font-semibold text-green-500">{strategy.backtest.profit}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Max Drawdown</div>
                    <div className="font-semibold text-red-500">{strategy.backtest.drawdown}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm">Win Rate</div>
                    <div className="font-semibold">{strategy.backtest.winRate}</div>
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
            
            <div className="space-y-4">
              {sampleStrategies.map((strat) => (
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
                  <div className="flex justify-end">
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm">
                View All Strategies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strategies; 