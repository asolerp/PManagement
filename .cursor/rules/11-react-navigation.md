---
description: React Navigation v7 patterns
globs: '**/Router/**/*.{js,ts,tsx}'
alwaysApply: false
---

# React Navigation v7

## Current Stack

- `@react-navigation/native` v7
- `@react-navigation/native-stack` v7
- `@react-navigation/bottom-tabs` v7

## Route Structure

```javascript
// Router/index.js - Entry point
const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthStack} />
    <Stack.Screen name="Main" component={MainTabs} />
  </Stack.Navigator>
);
```

## Typed Navigation

```javascript
// Define route types
const routes = {
  Home: undefined,
  Details: { id: string },
  Profile: { userId: string, edit?: boolean },
};

// Use in navigation
navigation.navigate('Details', { id: '123' });
```

## Deep Linking

```javascript
const linking = {
  prefixes: ['portmanagement://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Details: 'details/:id'
        }
      }
    }
  }
};
```

## Patterns

```javascript
// ✅ Reset stack when changing flows
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }]
});

// ✅ Pass minimal params (IDs, not full objects)
navigation.navigate('Details', { id: item.id });

// ❌ Avoid passing large objects in params
navigation.navigate('Details', { item: fullItemObject });
```

## Headers

```javascript
// Configure in screenOptions or options
<Stack.Screen
  name="Home"
  options={{
    title: 'Home',
    headerRight: () => <SettingsButton />
  }}
/>
```
