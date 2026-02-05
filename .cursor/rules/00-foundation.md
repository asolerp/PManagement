---
description: Core project rules - workflow, quality, and verification
alwaysApply: true
---

# Foundation Rules

## Objectives

- Prefer correctness and maintainability over cleverness.
- Every change must be testable or verifiable via build/run.
- Clean code > code that's quick to write.

## Workflow

1. Clarify scope in 3-7 bullet points.
2. Propose plan + file list before editing.
3. Implement in small, reviewable commits.
4. Run checks: lint, typecheck, tests, build.
5. Summarize: what changed, why, how to verify, risks.

## Output Format

Always include:

- ✅ **Verification**: exact commands to validate
- 🧪 **Tests**: added/updated
- 🧩 **Impact**: affected modules/screens
- ⚠️ **Risks**: potential regressions and rollback

## Code Principles

```javascript
// ❌ Avoid
const x = data?.foo?.bar?.baz ?? defaultValue;

// ✅ Prefer - explicit and debuggable
const foo = data?.foo;
const bar = foo?.bar;
const result = bar?.baz ?? defaultValue;
```

## Commits

- Format: `type(scope): concise description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Scope: affected module or feature
