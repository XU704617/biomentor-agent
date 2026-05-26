---
name: systematic-debugging
description: Use for ANY technical issue - test failures, bugs, unexpected behavior, performance problems. Find root cause before attempting fixes. Symptom fixes are failure.
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings - they often contain the exact solution
   - Read stack traces completely, note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably? What are the exact steps?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed? Git diff, recent commits, new dependencies, config changes

4. **Gather Evidence in Multi-Component Systems**
   - For each component boundary: log what data enters and exits
   - Run once to gather evidence showing WHERE it breaks
   - Then investigate that specific component

5. **Trace Data Flow**
   - Where does bad value originate? What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

1. **Find Working Examples** - Locate similar working code in same codebase
2. **Compare Against References** - If implementing pattern, read reference implementation COMPLETELY
3. **Identify Differences** - What's different between working and broken? List every difference.
4. **Understand Dependencies** - What other components does this need?

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis** - "I think X is the root cause because Y"
2. **Test Minimally** - Make the SMALLEST possible change, one variable at a time
3. **Verify Before Continuing** - Did it work? Yes → Phase 4. No → Form NEW hypothesis

### Phase 4: Implementation

1. **Create Failing Test Case** - Simplest reproduction, must have before fixing
2. **Implement Single Fix** - Address root cause, ONE change at a time
3. **Verify Fix** - Test passes? No regressions?
4. **If Fix Doesn't Work:**
   - If < 3 attempts: Return to Phase 1
   - **If ≥ 3 failures: STOP and question the architecture**

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## Red Flags - STOP and Follow Process

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "It's probably X, let me fix that"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)

**ALL of these mean: STOP. Return to Phase 1.**

## Real-World Impact

- Systematic approach: 15-30 minutes to fix
- Random fixes approach: 2-3 hours of thrashing
- First-time fix rate: 95% vs 40%
