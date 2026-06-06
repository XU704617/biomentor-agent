#!/usr/bin/env bash
#
# Usage:
#   FRONTEND_URL=https://your-frontend.example.com bash scripts/check_deployed_frontend.sh
#
# Checks:
#   1. FRONTEND_URL is set
#   2. GET $FRONTEND_URL/api/deploy-health
#   3. GET $FRONTEND_URL/api/industry/cases?page_size=100
#   4. GET $FRONTEND_URL/api/literature/search?q=mRNA&limit=3
#
# Outputs a summary and exits with 1 on failure.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

failures=0

_pass()  { echo -e "${GREEN}[PASS]${NC} $*"; }
_fail() { echo -e "${RED}[FAIL]${NC} $*"; failures=$((failures + 1)); }
_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
_info() { echo -e "${CYAN}[INFO]${NC} $*"; }

if [ -z "${FRONTEND_URL:-}" ]; then
  echo "ERROR: FRONTEND_URL is not set."
  echo "Usage: FRONTEND_URL=https://your-frontend.example.com bash $0"
  exit 1
fi

FRONTEND_URL="${FRONTEND_URL%/}"

echo "============================================"
echo "  BioMentor Agent — Deployed Frontend Check"
echo "  Target: $FRONTEND_URL"
echo "============================================"
echo ""

# --- 1. Deploy Health ---
echo "--- Check 1: /api/deploy-health ---"
health_raw=$(curl -sS --max-time 30 "${FRONTEND_URL}/api/deploy-health" 2>&1) || {
  _fail "deploy-health request failed: $health_raw"
  health_ok=0
}

if [ "${health_ok:-1}" -ne 0 ]; then
  health_json=$(echo "$health_raw" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(json.dumps({
        'frontend': data.get('frontend', 'unknown'),
        'backendConfigured': data.get('backendConfigured', False),
        'backendReachable': data.get('backendReachable', False),
        'backendBaseUrlHost': data.get('backendBaseUrlHost', ''),
        'backendBaseUrlLooksLocal': data.get('backendBaseUrlLooksLocal', False),
        'casesCount': data.get('casesCount', 0),
        'warnings': data.get('warnings', []),
    }))
except Exception as e:
    print(json.dumps({'error': str(e)}))
" 2>&1) || {
    _fail "deploy-health JSON parse failed"
    health_ok=0
  }
fi

if [ "${health_ok:-1}" -ne 0 ]; then
  frontend_status=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['frontend'])" 2>/dev/null || echo "unknown")
  backend_configured=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['backendConfigured'])" 2>/dev/null || echo "false")
  backend_reachable=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['backendReachable'])" 2>/dev/null || echo "false")
  backend_host=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['backendBaseUrlHost'])" 2>/dev/null || echo "")
  backend_looks_local=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['backendBaseUrlLooksLocal'])" 2>/dev/null || echo "false")
  cases_count=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['casesCount'])" 2>/dev/null || echo "0")
  warnings=$(echo "$health_json" | python3 -c "import sys,json; print(json.load(sys.stdin)['warnings'])" 2>/dev/null || echo "[]")

  if [ "$frontend_status" = "ok" ]; then
    _pass "frontend health: ok"
  else
    _fail "frontend health: $frontend_status"
  fi

  if [ "$backend_configured" = "True" ]; then
    _pass "backend configured: yes"
  else
    _warn "backend configured: no"
  fi

  if [ "$backend_reachable" = "True" ]; then
    _pass "backend reachable: yes"
  else
    _fail "backend reachable: no"
  fi

  if [ "$backend_looks_local" = "True" ]; then
    _warn "backend URL looks local (${backend_host}) — not suitable for public deployment"
  fi

  _info "backend host: ${backend_host:-none}"
  _info "industry cases count: ${cases_count}"
fi

echo ""

# --- 2. Industry Cases ---
echo "--- Check 2: /api/industry/cases?page_size=100 ---"
cases_raw=$(curl -sS --max-time 30 "${FRONTEND_URL}/api/industry/cases?page_size=100" 2>&1) || {
  _fail "industry/cases request failed: $cases_raw"
  cases_ok=0
}

if [ "${cases_ok:-1}" -ne 0 ]; then
  cases_count=$(echo "$cases_raw" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    items = data.get('items', [])
    print(len(items))
except:
    print(0)
" 2>/dev/null || echo "0")

  if [ "$cases_count" -gt 10 ]; then
    _pass "industry cases count: ${cases_count}"
  elif [ "$cases_count" -gt 0 ]; then
    _warn "industry cases count: ${cases_count} (likely fallback data, check backend connectivity)"
  else
    _fail "industry cases count: 0"
  fi
fi

echo ""

# --- 3. Literature Search ---
echo "--- Check 3: /api/literature/search?q=mRNA&limit=3 ---"
lit_raw=$(curl -sS --max-time 30 "${FRONTEND_URL}/api/literature/search?q=mRNA&limit=3" 2>&1) || {
  _fail "literature/search request failed: $lit_raw"
  lit_ok=0
}

if [ "${lit_ok:-1}" -ne 0 ]; then
  lit_status=$(echo "$lit_raw" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, dict) and 'error' in data:
        print('error')
    elif isinstance(data, dict) and 'items' in data:
        print('ok')
    elif isinstance(data, list):
        print('ok')
    else:
        print('unknown')
except:
    print('parse_error')
" 2>/dev/null || echo "parse_error")

  if [ "$lit_status" = "ok" ]; then
    _pass "literature search: ok"
  elif [ "$lit_status" = "error" ]; then
    _warn "literature search: returned error (provider may not be configured)"
  else
    _fail "literature search: unexpected response"
  fi
fi

echo ""
echo "============================================"
echo "  Summary"
echo "============================================"
echo ""

printf "  %-25s %s\n" "frontend health:" "$([ "${frontend_status:-fail}" = "ok" ] && echo -e "${GREEN}ok${NC}" || echo -e "${RED}fail${NC}")"
printf "  %-25s %s\n" "backend configured:" "$([ "${backend_configured:-False}" = "True" ] && echo -e "${GREEN}yes${NC}" || echo -e "${YELLOW}no${NC}")"
printf "  %-25s %s\n" "backend reachable:" "$([ "${backend_reachable:-False}" = "True" ] && echo -e "${GREEN}yes${NC}" || echo -e "${RED}no${NC}")"
printf "  %-25s %s\n" "industry cases count:" "${cases_count:-N/A}"
printf "  %-25s %s\n" "literature search:" "$([ "${lit_status:-fail}" = "ok" ] && echo -e "${GREEN}ok${NC}" || echo -e "${RED}fail/warn${NC}")"
printf "  %-25s %s\n" "backend host:" "${backend_host:-N/A}"
printf "  %-25s %s\n" "backend URL looks local:" "$([ "${backend_looks_local:-False}" = "True" ] && echo -e "${YELLOW}yes (not suitable for public deployment)${NC}" || echo "no")"

echo ""
if [ "$failures" -gt 0 ]; then
  echo -e "${RED}${failures} check(s) failed.${NC}"
  exit 1
else
  echo -e "${GREEN}All checks passed.${NC}"
  exit 0
fi
