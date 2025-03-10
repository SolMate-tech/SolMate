import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import contexts
import { WalletProvider as CustomWalletProvider } from './contexts/WalletContext';
import { ChatProvider } from './contexts/ChatContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { StrategiesProvider } from './contexts/StrategiesContext';
import { RiskProvider } from './contexts/RiskContext';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';
import Strategies from './pages/Strategies';
import RiskAnalysis from './pages/RiskAnalysis';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

function App() {
  // Set up Solana network connection
  const network = process.env.REACT_APP_SOLANA_NETWORK === 'devnet' 
    ? WalletAdapterNetwork.Devnet 
    : WalletAdapterNetwork.Mainnet;
  
  const endpoint = process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(network);
  
  // Set up wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CustomWalletProvider>
            <ChatProvider>
              <AnalyticsProvider>
                <StrategiesProvider>
                  <RiskProvider>
                    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
                      <Header />
                      <main className="flex-grow container mx-auto px-4 py-8">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/strategies" element={<Strategies />} />
                          <Route path="/risk" element={<RiskAnalysis />} />
                          <Route path="/learn" element={<Learn />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </RiskProvider>
                </StrategiesProvider>
              </AnalyticsProvider>
            </ChatProvider>
          </CustomWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App; 