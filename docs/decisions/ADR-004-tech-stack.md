# ADR-004 · Tech stack

**Status:** Decided

## Question

What concrete tools and frameworks should the project be built with?

## Decision

A free-tier-friendly stack chosen to ship fast and read as professional to any reviewer:

| Concern | Choice | Why over alternatives |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind | Widely legible, App Router fits the static + dynamic split, Tailwind keeps styling fast |
| Schema / validation | Zod | Single source of truth for API validation, runtime types, and Anthropic tool-use definitions |
| Database + realtime | Supabase (Postgres + Realtime) | Postgres for storage, built-in Realtime for activity feed without custom websocket infra |
| Auth (v1) | Supabase OAuth (GitHub + Google) | Built into Supabase, no separate auth service needed |
| Workflow orchestration | Inngest | Purpose-built for durable multi-step LLM workflows, free tier covers expected volume, trace UI doubles as agent observability. Chosen over Trigger.dev (comparable but less mature) and BullMQ (more setup, no built-in observability) |
| LLM | Anthropic API | Claude Haiku for cheap moderation pass, Claude Sonnet for generation. Tool use guarantees structured output format |
| Repo automation | Octokit (`@octokit/rest`) | Official GitHub REST client, straightforward for branch + PR + merge operations |
| Hosting | Vercel | Auto-deploy on main, per-PR preview deploys, free tier sufficient |
| Captcha (v1) | Cloudflare Turnstile | Free, privacy-friendly, less friction than reCAPTCHA |

## Orchestration detail

Inngest was chosen over the alternatives because the project's workflow shape — user-comment-triggered, real-time-UI-updating, with a multi-step pipeline — matches Inngest's sweet spot. Each pipeline step (moderation, generation, validation, PR creation, CI wait, merge, notify) becomes an explicit durable step with retries and visible traces.

GitHub Agentic Workflows (GHAW) was considered for the repo-touching step but not adopted in v0. The agent's output is already heavily constrained by structured-output schemas, a CI allowlist, and a daily spend cap — adding GHAW buys defence-in-depth that is not load-bearing for a prototype.

## Cost model

Infrastructure runs on free tiers. The only variable cost is the LLM API. With the structured-output design, each comment costs roughly $0.005–$0.02 end-to-end. A daily spend cap (configurable) hard-stops the queue when reached.
