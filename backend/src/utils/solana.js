const { Connection, clusterApiUrl } = require('@solana/web3.js');
const { logger } = require('./logger');

// Cache connections to avoid creating multiple connections to the same endpoint
const connectionCache = new Map();

/**
 * Get a Solana connection instance for the specified network
 * @param {string} network - The Solana network to connect to ('mainnet-beta', 'devnet', 'testnet')
 * @param {string} customRpcUrl - Optional custom RPC URL to use instead of the default
 * @returns {Connection} A Solana connection instance
 */
const getNetworkConnection = (network = 'devnet', customRpcUrl = null) => {
  const endpoint = customRpcUrl || clusterApiUrl(network);
  
  // Check if we already have a connection for this endpoint
  if (connectionCache.has(endpoint)) {
    return connectionCache.get(endpoint);
  }
  
  // Create a new connection and cache it
  const connection = new Connection(endpoint, 'confirmed');
  connectionCache.set(endpoint, connection);
  logger.info(`Created new Solana connection to ${network}${customRpcUrl ? ' (custom RPC)' : ''}`);
  
  return connection;
};

/**
 * Converts lamports to SOL
 * @param {number|string} lamports - Amount in lamports
 * @returns {number} Amount in SOL
 */
const lamportsToSol = (lamports) => {
  return parseFloat(lamports) / 1_000_000_000;
};

/**
 * Converts SOL to lamports
 * @param {number|string} sol - Amount in SOL
 * @returns {number} Amount in lamports
 */
const solToLamports = (sol) => {
  return parseFloat(sol) * 1_000_000_000;
};

/**
 * Get token account info for a given mint address and owner address
 * @param {Connection} connection - Solana connection instance
 * @param {PublicKey} mintAddress - Token mint address
 * @param {PublicKey} ownerAddress - Token account owner address
 * @returns {Promise<Array>} Token account info
 */
const getTokenAccountsByOwner = async (connection, mintAddress, ownerAddress) => {
  try {
    const { value } = await connection.getParsedTokenAccountsByOwner(
      ownerAddress,
      { mint: mintAddress }
    );
    return value;
  } catch (error) {
    logger.error(`Error fetching token accounts: ${error.message}`);
    throw error;
  }
};

/**
 * Shorten a Solana address for display
 * @param {string} address - The address to shorten
 * @param {number} startChars - Number of characters to keep from the beginning
 * @param {number} endChars - Number of characters to keep from the end
 * @returns {string} Shortened address
 */
const shortenAddress = (address, startChars = 4, endChars = 4) => {
  if (!address) return '';
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

module.exports = {
  getNetworkConnection,
  lamportsToSol,
  solToLamports,
  getTokenAccountsByOwner,
  shortenAddress
}; 