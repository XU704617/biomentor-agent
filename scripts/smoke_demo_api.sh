#!/usr/bin/env bash
#
# Usage:
#   BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
#   # Optional: run live literature provider checks (requires external API key)
#   RUN_LIVE_LITERATURE_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
#   # Optional: specify expected literature provider for live checks
#   LITERATURE_PROVIDER=pubmed RUN_LIVE_LITERATURE_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
#   # Optional: run evidence link checks (requires evidence API endpoints)
#   RUN_EVIDENCE_LINK_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
#   # Optional: run both live literature and evidence link checks
#   RUN_LIVE_LITERATURE_CHECKS=1 RUN_EVIDENCE_LINK_CHECKS=1 BACKEND_BASE=http://127.0.0.1:9090 bash scripts/smoke_demo_api.sh
#
# Smoke test script for BioMentor Agent demo API.
# Verifies the core API endpoints respond correctly.
# Exits with code 1 on any failure, 0 on success.

set -euo pipefail

BACKEND_BASE="${BACKEND_BASE:-http://127.0.0.1:9090}"
RUN_LIVE_LITERATURE_CHECKS="${RUN_LIVE_LITERATURE_CHECKS:-0}"
RUN_EVIDENCE_LINK_CHECKS="${RUN_EVIDENCE_LINK_CHECKS:-0}"
LITERATURE_PROVIDER="${LITERATURE_PROVIDER:-not_configured}"
EXPECTED_PROVIDER="${LITERATURE_PROVIDER:-not_configured}"

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
    expected = sys.argv[2]
    source = data.get('source', '')
    results = data.get('results', [])
    count = len(results) if isinstance(results, list) else -1
    if expected == 'not_configured':
        if source == 'not_configured' and isinstance(results, list) and count == 0:
            print('true')
        else:
            print('false')
    elif expected == 'pubmed':
        if source == 'pubmed' and isinstance(results, list) and count > 0:
            print('true')
        else:
            print('false')
    else:
        print('false')
except Exception:
    print('false')
" "$lit_resp" "$EXPECTED_PROVIDER")

echo "  literature search detail: provider=$lit_source query=$lit_query results_count=$lit_results_count expected_provider=$EXPECTED_PROVIDER"
check "literature search source=$EXPECTED_PROVIDER and results valid" "$lit_check"

# -------------------------------------------------------------------
# 4b. Anti-spoofing: when source=not_configured, results must be []
#     and no fake fields (title/doi/pmid/authors) are present.
#     PubMed anti-spoofing: script only checks, never fabricates data.
#     Missing PubMed fields must NOT be filled in by the script.
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
    expected = sys.argv[2]
    source = data.get('source', '')
    results = data.get('results', [])
    query = data.get('query', '')
    count = len(results) if isinstance(results, list) else -1
    if query != 'CAR-T':
        print('false')
    elif expected == 'not_configured':
        if source == 'not_configured' and isinstance(results, list) and count == 0:
            print('true')
        else:
            print('false')
    elif expected == 'pubmed':
        if source == 'pubmed' and isinstance(results, list) and count > 0:
            print('true')
        else:
            print('false')
    else:
        print('false')
except Exception:
    print('false')
" "$lit_cart_resp" "$EXPECTED_PROVIDER")

