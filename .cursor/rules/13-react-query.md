---
description: TanStack React Query v5 patterns
globs: '**/*.{js,ts,tsx}'
alwaysApply: false
---

# React Query v5

## Setup

```javascript
// App.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly: cacheTime)
      retry: 2
    }
  }
});
```

## Queries

```javascript
// ✅ Basic query
const { data, isLoading, error } = useQuery({
  queryKey: ['houses', filters],
  queryFn: () => fetchHouses(filters),
  enabled: !!userId
});

// ✅ Structured query keys
const queryKeys = {
  houses: {
    all: ['houses'],
    list: filters => ['houses', 'list', filters],
    detail: id => ['houses', 'detail', id]
  }
};
```

## Mutations

```javascript
const mutation = useMutation({
  mutationFn: updateHouse,
  onSuccess: (data, variables) => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['houses'] });

    // Or update cache directly
    queryClient.setQueryData(['houses', 'detail', variables.id], data);
  },
  onError: error => {
    Toast.show({ type: 'error', text1: error.message });
  }
});
```

## Optimistic Updates

```javascript
const mutation = useMutation({
  mutationFn: updateHouse,
  onMutate: async newData => {
    await queryClient.cancelQueries({ queryKey: ['houses', newData.id] });
    const previous = queryClient.getQueryData(['houses', newData.id]);
    queryClient.setQueryData(['houses', newData.id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['houses', newData.id], context.previous);
  }
});
```

## Patterns

```javascript
// ✅ Prefetch on navigation
const prefetchHouse = id => {
  queryClient.prefetchQuery({
    queryKey: ['houses', 'detail', id],
    queryFn: () => fetchHouse(id)
  });
};

// ✅ Infinite queries for pagination
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['houses', 'infinite'],
  queryFn: ({ pageParam = 0 }) => fetchHouses({ offset: pageParam }),
  getNextPageParam: lastPage => lastPage.nextOffset
});
```
