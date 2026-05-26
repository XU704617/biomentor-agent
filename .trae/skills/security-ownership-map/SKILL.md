---
name: security-ownership-map
description: Analyze git repositories to build security ownership topology, compute bus factor, and identify sensitive code risks. Invoke when user wants security-oriented ownership analysis, bus-factor analysis, or sensitive code hotspot detection.
---

# Security Ownership Map

Build a bipartite graph of people and files from git history, compute ownership risk, and identify security ownership concerns.

## Overview

Analyze git history to understand:
- Who owns sensitive code (auth, crypto, secrets)
- Bus factor risks (orphaned sensitive code)
- Hidden owners (concentrated control)
- Co-change clusters (files that move together)
- Maintainer communities

## Requirements

- Python 3
- Git installed

## Quick Start

```bash
# Basic analysis from repo root
git log --all --format='%H|%an|%ae|%ad' --name-only --date=iso > /tmp/git-log.txt

# Analyze the output
python -c "
from collections import defaultdict
import json

owner_files = defaultdict(set)
author_commits = defaultdict(int)

with open('/tmp/git-log.txt') as f:
    current_author = None
    for line in f:
        line = line.strip()
        if not line:
            continue
        if '|' in line:
            parts = line.split('|')
            current_author = parts[2]
            author_commits[current_author] += 1
        elif current_author:
            owner_files[current_author].add(line)

# Bus factor analysis
file_owners = defaultdict(set)
for author, files in owner_files.items():
    for f in files:
        file_owners[f].add(author)

sensitive_patterns = ['auth', 'crypto', 'secret', 'token', 'password', 'key', 'credential', 'cert']

print('## Security Ownership Report')
print()
print('### Bus Factor Hotspots (sensitive files with 1 owner)')
for filepath, owners in sorted(file_owners.items()):
    clean = filepath.lower()
    if any(p in clean for p in sensitive_patterns) and len(owners) <= 1:
        print(f'- **{filepath}**: bus_factor={len(owners)}, owners={owners}')

print()
print('### Top Sensitive Code Contributors')
sensitive_touches = defaultdict(int)
for author, files in owner_files.items():
    for f in files:
        if any(p in f.lower() for p in sensitive_patterns):
            sensitive_touches[author] += 1

for author, count in sorted(sensitive_touches.items(), key=lambda x: -x[1])[:10]:
    print(f'- {author}: {count} sensitive file touches')
"
```

## Sensitivity Rules

Default flagged patterns:
- `**/auth/**` - Authentication code
- `**/crypto/**` - Cryptographic code
- `**/*.pem`, `**/*.key` - Key files
- `**/secret*` - Secrets
- `**/token*` - Token handling
- `**/password*` - Password handling
- `**/.env*` - Environment configuration

## Key Metrics

### Bus Factor

Number of unique authors who have touched sensitive files. Low bus factor (\<=1) means a single person owns that code entirely — a key person risk.

### Hidden Owners

Authors who control a disproportionate share of sensitive code. Someone with 63% ownership of auth code is a hidden security owner.

### Orphaned Sensitive Code

Files with both low bus factor AND stale last touches (\>6 months). These are the highest-risk files.

## Workflow

1. **Scope the repo**: Identify the target repository and time window
2. **Define sensitivity rules**: Use defaults or customize based on project structure
3. **Extract git history**: Pull author, file, and date data
4. **Compute ownership**: Build person-to-file mapping
5. **Identify risks**: Bus factor hotspots, hidden owners, orphaned code
6. **Report findings**: Highlight top risks with specific file paths

## Output

The report should cover:
- **Orphaned sensitive code**: Files with bus factor \<= 1 and stale touches
- **Bus factor hotspots**: All sensitive files with low bus factor
- **Hidden owners**: Contributors controlling large shares of sensitive code
- **Sensitive code inventory**: Complete list of flagged files with owners
- **Recommendations**: Specific remediation actions

## Notes

- Compare against CODEOWNERS to highlight ownership drift
- Use `--since "12 months ago"` to focus on recent activity
- Exclude bot authors (dependabot, etc.) from analysis
- Consider both touched files and commit frequency
