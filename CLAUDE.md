# CivicDataSpace

## Project skills

Project-local Claude Code skills live under `.claude/skills/`.

- `SKILL.md` is the discoverable entry point for a skill. Each capability has its own folder, grouped by area (`ui/`, `ux/`, `documentation/`, `github/`).
- Supporting `.md` files are optional resources that a skill references when needed. A simple skill stays a single `SKILL.md`.
- `_shared/` holds reusable project context and conventions. These files are not skills.
- Use a skill when its capability matches the task.
- Existing project code and project documentation remain the source of truth.

See [docs/ai/skills-architecture.md](docs/ai/skills-architecture.md) for the structure and conventions.
