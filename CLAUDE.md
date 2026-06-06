# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SS Tickets is a fullstack ticket management system built as a learning and portfolio project. It is an npm workspaces monorepo with a Node.js/Express REST API, a React/Vite SPA, and Cypress E2E tests that run against the real backend and database.

The project is intentionally structured around documentation-first development: business rules, API contract, and BDD specs exist as standalone documents that guide both implementation and tests.

## Commands

### Setup

```bash
# Install all dependencies (root runs workspaces simultaneously)
npm install

# Start the database (required before running backend or tests)
docker-compose up -d
```

The `.env` file must exist at `packages/backend/.env` (used by both the backend and `cypress.config.js`). Copy `.env.example` from the project root as a reference.

### Development

```bash
# Start backend + frontend together (concurrently)
npm run dev

# Start individually
npm run backend:dev   # nodemon on packages/backend — port 3000 (default)
npm run frontend:dev  # Vite on packages/frontend — default port 5173
```

### Testing (Cypress E2E — requires the full stack to be running)

```bash
npm run cy:open   # interactive Cypress UI
npm run cy:test   # headless run

# Run a single spec headlessly
npx cypress run --spec "cypress/e2e/tickets.cy.js"
```

### Frontend lint

```bash
npm run lint -w packages/frontend
```

## Documentation

The `docs/` directory is the authoritative reference for this project. Always check these before making changes to business logic or API behavior:

- **[`docs/regras-de-negocio.md`](docs/regras-de-negocio.md)** — domain rules (RN-ID-*, RN-ACESSO-*, RN-VAL-*, RN-CICLO-*, RN-VIS-*). Technology-agnostic. These rules apply regardless of where an operation is initiated.
- **[`docs/contrato-api.md`](docs/contrato-api.md)** — HTTP contract: every endpoint, method, status code, request/response shape, and auth requirement. The source of truth for what the API must do.
- **[`docs/specs.md`](docs/specs.md)** — BDD scenarios in Gherkin format, each referencing the RN rule it validates. All scenarios are testable via direct API requests.
- **[`docs/decisions/`](docs/decisions/)** — Architecture Decision Records (ADRs). Read these to understand why the code is shaped the way it is.

## Architecture

### Backend (`packages/backend/src`)

Classic Express MVC layout:

- **`app.js`** — wires `helmet` (security headers), `cors` (restricted to `CORS_ORIGIN` env var or `localhost:5173`), `express.json`, malformed-JSON error handler, and mounts `/tickets`, `/usuarios`, `/notas`, `/health`. Includes graceful shutdown on `SIGTERM`/`SIGINT`.
- **`config/db.js`** — exports a `query(text, params)` wrapper around a `pg.Pool`, plus a `close()` method used by graceful shutdown. All queries use parameterised placeholders (`$1`, `$2`, …).
- **`middlewares/authMiddleware.js`** — validates `Authorization: Bearer <token>`, verifies the JWT, and injects `req.usuarioId` and `req.usuarioPerfil` for downstream controllers.
- **`controllers/`** — one file per resource. Controllers read identity from the JWT (`req.usuarioId`), never from the request body — `solicitante_id` on ticket creation and `autor_id` on note creation come exclusively from the token.
- **`routes/`** — thin router files; protected routes pass `auth` as middleware before the controller.

Note routes (`GET /tickets/:ticket_id/notas`) live inside `ticketRoutes.js`, not `notaRoutes.js`.

Health check is extracted to `systemController.js` + `systemRoutes.js`, following the same MVC pattern as other resources.

### Database (`init.sql` + Docker Compose)

Tables: `perfis` → `usuarios` → `tickets` → `notas`. The `num_sequencial` on notes is computed inside the INSERT via a subquery (`COALESCE(MAX(num_sequencial), 0) + 1`) scoped to the ticket — sequencing is per-ticket and race-condition-free at the SQL level.

**Valid ticket statuses:** `Aguardando atendimento`, `Em atendimento`, `Aguardando cliente`, `Respondido`, `Tratativa Interna`, `Resolvido`, `Fechado`.

Notes and status changes cannot be applied to tickets with status `Resolvido` or `Fechado` (403). See `RN-CICLO-01`.

**Seeds:** perfis 1=Solicitante, 2=Analista, 3=Admin. The seed usuarios have unhashed passwords — they exist only as reference data and are wiped by `resetDb` before each test.

### Frontend (`packages/frontend/src`)

React 19 SPA with React Router v7:

- **`api/api.js`** — Axios instance with `baseURL: http://localhost:3000` and a request interceptor that auto-attaches `Authorization: Bearer <token>` from `localStorage`.
- **`App.jsx`** — `ProtectedRoute` checks `localStorage.getItem('token')`; missing token redirects to `/login`.
- Public routes: `/login`, `/cadastro`. Private routes: `/meus-chamados`, `/fila-global`.
- `Login.jsx` uses native `fetch`; `Cadastro.jsx` uses the Axios `api` instance.

The frontend refactor planned in `docs/decisions/004-refatoracao-frontend-react.md` is in progress. Target features: Kanban view for Analistas (7 columns, drag-and-drop), full ticket CRUD for Solicitantes, and role-based redirect on login.

### Cypress Tests

Tests run against the live API (`baseUrl: http://localhost:3000`). The `resetDb` task (`cypress.config.js`) truncates `notas`, `tickets`, `usuarios` with `RESTART IDENTITY CASCADE` before each spec's `beforeEach` — `perfis` is left intact.

Custom commands in `cypress/support/commands.js`: `cy.apiLogin`, `cy.createUsuario`, `cy.createTicket`, `cy.createNota`.

Specs use `function()` (not arrow functions) in tests that need `this` for Cypress aliases (`.as()`).

## Key Constraints

- The backend port defaults to `3000` but is configurable via `process.env.PORT`. The frontend's `api/api.js` has `baseURL` hardcoded to `http://localhost:3000`.
- `JWT_SECRET` must be set in `packages/backend/.env` — read directly by `usuarioController.js` and `authMiddleware.js` via `process.env.JWT_SECRET`.
- CORS origin is configurable via `process.env.CORS_ORIGIN`; defaults to `http://localhost:5173` for local development.
- There are no backend unit tests; all API coverage is in Cypress.
- `RN-VIS-01` (filtering internal notes from Solicitantes) is specified in `regras-de-negocio.md` and `specs.md` but **not yet implemented** in `notaController.getNotasByTicket`.
