#!/usr/bin/env bash
#
# Demo Quality Validation Runner
#
# Usage:
#   bash scripts/run_demo_quality_checks.sh
#
#   # Enable optional checks
#   RUN_EVIDENCE_LINK_CHECKS=1 bash scripts/run_demo_quality_checks.sh
#   RUN_LIVE_LITERATURE_CHECKS=1 LITERATURE_PROVIDER=pubmed bash scripts/run_demo_quality_checks.sh
#
#   # Custom backend URL
#   BACKEND_BASE=http://127.0.0.1:9090 bash scripts/run_demo_quality_checks.sh
#
# This script performs a comprehensive quality check of the BioMentor Agent demo.
# It does NOT start services – it only checks whether services are available.
# Exits with code 0 on success, 1 on any failure.

set -euo pipefail

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------
BACKEND_BASE="${BACKEND_BASE:-http://127.0.0.1:9090}"
RUN_EVIDENCE_LINK_CHECKS="${RUN_EVIDENCE_LINK_CHECKS:-1}"
RUN_LIVE_LITERATURE_CHECKS="${RUN_LIVE_LITERATURE_CHECKS:-0}"
LITERATURE_PROVIDER="${LITERATURE_PROVIDER:-not_configured}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Track results
overall_pass=true
default_smoke_status="not_run"
evidence_status="skipped"
live_provider_status="skipped"

# -------------------------------------------------------------------
# Helper functions
# -------------------------------------------------------------------
print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_section() {
    echo ""
    echo -e "${YELLOW}--- $1 ---${NC}"
}

check_backend_reachable() {
    print_section "Backend Health Check"

    local http_code
    http_code=$(curl -sS --max-time 10 -o /dev/null -w "%{http_code}" "$BACKEND_BASE/docs" 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}[PASS]${NC} Backend is reachable at $BACKEND_BASE (HTTP $http_code)"
        return 0
    else
        echo -e "  ${RED}[FAIL]${NC} Backend is NOT reachable at $BACKEND_BASE (HTTP $http_code)"
        echo "  Please ensure the backend is running:"
        echo "    cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 9090"
        overall_pass=false
        return 1
    fi
}

run_default_smoke() {
    print_section "Default Smoke Tests (via smoke_demo_api.sh)"

    if [ ! -f "$SCRIPT_DIR/smoke_demo_api.sh" ]; then
        echo -e "  ${RED}[FAIL]${NC} smoke_demo_api.sh not found at $SCRIPT_DIR/smoke_demo_api.sh"
        default_smoke_status="fail"
        overall_pass=false
        return 1
    fi

    echo "  Running: BACKEND_BASE=$BACKEND_BASE LITERATURE_PROVIDER=$LITERATURE_PROVIDER RUN_EVIDENCE_LINK_CHECKS=0 RUN_LIVE_LITERATURE_CHECKS=0 bash scripts/smoke_demo_api.sh"
    echo ""

    if BACKEND_BASE="$BACKEND_BASE" \
       LITERATURE_PROVIDER="$LITERATURE_PROVIDER" \
       RUN_EVIDENCE_LINK_CHECKS=0 \
       RUN_LIVE_LITERATURE_CHECKS=0 \
       bash "$SCRIPT_DIR/smoke_demo_api.sh"; then
        default_smoke_status="pass"
        return 0
    else
        default_smoke_status="fail"
        overall_pass=false
        return 1
    fi
}

run_evidence_checks() {
    print_section "Evidence Link Checks (via smoke_demo_api.sh)"

    if [ "$RUN_EVIDENCE_LINK_CHECKS" != "1" ]; then
        echo -e "  ${YELLOW}[SKIPPED]${NC} Evidence checks disabled (set RUN_EVIDENCE_LINK_CHECKS=1 to enable)"
        evidence_status="skipped"
        return 0
    fi

    if [ ! -f "$SCRIPT_DIR/smoke_demo_api.sh" ]; then
        echo -e "  ${RED}[FAIL]${NC} smoke_demo_api.sh not found"
        evidence_status="fail"
        overall_pass=false
        return 1
    fi

    echo "  Running: BACKEND_BASE=$BACKEND_BASE RUN_EVIDENCE_LINK_CHECKS=1 bash scripts/smoke_demo_api.sh (evidence section only)"
    echo ""

    local tmp_file
    tmp_file=$(mktemp)

    if BACKEND_BASE="$BACKEND_BASE" \
       LITERATURE_PROVIDER="$LITERATURE_PROVIDER" \
       RUN_EVIDENCE_LINK_CHECKS=1 \
       RUN_LIVE_LITERATURE_CHECKS=0 \
       bash "$SCRIPT_DIR/smoke_demo_api.sh" > "$tmp_file" 2>&1; then
        echo -e "  ${GREEN}[PASS]${NC} Evidence checks passed"
        evidence_status="pass"
        rm -f "$tmp_file"
        return 0
    else
        local exit_code=$?
        echo -e "  ${RED}[FAIL]${NC} Evidence checks failed (exit code: $exit_code)"
        echo "  See output above for details"
        evidence_status="fail"
        overall_pass=false
        rm -f "$tmp_file"
        return 1
    fi
}

