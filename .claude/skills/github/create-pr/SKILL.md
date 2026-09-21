---
name: create-pr
description: Turn local changes into a GitHub pull request, or update the open PR for the current branch. Inspects the changes, creates a branch if needed, validates, commits, pushes and opens the PR. Use when the user asks to create a PR, open a PR, push my changes, or submit this work.
---

# Create PR

## Purpose

Take the local changes in the working tree and submit them as a GitHub pull request: inspect, branch, validate, commit, push, open (or update) the PR, and report what was done.

## When to use

- The user asks to create, open or update a pull request.
- The user asks to commit and push their local changes for review.

## When not to use

- The user only wants a local commit, with no push or PR.
- The user asks to merge a PR. This skill never merges.
- The user asks for a code review or audit of changes. Use a review skill instead.

## Workflow

```text
Inspect local changes
→ Understand scope
→ Check current branch
→ Create a branch if needed
→ Review diff
→ Validate
→ Commit
→ Push
→ Create/update PR
→ Summarise changes
```

### 1. Inspect local changes

- Run `git status --short -uall` so untracked files inside new folders are listed.
- Run `git diff` and `git diff --staged` and read them. Read untracked files that are part of the change.
- Work out what the changes actually do, not just which files changed.
- Separate relevant changes from unrelated local work. Unrelated work (other features, scratch files, editor or OS files, generated output nobody asked for) stays out of the commit and the PR. If it is unclear whether a change belongs, ask the user.

**No relevant changes:** stop. Do not create a branch, a commit or an empty PR. Report that there is nothing to submit. If the branch already has unpushed commits and no open PR, say so and offer to push and open the PR.

### 2. Check the current branch

- Current branch: `git branch --show-current`.
- Default branch: `git symbolic-ref refs/remotes/origin/HEAD` (this repository's default is `main`). Treat `main`, `master` and the default branch as protected.
- Run `git fetch origin` first so decisions use current remote state.

| Situation | Action |
|---|---|
| On a feature or fix branch and the changes belong to it | Reuse it. Do not create another branch. |
| On the default or a protected branch | Create a new branch from `origin/<default>`. |
| On a branch already merged into the default branch (`git merge-base --is-ancestor HEAD origin/<default>`) | Do not reuse it. Create a new branch from `origin/<default>`. |
| On a branch whose existing work is unrelated to these changes | Ask the user before creating or reusing anything. |

If creating the branch would collide with uncommitted changes, git stops. Do not stash-drop, reset or discard anything. Stop and ask.

### 3. Create a branch, if needed

- Infer a short kebab-case name from what the changes actually do: `<prefix>/<short-description>`.
- Prefixes: `feat/`, `fix/`, `design/`, `refactor/`, `docs/`, `chore/`.
  - `feat/` new behaviour or a new capability
  - `fix/` a bug fix
  - `design/` visual or UI-only change: styling, layout, tokens, copy
  - `refactor/` restructuring with no behaviour change
  - `docs/` documentation only
  - `chore/` tooling, config, dependencies, housekeeping
- Keep the name concise, about 3 to 5 words. Example: `design/dataset-type-outline-pill`.
- Create it with `git checkout -b <name> origin/<default>`. Never create a second branch when one already fits.

### 4. Review the diff

Before staging, re-read the final diff of the files to be included and check:

- It contains only the intended change.
- No secrets or credentials: `.env` files, API keys, tokens, private keys, passwords, credentials in URLs. If any are found, stop and tell the user. Do not commit them.
- No accidental files: build output (`dist/`), `node_modules/`, logs, `.DS_Store`, large binaries.
- No leftover debugging code, conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) or stray TODOs from the work.

### 5. Validate

Run the project's own validation commands. Read `package.json` scripts first and run only what exists. Do not invent commands.

At the time of writing, this repository defines:

| Purpose | Command |
|---|---|
| Lint | `npm run lint` |
| Typecheck | `npx tsc -b` |
| Build | `npm run build` (runs `tsc -b`, then `vite build`) |

There is no test or format script. Choose what fits the change:

- Docs-only or config-only change: validation may be limited to checking the files. Say so.
- Code or style change: run lint and typecheck. Run the build when the change could affect it (imports, config, tokens, routing).

Notes:

