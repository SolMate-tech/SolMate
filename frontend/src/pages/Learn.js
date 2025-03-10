import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Learn = () => {
  const { connected } = useWallet();
  const [activeCategory, setActiveCategory] = useState('basics');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'basics', name: 'Solana Basics' },
    { id: 'defi', name: 'DeFi Concepts' },
    { id: 'trading', name: 'Trading Strategies' },
    { id: 'technical', name: 'Technical Analysis' },
    { id: 'security', name: 'Security Best Practices' },
  ];

  const articles = {
    basics: [
      {
        id: 'solana-architecture',
        title: 'Understanding Solana Architecture',
        description: 'Learn about Solana\'s unique architecture and how it achieves high throughput.',
        difficulty: 'Beginner',
        duration: '10 min read',
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 'spl-tokens',
        title: 'SPL Tokens Explained',
        description: 'Everything you need to know about Solana Program Library tokens.',
        difficulty: 'Beginner',
        duration: '8 min read',
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 'solana-wallets',
        title: 'Guide to Solana Wallets',
        description: 'Compare different Solana wallet options and learn how to secure your assets.',
        difficulty: 'Beginner',
        duration: '12 min read',
        image: 'https://via.placeholder.com/150',
      },
    ],
    defi: [
      {
        id: 'liquidity-pools',
        title: 'Liquidity Pools on Solana',
        description: 'How liquidity pools work on Solana DEXes like Raydium and Orca.',
        difficulty: 'Intermediate',
        duration: '15 min read',
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 'yield-farming',
        title: 'Yield Farming Strategies',
        description: 'Maximize your returns with these Solana yield farming approaches.',
        difficulty: 'Advanced',
        duration: '20 min read',
        image: 'https://via.placeholder.com/150',
      },
    ],
    trading: [
      {
        id: 'dca-strategy',
        title: 'Dollar-Cost Averaging on Solana',
        description: 'How to implement a DCA strategy for Solana tokens.',
        difficulty: 'Beginner',
        duration: '10 min read',
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 'momentum-trading',
        title: 'Momentum Trading with On-Chain Data',
        description: 'Using Solana\'s on-chain data to identify momentum trading opportunities.',
        difficulty: 'Advanced',
        duration: '25 min read',
        image: 'https://via.placeholder.com/150',
      },
    ],
    technical: [
      {
        id: 'chart-patterns',
        title: 'Chart Patterns for Solana Tokens',
        description: 'Identifying common chart patterns in Solana token markets.',
        difficulty: 'Intermediate',
        duration: '18 min read',
        image: 'https://via.placeholder.com/150',
      },
    ],
    security: [
      {
        id: 'wallet-security',
        title: 'Securing Your Solana Wallet',
        description: 'Best practices for keeping your Solana assets safe.',
        difficulty: 'Beginner',
        duration: '15 min read',
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 'smart-contract-risks',
        title: 'Understanding Smart Contract Risks',
        description: 'How to evaluate Solana program security before investing.',
        difficulty: 'Intermediate',
        duration: '22 min read',
        image: 'https://via.placeholder.com/150',
      },
    ],
  };

  // Filter articles based on search query
  const filteredArticles = searchQuery
    ? Object.values(articles)
        .flat()
        .filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : articles[activeCategory];

  if (!connected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Please connect your Solana wallet to access the learning center.
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
        <h1 className="text-3xl font-bold mb-4">Learning Center</h1>
        <p className="text-gray-300">
          Expand your knowledge of Solana ecosystem with our educational resources.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id && !searchQuery
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Learning Path</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Solana Basics</span>
                  <span className="text-xs bg-green-600 px-2 py-1 rounded-full">Completed</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">DeFi Concepts</span>
                  <span className="text-xs bg-yellow-600 px-2 py-1 rounded-full">In Progress</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Trading Strategies</span>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">Not Started</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      article.difficulty === 'Beginner' ? 'bg-green-600' : 
                      article.difficulty === 'Intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                    } text-white`}>
                      {article.difficulty}
                    </span>
                    <span className="text-gray-400 text-xs">{article.duration}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{article.description}</p>
                  <button className="text-purple-400 hover:text-purple-300 font-medium">
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredArticles.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-300 mb-4">No articles found matching your search criteria.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-purple-400 hover:text-purple-300"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn; 