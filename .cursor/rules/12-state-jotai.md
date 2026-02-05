---
description: State management with Jotai (migrating from Redux)
globs: '**/*.{js,ts,tsx}'
alwaysApply: false
---

# State with Jotai

## Context

- Migrating from Redux to Jotai
- Jotai = primitive atoms, simple composition
- Temporary coexistence with Redux during migration

## Basic Atoms

```javascript
// atoms/user.js
import { atom } from 'jotai';

// Primitive atom
export const userAtom = atom(null);

// Derived atom (read-only)
export const isLoggedInAtom = atom(get => get(userAtom) !== null);

// Atom with custom write
export const userNameAtom = atom(
  get => get(userAtom)?.name ?? '',
  (get, set, newName) => {
    const user = get(userAtom);
    set(userAtom, { ...user, name: newName });
  }
);
```

## Usage in Components

```javascript
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

// Read + write
const [user, setUser] = useAtom(userAtom);

// Read only (optimized)
const isLoggedIn = useAtomValue(isLoggedInAtom);

// Write only (no re-render on changes)
const setUser = useSetAtom(userAtom);
```

## Organization

```
src/
└── atoms/
    ├── index.js       # Re-exports
    ├── user.js        # User atoms
    ├── filters.js     # Filter atoms
    └── ui.js          # UI state
```

## Patterns

```javascript
// ✅ Small and composable atoms
export const selectedHouseIdAtom = atom(null);
export const housesAtom = atom([]);
export const selectedHouseAtom = atom(get => {
  const id = get(selectedHouseIdAtom);
  const houses = get(housesAtom);
  return houses.find(h => h.id === id);
});

// ❌ Avoid giant atoms with all state
export const appStateAtom = atom({ user: {}, houses: [], ui: {} });
```

## Async with Jotai

```javascript
// Async atom (suspense-compatible)
export const userDataAtom = atom(async get => {
  const userId = get(userIdAtom);
  if (!userId) return null;
  return await fetchUser(userId);
});
```
