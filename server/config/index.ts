import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  server: {
    port: 3000,
    env: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-platform',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-development-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3003'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
}; 