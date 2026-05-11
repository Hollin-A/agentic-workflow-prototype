# Section List Model — Design for the Next Project

This document specifies the content model for the next project. It replaces the fixed-shape JSON files (`content/hero.json` with `title` + `subtitle`) with a dynamic array of typed sections. This unlocks structural edits — split, merge, reorder, add, remove — without compromising the agent's safety model.

---

## Why this exists

The current architecture has a credibility ceiling: visitors can only see *value* changes (a word swapped, a color shifted). A skeptical viewer can dismiss the whole project as "just a database with extra steps." Adding the ability to restructure the page proves the agent is doing real work — and it does so without crossing the line into having the agent write JSX or CSS code.

The agent continues to manipulate structured data only. Humans write the components that render that data. The CI allowlist still blocks all code changes. Auto-merge still works. Nothing about the safety guarantee weakens.

---

## The data model

The page is rendered from a single source: `content/sections.json`. This file is an ordered array of section objects.

```json
{
  "sections": [
    {
      "id": "intro",
      "type": "heading",
      "level": 1,
      "text": "How this site edits itself"
    },
    {
      "id": "elevator-pitch",
      "type": "paragraph",
      "text": "Every word on this page was suggested by a stranger and applied by an AI agent through a real GitHub pull request."
    },
    {
      "id": "how-it-works-callout",
      "type": "callout",
      "tone": "info",
      "title": "The 60-second cycle",
      "body": "You suggest a change. An agent moderates it, generates a patch, opens a PR, merges it. Vercel rebuilds. The site updates."
    },
    {
      "id": "pipeline-list",
      "type": "ordered-list",
      "items": [
        "Moderation — Claude Haiku checks for spam or off-topic",
        "Generation — Claude Sonnet produces a structured patch",
        "Validation — Zod schemas enforce the patch shape",
        "Commit — Octokit opens a PR against the repo",
        "Merge — CI runs the allowlist check; if it passes, auto-merge",
        "Deploy — Vercel rebuilds; ISR refreshes the page"
      ]
    },
    {
      "id": "see-the-prs",
      "type": "link-block",
      "text": "Every change has a real pull request →",
      "href": "https://github.com/.../pulls?q=is:pr+author:app"
    }
  ]
}
```

Each section has a stable `id` (used as the `edit_id`, e.g. `section.elevator-pitch`) and a `type` that determines which component renders it.

---

## Supported section types

Start with a small catalog. Add more types only when content demands it.

| Type | Fields | Use case |
|---|---|---|
| `heading` | `level` (1–3), `text` | Section titles |
| `paragraph` | `text` | Body prose |
| `callout` | `tone` (info / warn / success), `title`, `body` | Highlighted asides |
| `ordered-list` | `items[]` | Numbered steps |
| `bullet-list` | `items[]` | Unordered points |
| `code-block` | `language`, `code` | Inline code samples |
| `link-block` | `text`, `href` | CTA-style links |
| `diagram` | `caption`, `slug` (references a pre-built SVG component by name) | Architectural diagrams |
| `quote` | `text`, `attribution` | Pull quotes |

The `slug` field on `diagram` is the safety trick: the agent can reference a pre-built diagram by name but cannot invent new ones. The component file maps slugs to actual SVG/React components.

---

## What the agent can do

With this model, suggestions can produce:

- **Word-level edits** — same as today (rewrite the text inside a section)
- **Split** — one paragraph becomes three (suggest: "break this into three points")
- **Merge** — three short paragraphs become one (suggest: "combine these")
- **Reorder** — move sections (suggest: "put the diagram before the explanation")
- **Add** — insert a new section (suggest: "add a callout warning about the kill switch")
- **Remove** — drop a section (suggest: "this paragraph is redundant, delete it")
- **Type change** — paragraph → callout (suggest: "make this stand out more")
- **Visibility** — `visible: true | false` field on each section (suggest: "hide the testimonials for now")

What the agent **cannot** do:

- Invent new section types (the renderer registry is hardcoded)
- Write arbitrary HTML or markup (every field is a typed string)
- Reference components or assets that don't exist (diagram slugs are validated)
- Modify the rendering logic, styling, or any component code

---

## Zod schema

