# Starting the Next Project

A guide for moving from this prototype to a clean, public-ready implementation.

This repo is the reference implementation. The next project should be built from scratch with this as a reference — not copy-pasted, not forked. The reasoning and the process are below.

---

## Why build from scratch (not copy-paste)

The copy-paste-and-clean approach feels efficient but isn't. This codebase carries a thousand tiny decisions made over 14 phases — variable names that made sense in context, comments that reference deleted code, half-used utilities, components that import things you forgot to remove. You'd catch maybe 70% of the cruft. The remaining 30% becomes "why is this here?" mysteries in the new repo.

You'd also inherit bugs that were only learned by using the system — the popover positioning bug, the `--accent` portal bug, the kill switch revalidation bug. Those are fixed *here*, but a fresh build forces deliberate thought about each piece, which is when design issues surface.

The git history is the smallest issue. The bigger issue is that copy-paste preserves the shape of an iterative build, not the shape of a deliberate one.

Building fresh also lets you **design the content model first** — sections, types, Zod schemas (see [`section-list-model.md`](section-list-model.md)) — before any UI code is written. In this repo, the content model evolved alongside the UI. In the next one, the content model is the foundation; the UI follows from it.

---

## The flow: Claude as typist, this repo as reference

You don't have to rebuild from memory. Use Claude as the typist and this repo as the reference.

1. Set up the new repo with the basics — Next.js, Tailwind, env files, Supabase project, Inngest account, GitHub OAuth app
2. Open this repo and the new repo side by side in your editor
3. For each piece, point Claude at the reference: *"Look at `components/EditableElement.tsx` in the reference repo. Build the equivalent here. Skip these things we're dropping: [list]. Add these things we're changing: [list]."*
4. Claude writes the new version with the improvements baked in
5. Review, adjust, move on

This is faster than copy-paste-clean for anything non-trivial because you're not fighting tangled context — you're stating intent directly. The reference is there for the bits you don't want to re-derive (the Inngest function structure, the GitHub commit helper, the auth callbacks). Those you can pull over near-verbatim.

Keep this repo open on your screen during the build. Claude works best when you point at specific files. *"Look at this file, do the equivalent here"* is a much better prompt than *"build the comment API."*

---

## Build order

Each step has a clear endpoint. Build one thing, verify it works, move on. The **first git commit** happens after step 6 or 7 — when the system is fully working — so the public-facing git history starts at "complete working implementation," not "wired up the Inngest client."

### 1. Schemas first
Write `lib/schemas.ts` for the new section list model — see [`section-list-model.md`](section-list-model.md). This forces commitment to the content shape before any UI exists. Includes:
- The discriminated union for section types
- Theme tokens schema
- Comment schema
- Tool definitions for the agent

### 2. Page rendering (static)
Build the section renderer registry (`components/sections/`) and `app/page.tsx`. No editing yet — just static render of a hand-written `content/sections.json`. Verify every section type renders correctly.

### 3. Pipeline
Bring over the Inngest function (`inngest/functions/processComment.ts`), update it for the new `update_sections` tool. The pipeline structure is unchanged: load → moderate → kill switch check → generate → validate → PR → merge. Test by sending a manual Inngest event.

### 4. Editing surface
- `components/EditableElement.tsx`
- `components/CommentPopover.tsx`
- `app/api/comment/route.ts`
- Element locking logic

Test the full submit-to-merge cycle end-to-end.

### 5. Activity panel and X-ray
- `XRayProvider`, `XRayPill` cluster, `ActivityPanel`, `XRaySidebar`
- Real-time subscription via Supabase
- The Option B status dot, inline history expansion

### 6. Admin panel + hardening
- `/admin` route gated by `ADMIN_EMAIL`
- Stats grid, kill switch, activity log
- **Held-comment moderation queue** — per [`security.md`](security.md), this time built in from day one rather than deferred
- Honeypot field on the comment form
- GitHub-required submissions (no anonymous)
- Set the Anthropic spend cap in the console before launch

### 7. Content
Write the actual meta-documentation sections that go live. See [`section-list-model.md`](section-list-model.md) for guidance on initial section count and structure. The agent in the next project should be given the [`system-reference.md`](system-reference.md) document so it can answer "make this more technical" without hallucinating facts.

---

## Time estimate

Probably 1.5x the time of copy-paste-clean. You get a cleaner codebase, deliberate architecture, no inherited bugs, no cruft, and the chance to fix the small design regrets. For a project you want to show publicly, that's worth it.

---

## Carry these docs across

The next project's `docs/` should include:

- [`section-list-model.md`](section-list-model.md) — content model spec (build from this)
- [`security.md`](security.md) — hardening + held queue spec
- [`system-reference.md`](system-reference.md) — agent reference doc, also referenced in the generate-patch system prompt
- A fresh `architecture.md` reflecting the section list model
- A fresh `README.md` written as launch material, not a build journal

Leave the development plan and ADRs behind. They're artifacts of this prototype's evolution and don't belong in the public repo.
