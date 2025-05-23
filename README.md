# Avantos Journey Builder

## Overview
A React UI for editing prefill mappings between a series of forms connected in a Directed Acyclic Graph (DAG). These mappings allow data from upstream form fields to prefill downstream ones, supporting complex workflows and dependencies.

## Features
- Fetches graph data from a mock API
- Renders a flat list of forms (not a visual DAG)
- UI to view & edit prefill mappings
- Modal for selecting source data from:
  - Direct dependencies
  - Transitive dependencies
  - Global data (mocked)
- Visual mapping status indicators
- Responsive, modern UI
- End-to-end tests with Playwright

## Tech Stack
- React (TypeScript)
- Vite
- Playwright (E2E testing)
- CSS Modules
- Node.js mock API server

---

## Getting Started

### 1. Install dependencies
```sh
npm install
```

### 2. Start the mock API server
```sh
cd frontendchallengeserver
node index.js
```
You should see: `Server is running on http://localhost:3000`

### 3. Start the React app
```sh
npm run dev
```
You should see: `Local: http://localhost:3003/`

### 4. Open the app
Go to [http://localhost:3003](http://localhost:3003) in your browser.

---

## Running Tests

To run all Playwright end-to-end tests:
```sh
npx playwright test --headed
```

---

## Project Structure

- `src/components/` — React components (GraphTest, MappingEditor, MappingStatus, etc.)
- `src/hooks/` — Custom hooks for data fetching and mapping logic
- `src/lib/` — API and utility functions
- `src/styles/` — CSS Modules and global styles
- `frontendchallengeserver/` — Mock API server
- `tests/` — Playwright test suite

---

## Extending the Project

- **Add new data sources:**
  - Extend `useMappings` or create new hooks/components for new source types.
- **Add new mapping types or validation:**
  - Update mapping logic and UI in `MappingEditor` and `MappingStatus`.
- **Add new features:**
  - Create new components and integrate them in `GraphTest` or as needed.

---

## Key Patterns & Conventions
- **Functional React components** and custom hooks for logic separation
- **TypeScript** for type safety and clear interfaces
- **CSS Modules** for scoped, maintainable styles
- **Playwright** for robust end-to-end testing
- **Separation of concerns:** Data fetching, mapping logic, and UI are modular

---

## Contact / Contribution
- For questions or contributions, open an issue or PR.
- Follow the patterns in `src/components/` and `src/hooks/` for new features.

---

**Enjoy building with Avantos Journey Builder!**

```bash
git clone https://github.com/robotwist/avantos-field-mapping
cd avantos-field-mapping
pnpm install
pnpm dev
pnpm test:e2e
