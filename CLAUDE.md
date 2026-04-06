# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install all dependencies (run from repo root)
make install

# Start backend + frontend concurrently (backend :3001, frontend :5173)
make dev

# Type-check both backend and frontend (no test suite exists)
make test

# Reset database and populate with sample data
make seed

# Production build (frontend only)
make build

# Build and run Docker image
make docker && make docker-run
```

Individual services:
```bash
cd backend && npm run dev    # tsx watch on src/
cd frontend && npm run dev   # Vite HMR on port 5173
```

## Architecture Overview

Monorepo with two packages: `backend/` (Express 5 + TypeScript) and `frontend/` (Vue 3 + TypeScript + Vuetify 4). SQLite via `better-sqlite3`.

### Backend Layer Structure

```
index.ts       → Express setup, env config, server startup
auth.ts        → JWT validation + X-User-Role dev header; requireWriter/requireAdmin middleware
routes.ts      → All REST endpoints mounted at /api
repositories.ts → Data access layer (all DB queries live here)
database.ts    → SQLite schema init, called once at startup via getDb()
models.ts      → TypeScript interfaces for all entities
ocr.ts         → Anthropic/OpenAI OCR extraction for contract uploads
seed.ts        → Sample data (skips if data already exists)
```

All routes call repositories; no SQL in `routes.ts`. Activity events are written inside repositories for audit trail.

### Frontend Structure

`src/services/api.ts` is the single Axios client — it sets `X-User-Role`/`X-User-Id` headers (dev) or `Authorization: Bearer` (prod). All views import from this service, not directly from `axios`.

`vite.config.ts` proxies `/api/*` to `http://localhost:3001`, so frontend code always calls `/api/...` regardless of environment.

### Auth Modes

- **Dev:** Send `X-User-Role: Admin|Contract Manager|Viewer` and `X-User-Id` headers — no JWT needed
- **Prod:** JWT Bearer token validated against `JWT_SECRET`; subject auto-provisions a User record on first request

### Database

SQLite file at `backend/contracts.db` (dev) or `/app/data/contracts.db` (Docker). Schema is defined inline in `database.ts` and applied on every startup (idempotent `CREATE TABLE IF NOT EXISTS`). No migration framework — schema changes go directly in `database.ts`.

Vendor `legal_name` has a unique index on `LOWER(TRIM(legal_name))` — duplicate vendor creation returns HTTP 409.

### Contract Lifecycle States

`Draft → Under Review → Active → Expiring Soon → Expired → Terminated → Archived`

Archiving is a soft delete (`archived` flag). Restore is admin-only (`POST /contracts/:id/restore`).

### Environment Variables (Backend)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Server port |
| `DB_PATH` | `./contracts.db` | SQLite file location |
| `JWT_SECRET` | — | Required for JWT auth in prod |
| `ANTHROPIC_API_KEY` | — | OCR extraction (preferred for PDFs) |
| `OPENAI_API_KEY` | — | OCR extraction fallback |
| `NODE_ENV` | — | Set to `production` to disable dev auth headers |
| `FRONTEND_DIST` | — | Path to built frontend for static serving |
