#!/usr/bin/env bash
#
# Usage:
#   BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
# Smoke test script for BioMentor Agent demo API.
# Verifies the core API endpoints respond correctly.
# Exits with code 1 on any failure, 0 on success.

set -euo pipefail

BACKEND_BASE="${BACKEND_BASE:-http://127.0.0.1:9090}"

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
    # If it has a case_key field, it's a valid case object
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

# -------------------------------------------------------------------
# 4. GET /api/literature/search?q=mRNA&limit=5
# -------------------------------------------------------------------
echo "--- 4. GET /api/literature/search?q=mRNA&limit=5 ---"
lit_resp=$(fetch_json "$BACKEND_BASE/api/literature/search?q=mRNA&limit=5")

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

check "literature search source=not_configured and results=[]" "$lit_check"

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
echo ""
echo "============================================"
echo " Smoke Summary"
echo "============================================"
echo " industry cases:  $cases_total"
echo " case-004:        $( [ "$case004_ok" = "true" ] && echo 'ok' || echo 'FAIL' )"
echo " research tasks:  $tasks_count"
echo " literature search: $( [ "$lit_check" = "true" ] && echo 'not_configured' || echo 'FAIL' )"
echo ""

if [ "$fail_count" -eq 0 ]; then
    echo -e "${GREEN}SMOKE PASS${NC} ($pass_count/$((pass_count + fail_count)) checks passed)"
    exit 0
else
    echo -e "${RED}SMOKE FAIL${NC} ($pass_count/$((pass_count + fail_count)) checks passed, $fail_count failed)"
    exit 1
fi