```ts
const SectionBaseSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  visible: z.boolean().default(true),
})

const HeadingSchema = SectionBaseSchema.extend({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string().min(1).max(160),
})

const ParagraphSchema = SectionBaseSchema.extend({
  type: z.literal('paragraph'),
  text: z.string().min(1).max(800),
})

const CalloutSchema = SectionBaseSchema.extend({
  type: z.literal('callout'),
  tone: z.enum(['info', 'warn', 'success']),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
})

const OrderedListSchema = SectionBaseSchema.extend({
  type: z.literal('ordered-list'),
  items: z.array(z.string().min(1).max(200)).min(1).max(20),
})

// ... etc for each type

const SectionSchema = z.discriminatedUnion('type', [
  HeadingSchema,
  ParagraphSchema,
  CalloutSchema,
  OrderedListSchema,
  // ...
])

export const SectionsFileSchema = z.object({
  sections: z.array(SectionSchema).min(1).max(50),
})
```

The discriminated union is the key: each section's `type` literal forces the rest of the shape. The validator catches bad patches before they ever reach GitHub.

---

## Tool definitions for the agent

A single tool covers all section operations:

```ts
export const UpdateSectionsTool = {
  name: 'update_sections',
  description:
    'Modify the sections array. Use this for any change to page content or structure — ' +
    'rewriting text, splitting, merging, reordering, adding, removing, or hiding sections.',
  input_schema: {
    type: 'object',
    properties: {
      sections: {
        type: 'array',
        description:
          'The complete new sections array. Return the full array, not just the changes. ' +
          'Preserve unchanged sections exactly. Generate stable ids for new sections.',
        items: { /* mirror SectionSchema */ }
      }
    },
    required: ['sections']
  }
}
```

The agent always returns the *complete* sections array, not a diff. This is simpler than diff-based mutations and easier to validate. The file write is a wholesale replacement; the Zod schema validates the result.

Theme and override tools continue separately — they're unchanged.

---

## Component model

The page renders sections through a registry:

```tsx
// components/sections/registry.ts
import HeadingSection from './HeadingSection'
import ParagraphSection from './ParagraphSection'
// ...

export const SECTION_RENDERERS = {
  heading: HeadingSection,
  paragraph: ParagraphSection,
  callout: CalloutSection,
  'ordered-list': OrderedListSection,
  // ...
}

// app/page.tsx
import { SECTION_RENDERERS } from '@/components/sections/registry'

export default function Page() {
  const { sections } = readSections()
  return (
    <main>
      {sections.filter(s => s.visible).map(section => {
        const Renderer = SECTION_RENDERERS[section.type]
        return (
          <EditableElement key={section.id} editId={`section.${section.id}`} tag="div">
            <Renderer {...section} />
          </EditableElement>
        )
      })}
    </main>
  )
}
```

Every section becomes an `EditableElement` automatically. Visitors hover, suggest, watch the structure change.

---

## What stays the same

Everything else carries over from the current architecture unchanged:

- `EditableElement` and `XRayProvider` — the editable surface
- `CommentPopover` — the submission UI
- `ActivityPanel` — the floating feed
- `XRaySidebar` — the per-element view
- `/admin` — stats, kill switch, activity log
- Rate limiting, GitHub OAuth, element locking, ISR
- The Inngest pipeline structure (load → moderate → generate → validate → PR → merge)
- The CI allowlist (it now allows `content/sections.json` and `theme/`)
- The held-comment moderation queue (per the security doc)

Only the content model changes shape. Components and infrastructure are reusable.

---

## Trade-offs

**Pros:**
- Structural edits unlock the credibility story
- All changes still go through real PRs with real diffs
- Auto-merge stays safe — the agent never writes code
- Section types are extensible — add new types when content needs them
- The discriminated-union Zod schema is genuinely robust

**Cons:**
- More upfront design — you need to decide on the section catalog before launch
- Section components must exist before the agent can use them — no "the agent invented a new layout" magic
- The renderer registry is one more thing to keep in sync
- For very long pages, the agent generating the full sections array on every edit costs more tokens than a per-field patch (mitigated by Sonnet's pricing being reasonable, but worth noting at scale)

---

## What to build for the next project's launch

A small but interesting initial sections array. The page should:

1. Open with a heading and one-paragraph elevator pitch
2. Have a numbered list showing the 6-step pipeline
3. Include a callout about the kill switch / safety model
4. End with a link to the PRs

About 8–10 sections at launch. Enough that splits, merges, and reorders are meaningful, not so many that the page is overwhelming.

The page should explicitly invite structural suggestions: *"Try suggesting: 'split this paragraph into three points,' 'add a section about moderation,' 'put the diagram first.'"* Make the structural editability part of the pitch.
