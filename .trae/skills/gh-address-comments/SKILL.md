---
name: gh-address-comments
description: Address review and issue comments on GitHub PRs using gh CLI. Invoke when user wants to handle PR review comments, inspect PR feedback, or resolve code review threads.
---

# PR Comment Handler

Find the open PR for the current branch and address its comments using the GitHub CLI (`gh`).

## Prerequisites

- Install GitHub CLI: `winget install GitHub.cli` (Windows) or `brew install gh` (macOS)
- Authenticate: `gh auth login`
- Verify auth with: `gh auth status`

## Workflow

### 1. Find the Open PR

```bash
gh pr view --json number,title,url,state,body
```

If on main branch, list all open PRs:

```bash
gh pr list --state open --json number,title,url,headRefName
```

### 2. Inspect Comments Needing Attention

List all review comments:

```bash
gh pr view <pr-number> --json reviews,comments
```

Get review threads:

```bash
gh api "/repos/{owner}/{repo}/pulls/<pr-number>/comments" --jq '.[] | {id, path, body, created_at, user: .user.login}'
```

### 3. Present Comments to User

- Number all the review threads and comments
- Provide a short summary of what would be required to address each
- Ask which numbered comments should be addressed

### 4. Apply Fixes for Selected Comments

For each selected comment:
- Read the affected file at the referenced line
- Understand the reviewer's concern
- Apply the fix while preserving codebase conventions
- Verify with relevant tests if available

## Notes

- If `gh` hits auth/rate issues mid-run, prompt the user to re-authenticate
- Use `gh api` for endpoints not covered by direct commands
- Always verify the fix compiles/tests pass before marking as resolved
