/*
Directory: avantos-coding-challenge
*/

// Terminal Setup (run these commands first):
// -------------------------------------------
// npm create vite@latest avantos-coding-challenge -- --template react-ts
// cd avantos-coding-challenge
// npm install
// mkdir src/components src/hooks src/lib src/types

/* File: README.dev.md */
# Journey Builder – Avantos Coding Challenge

## 🌟 Mission
Build a powerful form mapping and visualization system that allows users to create and manage complex form relationships through an intuitive DAG (Directed Acyclic Graph) interface.

## 📦 Tech Stack
- React (Vite)
- TypeScript
- CSS Modules
- Jest + React Testing Library
- Playwright for E2E testing
- MongoDB for data persistence

## 🎯 Core Features
1. Enhanced DAG Visualization
   - Interactive node manipulation
   - Real-time updates
   - Custom styling and animations
2. Form Mapping System
   - Field type validation
   - Data transformation
   - Mapping visualization
3. Robust Error Handling
   - Toast notifications
   - Error boundaries
   - Validation feedback

## 🧱 Project Structure
```
/src
  /components
    /visualization    # DAG visualization components
    /ui              # Common UI components
  /hooks             # Custom React hooks
  /services          # Core services
  /lib               # Utility libraries
  /styles            # CSS modules
  /types             # TypeScript types
  App.tsx
  main.tsx
```

## 🧪 Testing Strategy
- Unit Tests
  - Service layer (transformation, validation)
  - Custom hooks
  - UI components
- Integration Tests
  - API endpoints
  - Service integration
- E2E Tests
  - User flows
  - Cross-browser testing

## 🚀 Development Workflow
1. Start MongoDB:
   ```bash
   ./scripts/start-mongodb.sh
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Run tests:
   ```bash
   pnpm test        # All tests
   pnpm test:unit   # Unit tests
   pnpm test:e2e    # E2E tests
   ```

## ✨ Key Implementations
- Type-safe development with TypeScript
- Robust error handling and validation
- Real-time data transformation
- Interactive DAG visualization
- Comprehensive test coverage

## 📝 Notes
- All components are built with TypeScript
- CSS Modules for scoped styling
- Jest + React Testing Library for unit tests
- Playwright for E2E testing
- MongoDB for data persistence

## Submission
- GitHub repo named `bf24df`