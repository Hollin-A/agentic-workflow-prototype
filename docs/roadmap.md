# Roadmap

## v0 — Prototype (this repo)

The vertical slice. Proves the full agentic loop works before building the full system.

**In scope:**
- Single page with three editable surfaces: hero title, hero subtitle, theme accent color
- Corner-icon comment affordance on each editable element
- Comment submission API with IP-based rate limiting (3/hour)
- Inngest workflow: moderation → generation → schema validation → PR → auto-merge → deploy
- Claude Haiku for moderation, Claude Sonnet for generation
- Structured output via Anthropic tool use, validated against Zod schemas
- Real-time activity feed (Supabase Realtime)
- Theme and content layers only
- Anonymous-only submissions
- CI allowlist: agent PRs may only touch `content/hero.json` and `theme/tokens.json`

**Out of scope (deferred to v1):**
- Override layer
- Element locking
- X-ray view
- OAuth login
- Owner ops panel
- Contributor notifications

**Done when:** the happy path works end-to-end, moderation rejects bad-faith comments, schema validation catches invalid LLM output, the activity feed updates without a page refresh, and rate limiting blocks excessive submissions.

---

## v1 — Full system

Built on top of v0 once the prototype is validated. Order reflects priority.

1. **Override layer** — third Zod schema, third editable file (`overrides/index.json`), `update_override` tool. Highest-value addition: unlocks the most interesting agent routing demo.
2. **X-ray view** — toggle that overlays `data-edit-id` labels, comment pins, and a pipeline sidebar. Three entry points: ambient pill button, `⌘.` shortcut, click-from-feed. Includes deep-linkable state (`?xray=hero.title`) so specific elements can be shared or linked from the activity feed.
3. **Element locking + resolved edit tracking** — when a comment for an element is active in the pipeline, that element is locked: the comment affordance is disabled and a "being updated" indicator shown. Unlocks when the comment reaches `merged` or `rejected`. Also adds `resolved_edit_id` to the database — the actual element the agent wrote to — distinct from the `edit_id` captured at click time (which can diverge when a visitor comments on one element about another). The activity feed and X-ray surface the resolved target.
4. **Live page content refresh** — page content is statically generated at build time; visitors must refresh after a Vercel redeploy to see agent changes. Fix via ISR (`revalidate` on the fetch) so the page re-renders automatically once the new deployment is live.
5. **OAuth login** (GitHub + Google) — higher rate limits, real attribution, "your suggestion is live" notification.
6. **Owner ops panel** — moderation queue, kill switch, spend cap config, ban controls.

---

## Later / open questions

- **Voting** — vote table, vote endpoint, queue ordering by votes. Skipped in v1 in favour of element locking as the simpler and more explainable conflict resolution mechanism. Worth revisiting at scale when multiple simultaneous submissions per element become common.
- **Conflict detection + decision windows** — depends on voting; deferred alongside it.
- **Vercel deploy webhook** — POST to an API route when a deployment completes; update the comment row status from `merged` to `deployed` so the activity feed reflects the true live state. Currently the feed shows "Merged — deploying" because the pipeline has no signal for when Vercel finishes.
- Portfolio teaser integration — a small scoped version embedded on a separate portfolio site
- GHAW hybrid for the PR step — adds defence-in-depth if the project gets serious attention
- PostHog for product analytics — optional, decide based on whether traffic data is useful
