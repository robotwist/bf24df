import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

const MONGODB_URI = config.mongodb.uri;

export const connectDB = async (): Promise<void> => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await disconnectDB();
    logger.info('Application terminated');
    process.exit(0);
  } catch (error) {
    logger.error('Error during application termination:', error);
    process.exit(1);
  }
}); 