interface Config {
  port: number;
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string[];
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-integration',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3003').split(','),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export { config }; 