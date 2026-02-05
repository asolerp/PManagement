---
description: Expo + React Native conventions for this project
globs: '**/*.{js,jsx,ts,tsx}'
alwaysApply: false
---

# Expo & React Native

## Stack

- **Expo SDK 53** + React Native 0.79
- **Expo Prebuild** for native projects
- **EAS Build** for CI/CD

## Architecture

```
src/
├── Screens/        # Screens (1 per feature)
├── components/     # Reusable components
├── Services/       # Business logic and API
├── Router/         # Navigation config
├── Theme/          # Global styles
└── Translations/   # i18n
```

## Components

```javascript
// ✅ Functional components + hooks
const MyComponent = ({ title, onPress }) => {
  const [state, setState] = useState(null);

  return (
    <Pressable onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  );
};

// ❌ Avoid class components
```

## Performance

- `React.memo()` for expensive components
- `useCallback` for handlers passed to children
- `useMemo` for heavy computations
- FlatList/SectionList for long lists (never ScrollView + map)

## Platform-Specific

```javascript
// Use Platform.select for iOS/Android differences
import { Platform } from 'react-native';

const styles = {
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 }
  })
};
```

## Expo Commands

```bash
# Development
npx expo start

# Local native build
npx expo run:ios
npx expo run:android

# Prebuild (regenerate natives)
npx expo prebuild --clean
```