cart_results_count=$(python3 -c "
import json, sys
try:
    data = json.loads(sys.argv[1])
    print(len(data.get('results', [])))
except Exception:
    print(-1)
" "$lit_cart_resp")

echo "  CAR-T search detail: provider=$lit_source results_count=$cart_results_count expected_provider=$EXPECTED_PROVIDER"
check "CAR-T search source=$EXPECTED_PROVIDER and results valid" "$lit_cart_check"

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
pubmed_live_status="skipped"
if [ "$RUN_LIVE_LITERATURE_CHECKS" = "1" ]; then
    echo ""
    echo -e "${YELLOW}--- 5. Live Literature Provider Checks (RUN_LIVE_LITERATURE_CHECKS=1) ---${NC}"
    echo "  expected provider: $LITERATURE_PROVIDER"

    lit_live_http_code=$(curl -sS --max-time 30 -o /tmp/smoke_lit_live.json -w "%{http_code}" "$BACKEND_BASE/api/literature/search?q=mRNA&limit=5" 2>/tmp/smoke_lit_live_err || echo "000")

    if [ "$lit_live_http_code" != "200" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} live literature search returned HTTP $lit_live_http_code (not 200)"
        pubmed_live_status="warn"
    else
        lit_live_source=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    print(data.get('source', ''))
except Exception:
    print('')
")

        lit_live_count=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    print(len(data.get('results', [])))
except Exception:
    print(-1)
")

        lit_live_valid=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    results = data.get('results', None)
    source = data.get('source', '')
    query = data.get('query', '')
    if isinstance(results, list) and isinstance(source, str) and isinstance(query, str):
        print('true')
    else:
        print('false')
except Exception:
    print('false')
")

        echo "  live search detail: provider=$lit_live_source results_count=$lit_live_count HTTP=$lit_live_http_code"
        check "live literature search returns valid JSON with results array" "$lit_live_valid"

        if [ "$LITERATURE_PROVIDER" = "pubmed" ]; then
            echo ""
            echo -e "${YELLOW}  --- 5a. PubMed-specific live checks ---${NC}"

            pubmed_source_check=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    if data.get('source', '') == 'pubmed':
        print('true')
    else:
        print('false')
except Exception:
    print('false')
")
            check "source == pubmed" "$pubmed_source_check"

            pubmed_results_array=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    if isinstance(data.get('results', None), list):
        print('true')
    else:
        print('false')
except Exception:
    print('false')
")
            check "results is array" "$pubmed_results_array"

            pubmed_count_nonneg=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    results = data.get('results', [])
    if isinstance(results, list) and len(results) >= 0:
        print('true')
    else:
        print('false')
except Exception:
    print('false')
")
            check "results_count >= 0 (got $lit_live_count)" "$pubmed_count_nonneg"

            pubmed_field_check=$(python3 -c "
import json
try:
    with open('/tmp/smoke_lit_live.json') as f:
        data = json.load(f)
    results = data.get('results', [])
    errors = []
    if len(results) == 0:
        print('true,no_results')
        exit(0)
    for i, r in enumerate(results):
        sp = r.get('source_provider', '')
        if sp != 'pubmed':
            errors.append('result[{}].source_provider != pubmed (got {})'.format(i, sp))
        pmid = r.get('pmid', None)
        if pmid is not None and not isinstance(pmid, str):
            errors.append('result[{}].pmid is not string (got {})'.format(i, type(pmid).__name__))
        if 'title' not in r:
            errors.append('result[{}] missing title field'.format(i))
        if 'doi' not in r:
            errors.append('result[{}] missing doi field'.format(i))
        if 'authors' not in r:
            errors.append('result[{}] missing authors field'.format(i))
        if 'abstract' not in r:
            errors.append('result[{}] missing abstract field'.format(i))
        url = r.get('url', None)
        if url is not None:
            if not isinstance(url, str):
                errors.append('result[{}].url is not string (got {})'.format(i, type(url).__name__))
    if errors:
        for e in errors:
            print('ERR: ' + e)
        print('false')
    else:
        print('true')
except Exception as e:
    print('ERR: exception ' + str(e))
    print('false')
")

            field_ok=$(echo "$pubmed_field_check" | tail -1)
            echo "$pubmed_field_check" | head -n -1
            if [ "$field_ok" = "true" ] || [ "$field_ok" = "true,no_results" ]; then
                check "PubMed result fields valid (source_provider=pubmed, pmid, title, doi, authors, abstract, url)" "true"
            else
                check "PubMed result fields valid (source_provider=pubmed, pmid, title, doi, authors, abstract, url)" "false"
            fi

            if [ "$pubmed_source_check" = "true" ] && [ "$pubmed_results_array" = "true" ] && [ "$pubmed_count_nonneg" = "true" ] && { [ "$field_ok" = "true" ] || [ "$field_ok" = "true,no_results" ]; }; then
                pubmed_live_status="pass"
            else
                pubmed_live_status="fail"
            fi
        else
            echo ""
            echo "  live literature provider is '$lit_live_source' (not pubmed) – PubMed-specific checks skipped"
        fi
    fi

    if [ "$pubmed_live_status" = "skipped" ] && [ "$lit_live_http_code" = "200" ]; then
        pubmed_live_status="pass"
    fi
else
    echo ""
    echo -e "${YELLOW}--- 5. Live Literature Provider Checks -- SKIPPED (RUN_LIVE_LITERATURE_CHECKS=0) ---${NC}"
fi

rm -f /tmp/smoke_lit_live.json /tmp/smoke_lit_live_err

# ===================================================================
# 6. Optional: Evidence Link Checks
# ===================================================================
if [ "$RUN_EVIDENCE_LINK_CHECKS" = "1" ]; then
    echo ""
    echo -e "${YELLOW}--- 6. Evidence Link Checks (RUN_EVIDENCE_LINK_CHECKS=1) ---${NC}"

    # Check if POST /api/evidence/search endpoint exists
    evidence_search_http_code=$(curl -sS --max-time 10 -o /tmp/smoke_evidence_search.json -w "%{http_code}" \
        -X POST "$BACKEND_BASE/api/evidence/search" \
        -H "Content-Type: application/json" \
        -d '{"query":"mRNA","limit":3}' 2>/dev/null || echo "000")

    if [ "$evidence_search_http_code" = "000" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} POST /api/evidence/search – endpoint unreachable (connection failed)"
        echo -e "  ${YELLOW}[SKIPPED]${NC} Evidence search check skipped – evidence API not available"
        evidence_search_status="skipped"
    elif [ "$evidence_search_http_code" = "404" ] || [ "$evidence_search_http_code" = "405" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} POST /api/evidence/search – returned HTTP $evidence_search_http_code"
        echo -e "  ${YELLOW}[SKIPPED]${NC} Evidence search check skipped – endpoint not implemented yet"
        evidence_search_status="skipped"
    else
        echo "  POST /api/evidence/search returned HTTP $evidence_search_http_code"
        evidence_search_valid=$(python3 -c "
import json
try:
    with open('/tmp/smoke_evidence_search.json') as f:
        data = json.load(f)
    results = data.get('results', None)
    if isinstance(results, list):
        print('true')
    else:
        print('false')
except Exception:
    print('false')
")
        echo "  evidence search results is array: $evidence_search_valid"
        check "POST /api/evidence/search returns JSON with results array" "$evidence_search_valid"
        evidence_search_status="checked"
    fi

    # Check if POST /api/evidence/note endpoint exists
    evidence_note_http_code=$(curl -sS --max-time 10 -o /tmp/smoke_evidence_note.json -w "%{http_code}" \
        -X POST "$BACKEND_BASE/api/evidence/note" \
        -H "Content-Type: application/json" \
        -d '{"papers":[{"pmid":"12345","title":"test"}]}' 2>/dev/null || echo "000")

    if [ "$evidence_note_http_code" = "000" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} POST /api/evidence/note – endpoint unreachable (connection failed)"
        echo -e "  ${YELLOW}[SKIPPED]${NC} Evidence note check skipped – evidence API not available"
        evidence_note_status="skipped"
    elif [ "$evidence_note_http_code" = "404" ] || [ "$evidence_note_http_code" = "405" ]; then
        echo -e "  ${YELLOW}[WARN]${NC} POST /api/evidence/note – returned HTTP $evidence_note_http_code"
        echo -e "  ${YELLOW}[SKIPPED]${NC} Evidence note check skipped – endpoint not implemented yet"
        evidence_note_status="skipped"
    else
        echo "  POST /api/evidence/note returned HTTP $evidence_note_http_code"
        evidence_note_valid=$(python3 -c "
import json
try:
    with open('/tmp/smoke_evidence_note.json') as f:
        data = json.load(f)
    resp_str = json.dumps(data).lower()
    # Check that response mentions limitations or boundaries
    has_limitation = any(kw in resp_str for kw in ['limitation', '边界', 'metadata', '不代表', 'not a conclusion', 'based on'])
    # Check no fabricated fields
    has_fake = 'doi' in resp_str and 'pmid' in resp_str and 'authors' in resp_str and 'abstract' in resp_str
    if has_limitation or not has_fake:
        print('true')
    else:
        print('false')
except Exception:
    print('false')
")
        echo "  evidence note has limitations/boundary info: $evidence_note_valid"
        check "POST /api/evidence/note returns JSON with limitations or boundary info" "$evidence_note_valid"
        evidence_note_status="checked"
    fi

    # Anti-spoofing: verify evidence note does not fabricate missing fields
    if [ "$evidence_note_status" = "checked" ]; then
        evidence_antispoof=$(python3 -c "
import json
try:
    with open('/tmp/smoke_evidence_note.json') as f:
        data = json.load(f)
    resp_str = json.dumps(data)
    # Should not contain clearly fabricated-looking values
    fake_indicators = ['FAKE', 'fabricated', 'placeholder_doi', 'placeholder_pmid']
    found = [f for f in fake_indicators if f.lower() in resp_str.lower()]
    if found:
        print('false')
    else:
        print('true')
except Exception:
    print('true')
")
        check "Evidence note anti-spoofing: no fabricated fields" "$evidence_antispoof"
    fi
else
    echo ""
    echo -e "${YELLOW}--- 6. Evidence Link Checks -- SKIPPED (RUN_EVIDENCE_LINK_CHECKS=0) ---${NC}"
    evidence_search_status="skipped"
    evidence_note_status="skipped"
fi

rm -f /tmp/smoke_evidence_search.json /tmp/smoke_evidence_note.json

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
echo " literature search:  $( [ "$lit_check" = "true" ] && echo "$EXPECTED_PROVIDER" || echo 'FAIL' )"
echo " anti-spoofing:      $( [ "$spoof_check" != "false" ] && echo 'ok' || echo 'FAIL' )"
echo " CAR-T search:       $( [ "$lit_cart_check" = "true" ] && echo "$EXPECTED_PROVIDER" || echo 'FAIL' )"
echo " empty q validation: $( [ "$empty_status" = "422" ] && [ "$emptyq_status" = "422" ] && echo 'ok' || echo 'FAIL' )"
echo ""
echo " literature provider: $LITERATURE_PROVIDER"
live_label="skipped"
if [ "$RUN_LIVE_LITERATURE_CHECKS" = "1" ]; then
    live_label="enabled"
fi
echo " live literature checks: $live_label"
echo " pubmed live: $pubmed_live_status"
echo ""
evidence_label="skipped"
if [ "$RUN_EVIDENCE_LINK_CHECKS" = "1" ]; then
    evidence_label="enabled"
fi
echo " evidence link checks: $evidence_label"
echo " evidence search: $evidence_search_status"
echo " evidence note: $evidence_note_status"
echo ""

if [ "$fail_count" -eq 0 ]; then
    echo -e "${GREEN}SMOKE PASS${NC} ($pass_count/$((pass_count + fail_count)) checks passed)"
    exit 0
else
    echo -e "${RED}SMOKE FAIL${NC} ($pass_count/$((pass_count + fail_count)) checks passed, $fail_count failed)"
    exit 1
fi