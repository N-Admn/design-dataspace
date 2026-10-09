# Brief for ChatGPT — ideating on CivicDataSpace so Claude Code can execute

> **How to use.** Start a new ChatGPT chat. Attach (or paste) **`module-PRD/project-context.md`** first, then paste **Part A** below
> as your first message. After that, ideate normally and ask ChatGPT to answer in the **Part C** prompt format. Paste the resulting
> prompt into Claude Code (which has the real repository). Screenshots help in both directions.

---

## Part A — paste this as ChatGPT's first message

```text
You are my design-and-product ideation partner for CivicDataSpace, a civic-data platform. I am building a front-end prototype
(React 19, TypeScript, Vite, Tailwind v4, Radix UI, lucide icons). The file I attached, project-context.md, is the source of
truth for the product, information architecture, UX rules, design system, routes and data model. Read it fully before answering.

HOW WE WORK
- You ideate, critique and write prompts. A separate AI coding agent (Claude Code) has the real repository and implements them.
  You cannot see the code, so never assume a component, route, field or asset exists unless project-context.md says so.
- The prototype has NO backend. Data is mock fixtures. Do not propose features that need real services unless you label them
  "future / backend-dependent".
- The design system is closed: existing colour tokens (and low-opacity tints of them), eight type roles (Display, Display 2,
  Heading 1–3, Body, Label, Caption), existing radius scale, existing Tailwind breakpoints (sm 640, md 768, lg 1024, xl 1280).
  Do NOT invent colours, font sizes, breakpoints, tokens, routes or illustration assets. If an idea needs one, say so explicitly
  as a proposed addition and keep it separate from the buildable part.
- Navigation rule: a category/listing click goes to the unified Search page on that content type's tab; a specific item opens its
  detail page. Do not propose separate listing pages per content type.
- Production pages are changed only when I say so. New explorations go in playgrounds (/playground/*, /design-system) first.

WHEN I SHARE AN IDEA OR SCREENSHOT
1. Restate the intent in one or two sentences, and name any ambiguity you see (I often mean something slightly different from my
   first wording — ask rather than guess when it changes the design).
2. Check it against project-context.md: what already exists, what conflicts, what data the model actually has.
3. Give 2–3 distinct directions with the trade-off of each, and recommend one.
4. Flag data/model limitations honestly (for example: datasets have no coverage, language or documentation field).
5. Only when I say "write the prompt", produce a build prompt in the format below.

BUILD PROMPT FORMAT (what Claude Code executes well)
Write one prompt per iteration, in plain text, with these sections, in this order:
  1. GOAL — one short paragraph: what changes and why.
  2. SCOPE — exact location (page/route/component or playground) and what must NOT be touched.
  3. BEFORE IMPLEMENTING — "inspect the existing components, routes, tokens and data first; reuse them; report anything that
     does not exist instead of inventing it."
  4. STRUCTURE / BEHAVIOUR — numbered, concrete: layout, order of elements, states, interactions, exact copy in quotes.
  5. DIMENSIONS & TOKENS — measurable values (px, columns, rows, which type role, which tint) tied to existing tokens. Avoid
     contradictory numbers; if you are unsure, give a range and a default.
  6. RESPONSIVE — what happens at 390, 768 and 1280 (and the thresholds that matter), using existing breakpoints only.
  7. ACCESSIBILITY & MOTION — keyboard, focus, semantics, prefers-reduced-motion behaviour.
  8. DO NOT — an explicit list of things to avoid (new tokens, new routes, invented data, production changes, commits).
  9. VALIDATION — viewports to test, datasets/states to test, and measurable pass/fail checks (no overflow, fixed heights,
     no clipping, typecheck/lint/build pass).
 10. REPORT — what I want back (files changed, components created, measured results, limitations).
Always end with "Do not commit anything." unless I ask for a commit.
Keep each prompt to one coherent iteration. Prefer measurable acceptance criteria over adjectives.

STYLE OF YOUR ANSWERS
Be concise and decisive. Use short lists. Lead with the recommendation. Don't restate project-context.md back to me.
```

---

## Part B — current state of the iteration (give ChatGPT this too)

**Where we are (October 2026).** The shared shell, landing page, navigation, search, design-system page and a Data DNA prototype are
built and merged or in the working tree. Recent work, newest first:

| Area | State |
|---|---|
| **Dataset Details hero** | The header card now fills the space between Back and the tabs from `md`; content-driven below. Title/actions on top, metadata cards at the bottom. |
| **Data DNA (playground only)** | `/playground/dataset-header` → "Data DNA" tab. Visual dataset profile: **Story → Facts → Connections → Trust**. Fixed-height bento (standard card 160px, feature 336px, gap 16px; 12/6/1 columns). Expressive tinted cards for "What this data tells us" and "Where this data is used" (Use Cases amber, Collaboratives green, Events lavender, Visualisations blue); quiet white cards for facts and provenance. Controls: dataset selector, viewport (1280/768/390/Compare all), density (Rich/Moderate/Sparse — exploration only). **Not yet in production.** |
| **Landing page** | Search hero + stretched topic chips + five asymmetric illustration cards (one sentence each), all in the first viewport from `lg`; staged entrance animation. |
| **Navigation** | Search · Discover (Knowledge / Stories / Community) · Collaboratives · More (About / Resources). Listing clicks open Search tabs. |
| **Design System page** | Docs layout with a left accordion sidebar; Responsive Behaviour section; Responsive Playground (live frames at 390/768/1280). |
| **Small fixes** | Compact chips and a centred footer on phones. |

**Open threads good for ideation** (none is decided):
1. **Data DNA → production.** How the Metadata/profile experience relates to the current Overview / Data / Visualisations tabs (we have
   *not* renamed or replaced anything). What "Download Data DNA" (a downloadable visual profile artifact) should contain and look like.
