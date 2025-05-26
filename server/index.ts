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

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
}));
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/fhir', fhirRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare')
  .then(() => {
    logger.info('MongoDB connected successfully');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

export { app }; 