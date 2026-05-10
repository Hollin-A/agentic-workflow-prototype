# ADR-003 · LLM constraints: structured output over freeform code

**Status:** Decided

## Question

What does the LLM actually emit, and how is it prevented from going off the rails?

## Options considered

- **Freeform code edits** — LLM writes arbitrary diffs against the repo. Maximum expressiveness, maximum risk, expensive to validate, and one bad output can break the build or worse.
- **Structured output against narrow schemas** — LLM emits a JSON patch matching a defined schema for the target layer. Validated before any commit happens.

## Decision

Structured output, schema-validated, narrow scope. The LLM is never asked to write arbitrary code.

For each layer (theme, content, override) there is a Zod schema describing exactly what fields can be set and what values are allowed. The same Zod schemas serve as the source of truth for API validation, runtime type checking, and Anthropic tool-use definitions. The LLM's job is to read the comment + the targeted element + the current value of the relevant file slice, and emit a structured patch via tool use.

The patch is validated against the schema before any commit happens. Anything that fails validation is rejected with a clear error and never reaches the repo.

## Why this matters

This is the single most important safety and cost decision in the system.

**The LLM cannot break the build** — it cannot touch build configuration.
**The LLM cannot inject scripts** — the schema has no script field.
**The LLM cannot exfiltrate data** — those files are not in scope.
**Cost is bounded** — small structured outputs are cheap; the system prompt + relevant file slice fit in a few thousand tokens.
**Failure modes are predictable** — there is a finite vocabulary of valid changes.

The CI allowlist (see `architecture.md`) is a second wall: even if structured output somehow produced a path outside `content/` or `theme/`, CI would block the PR before merge.

## Why this makes the agent more interesting, not less

Instead of competing on raw code generation, the system's value-add is routing intelligence and creative copy/design judgment within constraints. That is where smaller, cheaper models shine and where the demo's quality is most legible to a reviewer.
