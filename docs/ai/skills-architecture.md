# Skills architecture

This document describes how project-local Claude Code skills are organised in this repository.

> **Status:** `github/create-pr` is implemented. The other six skills and the three `_shared/` files are placeholders that contain `TODO` until they are written.

## Principle

**`SKILL.md` is the discoverable skill entry point. Supporting `.md` files are internal resources referenced by the skill when needed.**

The architecture stays lightweight. A skill gets extra files or folders only when it actually needs them.

## Layout

```text
.claude/
└── skills/
    ├── _shared/
    │   ├── project-context.md
    │   ├── output-conventions.md
    │   └── validation-principles.md
    │
    ├── ui/
    │   ├── ui-review/
    │   │   └── SKILL.md
    │   ├── design-system/
    │   │   └── SKILL.md
    │   └── accessibility-audit/
    │       └── SKILL.md
    │
    ├── ux/
    │   ├── ux-audit/
    │   │   └── SKILL.md
    │   └── flow-analysis/
    │       └── SKILL.md
    │
    ├── documentation/
    │   └── SKILL.md
    │
    └── github/
        └── create-pr/
            └── SKILL.md
```

## Levels

| Level | Role |
|---|---|
| `SKILL.md` | The discoverable skill entry point. It holds the skill's instructions and workflow. |
| Supporting `.md` files | Optional resources a skill references when needed. They are not entry points. |
| `_shared/` | Shared project context and conventions used by more than one skill. **Not skills.** |

## Skills

| Skill | Area | Intent | Status |
|---|---|---|---|
| `ui/ui-review` | UI | Review UI changes | Placeholder |
| `ui/design-system` | UI | Work with the design system and tokens | Placeholder |
| `ui/accessibility-audit` | UI | Audit accessibility | Placeholder |
| `ux/ux-audit` | UX | Audit UX | Placeholder |
| `ux/flow-analysis` | UX | Analyse user flows | Placeholder |
| `documentation` | Docs | Write and maintain documentation | Placeholder |
| `github/create-pr` | GitHub | Turn local changes into a pull request | **Implemented** |

### `github/create-pr`

Takes local changes to a GitHub pull request: inspect changes, understand scope, check the current branch, create a branch if needed, review the diff, validate, commit, push, create or update the PR, and summarise. It reuses a feature branch, branches from the default branch otherwise, updates an existing open PR instead of creating a duplicate, submits nothing when there are no relevant changes, and never force-pushes, resets, deletes branches or files, rewrites shared history or discards local changes. It is a single `SKILL.md` with no supporting files.

## Simple skills stay simple

A simple skill remains a single `SKILL.md`. Do not add supporting files or folders by default. `github/create-pr` is currently implemented this way, and can be split later if it becomes too large.

## Growing a complex skill

When a skill outgrows one file, it can add supporting folders next to its `SKILL.md`, only as needed:

```text
<skill>/
├── SKILL.md
├── workflows/    step-by-step procedures
├── rules/        criteria and decision rules
├── references/   background knowledge and checklists
└── templates/    reusable output formats
```

`SKILL.md` stays the entry point and points to these files when the task calls for them. None of these folders exist yet.

## Placeholder format

Placeholder `SKILL.md` files follow one structure: Purpose, When to use, When not to use, Workflow, Project-specific rules, References, Output, Validation. An implemented skill keeps those sections, adds the frontmatter (`name`, `description`) that makes it discoverable, and may add sections it needs. Shared files hold a title and a `TODO` until written.

## Adding a new skill

1. Choose an area folder (`ui/`, `ux/`, `documentation/`, `github/`), or add a new one if none fits.
2. Create `<area>/<skill-name>/SKILL.md` using the placeholder structure.
3. Keep it a single file until it needs more.
4. Put context shared with other skills in `_shared/`.
5. Keep detailed skill instructions out of `CLAUDE.md`.

## Source of truth

Existing project code and project documentation, such as `design-system.md`, the reports in `audit-reports/` and the PRDs in `module-PRD/`, remain the source of truth. Skills point to them and must not contradict them.
