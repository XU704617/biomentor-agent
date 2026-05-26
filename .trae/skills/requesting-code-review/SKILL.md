---
name: requesting-code-review
description: Use after completing a major feature or before merging to main, to perform self-review of current changes before creating a PR.
---

# Requesting Code Review (Self-Review)

## Overview

Self-review your changes before creating a PR. Catch issues before they cascade.

**Core principle:** Review your own work critically before others see it.

## When to Request Review

**Mandatory:**
- After completing major feature
- Before merge to main
- When a plan phase is complete

## How to Self-Review

### 1. Get the Diff

```bash
BASE_SHA=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null)
HEAD_SHA=$(git rev-parse HEAD)

# View the diff
git diff $BASE_SHA..$HEAD_SHA --stat
git diff $BASE_SHA..$HEAD_SHA
```

### 2. Review Checklist

Go through each file in the diff and check:

- **Correctness**: Does the logic do what was intended?
- **Completeness**: Are all requirements covered?
- **Edge cases**: Error states, null/empty inputs, boundary conditions
- **Tests**: Do tests cover the new behavior? Are they meaningful?
- **Style**: Consistent with codebase conventions?
- **Security**: Any injection vectors, exposed secrets, unsafe operations?
- **Performance**: Unnecessary allocations, N+1 queries, blocking operations?
- **Naming**: Are variables and functions clearly named?
- **Documentation**: Are complex sections adequately explained?

### 3. Create TodoWrite for Issues Found

For each issue found, create a todo item and fix before proceeding.

### 4. Verify Fixes

```bash
# Run tests
# Run linter
# Verify build
```

## Red Flags

**Never:**
- Skip review because "it's simple"
- Batch review multiple unrelated changes
- Skip reviewing generated or config files

## Integration

After self-review passes, proceed with branch completion (merge or PR creation).
