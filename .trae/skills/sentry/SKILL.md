---
name: sentry
description: Inspect Sentry issues, summarize production errors, and pull Sentry health data via Sentry CLI. Invoke when user asks to check Sentry errors, review production issues, or inspect error events.
---

# Sentry (Read-only Observability)

Use the Sentry CLI for read-only queries against Sentry projects: issue listing, event inspection, and AI-powered root cause analysis.

## Quick Start

- If not authenticated, run `sentry auth login` or set `SENTRY_AUTH_TOKEN` env var
- The CLI auto-detects org/project from DSNs in `.env` files, source code, and config
- Defaults: time range `24h`, environment `production`, limit 20
- Always use `--json` for machine-readable output
- Use `sentry schema <resource>` to discover API endpoints

## Installation

```bash
# macOS / Linux
curl https://cli.sentry.dev/install -fsS | bash

# Windows
npm install -g @sentry/cli

# Verify
sentry --version
```

## Authentication

```bash
sentry auth login
sentry auth status
```

Never ask the user to paste the full token. Ask them to set it locally.

## Core Tasks

### 1. List Issues (Most Recent)

```bash
sentry issue list \
  --query "is:unresolved environment:production" \
  --period 24h \
  --limit 20 \
  --json --fields shortId,title,priority,level,status
```

### 2. Resolve Issue Short ID to Detail

```bash
sentry issue view ABC-123 --json
```

Use short ID format (e.g., `ABC-123`), not the numeric ID.

### 3. Issue Events

```bash
sentry issue events ABC-123 --limit 20 --json
```

### 4. Event Detail

```bash
sentry event view {org}/{project}/{event_id} --json
```

### 5. AI-Powered Root Cause Analysis

```bash
sentry issue explain ABC-123
```

### 6. AI-Powered Fix Plan

```bash
sentry issue plan ABC-123
```

## Fallback: Arbitrary API Access

```bash
sentry api /api/0/organizations/{org}/ --method GET
sentry schema issues
```

## Inputs and Defaults

- `org_slug`, `project_slug`: auto-detected by CLI
- `time_range`: default `24h` (`--period 24h`)
- `environment`: default `production` (`environment:production`)
- `limit`: default 20 (`--limit`)
- `search_query`: optional `--query` (Sentry search syntax)

## Output Formatting

- Issue list: title, short_id, status, first_seen, last_seen, count
- Event detail: culprit, timestamp, environment, release, url
- If no results, state explicitly
- Redact PII in output (emails, IPs). Do not print raw stack traces
- Never echo auth tokens
