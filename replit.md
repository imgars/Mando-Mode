# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile-app/         # Cuphead UI - Expo mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `artifacts/mobile-app` (`@workspace/mobile-app`)

Cuphead UI — Expo React Native app for hiding touch UI buttons when using a gamepad controller.

- **Android package**: `com.cupheadui.app`
- **Screens**: Home (status/controls), Zone Editor (draw overlay zones), Profiles (game profiles), Settings (opacity/color)
- **State**: React Context + AsyncStorage for persistent game profiles and settings
- **Native modules** (Android):
  - `OverlayService.kt` — Full-screen overlay service using SYSTEM_ALERT_WINDOW
  - `FloatingBubbleService.kt` — Draggable floating bubble that appears when app is backgrounded; tap to reopen, × to dismiss
  - `GamepadOverlayModule.kt` — Expo module exposing overlay + bubble + gamepad APIs to JS
- **Key files**:
  - `app/index.tsx` — Home screen with overlay toggle, gamepad status, quick actions
  - `app/editor.tsx` — Visual zone editor with draw/select modes
  - `app/profiles.tsx` — Game profile CRUD management
  - `app/settings.tsx` — Overlay opacity, color, auto-detection settings
  - `context/OverlayContext.tsx` — Global state with AsyncStorage persistence, AppState-driven bubble lifecycle
  - `components/ZoneCanvas.tsx` — PanResponder-based drawing canvas for overlay zones
  - `components/StatusCard.tsx`, `ToggleRow.tsx`, `SliderRow.tsx`, `ProfileCard.tsx` — Reusable UI components
- **EAS Build**: `eas.json` configured with `preview` profile for APK generation. Run `eas build --platform android --profile preview` (requires EAS CLI + Expo account).
- **Note**: The actual Android overlay and floating bubble require a development build with native modules. The Expo Go version provides full configuration UI and simulated gamepad detection.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/download-page` (`@workspace/download-page`)

Cuphead UI download page — Vite + React single-page app that fetches the latest APK from GitHub Releases (`imgars/Mando-Mode`) and provides a download button.

- Fetches latest release from GitHub API (`https://api.github.com/repos/imgars/Mando-Mode/releases/latest`)
- Shows APK version, size, and download link when a release exists
- Shows "no disponible" message when no release has been published yet

## GitHub Actions — APK Build & Release

A GitHub Actions workflow (`.github/workflows/build-apk.yml`) automatically builds the APK and publishes it as a GitHub Release.

### How it works
1. On every push to `master`, the workflow triggers
2. EAS CLI builds the APK using the `preview` profile (configured in `artifacts/mobile-app/eas.json`)
3. The resulting `.apk` is attached to a new GitHub Release

### Required GitHub Secrets
- **`EXPO_TOKEN`** — An Expo access token for authenticating with EAS Build. Generate one at https://expo.dev/accounts/[your-username]/settings/access-tokens
- **`GITHUB_TOKEN`** — Automatically provided by GitHub Actions (no setup needed)

### First-time setup
1. Create an Expo account at https://expo.dev
2. Update `artifacts/mobile-app/app.json` → `expo.owner` with your Expo username
3. Generate an access token at https://expo.dev/accounts/[your-username]/settings/access-tokens
4. Add the token as a secret in GitHub: Repository → Settings → Secrets and variables → Actions → New repository secret → Name: `EXPO_TOKEN`, Value: your token
5. Push to `master` — the workflow will build and publish the APK automatically

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