2. **Data DNA visual language.** The only anchor today is a large faint DNA mark; no illustration asset exists. Ideas for selective
   visual anchors that stay within the design system.
3. **Data DNA on small screens.** Currently a long single column (fixed card heights). A two-up mobile arrangement was deliberately
   deferred.
4. **Relationships.** "Where this data is used" counts published use cases, collaboratives, events and visualisations. Publications and
   AI models have no link to datasets in the data model — a model change would be needed.
5. **Publishers and Organisations** as Search content types (they currently keep their own routes).
6. **Pages still "Coming soon":** dataset/AI-model/publication explore pages, Collaboratives landing, Publishers, About, Contact, Docs.
7. **Responsive gaps:** a small-screen pattern for tables (list/card) and a shared filter drawer.
8. **Landing page next steps** (copy, illustration for AI Models/Community, how the cards relate to the topics row).

**Facts ChatGPT should not get wrong**
- Dataset fields that exist: name, description, sector, geography, tags, source website, create date, access type, licence, files
  (name, extension, size, optional row/column counts, source). **Do not exist:** coverage, language, methodology, summary field,
  quality score, usage analytics.
- A "Data DNA icon" asset does not exist (the prototype uses lucide's `Dna`). Consumer download is a toast.
- Type roles are fixed; "Display 2" (26–28px) is the largest non-hero heading role. No new sizes.
- The status model is only **draft / published**; edit state (saved/unsaved) is not a status.

---

## Part C — what a good build prompt looks like (examples that worked, shortened)

Use these as templates when asking ChatGPT to write prompts.

**Example 1 — recomposing a playground (geometry change)**

```text
Revise the existing Data DNA playground at /playground/dataset-header. Do NOT touch the production Dataset Details page.

1. Card geometry — update data-dna-constants.ts: standard card 160px, grid gap 16px, feature card = 2 rows = 336px. Keep the
   12-column (≥1024) / 6-column (≥768) / 1-column grid. All cards use the shared DNACard frame; no per-card heights.
2. Feature card — keep the label "WHAT THIS DATA TELLS US" and the source note "From the dataset description"; show one concise
   sentence in the Display 2 type role. No new font sizes.
3. Where this data is used — four equal cards (Use Cases amber, Collaboratives green, Events lavender, Visualisations blue) using
   existing chart/accent tints; each shows a large count and the first one or two linked titles, then "+N more".
...
Validation: typecheck, lint, build; render ds-1 at 1280, 768, 390 and two other datasets; verify every card keeps its fixed height,
no text overflow, no horizontal overflow. Report final dimensions and any data-model limitations. Do not commit anything.
```

**Example 2 — a layout behaviour change in production (derive size from layout, not pixels)**

```text
Make the Dataset Details header card fill the space between the Back row and the tabs. Use flex/calc from the existing layout
variable (--layout-chrome-offset); do NOT hardcode a pixel height. From md: available-height hero; below md: content-driven.
Title/actions stay in the top zone, metadata at the bottom. Do not touch the Data or Visualisations tabs or the Data DNA playground.
Test at 1440, 1280, 1024, 768, 640, 390; check overflow, clipping, tabs visible, buttons reachable. Do not commit anything.
```

**Example 3 — animation with an exact sequence**

```text
Entrance: (1) the search section fades in vertically centred; (2) after 1s it rises into its resting place; (3) cards slide in —
left cards from the left edge, collaboratives and AI models from the bottom, use cases from the right; (4) topic chips pop in last.
Only transform/opacity; ~700–1200ms for the card motion; no bounce. prefers-reduced-motion: show the final layout immediately.
No layout shift after the animation; no horizontal scrollbar while cards slide in.
```

### What made these work
- **Named, existing things** (file names, routes, components, type roles) and an explicit "do not touch" list.
- **Exact copy and measurable numbers** (px, columns, ms, viewports) instead of "make it feel premium".
- **A scoped surface** (playground vs production) stated up front.
- **Validation + report sections**, so results come back as numbers (card heights seen, overflow yes/no, files changed).

### Things that caused rework — ask ChatGPT to avoid them
- **Ambiguous words.** "Stack the cards", "push up", "stretch to the search bar" each had two plausible meanings. Describe the
  start state, the end state and the motion explicitly, or give an ASCII sketch.
- **Assets or routes that don't exist** (a Data DNA icon, a Datasets listing page). Say "use X if it exists, otherwise tell me".
- **Facts the data model lacks** (coverage, language, methodology, example numbers like "22,615 records"). Ask for values to be
  *derived from mock data*, and for missing fields to be marked unavailable or omitted — never invented.
- **Contradictory numbers** across sections of the same prompt (for example a 6-column feature that is "approximately 320px" in one
  place and 272px in another). Pick one canonical set.
- **Fixed heights that fight content** (fit-in-viewport requirements). If something must fit on screen, give the viewports and say
  what may shrink (illustration size, spacing) and what may not (type roles).
- **Several unrelated changes in one prompt.** One iteration per prompt makes review and PRs cleaner.

---

## Part D — hand-back protocol

1. Ask ChatGPT to finish an ideation with **"Prompt for Claude Code:"** followed by the prompt in the Part C format.
2. If a screenshot or sketch drove the idea, attach it when you paste the prompt into Claude Code.
3. After Claude Code finishes, bring its **Report** (dimensions, measured results, limitations) back to ChatGPT. That is the feedback
   loop: ChatGPT critiques the measured result and proposes the next small iteration.
4. If ChatGPT proposes something that needs a new token, route, asset or data field, treat it as a **separate decision** — ask
   Claude Code to assess the cost first ("report what would be required; don't implement").