run_live_provider_checks() {
    print_section "Live Literature Provider Checks (via smoke_demo_api.sh)"

    if [ "$RUN_LIVE_LITERATURE_CHECKS" != "1" ]; then
        echo -e "  ${YELLOW}[SKIPPED]${NC} Live provider checks disabled (set RUN_LIVE_LITERATURE_CHECKS=1 to enable)"
        echo "  NOTE: Live checks may require external API access"
        live_provider_status="skipped"
        return 0
    fi

    if [ ! -f "$SCRIPT_DIR/smoke_demo_api.sh" ]; then
        echo -e "  ${RED}[FAIL]${NC} smoke_demo_api.sh not found"
        live_provider_status="fail"
        overall_pass=false
        return 1
    fi

    echo "  Running: BACKEND_BASE=$BACKEND_BASE LITERATURE_PROVIDER=$LITERATURE_PROVIDER RUN_LIVE_LITERATURE_CHECKS=1 bash scripts/smoke_demo_api.sh"
    echo ""
    echo -e "  ${YELLOW}[WARN]${NC} Live checks require external API access. Proceeding..."
    echo ""

    if BACKEND_BASE="$BACKEND_BASE" \
       LITERATURE_PROVIDER="$LITERATURE_PROVIDER" \
       RUN_EVIDENCE_LINK_CHECKS=0 \
       RUN_LIVE_LITERATURE_CHECKS=1 \
       bash "$SCRIPT_DIR/smoke_demo_api.sh"; then
        live_provider_status="pass"
        return 0
    else
        live_provider_status="fail"
        overall_pass=false
        return 1
    fi
}

print_summary() {
    print_header "Demo Quality Validation Summary"

    echo ""
    echo -e "  ${BLUE}Environment:${NC}"
    echo "    Backend:       $BACKEND_BASE"
    echo "    Commit:        $(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    echo "    Branch:        $(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
    echo "    Date:          $(date '+%Y-%m-%d %H:%M:%S %Z')"

    echo ""
    echo -e "  ${BLUE}Results:${NC}"

    if [ "$default_smoke_status" = "pass" ]; then
        echo -e "    Default smoke:     ${GREEN}[PASS]${NC}"
    elif [ "$default_smoke_status" = "fail" ]; then
        echo -e "    Default smoke:     ${RED}[FAIL]${NC}"
    else
        echo -e "    Default smoke:     ${YELLOW}[NOT RUN]${NC}"
    fi

    if [ "$evidence_status" = "pass" ]; then
        echo -e "    Evidence checks:   ${GREEN}[PASS]${NC}"
    elif [ "$evidence_status" = "fail" ]; then
        echo -e "    Evidence checks:   ${RED}[FAIL]${NC}"
    else
        echo -e "    Evidence checks:   ${YELLOW}[SKIPPED]${NC}"
    fi

    if [ "$live_provider_status" = "pass" ]; then
        echo -e "    Live provider:     ${GREEN}[PASS]${NC}"
    elif [ "$live_provider_status" = "fail" ]; then
        echo -e "    Live provider:     ${RED}[FAIL]${NC}"
    else
        echo -e "    Live provider:     ${YELLOW}[SKIPPED]${NC}"
    fi

    echo ""
    echo -e "  ${BLUE}Configuration:${NC}"
    echo "    RUN_EVIDENCE_LINK_CHECKS:    $RUN_EVIDENCE_LINK_CHECKS"
    echo "    RUN_LIVE_LITERATURE_CHECKS:  $RUN_LIVE_LITERATURE_CHECKS"
    echo "    LITERATURE_PROVIDER:         $LITERATURE_PROVIDER"

    echo ""
    if [ "$overall_pass" = "true" ]; then
        echo -e "  ${GREEN}============================================${NC}"
        echo -e "  ${GREEN}  OVERALL: PASS${NC}"
        echo -e "  ${GREEN}============================================${NC}"
        exit 0
    else
        echo -e "  ${RED}============================================${NC}"
        echo -e "  ${RED}  OVERALL: FAIL${NC}"
        echo -e "  ${RED}============================================${NC}"
        exit 1
    fi
}

# -------------------------------------------------------------------
# Main execution
# -------------------------------------------------------------------
print_header "BioMentor Agent Demo Quality Validation"
echo "  Backend: $BACKEND_BASE"
echo "  Evidence checks: $([ "$RUN_EVIDENCE_LINK_CHECKS" = "1" ] && echo 'enabled' || echo 'disabled')"
echo "  Live provider:   $([ "$RUN_LIVE_LITERATURE_CHECKS" = "1" ] && echo "enabled (provider=$LITERATURE_PROVIDER)" || echo 'disabled')"

# Step 1: Check backend is reachable
check_backend_reachable || {
    echo ""
    echo -e "${RED}Backend not reachable. Aborting further checks.${NC}"
    print_summary
}

# Step 2: Run default smoke tests (always runs, no external deps)
run_default_smoke || true

# Step 3: Run evidence checks (optional)
run_evidence_checks || true

# Step 4: Run live provider checks (optional, requires external access)
run_live_provider_checks || true

# Step 5: Print summary
print_summary
