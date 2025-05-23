# Project: Avantos Journey Builder

## What I'm building
A React UI for editing prefill mappings between a series of forms connected in a Directed Acyclic Graph (DAG). These mappings allow data from upstream form fields to prefill downstream ones.

## Core Requirements
- Fetch graph data from mock API: `GET /api/v1/{orgId}/actions/blueprints/{blueprintId}/graph`
- Render a flat list of forms (not DAG visually)
- Build a UI to view & edit prefill mappings
- Modal for selecting source data from:
  1. Direct dependencies
  2. Transitive dependencies
  3. Global data (mocked)

## Technical Stack
- React (with TypeScript)
- Local dev server (localhost:3000) serving `graph.json` from mock server
- CSS Modules (or your styling method of choice)

## Key Constraints
- Focus on clean code structure & extensibility
- Make it easy to add new data sources in the future

## Goals
- Impress with organization, extensibility, clear interfaces
- Show independence in thinking + implementation
