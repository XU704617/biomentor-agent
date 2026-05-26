---
name: yeet
description: Stage, commit, push, and open a GitHub pull request in one flow. Invoke when user asks to create a PR, push code and open PR, or complete the git commit-to-PR workflow.
---

# Yeet — Git Commit, Push & PR

Stage, commit, push, and open a GitHub pull request in one flow using the GitHub CLI (`gh`).

## Prerequisites

- GitHub CLI `gh` installed: `gh --version`
- Authenticated session: `gh auth status`
- If not authenticated, run `gh auth login` first

## Naming Conventions

- Branch: descriptive kebab-case from main/master
- Commit: terse description of the net change
- PR title: descriptive summary of the full diff

## Workflow

### 1. Setup Branch

```bash
# If on main/master/default, create a branch
git checkout -b "feature-description"

# Otherwise stay on current branch
```

### 2. Stage and Commit

```bash
# Check status
git status -sb

# Stage all changes
git add -A

# Commit
git commit -m "concise description of changes"
```

### 3. Run Checks (if applicable)

If checks fail due to missing deps/tools, install dependencies and rerun once.

### 4. Push

```bash
git push -u origin $(git branch --show-current)
```

### 5. Discover PR Template

Check for existing PR templates:

```bash
ls .github/pull_request_template.md
ls .github/PULL_REQUEST_TEMPLATE.md
ls .github/pull_request_template/
ls .github/PULL_REQUEST_TEMPLATE/
```

### 6. Create or Update PR

Check for existing PR:

```bash
gh pr view "$(git branch --show-current)" --json number,isDraft,url
```

If PR already exists, update it. Otherwise, create a draft PR:

```bash
# With template
GH_PROMPT_DISABLED=1 gh pr create --draft --fill --template ".github/pull_request_template.md" --head "$(git branch --show-current)"

# Without template
GH_PROMPT_DISABLED=1 gh pr create --draft --fill --head "$(git branch --show-current)"
```

### 7. Edit PR Description

Edit the PR title and body to reflect the actual net change:

```bash
gh pr edit --title "type(scope): description" --body-file /tmp/pr-body.md
```

## PR Title Format

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: add user authentication`
- `fix(auth): resolve token refresh race condition`
- `docs: update API reference`
- `refactor(db): migrate queries to Prisma`

## PR Body Shape (Fallback)

When no repository template exists:

```markdown
## Why

Describe the user-facing or maintainer-facing problem, including cause and effect.

## What Changed

Describe the net implementation change in concise prose.
```

## Verification Section

Only add verification when you have behavioral evidence: a reproduced bug, before/after check, targeted test, or manual scenario. Do not add for generic commands (linters, type checks, formatters).

## Markdown Conventions

- Put code, paths, commands, flags in backticks
- Use fenced code blocks for shell transcripts
- Reference relevant issues or related PRs
- Use repo-relative paths, not absolute local paths
