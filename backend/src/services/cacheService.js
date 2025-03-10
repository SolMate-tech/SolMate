const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Simple in-memory cache for LLM responses
 * Supports TTL (Time-To-Live) and max size constraints
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.keyTimestamps = new Map(); // Store insertion timestamps
    this.maxSize = config.cache.maxSize || 1000;
    this.ttl = (config.cache.ttl || 3600) * 1000; // Convert seconds to milliseconds
    this.enabled = config.cache.enabled !== false;
    
    // Periodically clean expired cache items
    this.cleanupInterval = setInterval(() => {
      this.removeExpiredItems();
    }, 60000); // Clean every minute
    
    logger.info(`Cache service initialized. Enabled: ${this.enabled}, TTL: ${this.ttl/1000}s, Max size: ${this.maxSize}`);
  }
  
  /**
   * Generate a cache key from the input parameters
   * @param {string} prompt - The user prompt
   * @param {string} provider - LLM provider id
   * @param {string} model - Model name
   * @param {Object} options - Additional options that affect the response
   * @returns {string} - A unique cache key
   */
  generateKey(prompt, provider, model, options = {}) {
    // Normalize the prompt by trimming whitespace and converting to lowercase
    const normalizedPrompt = prompt.trim().toLowerCase();
    
    // Include only options that affect the output
    const relevantOptions = {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP
    };
    
    // Create a composite key
    return `${provider}:${model}:${JSON.stringify(relevantOptions)}:${normalizedPrompt}`;
  }
  
  /**
   * Set an item in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @returns {boolean} - Success indicator
   */
  set(key, value) {
    if (!this.enabled) return false;
    
    try {
      // If cache is at capacity, remove the oldest item
      if (this.cache.size >= this.maxSize) {
        this.removeOldestItem();
      }
      
      this.cache.set(key, value);
      this.keyTimestamps.set(key, Date.now());
      return true;
    } catch (error) {
      logger.error(`Cache set error: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get an item from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    if (!this.enabled) return null;
    
    try {
      // Check if the key exists and hasn't expired
      if (this.cache.has(key)) {
        const timestamp = this.keyTimestamps.get(key);
        const now = Date.now();
        
        // Check if item has expired
        if (now - timestamp > this.ttl) {
          // Item expired, remove it
          this.cache.delete(key);
          this.keyTimestamps.delete(key);
          return null;
        }
        
        // Update the timestamp (extend TTL on access)
        this.keyTimestamps.set(key, now);
        return this.cache.get(key);
      }
      
      return null;
    } catch (error) {
      logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Remove the oldest item from the cache
   */
  removeOldestItem() {
    if (this.keyTimestamps.size === 0) return;
    
    // Find the oldest key by timestamp
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, timestamp] of this.keyTimestamps.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }
    
    // Remove the oldest item
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.keyTimestamps.delete(oldestKey);
      logger.debug(`Removed oldest cache item: ${oldestKey}`);
    }
  }
  
  /**
   * Remove all expired items from the cache
   */
  removeExpiredItems() {
    if (!this.enabled || this.keyTimestamps.size === 0) return;
    
    const now = Date.now();
    const expiredKeys = [];
    
    // Find all expired keys
    for (const [key, timestamp] of this.keyTimestamps.entries()) {
      if (now - timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired items
    if (expiredKeys.length > 0) {
      expiredKeys.forEach(key => {
        this.cache.delete(key);
        this.keyTimestamps.delete(key);
      });
      
      logger.debug(`Removed ${expiredKeys.length} expired cache items`);
    }
  }
  
  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
    this.keyTimestamps.clear();
    logger.info('Cache cleared');
  }
  
  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl / 1000, // Convert to seconds
      enabled: this.enabled
    };
  }
  
  /**
   * Clean up resources when shutting down
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clear();
    logger.info('Cache service shut down');
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService; 