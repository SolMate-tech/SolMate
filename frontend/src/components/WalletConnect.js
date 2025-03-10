import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletConnect = () => {
  const { wallet, publicKey, connected } = useWallet();

  return (
    <div className="wallet-connect-container">
      <div className="wallet-button">
        <WalletMultiButton />
      </div>
      {connected && (
        <div className="wallet-info">
          <p>Connected to: {wallet?.adapter.name}</p>
          <p>Address: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 