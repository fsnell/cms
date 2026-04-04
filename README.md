# Contract Management System

A Vendor Management Office (VMO) contract management application built with Vue 3, Vuetify, Node.js, Express, and SQLite.

## Stack
- Frontend: Vue 3, TypeScript, Vite, Vuetify
- Backend: Node.js, Express, TypeScript
- Database: SQLite
- Testing: Jest, Vitest, Cypress

## Current Capabilities
- Vendor create, edit, list, soft delete, and deactivate workflows
- Contract create, edit, list, archive, and soft delete workflows
- Dashboard summary endpoint and dashboard UI
- Reminder API support
- JWT-based mock auth with role-aware UI behavior
- Duplicate vendor-name prevention
- Cypress end-to-end coverage for core page and vendor flows

## Project Structure
- `frontend/`: Vue/Vuetify SPA
- `backend/`: Express API and SQLite access layer
- `requirements.md`: Product and technical requirements
- `build-tasks.md`: Build/test execution plan
- `Makefile`: Common development commands

## Prerequisites
- Node.js
- npm
- make

## Install
```bash
make install
```

## Run Locally
Run both frontend and backend:
```bash
make dev
```

Run frontend only:
```bash
make frontend
```

Run backend only:
```bash
make backend
```

Frontend:
- `http://127.0.0.1:5173`

Backend:
- `http://localhost:3000`

## Build
Build both apps:
```bash
make build
```

Build backend only:
```bash
make build-backend
```

Build frontend only:
```bash
make build-frontend
```

## Seed Sample Data
```bash
make seed
```

This populates sample users, vendors, contracts, and reminders for local testing.

## Test
Run backend tests:
```bash
cd backend && npm test
```

Run frontend unit tests:
```bash
cd frontend && npm test
```

Run Cypress end-to-end tests:
```bash
cd frontend && npm run cypress:run
```

## Soft Delete Behavior
- Contracts are soft deleted by being archived.
- Vendors are soft deleted by being marked `Inactive`.
- Vendors remain visible in the list after deletion because the delete action is non-destructive.

## Roles
- `Admin`: Full write access including vendor delete action
- `Contract Manager`: Create/edit/deactivate access
- `Viewer`: Read-only access

## Notes
- Authentication is currently mocked with JWT-like tokens for local development.
- Okta-compatible JWT validation is the intended integration path.
- SQLite database file is stored locally as `contracts.db` in the project root.

## Useful Commands
```bash
make help
```

## Status
This repository contains an MVP implementation with working core flows and automated test coverage, but not all items in `build-tasks.md` are complete yet.
