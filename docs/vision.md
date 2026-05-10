# Vision

## What this project is

A standalone web app that demonstrates two skill axes simultaneously: **polished frontend** (interaction design, animation, real-time UI) and **agentic workflow orchestration** (multi-step pipelines, structured output, observability, safety).

Visitors leave Figma-style comments on elements of a fake product's marketing site. An LLM-driven pipeline interprets each comment, generates a constrained code change, validates it, opens a PR, and redeploys. The crowd collectively shapes the site over time.

## The fictional product

The marketing site is for a fake SaaS product — a placeholder canvas that lets the agentic system demonstrate real judgment work: rewriting copy, picking palettes that harmonise, deciding which element a comment was actually about. The format is universally legible to any technical reviewer.

## Why this concept

The agent does *judgment* work, not just mechanical asset placement. Every reviewer recognises a SaaS landing page and immediately maps the workflow to design iteration that real teams do every week. Constraints are tractable — a small set of editable zones, theme tokens, copy strings — no image generation needed.

## What success looks like

**Prototype (this repo):** The full comment-to-deploy loop works end-to-end on three editable surfaces. Every architectural assumption is validated before building the full system.

**v1:** Layered scope model live (theme, override, content layers), voting, conflict detection, X-ray view, OAuth login, owner ops panel.

## The two skill axes

**Frontend:** The live site looks and feels like a real product. Agent activity surfaces as ambient UI — a small queue indicator, an activity feed, an X-ray toggle that reveals the pipeline in-place. The site is not a tool with a content area; it's a continuous artifact whose evolution is itself the demo.

**Agentic orchestration:** The pipeline is durable, observable, and safe. Each step is explicit and retryable. The LLM is constrained to structured output against narrow schemas. CI enforces an allowlist of files the agent is permitted to modify. The system fails safely and loudly.