- `npm run build` runs `scripts/generate-tokens.mjs` first, which can rewrite generated files (for example `src/generated/tokens.css`, `design-system.md`). Check `git status` afterwards. Include such files only if the change is genuinely about tokens. Otherwise leave them out and tell the user. Do not discard them.
- If validation fails, report the failure with the relevant output. Do not commit and push as if it passed. Fix problems caused by the change. Ask the user before proceeding if it is unclear or failures are pre-existing.
- Never claim a check passed unless it was actually run and succeeded. State what was not run.

### 6. Commit

- Stage files explicitly by path. Never use `git add -A` or `git add .`.
- Message format: `<type>: <short description>`, using the same types as the branch prefixes (`feat`, `fix`, `design`, `refactor`, `docs`, `chore`).
- Imperative mood, concise, describing the actual change. Example: `design: use outline badge for both dataset types`.
- Add a body only when the reason is not obvious from the subject.
- Add any commit attribution the user or session instructions call for.
- Several logically separate changes can be several commits. Do not split needlessly.

### 7. Push

- New branch: `git push -u origin <branch>`.
- Existing branch: `git push`.
- Never force-push. If the push is rejected because the remote has new commits, stop and ask. Do not rebase or rewrite shared history without the user's approval.

### 8. Create or update the PR

First check whether the branch already has an open PR:

```bash
gh pr list --head <branch> --state open --json number,url,title
```

- **Open PR exists:** do not create a duplicate. The push above already updated it. Report that the existing PR was updated. Update its description only if the scope changed, and say so.
- **No open PR:** create one against the default branch:
  ```bash
  gh pr create --base <default> --head <branch> --title "<title>" --body "<body>"
  ```
- Use the repository's PR template or convention if one exists (`.github/pull_request_template.md`, `docs/pull_request_template.md`, `PULL_REQUEST_TEMPLATE.md`, or `CONTRIBUTING.md`). None exists at the time of writing.
- If `gh` is missing or not authenticated (`gh auth status`), do not hunt for tokens. Push the branch, then give the user the link to open the PR manually, `https://github.com/<owner>/<repo>/pull/new/<branch>`, along with the ready-to-paste title and description.

**Title:** concise and specific, describing the change, not the process. Example: `Use the outline badge for both dataset types in the list`.

**Description:** factual, with no marketing tone or filler.

```markdown
## Summary
One or two sentences: what changed and why.

## Changes
- Specific change
- Specific change

## Validation
- What was run and the result
- What was not run

## Notes
Anything a reviewer should know: follow-ups, trade-offs, files intentionally excluded. Omit if none.
```

Add any PR attribution the user or session instructions call for.

### 9. Summarise

Report using the format under **Output**.

## Project-specific rules

- Repository: `N-Admn/design-dataspace`. Default branch: `main`. Work is merged through pull requests, so never push feature work directly to `main`.
- This skill never merges a PR, and never deletes branches, local or remote. Leave both to the user.
- Do not modify application code, install dependencies or change project configuration just to make a PR go through, unless the user asked for that change.
- Existing project code and documentation are the source of truth. Describe changes as they are in the diff.

## Safety

Never do any of the following automatically:

- force-push (`--force`, `--force-with-lease`)
- `git reset --hard`
- delete branches
- delete files to resolve Git problems
- rewrite shared history (rebase or amend commits that are already pushed)
- discard local changes (`git checkout -- .`, `git restore .`, `git clean`, dropping stashes)
- commit secrets
- include unrelated user work

If a destructive operation seems required, stop, explain why, and ask the user.

## References

- `.claude/skills/_shared/` holds shared project context and conventions. It is still a placeholder.
- No supporting files yet. This skill stays a single `SKILL.md` until it needs splitting.

## Output

After creating or updating the PR, reply with exactly this, concise and factual:

```text
PR: <URL>

Branch:
<branch>

Commit:
<short sha> <subject>

Title:
<title>

Changed:
- ...
- ...
- ...

Validation:
- ...
```

- If the existing PR was updated, say so on the `PR:` line, for example `PR: <URL> (existing PR updated)`.
- If `gh` was unavailable, replace the URL with the manual link and say the PR was not created.
- If nothing was submitted, say "Nothing to submit" and why.
- List any unrelated local changes that were deliberately left out.

## Validation

Before reporting done, confirm each of these:

- The commit contains only the intended files (`git show --stat HEAD`).
- The branch is pushed and the PR exists or was updated (`gh pr view` or `gh pr list`).
- The validation results listed in the report are ones that were actually run.
- No secrets, no unrelated work, and no destructive git operations were involved.
