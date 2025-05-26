# Healthcare Integration Platform

A modern healthcare integration platform that supports FHIR and HL7 standards, with workflow automation capabilities.

## Features

- 🔄 FHIR/HL7 Integration
  - Full FHIR resource support
  - HL7 message processing
  - Real-time data synchronization
  - Custom resource mapping

- 🤖 Workflow Automation
  - Visual workflow editor
  - Custom workflow templates
  - Event-driven automation
  - Integration with external systems

- 📊 Analytics & Monitoring
  - Real-time dashboards
  - Performance metrics
  - Error tracking
  - Audit logs

- 🔒 Security
  - OAuth2 authentication
  - Role-based access control
  - Data encryption
  - Audit trails

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
  - React Query

- **Backend**
  - Node.js
  - Express
  - TypeScript
  - MongoDB
  - Redis

- **Testing**
  - Jest
  - React Testing Library
  - Playwright
  - Cypress

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB 6.x or later
- Redis 7.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthcare-integration.git
cd healthcare-integration
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
  ├── core/           # Core business logic
  │   ├── services/   # Business services
  │   ├── hooks/      # Custom React hooks
  │   ├── utils/      # Utility functions
  │   └── types/      # TypeScript types
  │
  ├── features/       # Feature modules
  │   ├── workflow/   # Workflow automation
  │   ├── integration/# FHIR/HL7 integration
  │   └── analytics/  # Analytics & monitoring
  │
  └── shared/         # Shared resources
      ├── components/ # Reusable components
      ├── layouts/    # Page layouts
      └── styles/     # Global styles
```

## API Documentation

The API documentation is available at `/api-docs` when running the server. It provides detailed information about:

- Available endpoints
- Request/response formats
- Authentication
- Error handling
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the [TypeScript style guide](docs/STYLE_GUIDE.md)
- Write tests for new features
- Update documentation
- Follow the [Git commit message convention](docs/COMMIT_CONVENTION.md)

## Deployment

### Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Docker

```bash
# Build the Docker image
docker build -t healthcare-integration .

# Run the container
docker run -p 3000:3000 healthcare-integration
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@example.com or join our Slack channel.

```bash
git clone https://github.com/robotwist/avantos-field-mapping
cd avantos-field-mapping
pnpm install
pnpm dev
pnpm test:e2e
