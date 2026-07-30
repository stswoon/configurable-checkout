# AGENTS.md — Configurable Checkout

Instructions for AI coding agents working in this repository.

Blog post (architecture context): https://blog.stswoon.ru/pages/2026/ConfigurableCheckout/index.html

## Project overview

Monorepo demo of a **config-driven checkout UI**. A JSON configuration defines which widgets render in the checkout flow; the right panel shows a live runtime preview driven by that config and a selected quote.

Split-pane layout:

- **Left (`ConfigEditor`)** — edit JSON config, pick a quote ID, apply to preview.
- **Right (`RuntimeView`)** — renders widgets via `CheckoutRenderer` + `WidgetRenderer`.

Persistence is file-based (JSON on disk). No database.

## Repository structure

```
configurable-checkout/
├── backend/          Express API, JSON file store
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/   configRoutes, idpRoutes, quoteRoutes
│   │   └── lib/      jsonStore helpers
│   └── data/         Runtime data (config, quotes, idp users)
├── frontend/         React 19 + Rspack + Tailwind + shadcn/ui
│   └── src/
│       ├── components/   App shell (ConfigEditor, RuntimeView)
│       ├── modules/checkout/   CheckoutRenderer, WidgetRenderer (canonical)
│       ├── stores/       Zustand configStore, exampleConfig
│       ├── hooks/        SWR wrappers (useApi.ts)
│       ├── lib/          API client, utils
│       ├── ui/           shadcn components (use @/ui/* imports)
│       └── ui-extra/     Reusable shadcn layers (use @/ui-extra/* imports)
└── shared/           Cross-package types (QuoteType.ts)
```

## Commands

From repo root:

```bash
npm install
npm run dev              # backend + frontend workspaces
npm run dev:backend      # Express on http://localhost:3100
npm run dev:frontend     # Rspack dev server on http://localhost:3000
npm run build            # build all workspaces
```

Backend only:

```bash
npm run dev -w backend
npm run build -w backend
npm start -w backend     # runs dist/index.js
```

Frontend only:

```bash
npm run dev -w frontend
npm run build -w frontend
```

**Dev proxy:** frontend dev server proxies `/api/*` → `http://localhost:3100`. Run both services for full functionality.

**Health check:** `GET http://localhost:3100/health`

There is no test suite yet. Verify changes manually via the dev UI or API calls.

## Architecture

### Config-driven widgets

Checkout layout is defined by a JSON object with a `widgets` array:

```json
{
  "id": "default",
  "quoteId": "quote-001",
  "widgets": [
    { "id": "header-1", "type": "header", "props": { "title": "..." } },
    { "id": "quote-1", "type": "quoteSummary", "props": {} }
  ]
}
```

Each widget has `id`, `type`, and optional `props`. Types are resolved in `frontend/src/modules/checkout/WidgetRenderer.tsx` via `WIDGET_REGISTRY`.

Registered widget types:

| type           | props (examples)                    |
|----------------|-------------------------------------|
| `header`       | `title`, `subtitle`                 |
| `userProfile`  | `userId` (not yet wired in renderer)|
| `quoteSummary` | —                                   |
| `contactForm`  | `fields: string[]`                  |
| `payment`      | `methods: string[]`                 |

Unknown types render `UnknownWidget` (dashed placeholder).

### State flow

1. User edits JSON in `ConfigEditor` and clicks **Apply**.
2. `useConfigStore.applyConfig()` saves config + quoteId to `localStorage`.
3. `RuntimeView` reads store and passes config + quoteId to `CheckoutRenderer`.
4. `CheckoutRenderer` fetches quote data via SWR (`useQuote`) and maps widgets to `WidgetRenderer`.

Config in the editor is **local-first** (localStorage). Backend config API exists but the editor does not auto-sync to it on Apply.

### Shared types

`shared/QuoteType.ts` is the canonical quote model. Import via:

- Frontend: `import type { QuoteType } from "@shared/QuoteType"` or `Quote` alias from `@/lib/api`
- Backend: relative path `../../../shared/QuoteType`

Keep frontend `CheckoutConfig` / `WidgetDefinition` (in `lib/api.ts` and backend routes) aligned when changing the config schema.

