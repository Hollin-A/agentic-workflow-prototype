# agentic-workflow-prototype

A prototype that proves the full agentic loop works end-to-end. Visitors leave comments on elements of a fake product's marketing site. An LLM-driven pipeline interprets each comment, generates a constrained code change, validates it, opens a PR, and redeploys. The crowd collectively shapes the site over time.

This repo is the vertical slice — the smallest version of the system that touches every layer. Once this works, scaling up to the full vision is more of the same.

## What this prototype proves

A visitor leaves a comment on an element → the system moderates it → generates a structured patch via LLM → opens a PR → CI validates → PR auto-merges → Vercel redeploys → the activity feed updates in real time.

If that loop works end-to-end, every architectural assumption is validated.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Schema & validation | Zod |
| Database + auth + realtime | Supabase |
| Workflow orchestration | Inngest |
| LLM | Anthropic API (Haiku for moderation, Sonnet for generation) |
| Repo automation | Octokit (GitHub API) |
| Hosting | Vercel |

## Running locally

You need two terminals.

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — Inngest dev server (required for workflows to fire)
npx inngest-cli@latest dev
```

Visit `http://localhost:3000`. The Inngest trace UI runs at `http://localhost:8288`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. The same variables need to be set in Vercel project settings for production.

## Docs

- [`docs/vision.md`](docs/vision.md) — what this project is and where it's going
- [`docs/architecture.md`](docs/architecture.md) — system design and data flow
- [`docs/roadmap.md`](docs/roadmap.md) — what's in v0, what's deferred to v1
- [`docs/decisions/`](docs/decisions/) — architecture decision records
