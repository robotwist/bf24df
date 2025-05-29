# Healthcare Integration Platform

A modern healthcare integration platform built with React, TypeScript, and Node.js, featuring a powerful form mapping and visualization system.

## Project Structure

```
/
├── src/                    # React frontend application
│   ├── components/        # Reusable UI components
│   │   ├── visualization/ # DAG visualization components
│   │   └── ui/           # Common UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Core services (transformation, validation)
│   ├── lib/              # Utility libraries
│   ├── styles/           # CSS modules and global styles
│   └── types/            # TypeScript type definitions
│
├── server/                # Node.js backend application
│   ├── config/           # Server configuration
│   ├── routes/           # API route handlers
│   ├── models/           # Database models
│   ├── utils/            # Backend utility functions
│   └── tests/            # Backend tests
│
├── tests/                # Test suites
│   ├── services/        # Service unit tests
│   ├── hooks/          # Hook unit tests
│   └── e2e/            # End-to-end tests
│
└── scripts/             # Utility scripts
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

3. Start MongoDB:
   ```bash
   ./scripts/start-mongodb.sh
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Features

- Form Mapping System
  - Field type validation
  - Data transformation
  - Mapping visualization
- Enhanced DAG Visualization
  - Interactive node manipulation
  - Real-time updates
  - Custom styling
- Robust Error Handling
  - Toast notifications
  - Error boundaries
  - Validation feedback
- Type-Safe Development
  - TypeScript throughout
  - Comprehensive type definitions
  - Strict type checking

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:e2e
```

### Building for Production

```bash
pnpm build
```

## Testing Strategy

- Unit Tests
  - Service layer testing
  - Hook testing
  - Component testing
- Integration Tests
  - API endpoint testing
  - Service integration testing
- E2E Tests
  - User flow testing
  - Cross-browser testing

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT
