import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { connectDB } from './db/mongodb';
import fhirRoutes from './routes/fhir';
import { logger } from './utils/logger';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Root route handler - serve the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Graph data endpoint
app.get('/api/graph', (req, res) => {
  try {
    const graphData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'shared', 'data', 'graph.json'), 'utf8'));
    res.json(graphData);
  } catch (error) {
    logger.error('Error reading graph data:', error);
    res.status(500).json({ error: 'Failed to load graph data' });
  }
});

// Forms endpoint
app.get('/api/forms', (req, res) => {
  try {
    const graphData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'shared', 'data', 'graph.json'), 'utf8'));
    const forms = graphData.nodes.filter((node: any) => node.type === 'form');
    res.json(forms);
  } catch (error) {
    logger.error('Error reading forms data:', error);
    res.status(500).json({ error: 'Failed to load forms data' });
  }
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// FHIR Routes
app.use('/fhir', fhirRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please free up the port or use a different one.`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        logger.info('Server closed');
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing MongoDB connection:', error);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app }; 