# Architecture

## System overview

A Next.js app where every editable element on the page carries a `data-edit-id` attribute. Visitors leave comments on those elements. Each comment triggers a durable Inngest workflow that moderates, generates a structured patch, validates it, commits it to a branch, opens a PR, waits for CI, and merges. Vercel auto-deploys on merge. Supabase Realtime pushes status updates to connected clients.

## Editable elements

Every element the agent is allowed to modify has a `data-edit-id` attribute with a hierarchical dot-notation ID:

```
hero.title
hero.lede
hero.cta-primary
features.card-1
theme.accent
```

The ID appears in agent prompts, activity feed entries, PR commit messages, and moderation logs. Anything without an ID is intentionally not editable. See [ADR-001](decisions/ADR-001-element-identity.md).

## The three-layer edit model

Edits are routed to one of three layers based on the comment and target element. See [ADR-002](decisions/ADR-002-layered-scope.md).

| Layer | What it holds | Example |
|---|---|---|
| **Theme** | Global design tokens — accent color, font, spacing | `"make everything more muted"` |
| **Override** | Per-element exceptions that pin a value regardless of theme | `"keep this button the old orange"` |
| **Content** | Copy strings, alt text | `"make this headline punchier"` |

The agent's routing decision — which layer to write to — is visible in the activity feed and X-ray view.

## Agent pipeline

Each comment submission triggers this Inngest workflow:

```
1. Comment received → persisted to Supabase, status: queued
2. Moderation (Claude Haiku) → classifies as safe / unsafe / off-topic
   └─ unsafe/off-topic → status: rejected, pipeline stops
3. Generation (Claude Sonnet) → emits a structured JSON patch via tool use
4. Schema validation (Zod) → patch validated against the target layer's schema
   └─ invalid → error surfaced in Inngest trace, pipeline stops
5. Commit + PR (Octokit) → branch created, file patched, PR opened
6. CI (GitHub Actions) → allowlist check: only permitted files may be changed
   └─ disallowed file touched → CI fails, PR blocked
7. Auto-merge → squash merge to main
8. Vercel redeploy → triggered automatically on main push
9. Status update → Supabase row updated, Realtime notifies connected clients
```

Each step is durable and retryable. Failures surface in the Inngest trace UI.

## The CI allowlist (safety net)

The most important safety layer. A GitHub Actions workflow runs on every PR and rejects any change that touches a file outside the permitted set:

```
content/hero.json
theme/tokens.json
```

This means the agent cannot modify application code, configuration, auth, or anything else — regardless of what the LLM emits. The structured output schemas are the first wall; the CI allowlist is the second.

## Data flow diagram

```
Visitor                App                    Inngest              GitHub / Vercel
  │                     │                        │                       │
  │── comment submit ──▶│                        │                       │
  │                     │── inngest.send ────────▶│                       │
  │                     │                        │── moderate ──▶ Haiku  │
  │                     │                        │── generate ──▶ Sonnet │
  │                     │                        │── validate (Zod)      │
  │                     │                        │── commit + PR ────────▶│
  │                     │                        │                       │── CI check
  │                     │                        │                       │── auto-merge
  │                     │                        │                       │── Vercel deploy
  │                     │◀── Realtime update ────│◀── status update ─────│
  │◀── feed update ─────│                        │                       │
```

## File structure (prototype)

```
app/
  layout.tsx
  page.tsx                    # The editable marketing page
  api/
    comment/route.ts          # POST /api/comment
    inngest/route.ts          # Inngest webhook handler
components/
  EditableElement.tsx         # Wraps any element, adds corner comment icon
  CommentPopover.tsx          # Comment submission dialog
  ActivityFeed.tsx            # Realtime activity feed
content/
  hero.json                   # { title, subtitle } — agent can edit this
theme/
  tokens.json                 # { accent } — agent can edit this
lib/
  supabase.ts
  github.ts
  anthropic.ts
  schemas.ts                  # Zod schemas — single source of truth
inngest/
  client.ts
  functions/
    processComment.ts         # The full agent pipeline
supabase/
  migrations/
    0001_init.sql
.github/
  workflows/
    check-allowlist.yml       # CI safety net
```
