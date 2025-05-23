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
Rebuild a simplified version of the Avantos Journey Builder UI. The goal is to fetch a graph of form nodes (a DAG), render them in a basic list, and provide a flexible, editable UI to manage prefill mappings between form fields.

## 📦 Tech Stack
- React (Vite)
- TypeScript
- CSS Modules or simple styles
- Mock API (via `frontendchallengeserver` repo)

## 🎯 Core Objectives
1. Fetch and render form DAG from the API
2. Build UI for viewing/editing field prefill mappings
3. Design architecture to allow easily pluggable new data sources

## 🧱 Folder Structure
```
/src
  /components
  /hooks
  /lib
  /types
  App.tsx
  main.tsx
```

## 🧪 Testing Strategy
- Playwright or React Testing Library
- Unit tests for DAG traversal logic

## ✨ Bonus Ideas
- Zustand for state
- Animations
- Test coverage

## Submission
- GitHub repo named `bf24df`
- Unlisted YouTube screen share (20–30 min)
- Submit both via email to the address from the challenge instructions
