# AI Agent Instructions — Freelancer Finance SaaS (MVP)

Context for OpenCode / Cursor / Claude Code sessions. Every line here was verified against actual config and source code.

## Critical facts

- **No `src/` folder** — code lives at root: `app/`, `features/`, `components/`, `lib/`, `models/`, `services/`, `scripts/`, `types/`. The feature-per-folder convention in the old AGENTS.md described a `src/` layout that does not exist. Each `features/x/` owns `components/`, `actions.ts`, `schemas.ts`.
- **Tailwind v4** — CSS-first config via `@import "tailwindcss"` + `@theme` in `app/globals.css`. Custom design tokens (Notion palette: `bg-canvas-soft`, `text-ink-secondary`, `shadow-elevation-1`, etc.) are in `tailwind.config.ts` — do not invent new tokens, propose additions there. `globals.css` has shadcn defaults; the config tokens override them.
- **`CLAUDE.md`** just references `@AGENTS.md` — this file is the single source of instructions.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) |
| `npm run seed` | Seeds DB via `scripts/seed.js` (CommonJS, loads `.env.local` manually) |

No test runner is configured. There is no typecheck script — the TS build step handles it. No pre-commit hooks.

## Architecture

- **Server Components by default.** Push `"use client"` only to leaf interactivity nodes.
- **Mutations via Server Actions** (`"use server"`), not API routes — except webhooks. All return `{success, data/error}` consistently.
- **Auth.js v5 beta** (Credentials provider). Config split: `auth.config.ts` (callbacks, pages, route guards) + `auth.ts` (NextAuth init with providers). Middleware-ish route protection in `proxy.ts` using `auth()` from `auth.config.ts`.
- **MongoDB + Mongoose** — cached connection in `lib/db.ts` (env var: `DATA_BASE_URL`). Strict schemas with `{ timestamps: true }`. Soft deletes on financial records: `isDeleted: Boolean` + `deletedAt: Date`.
- **All input validated by Zod** at the top of each Server Action before touching Mongoose.

## Scope (from MVP_PLAN.md)

Current phases: 0–5 all marked complete. Features not to build: multi-currency, teams/permissions, recurring invoices, OCR, bank sync, reports beyond dashboard charts, mobile app.

## Quirks & notes

- `lib/utils.ts` — only exports `cn()` (shadcn), `formatDate()`, `serialize(JSON.parse(JSON.stringify(obj)))`.
- No barrel (`index.ts`) exports from features — import by direct path.
- Store design tokens from `DESIGN.md` in `tailwind.config.ts`, not hardcoded. Semantic status colors (`success`, `warning`, `destructive`, `info`) are project-specific additions — DESIGN.md lacks them.
- `proxy.ts` at root exports the auth middleware guard — do not delete or edit unless changing route protection rules.
- `README.md` is outdated (describes an old expenses-only prototype); do not rely on it.
- Seed demo login: `demo@freelancer.com` / `password123`.
- Environment required: `DATA_BASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GEMINI_API_KEY`, `CLOUDINARY_*` vars.
