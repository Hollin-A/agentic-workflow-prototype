# ADR-001 · Element identity: how the system knows what was clicked

**Status:** Decided

## Question

Comments have to be associated with stable element references that survive code changes, refactors, and responsive layouts.

## Options considered

- **Click coordinates (x, y)** — brittle under any layout change
- **CSS selector path** — stable until you refactor the markup
- **Component name + position** — ties the agent to framework internals
- **Explicit `data-edit-id` attributes** — authored by the developer, human-readable, decoupled from markup structure

## Decision

Explicit `data-edit-id` attributes. Each editable element gets a stable, human-readable ID using hierarchical dot notation:

```
hero.title
hero.lede
features.card-1
features.card-2.title
theme.accent
```

The ID is the unit of address across the entire system — it appears in agent prompts, activity feed entries, PR commit messages, Supabase rows, and moderation logs. Because it's a deliberate authoring choice, the surface of editable elements is explicit: anything without an ID is intentionally not editable.

## Why this matters

Hierarchical IDs give the agent better routing signal than flat IDs. `features.card-2.title` tells the agent it's targeting the title of the second feature card, not some arbitrary element. This signal informs which layer to write to (ADR-002) and how to phrase the structured patch.
