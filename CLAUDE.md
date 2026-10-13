# CivicDataSpace

## Project skills

Project-local Claude Code skills live under `.claude/skills/`.

- `SKILL.md` is the discoverable entry point for a skill. Each capability has its own folder, grouped by area (`ui/`, `ux/`, `documentation/`, `github/`).
- Supporting `.md` files are optional resources that a skill references when needed. A simple skill stays a single `SKILL.md`.
- `_shared/` holds reusable project context and conventions. These files are not skills.
- Use a skill when its capability matches the task.
- Existing project code and project documentation remain the source of truth.

See [docs/ai/skills-architecture.md](docs/ai/skills-architecture.md) for the structure and conventions.

## UI conventions

- **Contributor forms:** follow the `ui/contributor-form-patterns` skill (`.claude/skills/ui/contributor-form-patterns/SKILL.md`) for anything added to a contributor flow — above all, an "add another / add new" action is a right-hand drawer opened by an outline `+ Add <Thing>` button at the top right of the card title, never inline fields — and record any newly standardised rule in that skill's Standards log.
- **File uploads:** every upload — in forms, side sheets, modals or inline editors — uses the one standard dropzone: `FileUploadField` for a single-asset field, `DropzoneUploadField` for multi-file surfaces (both in `src/components/shared/`). Never add a bare "Upload" button, a compact variant, a custom icon/label or a bespoke dashed box; only the instruction wording (`title` / `dropzoneTitle`) varies. Extensions and the size limit come from the field's validation constants. Spec: "Upload fields" in the design system page and `design-system.md`.
