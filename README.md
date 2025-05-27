# Healthcare Integration Platform

A modern healthcare integration platform built with React, Node.js, and MongoDB.

## Project Structure

```
/
├── src/                    # React frontend application
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific components and logic
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React context providers
│   ├── services/         # API and external service integrations
│   ├── utils/            # Frontend utility functions
│   ├── styles/           # Global styles and themes
│   ├── assets/           # Static assets (images, fonts, etc.)
│   └── types/            # TypeScript type definitions
│
├── server/                # Node.js backend application
│   ├── config/           # Server configuration
│   ├── routes/           # API route handlers
│   ├── models/           # Database models
│   ├── middleware/       # Express middleware
│   ├── utils/            # Backend utility functions
│   └── tests/            # Backend tests
│
├── shared/               # Shared code between frontend and backend
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Shared utility functions
│   └── data/            # Shared data files
│
└── tests/               # Test suites
    ├── unit/           # Unit tests
    ├── integration/    # Integration tests
    └── e2e/            # End-to-end tests
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)
- MongoDB (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd healthcare-integration
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start MongoDB:
   ```bash
   mongod --dbpath ./data/db
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## Features

- FHIR Resource Management
- Healthcare Workflow Automation
- Graph-based Form Builder
- Real-time Data Integration
- API Documentation with Swagger
- MongoDB Integration
- TypeScript Support

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### Building for Production

```bash
pnpm build
```

## API Endpoints

- `GET /` - Frontend application
- `GET /health` - Health check endpoint
- `GET /api-docs` - API documentation
- `GET /api/graph` - Graph data
- `GET /api/forms` - Form definitions
- `GET/POST/PUT/DELETE /fhir/*` - FHIR resource endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT
