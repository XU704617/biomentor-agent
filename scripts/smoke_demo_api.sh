#!/usr/bin/env bash
#
# Usage:
#   BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
#   # Optional: run live literature provider checks (requires external API key)
#   RUN_LIVE_LITERATURE_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
# Smoke test script for BioMentor Agent demo API.
# Verifies the core API endpoints respond correctly.
# Exits with code 1 on any failure, 0 on success.

set -euo pipefail

BACKEND_BASE="${BACKEND_BASE:-http://127.0.0.1:9090}"
RUN_LIVE_LITERATURE_CHECKS="${RUN_LIVE_LITERATURE_CHECKS:-0}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass_count=0
fail_count=0

check() {
    local label="$1"
    local condition="$2"
    if [ "$condition" = "true" ]; then
        echo -e "  ${GREEN}[PASS]${NC} $label"
        pass_count=$((pass_count + 1))
    else
        echo -e "  ${RED}[FAIL]${NC} $label"
        fail_count=$((fail_count + 1))
    fi
}

fetch_json() {
    local url="$1"
    local method="${2:-GET}"
    local body="${3:-}"

    if [ "$method" = "POST" ]; then
        curl -sS --max-time 30 -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$body"
    else
        curl -sS --max-time 30 "$url"
    fi
}

# fetch with HTTP status code output for error checks
fetch_with_status() {
    local url="$1"
    curl -sS --max-time 30 -w "\n%{http_code}" "$url"
}

echo "============================================"
echo " BioMentor Demo API Smoke Test"
echo " Backend: $BACKEND_BASE"
echo "============================================"
echo ""

# -------------------------------------------------------------------
# 1. GET /api/industry/cases?page_size=100
# -------------------------------------------------------------------
echo "--- 1. GET /api/industry/cases?page_size=100 ---"
cases_resp=$(fetch_json "$BACKEND_BASE/api/industry/cases?page_size=100")

cases_total=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(data.get('total', 0))
except Exception as e:
    print(0, file=sys.stderr)
    print(0)
" "$cases_resp")

check "industry cases total >= 23 (got $cases_total)" "$([ "$cases_total" -ge 23 ] && echo true || echo false)"

# -------------------------------------------------------------------
# 2. GET /api/industry/cases/case-004
# -------------------------------------------------------------------
echo "--- 2. GET /api/industry/cases/case-004 ---"
case004_resp=$(fetch_json "$BACKEND_BASE/api/industry/cases/case-004")

case004_ok=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    if data.get('case_key') == 'case-004':
        print('true')
    else:
        print('false')
except Exception:
    print('false')
" "$case004_resp")

check "case-004 returned with case_key=case-004" "$case004_ok"

# -------------------------------------------------------------------
# 3. POST /api/research/generate-task
# -------------------------------------------------------------------
echo "--- 3. POST /api/research/generate-task ---"
task_body='{"topic":"mRNA vaccine mechanism","case_key":"case-004","mode":"case_driven"}'
task_resp=$(fetch_json "$BACKEND_BASE/api/research/generate-task" "POST" "$task_body")

tasks_count=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    tasks = data.get('tasks', [])
    print(len(tasks))
except Exception as e:
    print(0, file=sys.stderr)
    print(0)
" "$task_resp")

check "research tasks count == 4 (got $tasks_count)" "$([ "$tasks_count" -eq 4 ] && echo true || echo false)"

# ===================================================================
# 4. Literature Search – Core Checks
# ===================================================================

# -------------------------------------------------------------------
# 4a. GET /api/literature/search?q=mRNA&limit=5  (baseline check)
# -------------------------------------------------------------------
echo "--- 4a. GET /api/literature/search?q=mRNA&limit=5 ---"
lit_resp=$(fetch_json "$BACKEND_BASE/api/literature/search?q=mRNA&limit=5")

lit_source=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(data.get('source', ''))
except Exception:
    print('')
" "$lit_resp")

lit_results_count=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    results = data.get('results', [])
    print(len(results))
except Exception:
    print(-1)
" "$lit_resp")

lit_query=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(data.get('query', ''))
except Exception:
    print('')
" "$lit_resp")

lit_check=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    source = data.get('source', '')
    results = data.get('results', [])
    if source == 'not_configured' and isinstance(results, list) and len(results) == 0:
        print('true')
    else:
        print('false')
except Exception:
    print('false')
" "$lit_resp")

echo "  literature search detail: provider=$lit_source query=$lit_query results_count=$lit_results_count"
check "literature search source=not_configured and results=[]" "$lit_check"

# -------------------------------------------------------------------
# 4b. Anti-spoofing: when source=not_configured, results must be []
#     and no fake fields (title/doi/pmid/authors) are present
# -------------------------------------------------------------------
echo "--- 4b. Anti-spoofing check (source=not_configured) ---"

spoof_check=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    source = data.get('source', '')
    results = data.get('results', [])
    if source != 'not_configured':
        print('skipped')
    elif not isinstance(results, list) or len(results) != 0:
        print('false')
    else:
        # verify no fake fields in the response
        fake_fields = ['title', 'doi', 'pmid', 'authors', 'abstract', 'year', 'journal', 'url', 'citation_count']
        resp_str = json.dumps(data).lower()
        found_fake = [f for f in fake_fields if f in resp_str]
        if found_fake:
            print('false')
        else:
            print('true')
