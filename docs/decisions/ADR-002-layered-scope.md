# ADR-002 · Edit scope: how the three layers compose

**Status:** Decided

## Question

When someone says "make the whole site orange" and someone else says "make this button blue," how does the system reconcile global and local edits without one silently overwriting the other?

## Options considered

- **Last-write-wins on a flat config** — late writes silently undo earlier ones, no story for per-element exceptions
- **Vote-based winner, no scope model** — single winner per disputed element, but can't express "this one different from everything else"
- **Element-only comments, no global edits** — sidesteps the problem but removes interesting agent routing work
- **Layered scope model** — theme layer (global tokens) + override layer (per-element exceptions) + content layer (copy strings)

## Decision

Three layers, in order of specificity:

**Theme** — global design tokens: accent color, font family, base spacing, surface tones. A suggestion like "make everything orange" lands here and cascades to all surfaces that reference the token.

**Override** — per-element exceptions. "Make this button orange" creates an entry that pins that element's value regardless of what the theme layer does. Persists until explicitly cleared.

**Content** — copy strings, alt text, ordering. Last-write-wins; real conflicts are rare because copy edits to the same field by different people are treated as sequential refinements, not conflicts.

## Why this matters

This is the most important architectural call for the agent, because it determines what routing decisions are interesting and what failure modes are possible.

Two changes that would collide under a flat model — "make the theme rust" and "but keep this button orange" — both deploy cleanly because they live on different layers. That routing decision is the agentic logic working visibly, and it's the kind of thing a reviewer remembers.

The agent's job becomes: read the comment + the targeted element's `data-edit-id`, decide which layer to write to, validate the patch against that layer's Zod schema, emit a structured patch. The routing decision is captured in the agent's reasoning trace and visible in the activity feed.

## Prototype scope

v0 implements **theme** and **content** layers only. The **override** layer is the first thing added in v1 — it's the highest-value addition after the base loop works.
