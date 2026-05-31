# BioMentor Agent Local Demo Startup Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- Backend dependencies installed: `cd backend && pip install -r requirements.txt`
- Frontend dependencies installed: `cd frontend && npm install`

## Database Setup

The default database path (`backend/biomentor.db`) may encounter `sqlite3.OperationalError: disk I/O error` due to residual WAL files or filesystem issues.

**Recommended:** Use a `/tmp`-based SQLite database to avoid this problem.

To reset the demo database:

```bash
bash scripts/reset_demo_db.sh
```

This script will:
- Optionally stop any process on port 9090 (asks for confirmation)
- Remove `backend/biomentor.db`, `backend/biomentor.db-wal`, `backend/biomentor.db-shm`
- Print the recommended startup commands
- **Not** touch `.env.local` or `seed_data` files

## Starting the Backend

```bash
cd backend
export DATABASE_URL=sqlite:////tmp/biomentor_demo_23cases.db
python -m uvicorn app.main:app --host 0.0.0.0 --port 9090

> 注意：运行前请先激活后端虚拟环境，或使用已安装项目依赖的 Python。若在 worktree 中没有本地 `.venv-conda`，可以复用主仓库后端虚拟环境中的 Python。
```

### Literature Search Provider (Optional)

By default, literature search is not configured. To enable a provider:

```bash
# Default: no literature provider
export LITERATURE_PROVIDER=not_configured

# Use Semantic Scholar (requires API key)
export LITERATURE_PROVIDER=semantic_scholar
export LITERATURE_SEMANTIC_SCHOLAR_API_KEY=your_api_key_here

# Use Crossref (no API key required)
export LITERATURE_PROVIDER=crossref

# Use PubMed (NCBI Entrez E-utilities)
export LITERATURE_PROVIDER=pubmed
export LITERATURE_NCBI_API_KEY=your_ncbi_api_key_here  # optional, raises rate limit
export LITERATURE_NCBI_TOOL=biomentor-agent
export LITERATURE_NCBI_EMAIL=your_email@example.com     # optional but recommended
```

See [LITERATURE_SEARCH_CONTRACT.md](./LITERATURE_SEARCH_CONTRACT.md) for details on provider capabilities and boundaries.

Expected log output on startup:

```
[seed] Creating demo data...
[seed] Loaded 23 industry cases
[seed] Demo data created successfully.
```

## Starting the Frontend

```bash
cd frontend
npm run dev -- -p 3001
```

## Verification URLs

After both servers are running, open the following URLs in your browser:

| Page | URL |
|------|-----|
| Industry Cases | `http://localhost:3001/cases` |
| Research (case-004) | `http://localhost:3001/research?caseId=case-004` |
| Seminar (case-002) | `http://localhost:3001/seminar?caseId=case-002` |

API verification:

```bash
curl "http://localhost:9090/api/industry/cases?page_size=100"
```

Expected response: `total=23` industry cases.

## Quality Validation

After both servers are running, you can run the automated quality validation:

```bash
# Basic validation (default, no external dependencies)
BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh

# With evidence link checks
RUN_EVIDENCE_LINK_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh

# With live literature provider checks (requires external API access)
RUN_LIVE_LITERATURE_CHECKS=1 LITERATURE_PROVIDER=pubmed BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh
```

See [DEMO_VALIDATION_REPORT_TEMPLATE.md](./DEMO_VALIDATION_REPORT_TEMPLATE.md) for recording validation results.

## Known Issues

### disk I/O error with default database

**Symptom:** `sqlite3.OperationalError: disk I/O error` when starting the backend with the default `backend/biomentor.db`.

**Root cause:** Stale WAL (`-wal`, `-shm`) files or filesystem-level issues with the default database location.

**Solutions (choose one):**

1. **Use /tmp database (recommended):**
   ```bash
   export DATABASE_URL=sqlite:////tmp/biomentor_demo_23cases.db
   ```

2. **Reset the default database:**
   ```bash
   bash scripts/reset_demo_db.sh
   ```

3. **Manual cleanup:**
   ```bash
   rm -f backend/biomentor.db backend/biomentor.db-wal backend/biomentor.db-shm
   ```