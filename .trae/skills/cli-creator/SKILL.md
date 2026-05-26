---
name: cli-creator
description: Build composable command-line tools from API docs, OpenAPI specs, or existing scripts. Invoke when user wants to create a CLI tool, wrap an API as CLI, or build a developer tool command.
---

# CLI Creator

Create a real CLI tool that can be run by command name from any working directory. This skill is for durable tools, not one-off scripts.

## Start

Identify the target tool:
- **Source**: API docs, OpenAPI spec, SDK docs, curl examples, existing script
- **Jobs**: Concrete operations like `list items`, `download logs`, `search`, `upload`, `read status`
- **Name**: Short binary name like `my-tool`, `api-cli`, `log-hunter`

Before scaffolding, check if the name is available:

```bash
command -v <tool-name> || true
```

## Choose the Runtime

Check available toolchains:

```bash
command -v cargo rustc node npm python3 uv || true
```

Guidance:
- **Rust**: Durable binary, strong argument parsing, good JSON handling, easy to distribute. Use `clap`, `reqwest`, `serde_json`, `anyhow`
- **Node/TypeScript**: When official SDK or browser automation is needed. Use `commander`, `zod` for validation
- **Python**: For data science, local file transforms, or Python-heavy admin tooling. Use `typer`/`argparse`, `requests`/`httpx`

Choose the least surprising toolchain for the user's context.

## Command Contract

Design commands that are composable and predictable:

```
tool-name --help                     # Show all capabilities
tool-name init ...                   # Store local config
tool-name list ...                   # Discovery (find projects, workspaces, etc.)
tool-name get <id>                   # Resolve by ID
tool-name create ...                 # Write operations
tool-name --json <command>           # Machine-readable output
tool-name doctor                     # Verify config, auth, reachability
```

Principles:
- Discovery commands find top-level containers (projects, teams, etc.)
- Resolve commands turn names/URLs into stable IDs
- Read commands fetch and list collections (support pagination with `--limit`)
- Write commands do one named action each (create, update, delete). Support `--dry-run`
- `--json` returns stable machine-readable output
- Raw escape hatch: `request` or `api` for unsupported endpoints

## Auth and Config

Precedence order:
1. Environment variable using the service's standard name (e.g., `GITHUB_TOKEN`)
2. Config file under `~/.<tool-name>/config.toml` or similar
3. `--api-key` flag only for one-off tests

Never print full tokens. Use `doctor --json` to report auth status.

## Rust Template

```rust
use clap::{Parser, Subcommand};
use anyhow::Result;

#[derive(Parser)]
#[command(name = "my-tool")]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    #[arg(long, global = true)]
    json: bool,
}

#[derive(Subcommand)]
enum Commands {
    List { limit: Option<u32> },
    Get { id: String },
    Doctor,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    // Handle commands
    Ok(())
}
```

Install via `Makefile`:

```makefile
install-local:
    cargo build --release
    cp target/release/my-tool ~/.local/bin/
```

## Python Template

```python
import argparse
import json
import sys

def cmd_list(args):
    results = fetch_list(limit=args.limit)
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for item in results:
            print(f"{item['id']}: {item['name']}")

parser = argparse.ArgumentParser(prog="my-tool")
parser.add_argument("--json", action="store_true")
subparsers = parser.add_subparsers()

list_parser = subparsers.add_parser("list")
list_parser.add_argument("--limit", type=int, default=20)
list_parser.set_defaults(func=cmd_list)

args = parser.parse_args()
if hasattr(args, 'func'):
    args.func(args)
```

Install via `pyproject.toml`:

```toml
[project.scripts]
my-tool = "my_tool.cli:main"
```

## Node Template

```javascript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();
program.name('my-tool').option('--json', 'JSON output');

program
  .command('list')
  .option('--limit <n>', 'Max results', '20')
  .action(async (opts) => {
    const results = await fetchList(opts.limit);
    console.log(program.opts().json ? JSON.stringify(results, null, 2) : results.map(r => `${r.id}: ${r.name}`).join('\n'));
  });

program.parse();
```

Install via `package.json`:

```json
{ "bin": { "my-tool": "./cli.js" } }
```

## Build Workflow

1. Read the source to inventory resources, auth, pagination, IDs, and dangerous write actions
2. Sketch the command list. Keep names short and shell-friendly
3. Scaffold with a README
4. Implement `doctor`, discovery, resolve, read commands, and the raw escape hatch
5. Install on PATH so it works outside the source folder
6. Smoke test from another directory
7. Run format, typecheck, and unit tests
