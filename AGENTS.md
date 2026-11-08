<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# EIMS Client

Next.js 16.2.10 + React 19 frontend for an education-institution management system. It is a pure API client — no database or migrations here; it talks to a separate REST backend.

## Commands

- `npm run dev` — dev server on `0.0.0.0:3000` (Turbopack is the default in Next 16)
- `npm run build` — production build; includes the built-in TypeScript check
- `npm run lint` — `biome check` (lint + format verification). `next lint` was **removed** in Next 16 — don't use it
- `npm run format` — `biome format --write`
- No test suite. No `typecheck` script — type errors surface via `npm run build` or `npx tsc --noEmit`

## Next.js 16 gotchas (this repo)

- Middleware is now `proxy.ts`, not `middleware.ts` — see `src/proxy.ts` and read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` before touching it
- `cookies()`, `headers()`, `params`, `searchParams` are **async** — always `await` them (the codebase already does)
- Next docs for this exact version ship in `node_modules/next/dist/docs/`; `version-16.md` lists the breaking changes

## Architecture

- Path alias `@/*` → `src/*` (tsconfig.json)
- Route groups split by role: `(admin-auth)` → `/admin-login`, `(dashboard)` admin app, `(teacher)` / `(student)` portals, `(common)` public pages
- Role guard is `src/proxy.ts`: `/dashboard` = admin, `/teacher/` = teacher, `/student/` = student; unauthenticated users are redirected to the matching login page. Role comes from a JWT (`role` or `userType` claim)
- Auth = JWT cookies. `accessToken` is client-readable (non-httpOnly, for role checks in `proxy.ts`/`apiRequest.ts`); `refreshToken` is httpOnly. Both are set by `setAuthCookies()` in `src/services/admin-auth/index.ts`
- API layer: `src/services/<module>/index.ts` files are Server Actions (`"use server"`) that call `apiRequest()` from `@/lib/apiRequest`. Requests hit `${NEXT_PUBLIC_API_URL}/<endpoint>` (`.env`, default `http://localhost:5000/api/v1`), attach `Authorization: Bearer` **only when `authRequired: true`**, auto-refresh on 401, and return the parsed JSON body directly (never a `fetch` `Response`)
- Feature access control: `PermissionProvider` / `usePermissions` (`src/components/providers/permission-provider.tsx`) against permission strings in `src/constant/permissions.ts` (`model.action`, e.g. `role.create`). Add new permissions there, not inline
- shadcn/ui with a custom `base-vega` style (`components.json`), components in `src/components/ui`. Tailwind v4 with CSS-first config in `src/app/globals.css`

## Conventions

- Client forms: `react-hook-form` + `zod` schemas in `src/validation/<module>/`, mirroring `src/services/<module>/`
- Query params: pass as `QueryParams[]` (`{ label, value }`); services convert with `new URLSearchParams`
- Mutating services call `revalidatePath()` (e.g. after deletes) so server-rendered pages refresh
- New remote `next/image` hosts must be added to `images.remotePatterns` in `next.config.ts` (currently only picsum.photos and images.unsplash.com)
- Backend errors arrive as JSON bodies with a `success` flag — check it before reading `data`
