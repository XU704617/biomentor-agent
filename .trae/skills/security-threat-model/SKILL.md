---
name: security-threat-model
description: Repository-grounded threat modeling that enumerates trust boundaries, assets, attacker capabilities, abuse paths, and mitigations. Invoke when user explicitly asks to threat model a codebase, enumerate threats, or perform AppSec threat modeling.
---

# Threat Model Source Code Repo

Deliver an actionable AppSec-grade threat model that is specific to the repository or a project path, not a generic checklist. Anchor every architectural claim to evidence in the repo and keep assumptions explicit. Prioritize realistic attacker goals and concrete impacts over generic checklists.

## Quick Start

1. Collect (or infer) inputs:
   - Repo root path and any in-scope paths
   - Intended usage, deployment model, internet exposure, and auth expectations (if known)
   - Any existing repository summary or architecture spec

## Workflow

### 1. Scope and Extract the System Model

- Identify primary components, data stores, and external integrations
- Identify how the system runs (server, CLI, library, worker) and its entrypoints
- Separate runtime behavior from CI/build/dev tooling and from tests/examples
- Map in-scope locations to components and exclude out-of-scope items explicitly
- Do not claim components, flows, or controls without evidence

### 2. Derive Boundaries, Assets, and Entry Points

- Enumerate trust boundaries as concrete edges between components, noting protocol, auth, encryption, validation, and rate limiting
- List assets that drive risk (data, credentials, models, config, compute resources, audit logs)
- Identify entry points (endpoints, upload surfaces, parsers/decoders, job triggers, admin tooling, logging/error sinks)

### 3. Calibrate Assets and Attacker Capabilities

- List the assets that drive risk (credentials, PII, integrity-critical state, availability-critical components, build artifacts)
- Describe realistic attacker capabilities based on exposure and intended usage
- Explicitly note non-capabilities to avoid inflated severity

### 4. Enumerate Threats as Abuse Paths

- Prefer attacker goals that map to assets and boundaries (exfiltration, privilege escalation, integrity compromise, denial of service)
- Classify each threat and tie it to impacted assets
- Keep the number of threats small but high quality

### 5. Prioritize with Explicit Likelihood and Impact Reasoning

- Use qualitative likelihood and impact (low/medium/high) with short justifications
- Set overall priority (critical/high/medium/low) using likelihood × impact, adjusted for existing controls
- State which assumptions most influence the ranking

### 6. Validate Service Context and Assumptions with the User

- Summarize key assumptions that materially affect threat ranking or scope, then ask the user to confirm or correct them
- Ask 1-3 targeted questions to resolve missing context (service owner, environment, scale, deployment model, authn/authz, internet exposure, data sensitivity, multi-tenancy)
- Pause and wait for user feedback before producing the final report
- If the user declines or can't answer, state which assumptions remain and how they influence priority

### 7. Recommend Mitigations and Focus Paths

- Distinguish existing mitigations (with evidence) from recommended mitigations
- Tie mitigations to concrete locations (component, boundary, or entry point) and control types (authZ checks, input validation, schema enforcement, sandboxing, rate limits, secrets isolation, audit logging)
- Prefer specific implementation hints over generic advice
- Base recommendations on validated user context; if assumptions remain unresolved, mark recommendations as conditional

### 8. Run a Quality Check Before Finalizing

- Confirm all discovered entrypoints are covered
- Confirm each trust boundary is represented in threats
- Confirm runtime vs CI/dev separation
- Confirm user clarifications (or explicit non-responses) are reflected
- Confirm assumptions and open questions are explicit
- Write the final markdown to a file named `<repo-or-dir-name>-threat-model.md`

## Risk Prioritization Guidance

- **High**: pre-auth RCE, auth bypass, cross-tenant access, sensitive data exfiltration, key or token theft, model or config integrity compromise, sandbox escape
- **Medium**: targeted DoS of critical components, partial data exposure, rate-limit bypass with measurable impact, log/metrics poisoning that affects detection
- **Low**: low-sensitivity info leaks, noisy DoS with easy mitigation, issues requiring unlikely preconditions

## Output Format

Deliver a concise Markdown threat model covering:

```markdown
# Threat Model: <project-name>

## System Overview
<brief description of system architecture, deployment model, and key components>

## Scope
- In scope: <paths/components>
- Out of scope: <excluded items with rationale>

## Trust Boundaries
<list each boundary with protocol, auth, encryption details>

## Assets
<list each asset with sensitivity and impact>

## Attacker Model
<capabilities, access level, motivation>

## Threats
| ID | Threat | Impact | Likelihood | Priority | Asset | Boundary |
|----|--------|--------|------------|----------|-------|----------|
| T-01 | ... | High | Medium | High | ... | ... |

## Existing Mitigations
<evidence-backed existing controls>

## Recommended Mitigations
<prioritized recommendations tied to specific locations>

## Assumptions and Open Questions
<explicit assumptions and unresolved context>
```