## API reference

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/config`         | List config IDs          |
| GET    | `/api/config/:id`     | Get config               |
| PUT    | `/api/config/:id`     | Upsert config            |
| POST   | `/api/config`         | Create config (UUID id)  |
| GET    | `/api/quotes`         | List quote IDs           |
| GET    | `/api/quotes/:id`     | Get quote                |
| POST   | `/api/quotes`         | Create quote             |
| PUT    | `/api/quotes/:id`     | Update quote             |
| GET    | `/api/idp/users`      | List users               |
| GET    | `/api/idp/users/:id`  | Get user                 |
| POST   | `/api/idp/login`      | Mock login               |
| GET    | `/api/idp/session/:token` | Get session          |

Data files live under `backend/data/`:

- `config/*.json` — checkout configs
- `quotes/*.json` — quote entities
- `idp/users.json`, `idp/sessions.json` — mock identity provider

Use `backend/src/lib/jsonStore.ts` for all file I/O (`readJsonFile`, `writeJsonFile`, `listJsonFiles`).

## Coding conventions

### General

- TypeScript strict mode in both packages.
- Minimize scope — smallest correct diff; do not refactor unrelated code.
- Match existing naming, import style, and patterns in the file you edit.
- Comments only for non-obvious business logic.
- Do not add tests unless requested or they cover meaningful behavior.

### Backend

- Express routers in `backend/src/routes/`, one file per domain.
- CommonJS modules (`module: CommonJS` in tsconfig).
- Default port `3100` (`process.env.PORT`).
- Return `{ error: "..." }` with appropriate HTTP status on failures.
- New entities: add sample JSON under `backend/data/` if useful for manual testing.

### Frontend

- React 19 functional components, hooks for reusable logic.
- Path aliases: `@/` → `src/`, `@shared/` → `../shared/` (configured in `rspack.config.ts` and `tsconfig.json`).
- **UI imports:** use `@/ui/*` (canonical). `components.json` lists `@/components/ui` but active code imports from `@/ui/`.
- **Widget code:** canonical location is `frontend/src/modules/checkout/`. Do not extend the legacy `components/widgets/WidgetRenderer.tsx`.
- Styling: Tailwind CSS + shadcn/ui (new-york style). Use `cn()` from `@/lib/utils`.
- **shadcn/ui first:** Before building custom UI (raw HTML, styled `div`s, hand-rolled form controls), check whether an existing `@/ui/*` component or shadcn registry component fits. Prefer composing shadcn primitives over one-off markup. Add missing components with `npx shadcn@latest add <name>` into `frontend/src/ui/` and import from `@/ui/*`. Custom UI is acceptable only when shadcn has no suitable component or composition is impractical.
- **ui-extra for reusable shadcn layers:** If a shadcn primitive is wrapped with cross-cutting UI behavior (loading, empty state, async data, repeated composition) and the block is reusable beyond one screen, extract it to `frontend/src/ui-extra/` and import from `@/ui-extra/*`. Keep `@/ui/*` for unmodified shadcn CLI components only. Example: `AsyncSelect` wraps `Select` with `isLoading`, empty placeholder, and option mapping — used from feature components like `ConfigEditor`, not inlined.
- Data fetching: SWR hooks in `hooks/useApi.ts`; raw fetch functions in `lib/api.ts`.
- Client state: Zustand (`stores/configStore.ts`) for editor/runtime config.

### Git / commits

- Conventional commits: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.
- Reference GitLab issues as `#<number>` in commits and MR descriptions.
- Only commit when explicitly asked.

## Common tasks

### Add a new widget type

1. Implement component in `frontend/src/modules/checkout/WidgetRenderer.tsx`.
2. Register it in `WIDGET_REGISTRY`.
3. Add an example entry to `backend/data/config/default.json` and/or `frontend/src/stores/exampleConfig.ts`.
4. Document expected `props` shape via typed casts (existing pattern) or extend `WidgetDefinition` if needed.

### Add a new API route

1. Create or extend a router in `backend/src/routes/`.
2. Mount it in `backend/src/index.ts`.
3. Add fetch function + SWR hook in `frontend/src/lib/api.ts` and `frontend/src/hooks/useApi.ts`.
4. Add sample data under `backend/data/` if applicable.

### Change quote schema

1. Update `shared/QuoteType.ts`.
2. Update affected widgets, routes, and sample JSON files.
3. Ensure backend import path and frontend `@shared` alias both resolve.

## Pitfalls / do-nots

- Do not assume config is persisted to the backend when user clicks Apply — only localStorage is updated.
- `CheckoutRenderer` passes `quote` to widgets but not `user`; `userProfile` widget expects `user` prop — wire `useUser` if implementing user-dependent behavior.
- `exampleConfig.ts` schema differs from production widget config (stepper-oriented); use `backend/data/config/default.json` as the reference for widget-based configs.
- Avoid duplicating UI component folders (`components/ui` vs `ui`); prefer `@/ui`.
- Do not commit secrets or `.env` files.
- Do not run destructive git commands unless explicitly requested.
