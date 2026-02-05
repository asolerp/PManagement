---
description: Three-phase workflow with virtual subagents (Planner/Implementer/Reviewer)
alwaysApply: true
---

# Agent Workflow

Every non-trivial task follows a three-phase approach with virtual subagents.

## Phase 1: Planner 🎯

**Goal**: Understand, scope, and design before touching code.

### Actions

1. Analyze the request and clarify ambiguities
2. Identify affected files and dependencies
3. Propose implementation plan with steps
4. Estimate risk and complexity
5. Ask clarifying questions if needed

### Output Format

```markdown
## 🎯 Plan

**Scope**: [1-2 sentence summary]

**Files to modify**:

- `path/to/file.js` - reason
- `path/to/other.js` - reason

**Steps**:

1. Step one description
2. Step two description
3. ...

**Risks**: [potential issues]
**Dependencies**: [blockers or prerequisites]
```

### Exit Criteria

- User approves plan, OR
- Plan is trivial (< 3 files, clear scope)

---

## Phase 2: Implementer 🔨

**Goal**: Execute the plan with clean, tested code.

### Actions

1. Follow the approved plan step by step
2. Write code following project conventions
3. Add/update tests for new logic
4. Run lint and fix issues
5. Keep changes minimal and focused

### Rules

- One logical change per commit
- Follow existing patterns in codebase
- No unrelated refactoring
- Comment complex logic

### Output Format

```markdown
## 🔨 Implementation

**Changes made**:

- `file.js`: description of change
- `other.js`: description of change

**Tests**: [added/updated/skipped with reason]
```

---

## Phase 3: Reviewer 🔍

**Goal**: Verify quality and completeness before finishing.

### Checklist

```markdown
## 🔍 Review

### Code Quality

- [ ] Follows project conventions
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling present
- [ ] No console.log in production code

### Testing

- [ ] Tests pass (`npm test`)
- [ ] New logic has coverage
- [ ] Edge cases considered

### Build

- [ ] Lint passes (`npm run lint`)
- [ ] App builds successfully
- [ ] No TypeScript errors (if applicable)

### Documentation

- [ ] Complex logic commented
- [ ] API changes documented
- [ ] Breaking changes noted
```

### Output Format

````markdown
## 🔍 Review Summary

**Status**: ✅ Ready / ⚠️ Needs fixes / ❌ Blocked

**Verification**:

```bash
npm run lint     # ✅ passed
npm test         # ✅ passed
```
````

**Remaining issues**: [if any]
**How to test manually**: [steps]

```

---

## Quick Reference

| Phase | Icon | Focus | Output |
|-------|------|-------|--------|
| Planner | 🎯 | Scope & design | Plan with files/steps |
| Implementer | 🔨 | Write code | Changes + tests |
| Reviewer | 🔍 | Verify quality | Checklist + summary |

## When to Skip Phases

- **Trivial tasks** (typo fix, config change): Skip Planner, light Review
- **Exploration/questions**: Skip all, just answer
- **Urgent hotfix**: Abbreviated Planner, full Implementer, focused Review
```
