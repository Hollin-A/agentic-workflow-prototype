# Contributing

Git conventions for this repo — followed by both humans and the LLM agent.

## Branch naming

```
<type>/<short-description>
```

Types:
- `feat/` — new feature
- `fix/` — bug fix
- `chore/` — maintenance, dependency updates, config
- `docs/` — documentation only
- `refactor/` — code restructure, no behaviour change
- `test/` — adding or fixing tests

Examples: `feat/comment-popover`, `fix/inngest-retry-logic`, `docs/adr-layered-scope`

## Commit messages

Follows [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <short summary>

[optional body — explains why, not what]
```

Rules:
- Imperative mood: "add login" not "added login"
- Lowercase, no period at end
- Summary line under 72 characters
- Body explains the *why* when it's not obvious from the summary

Examples:
```
feat(comment): add corner-icon affordance to editable elements
fix(inngest): handle missing tool_use block in Anthropic response
chore: upgrade @anthropic-ai/sdk to v0.95
docs: add ADR for layered scope model
```

## PR titles

Mirror the commit format: `<type>(<scope>): <description>`

## Agent-opened PRs

When the LLM pipeline opens PRs via Octokit, commit messages follow a separate convention to distinguish agent commits from human ones:

```
agent(<edit-id>): <short description of the change>
```

Example: `agent(hero.title): rewrite headline to declarative voice`

This keeps agent activity clearly identifiable in the git history.

## What not to commit

- `.env.local` or any file containing secrets
- Files outside `content/` and `theme/` in agent-opened PRs — CI will block these anyway
