---
name: using-git-worktrees
description: Use when starting complex implementation work needing isolated workspace. Creates isolated git worktrees for parallel development without branch switching.
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

## Directory Selection Process

1. Check if `.worktrees` or `worktrees` directory exists (`.worktrees` preferred)
2. Check project config files for worktree preferences
3. If none found, ask user preference

### Safety Verification

For project-local directories, **MUST verify directory is gitignored** before creating worktree:

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If NOT ignored: Add to `.gitignore` and commit before proceeding.

## Creation Steps

```bash
# Detect project name
project=$(basename "$(git rev-parse --show-toplevel)")

# Create worktree with new branch
git worktree add ".worktrees/$BRANCH_NAME" -b "$BRANCH_NAME"

# Enter worktree
cd ".worktrees/$BRANCH_NAME"

# Run project setup (auto-detect)
# Node.js: npm install
# Rust: cargo build
# Python: pip install -r requirements.txt
```

## Verify Clean Baseline

Run tests to ensure worktree starts clean. If tests fail: report and ask whether to proceed.

## Cleanup

```bash
# When done with worktree
git worktree remove .worktrees/<branch-name>

# List existing worktrees
git worktree list
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify gitignored) |
| `worktrees/` exists | Use it (verify gitignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Ask user |
| Directory not gitignored | Add to .gitignore + commit |
| Tests fail during baseline | Report failures + ask |

## Common Mistakes

- **Skipping ignore verification** - Worktree contents get tracked, pollute git status
- **Proceeding with failing tests** - Can't distinguish new bugs from pre-existing issues
- **Assuming directory location** - Follow priority: existing > config > ask
