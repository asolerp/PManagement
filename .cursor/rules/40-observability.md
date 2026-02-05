---
description: Observability - logging, crashlytics, and monitoring
globs: '**/*.{js,ts,tsx}'
alwaysApply: false
---

# Observability

## Crashlytics

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// Register user for traceability
crashlytics().setUserId(user.id);
crashlytics().setAttributes({
  role: user.role,
  company: user.companyId
});

// Log non-fatal errors
try {
  await riskyOperation();
} catch (error) {
  crashlytics().recordError(error);
  // Continue or show fallback
}

// Breadcrumbs for context
crashlytics().log('User navigated to HouseDetails');
crashlytics().log(`Fetching house ${houseId}`);
```

## Structured Logging

```javascript
// Centralized logger
const logger = {
  info: (message, context = {}) => {
    if (__DEV__) console.log(`[INFO] ${message}`, context);
    crashlytics().log(`[INFO] ${message} ${JSON.stringify(context)}`);
  },

  error: (message, error, context = {}) => {
    if (__DEV__) console.error(`[ERROR] ${message}`, error, context);
    crashlytics().recordError(error);
  },

  warn: (message, context = {}) => {
    if (__DEV__) console.warn(`[WARN] ${message}`, context);
    crashlytics().log(`[WARN] ${message}`);
  }
};
```

## Error Boundaries

```javascript
import ErrorBoundary from 'react-native-error-boundary';

const errorHandler = (error, stackTrace) => {
  crashlytics().recordError(error);
  crashlytics().log(`Stack: ${stackTrace}`);
};

const FallbackComponent = ({ error, resetError }) => (
  <View>
    <Text>Something went wrong</Text>
    <Button title="Retry" onPress={resetError} />
  </View>
);

// In App.js
<ErrorBoundary onError={errorHandler} FallbackComponent={FallbackComponent}>
  <AppContent />
</ErrorBoundary>;
```

## Performance Monitoring

```javascript
// Measure critical operations
const startTime = performance.now();
await heavyOperation();
const duration = performance.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow operation detected', {
    operation: 'heavyOperation',
    duration
  });
}
```

## Pre-Release Checklist

- [ ] Crashlytics configured and tested
- [ ] Error boundaries on main screens
- [ ] Sensitive logs removed/obfuscated
- [ ] User attributes configured
- [ ] Source maps uploaded for symbolication
