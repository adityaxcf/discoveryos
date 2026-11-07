# DiscoveryOS — Product Discovery & Research Intelligence

DiscoveryOS is a full-stack research analysis demo that organizes customer feedback into themes, scores product opportunities, links supporting quotes, and produces a synthesis report.

## What it does

- Browse and filter sample research sources.
- Extract candidate insights from source text.
- Group insights using predefined keyword-based themes.
- Estimate sentiment, severity, business impact and opportunity scores using deterministic rules.
- Link selected source quotes to themes.
- View segment-oriented summaries and a generated product discovery report.
- Ask questions through a rule-based interface that selects responses based on recognized question patterns.

**Important:** The current implementation does not call an OpenAI model. The analysis pipeline is deterministic and keyword/rule based. The Ask interface uses predefined question-pattern matching, not an LLM. Scores and sentiment labels are heuristic signals and should be validated by a human researcher before product decisions.

## Technology

- Next.js 14 App Router, React 18 and TypeScript
- Tailwind CSS
- Supabase JavaScript client and a Supabase-hosted database
- Recharts and Lucide React

The current database client is implemented in `lib/db.ts`. It reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY` and is intended for server-side use. This repository's active data layer is Supabase; older references to SQLite in this README are outdated.

## Local setup

1. Use Node.js 20 and npm.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Configure the Supabase URL and server-side secret key in `.env.local`.
5. Ensure the Supabase project has the tables and schema expected by the application.
6. Start the development server with `npm run dev`.
7. Open `http://localhost:3000`.

Never expose `SUPABASE_SECRET_KEY` through a `NEXT_PUBLIC_*` variable or import the server database client into browser-side components. Do not commit local environment files.

## Demo data and project scope

The initialization route creates a shared default project named `proj-default` and inserts the bundled demo dataset when that project does not already exist. This is a demonstration setup, not a user-isolated workspace model.

## Security and production limitations

- The current middleware does not authenticate users.
- API routes accept project identifiers and access database records without user-level authorization.
- The server-side Supabase secret key has elevated privileges and must remain server-only.
- The default project is shared; there is no verified per-user project ownership or row-level access enforcement in the application routes.
- Before using real or private research data, implement authentication, server-side authorization and project ownership checks; configure and test Supabase Row Level Security policies; validate API request bodies; and add rate limiting and operational logging.
- Do not treat the current demo dataset or heuristic opportunity scores as production research conclusions.

## Main project areas

- `app/` — Next.js pages and API route handlers
- `components/` — reusable interface components
- `lib/ai-pipeline.ts` — deterministic insight extraction, keyword classification, scoring, evidence selection and report generation
- `lib/db.ts` — server-side Supabase client
- `lib/demo-data.ts` — bundled demo research data
- `lib/types.ts` — TypeScript domain types

## Build

- `npm run dev` — local development
- `npm run build` — production build
- `npm start` — production server
