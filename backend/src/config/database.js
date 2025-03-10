const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./index');

// Configure connection string based on environment
const getConnectionString = () => {
  let connectionString = config.MONGODB_URI;

  if (!connectionString) {
    // Fallback to building the connection string from parts
    const host = config.DB_HOST || 'localhost';
    const port = config.DB_PORT || '27017';
    const database = config.DB_NAME || 'solmate';
    const user = config.DB_USER;
    const password = config.DB_PASSWORD;
    
    if (user && password) {
      connectionString = `mongodb://${user}:${password}@${host}:${port}/${database}`;
    } else {
      connectionString = `mongodb://${host}:${port}/${database}`;
    }
  }
  
  return connectionString;
};

/**
 * Connect to MongoDB
 * @returns {Promise} Mongoose connection
 */
const connectDB = async () => {
  try {
    // Configure mongoose connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    };

    const connectionString = getConnectionString();
    
    // Connect to MongoDB
    const conn = await mongoose.connect(connectionString, options);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected, attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error(error.stack);
    // Exit with failure in production, but allow retry in development
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = {
  connectDB,
  getConnectionString,
}; 