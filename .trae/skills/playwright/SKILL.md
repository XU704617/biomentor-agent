---
name: playwright
description: Automate a real browser from the terminal for navigation, form filling, screenshots, and data extraction. Invoke when task requires browser automation, web scraping, UI testing, or taking screenshots of web pages.
---

# Playwright CLI Skill

Drive a real browser from the terminal using Playwright. Prefer the `playwright-cli` when installed, or use Playwright programmatically via `npx playwright`.

## Prerequisites

Check that Node.js/npm are available:

```bash
node --version
npm --version
```

If missing, install Node.js/npm first.

## Installation

```bash
# Install Playwright CLI globally
npm install -g @playwright/cli@latest

# Or use via npx directly
npx playwright-cli --help

# Install browser binaries
npx playwright install chromium
```

## Quick Start

```bash
# Open a page
npx playwright-cli open https://example.com --headed

# Take a snapshot of DOM state
npx playwright-cli snapshot

# Click an element by ref
npx playwright-cli click e15

# Type text
npx playwright-cli type "Hello World"

# Press a key
npx playwright-cli press Enter

# Take a screenshot
npx playwright-cli screenshot output/screenshot.png
```

## Core Workflow

1. Open the page
2. Snapshot to get stable element refs
3. Interact using refs from the latest snapshot
4. Re-snapshot after navigation or significant DOM changes
5. Capture artifacts (screenshot, PDF, traces) when useful

Minimal loop:

```bash
npx playwright-cli open https://example.com --headed
npx playwright-cli snapshot
npx playwright-cli click e3
npx playwright-cli snapshot
```

## When to Snapshot Again

Snapshot again after:
- Navigation
- Clicking elements that change the UI substantially
- Opening/closing modals or menus
- Tab switches

Refs can go stale. When a command fails due to a missing ref, snapshot again.

## Recommended Patterns

### Form Fill and Submit

```bash
npx playwright-cli open https://example.com/form
npx playwright-cli snapshot
npx playwright-cli fill e1 "user@example.com"
npx playwright-cli fill e2 "password"
npx playwright-cli click e3
npx playwright-cli snapshot
```

### Debug a UI Flow with Traces

```bash
npx playwright-cli open https://example.com --headed
npx playwright-cli tracing-start
# ...interactions...
npx playwright-cli tracing-stop
```

### Multi-tab Work

```bash
npx playwright-cli tab-new https://example.com
npx playwright-cli tab-list
npx playwright-cli tab-select 0
npx playwright-cli snapshot
```

## Programmatic Usage (Python)

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("https://example.com")
    page.screenshot(path="screenshot.png")
    browser.close()
```

Install: `pip install playwright` then `python -m playwright install chromium`

## Guardrails

- Always snapshot before referencing element IDs
- Re-snapshot when refs seem stale
- Prefer explicit commands over `eval` and `run-code`
- Use `--headed` when a visual check will help
- For screenshots, use `output/playwright/` directory
