# Journey Builder React Coding Challenge

A React application for visualizing and managing form DAGs with prefill mapping capabilities.

## Features

- Visualize form DAGs with interactive nodes and edges
- Map fields between forms for data prefilling
- Support for multiple data sources (Form, Global, Custom)
- Real-time validation and transformation of mapped values
- Toast notifications for user feedback
- Comprehensive test coverage

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/journey-builder.git
cd journey-builder

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Business logic and utilities
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Documentation

- [Development Guide](docs/README.dev.md) - Setup and development workflow
- [Testing Guide](docs/TESTING.md) - Testing strategy and examples
- [Architecture Guide](docs/ARCHITECTURE.md) - Component composition and data source extension

## Key Components

### DAG Visualization
- Interactive node selection
- Edge highlighting
- Zoom and pan controls

### Form Mapping
- Field mapping interface
- Data source selection
- Value transformation
- Real-time validation

### Data Sources
- Form data source
- Global data source
- Extensible for custom sources

## Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run end-to-end tests
pnpm test:e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Version Control

### Branching Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Maintenance tasks

### Pull Request Process
1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update the changelog
5. Get code review approval

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
