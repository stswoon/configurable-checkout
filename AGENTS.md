# AGENTS.md — Configurable Checkout

Instructions for AI coding agents working in this repository.

Blog post (architecture context): https://blog.stswoon.ru/pages/2026/ConfigurableCheckout/index.html

## Project overview

Monorepo demo of a **config-driven checkout UI**. A JSON configuration defines which widgets render in the checkout flow; the right panel shows a live runtime preview driven by that config and a selected quote.

Split-pane layout:

- **Left (`ConfigEditor`)** — edit JSON config, pick a quote ID, apply to preview.
- **Right (`RuntimeView`)** — renders widgets via `Checkout` + `WidgetRenderer`.

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
│       ├── modules/checkout/   Checkout, WidgetRenderer, widgets/ (canonical)
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

Reference diagram: [`docs/img.png`](docs/img.png) (also in
the [blog post](https://blog.stswoon.ru/pages/2026/ConfigurableCheckout/index.html)).

### Checkout module — target design

Production checkout is a **wizard** driven by JSON config and a quote loaded from the backend. A single`CheckoutContext`
owns shared state and step navigation; widgets are steps that read/write that context and optionally call the API for
step-specific data.

```
ReactRoute (?quoteId)
    └── CheckoutContext          ← loads JsonConfig + quote by id (QuoteManager / BE)
            └── Form
                    ├── WizardStepper
                    │       ├── Widget 1   (CheckoutStep)
                    │       ├── Widget 2   (CheckoutStep) ──optional──► BE
                    │       └── Widget 3   (CheckoutStep)
                    └── SubmitWidget       ──submit quote──► BE (next status)
```

**Data inputs**

| Source                        | Role                                                                   |
|-------------------------------|------------------------------------------------------------------------|
| `quoteId` (route query param) | Identifies which quote to load                                         |
| JsonConfig                    | Declares `stepperView`, ordered `widgets[]`, and per-widget params     |
| QuoteManager (BE)             | `GET /api/quotes/:id` — canonical quote entity (`shared/QuoteType.ts`) |

**CheckoutContext responsibilities**

- Hold checkout **state** (form fields, step validity, accumulated answers) — expose `get` / `set` (or equivalent hook).
- Own **navigation** — `nextStep`, `prevStep`, current step index; widgets must not implement their own stepper logic.
- Provide **quote** (and session user when wired) to all descendants.

**UI shell**

- `Form` — wraps the wizard; eventual home for native submit / validation boundaries.
- `WizardStepper` — renders one active step (or vertical list in `stepperView: "vertical"`) from config `widgets`.
- `SubmitWidget` — not a config step; fixed final control that submits the quote and moves it to the next status on the
  backend.

**CheckoutStep contract (widgets)**

Every step widget should behave as a `CheckoutStep`:

1. **Config** — declare `stepName`, `widgetType`, optional `widgetParams` in JSON; read params via
   `getWidgetParams(widget)`.
2. **Shared state** — read and update checkout state only through `CheckoutContext`, not local duplication of quote-wide
   fields.
3. **Navigation** — call context `nextStep` / `prevStep`; disable or block next when the step is invalid.
4. **Backend** — prefer context-provided quote/user; call SWR hooks / `lib/api.ts` only for **step-specific** extra
   data (diagram: Widget 2 → BE). Do not re-fetch the whole quote in every widget.
5. **Presentation** — pure UI in `widgets/<Name>Widget.tsx`; use `@/ui/*` and `@/ui-extra/*`.

Registered step widgets (canonical registry in `widgets/index.ts`):

| widgetType           | widgetParams (examples)                  | Notes                  |
|----------------------|------------------------------------------|------------------------|
| `KycWidget`          | `identificationType: "phone" \| "email"` | Identity step          |
| `OrderDetailsWidget` | —                                        | Reads `quote.order`    |
| `DeliveryWidget`     | —                                        | Reads `quote.delivery` |
| `ConsentsWidget`     | `consents: { id, label }[]`              | Optional consent list  |

Unknown `widgetType` values render `UnknownWidget`.

### Config schema (checkout widgets)

Canonical widget entries use **`stepName`**, **`widgetType`**, **`widgetParams`** (see
`frontend/src/stores/exampleConfig.ts`):

```json
{
  "stepperView": "vertical",
  "widgets": [
    {
      "stepName": "Know Your Customer",
      "widgetType": "KycWidget",
      "widgetParams": {
        "identificationType": "phone"
      }
    },
    {
      "stepName": "Order Details",
      "widgetType": "OrderDetailsWidget"
    },
    {
      "stepName": "Delivery",
      "widgetType": "DeliveryWidget"
    },
    {
      "stepName": "Consents",
      "widgetType": "ConsentsWidget"
    }
  ]
}
```

Legacy backend sample `backend/data/config/default.json` still uses `id` / `type` / `props` — deprecated for the
checkout module; `WidgetDefinition` in `lib/api.ts` supports both shapes for migration.

### Current implementation vs target

| Piece                                      | Status      | Location                                    |
|--------------------------------------------|-------------|---------------------------------------------|
| Widget components + registry               | Implemented | `frontend/src/modules/checkout/widgets/`    |
| `WidgetRenderer` (type → component)        | Implemented | `WidgetRenderer.tsx`                        |
| Flat runtime preview (all widgets visible) | Implemented | `Checkout.tsx` + demo `RuntimeView` |
| `CheckoutContext` (state + navigation)     | Planned     | —                                           |
| `WizardStepper` + step visibility          | Planned     | —                                           |
| `SubmitWidget` + quote status transition   | Planned     | —                                           |
| Route entry with `?quoteId=`               | Planned     | demo uses Zustand `quoteId` instead         |

The **demo app** (`ConfigEditor` / `RuntimeView`) intentionally uses a simplified flat renderer so config edits preview
instantly. When implementing production checkout, evolve `Checkout` toward the diagram — do not fork a second
widget system.

**Demo state flow (today)**

1. User edits JSON in `ConfigEditor` and clicks **Apply**.
2. `useConfigStore.applyConfig()` saves config + quoteId to `localStorage`.
3. `RuntimeView` passes config + quoteId to `Checkout`.
4. `Checkout` fetches quote via `useQuote(quoteId)` and maps every widget through `WidgetRenderer`.

Config in the editor is **local-first** (localStorage). Backend config API exists but the editor does not auto-sync to it on Apply.

### Developing widgets (`frontend/src/modules/checkout`)

Follow this path for every new checkout step:

1. **Add a file** — `widgets/MyStepWidget.tsx`. Export a named component matching the `WidgetProps` interface (
   `widgets/types.ts`).
2. **Register** — import in `widgets/index.ts` and add to `WIDGET_REGISTRY` under the exact `widgetType` string used in
   JSON.
3. **Read config** — `widget.stepName` for title fallback; `getWidgetParams(widget)` for typed params (cast locally,
   same as existing widgets).
4. **Use shared data** — accept `quote` / `user` from props (today) or from `CheckoutContext` (target). Show a loading
   placeholder when `quote` is undefined.
5. **Mutations** — write into checkout context state, not directly into SWR cache, unless persisting immediately via a
   dedicated API (e.g. PATCH quote).
6. **Optional API** — add fetch + hook in `lib/api.ts` / `hooks/useApi.ts` only if the step needs data beyond
   quote/user.
7. **Example config** — add an entry to `frontend/src/stores/exampleConfig.ts` (and backend config when migrating off
   legacy schema).
8. **UI** — compose `@/ui/*`; extract reusable async/empty patterns to `@/ui-extra/*`.

**Do not**

- Add widgets under `components/widgets/` (legacy).
- Embed step navigation (Next/Back buttons tied to global step index) inside the widget — that belongs in
  `WizardStepper` / context (once implemented).
- Introduce parallel registries or duplicate `WidgetRenderer`.
- Use legacy `type` / `props` in new checkout configs.

**Module layout**

```
frontend/src/modules/checkout/
├── Checkout.tsx    # Shell: context + stepper (preview → wizard)
├── WidgetRenderer.tsx      # Maps widgetType → component
└── widgets/
    ├── index.ts            # WIDGET_REGISTRY
    ├── types.ts            # WidgetProps, resolveWidgetType, getWidgetParams
    ├── UnknownWidget.tsx
    └── *Widget.tsx         # One file per step
```

### Shared types

`shared/QuoteType.ts` is the canonical quote model. Import via:

- Frontend: `import type { QuoteType } from "@shared/QuoteType"` or `Quote` alias from `@/lib/api`
- Backend: relative path `../../../shared/QuoteType`

Keep frontend `CheckoutConfig` / `WidgetDefinition` (in `lib/api.ts` and backend routes) aligned when changing the config schema.

## API reference

| Method | Path                      | Description             |
|--------|---------------------------|-------------------------|
| GET    | `/api/config`             | List config IDs         |
| GET    | `/api/config/:id`         | Get config              |
| PUT    | `/api/config/:id`         | Upsert config           |
| POST   | `/api/config`             | Create config (UUID id) |
| GET    | `/api/quotes`             | List quote IDs          |
| GET    | `/api/quotes/:id`         | Get quote               |
| POST   | `/api/quotes`             | Create quote            |
| PUT    | `/api/quotes/:id`         | Update quote            |
| GET    | `/api/idp/users`          | List users              |
| GET    | `/api/idp/users/:id`      | Get user                |
| POST   | `/api/idp/login`          | Mock login              |
| GET    | `/api/idp/session/:token` | Get session             |

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

1. Create `frontend/src/modules/checkout/widgets/<Name>Widget.tsx` implementing `WidgetProps`.
2. Register in `widgets/index.ts` → `WIDGET_REGISTRY` (key = JSON `widgetType`).
3. Add an example entry to `frontend/src/stores/exampleConfig.ts`.
4. Document `widgetParams` via local casts in the widget (existing pattern) or extend `WidgetDefinition` if needed.
5. When `CheckoutContext` exists, consume it for state/navigation instead of only props.

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
- `Checkout` currently renders all widgets at once (preview mode); full wizard/context is not wired yet — follow
  the target architecture in [`docs/img.png`](docs/img.png) when extending the shell.
- `Checkout` passes `quote` to widgets but not `user`; wire `useUser` via context or props when implementing
  user-dependent steps.
- Use `exampleConfig.ts` (`stepName` / `widgetType` / `widgetParams`) as the reference for checkout widgets — not legacy
  `backend/data/config/default.json` (`id` / `type` / `props`).
- Avoid duplicating UI component folders (`components/ui` vs `ui`); prefer `@/ui`.
- Do not commit secrets or `.env` files.
- Do not run destructive git commands unless explicitly requested.
