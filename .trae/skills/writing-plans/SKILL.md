---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans with bite-sized tasks. Document everything: which files to touch, code, testing, and how to verify. DRY. YAGNI. TDD. Frequent commits.

Assume the implementer is a skilled developer but has zero context for the codebase.

## Plan Document Header

Every plan MUST start with:

```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

Each task is one self-contained unit of work (2-5 minutes):

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**
```

## No Placeholders

Every step must contain the actual content needed. These are **plan failures** - never write them:
- "TBD", "TODO", "implement later"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code)
- Steps that describe what to do without showing how

## File Structure

Before defining tasks, map out which files will be created or modified and what each is responsible for. Design units with clear boundaries.

## Bite-Sized Task Granularity

Each step is one action (2-5 minutes):
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Self-Review

After writing the complete plan:
1. **Spec coverage:** Can you point to a task that implements each requirement?
2. **Placeholder scan:** Search for any patterns from "No Placeholders" above
3. **Type consistency:** Do types, signatures, and property names match across tasks?

## Remember
- Exact file paths always
- Complete code in every step
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits
