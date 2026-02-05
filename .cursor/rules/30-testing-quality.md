---
description: Testing and code quality
globs: '**/*.{test,spec}.{js,ts,tsx}'
alwaysApply: false
---

# Testing & Quality

## Testing Strategy

| Type        | What to test               | Tool           |
| ----------- | -------------------------- | -------------- |
| Unit        | Pure logic, utils, atoms   | Jest           |
| Integration | Hooks, services with mocks | Jest + RTL     |
| Component   | Isolated components        | RTL            |
| E2E         | Critical flows             | Detox (future) |

## Structure

```
src/
├── __tests__/           # Integration tests
├── components/
│   └── Button/
│       ├── Button.js
│       └── Button.test.js  # Colocated tests
└── Services/
    └── __tests__/       # Service tests
```

## Test Patterns

```javascript
// ✅ Clear describe, specific test
describe('calculateTotal', () => {
  it('returns 0 for empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('sums item prices correctly', () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });
});

// ✅ Minimal and realistic mocks
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ data: () => mockData }))
      }))
    }))
  })
}));
```

## Coverage

```bash
# Run with coverage
npm test -- --coverage

# Minimum threshold (jest.config.js)
coverageThreshold: {
  global: {
    branches: 60,
    functions: 60,
    lines: 70,
  },
}
```

## Rules

- Every bugfix: add regression test
- Business logic: 80%+ coverage
- UI components: interaction tests, not excessive snapshots
- Mocks: minimum necessary, realistic data
