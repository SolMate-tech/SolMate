const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * SolanaService provides methods for interacting with the Solana blockchain
 */
class SolanaService {
  constructor() {
    // Initialize connection to Solana network
    this.connectionUrl = config.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
    this.connection = new Connection(this.connectionUrl, 'confirmed');
    logger.info(`Solana connection initialized to ${this.connectionUrl}`);
  }

  /**
   * Get account information for a Solana address
   * @param {string} address - Solana account address
   * @returns {Promise<Object>} Account information
   */
  async getAccountInfo(address) {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo;
    } catch (error) {
      logger.error(`Error fetching account info for ${address}: ${error.message}`);
      throw new Error(`Failed to fetch account info: ${error.message}`);
    }
  }

  /**
   * Get SOL balance for a Solana address
   * @param {string} address - Solana account address
   * @returns {Promise<number>} Balance in SOL
   */
  async getSolBalance(address) {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 10**9; // Convert lamports to SOL
    } catch (error) {
      logger.error(`Error fetching SOL balance for ${address}: ${error.message}`);
      throw new Error(`Failed to fetch SOL balance: ${error.message}`);
    }
  }

  /**
   * Get token accounts for a Solana address
   * @param {string} ownerAddress - Solana account address
   * @returns {Promise<Array>} Array of token accounts
   */
  async getTokenAccounts(ownerAddress) {
    try {
      const publicKey = new PublicKey(ownerAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      
      return tokenAccounts.value.map(account => {
        const accountData = account.account.data.parsed.info;
        return {
          mint: accountData.mint,
          owner: accountData.owner,
          tokenAmount: accountData.tokenAmount,
          decimals: accountData.tokenAmount.decimals,
          uiAmount: accountData.tokenAmount.uiAmount
        };
      });
    } catch (error) {
      logger.error(`Error fetching token accounts for ${ownerAddress}: ${error.message}`);
      throw new Error(`Failed to fetch token accounts: ${error.message}`);
    }
  }

  /**
   * Get recent transactions for a Solana address
   * @param {string} address - Solana account address
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} Array of transactions
   */
  async getRecentTransactions(address, limit = 10) {
    try {
      const publicKey = new PublicKey(address);
      const transactions = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );
      
      return transactions.map(tx => ({
        signature: tx.signature,
        slot: tx.slot,
        confirmationStatus: tx.confirmationStatus,
        blockTime: tx.blockTime,
        err: tx.err
      }));
    } catch (error) {
      logger.error(`Error fetching transactions for ${address}: ${error.message}`);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get transaction details
   * @param {string} signature - Transaction signature
   * @returns {Promise<Object>} Transaction details
   */
  async getTransaction(signature) {
    try {
      const transaction = await this.connection.getParsedTransaction(
        signature,
        'confirmed'
      );
      return transaction;
    } catch (error) {
      logger.error(`Error fetching transaction ${signature}: ${error.message}`);
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
  }

  /**
   * Get token information
   * @param {string} mint - Token mint address
   * @returns {Promise<Object>} Token information
   */
  async getTokenInfo(mint) {
    try {
      const publicKey = new PublicKey(mint);
      const tokenInfo = await this.connection.getParsedAccountInfo(publicKey);
      
      if (!tokenInfo.value || !tokenInfo.value.data) {
        throw new Error('Token not found');
      }
      
      return tokenInfo.value;
    } catch (error) {
      logger.error(`Error fetching token info for ${mint}: ${error.message}`);
      throw new Error(`Failed to fetch token info: ${error.message}`);
    }
  }
}

// Create singleton instance
const solanaService = new SolanaService();

module.exports = solanaService; 