except Exception:
    print('false')
" "$lit_resp")

check "no fake fields (title/doi/pmid/authors) when source=not_configured" "$([ "$spoof_check" != "false" ] && echo true || echo false)"

# -------------------------------------------------------------------
# 4c. GET /api/literature/search?q=CAR-T&limit=3
# -------------------------------------------------------------------
echo "--- 4c. GET /api/literature/search?q=CAR-T&limit=3 ---"
lit_cart_resp=$(fetch_json "$BACKEND_BASE/api/literature/search?q=CAR-T&limit=3")

lit_cart_check=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    source = data.get('source', '')
    results = data.get('results', [])
    query = data.get('query', '')
    if query == 'CAR-T' and source == 'not_configured' and isinstance(results, list) and len(results) == 0:
        print('true')
    else:
        print('false')
except Exception:
    print('false')
" "$lit_cart_resp")

cart_results_count=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(len(data.get('results', [])))
except Exception:
    print(-1)
" "$lit_cart_resp")

echo "  CAR-T search detail: provider=$lit_source results_count=$cart_results_count"
check "CAR-T search source=not_configured and results=[]" "$lit_cart_check"

# -------------------------------------------------------------------
# 4d. Empty query / missing q – expect 422 validation error
# -------------------------------------------------------------------
echo "--- 4d. GET /api/literature/search (missing q) ---"
lit_empty_resp=$(fetch_with_status "$BACKEND_BASE/api/literature/search?limit=5")

empty_status=$(echo "$lit_empty_resp" | tail -1)
check "missing q returns 422 (got $empty_status)" "$([ "$empty_status" = "422" ] && echo true || echo false)"

# -------------------------------------------------------------------
# 4e. Empty query (q parameter present but empty)
# -------------------------------------------------------------------
echo "--- 4e. GET /api/literature/search?q=&limit=5 (empty q) ---"
lit_emptyq_resp=$(fetch_with_status "$BACKEND_BASE/api/literature/search?q=&limit=5")

emptyq_status=$(echo "$lit_emptyq_resp" | tail -1)
check "empty q returns 422 (got $emptyq_status)" "$([ "$emptyq_status" = "422" ] && echo true || echo false)"

# ===================================================================
# 5. Optional: Live Literature Provider Check
# ===================================================================
if [ "$RUN_LIVE_LITERATURE_CHECKS" = "1" ]; then
    echo ""
    echo -e "${YELLOW}--- 5. Live Literature Provider Checks (RUN_LIVE_LITERATURE_CHECKS=1) ---${NC}"
    echo "  (API may not crash, return JSON, results is array – does NOT require results)"

    lit_live_resp=$(fetch_json "$BACKEND_BASE/api/literature/search?q=mRNA&limit=3")

    lit_live_valid=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    results = data.get('results', None)
    source = data.get('source', '')
    query = data.get('query', '')
    if isinstance(results, list) and isinstance(source, str) and isinstance(query, str):
        print('true')
    else:
        print('false')
except Exception:
    print('false')
" "$lit_live_resp")

    lit_live_source=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(data.get('source', ''))
except Exception:
    print('')
" "$lit_live_resp")

    lit_live_count=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(len(data.get('results', [])))
except Exception:
    print(-1)
" "$lit_live_resp")

    echo "  live search detail: provider=$lit_live_source results_count=$lit_live_count"
    check "live literature search returns valid JSON with results array" "$lit_live_valid"
else
    echo ""
    echo -e "${YELLOW}--- 5. Live Literature Provider Checks -- SKIPPED (RUN_LIVE_LITERATURE_CHECKS=0) ---${NC}"
fi

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
echo ""
echo "============================================"
echo " Smoke Summary"
echo "============================================"
echo " industry cases:     $cases_total"
echo " case-004:           $( [ "$case004_ok" = "true" ] && echo 'ok' || echo 'FAIL' )"
echo " research tasks:     $tasks_count"
echo " literature search:  $( [ "$lit_check" = "true" ] && echo 'not_configured' || echo 'FAIL' )"
echo " anti-spoofing:      $( [ "$spoof_check" != "false" ] && echo 'ok' || echo 'FAIL' )"
echo " CAR-T search:       $( [ "$lit_cart_check" = "true" ] && echo 'not_configured' || echo 'FAIL' )"
echo " empty q validation: $( [ "$empty_status" = "422" ] && [ "$emptyq_status" = "422" ] && echo 'ok' || echo 'FAIL' )"
echo ""

if [ "$fail_count" -eq 0 ]; then
    echo -e "${GREEN}SMOKE PASS${NC} ($pass_count/$((pass_count + fail_count)) checks passed)"
    exit 0
else
    echo -e "${RED}SMOKE FAIL${NC} ($pass_count/$((pass_count + fail_count)) checks passed, $fail_count failed)"
    exit 1
fi