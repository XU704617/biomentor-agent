---
name: gh-fix-ci
description: Debug and fix failing GitHub PR checks running in GitHub Actions. Invoke when user asks to debug failing CI, fix broken PR checks, or investigate GitHub Actions failures.
---

# GH PR Checks: Plan & Fix

Use `gh` to locate failing PR checks, fetch GitHub Actions logs for actionable failures, summarize the failure snippet, then propose a fix plan and implement after explicit approval.

## Prerequisites

- GitHub CLI `gh` installed and authenticated
- Verify: `gh auth status` (repo + workflow scopes typically required)

## Inputs

- `repo`: path inside the repo (default `.`)
- `pr`: PR number or URL (optional; defaults to current branch PR)

## Workflow

### 1. Verify GH Authentication

```bash
gh auth status
```

If unauthenticated, run `gh auth login` ensuring repo + workflow scopes.

### 2. Resolve the PR

```bash
# Get current branch PR
gh pr view --json number,url,title

# Or specify PR number
gh pr view <number> --json number,url,title
```

### 3. Inspect Failing Checks

```bash
# List checks with status
gh pr checks <pr-number> --json name,state,bucket,link,startedAt,completedAt,workflow

# For each failing check, get run details
gh run view <run-id> --json name,workflowName,conclusion,status,url,event,headBranch,headSha

# Get run logs
gh run view <run-id> --log

# If log is still in progress, fetch job logs directly
gh api "/repos/{owner}/{repo}/actions/jobs/<job-id>/logs"
```

### 4. Handle Non-GitHub Actions Checks

If `detailsUrl` is not a GitHub Actions run, label it as external and only report the URL. Do not attempt Buildkite or other third-party CI providers.

### 5. Summarize Failures

Provide for each failure:
- Failing check name
- Run URL (if available)
- A concise log snippet showing the actual error
- Call out any missing logs explicitly

### 6. Create a Fix Plan

Draft a concise plan covering:
- Root cause analysis
- Files to modify
- Expected changes
- Verification steps (tests to run, commands to verify)

Present the plan and request explicit approval before implementing.

### 7. Implement After Approval

- Apply the approved changes
- Summarize the diff and affected tests
- Verify with relevant commands before pushing

### 8. Recheck Status

After changes, re-run relevant tests:

```bash
gh pr checks <pr-number>
```
