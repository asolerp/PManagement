---
description: Patterns for Firebase Functions and services
globs: '**/Services/**/*.{js,ts}'
alwaysApply: false
---

# Firebase Functions

## Firebase Stack

- `@react-native-firebase/app` v22
- `@react-native-firebase/functions`
- `@react-native-firebase/firestore`
- `@react-native-firebase/auth`

## Calling Functions

```javascript
import functions from '@react-native-firebase/functions';

// Callable function
const callFunction = async (name, data) => {
  try {
    const result = await functions().httpsCallable(name)(data);
    return result.data;
  } catch (error) {
    if (error.code === 'functions/unauthenticated') {
      // Handle auth error
    }
    throw error;
  }
};

// Usage
const houses = await callFunction('getHouses', { userId });
```

## Local Emulator

```javascript
// Development only
if (__DEV__) {
  functions().useEmulator('localhost', 5001);
  firestore().useEmulator('localhost', 8080);
  auth().useEmulator('http://localhost:9099');
}
```

## Firestore Patterns

```javascript
// ✅ Queries with indexes
const housesRef = firestore()
  .collection('houses')
  .where('ownerId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(20);

// ✅ Listeners with cleanup
useEffect(() => {
  const unsubscribe = housesRef.onSnapshot(
    snapshot =>
      setHouses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
    error => console.error('Firestore error:', error)
  );
  return unsubscribe;
}, [userId]);

// ✅ Batch writes
const batch = firestore().batch();
items.forEach(item => {
  const ref = firestore().collection('items').doc(item.id);
  batch.update(ref, { status: 'processed' });
});
await batch.commit();
```

## Error Handling

```javascript
// Map Firebase error codes
const handleFirebaseError = error => {
  const messages = {
    'permission-denied': 'You do not have permission for this action',
    'not-found': 'Document not found',
    'already-exists': 'Document already exists'
  };
  return messages[error.code] || 'Unknown error';
};
```

## Security Rules (reminder)

```javascript
// Rules must be validated in Firebase Console
// Never rely only on client-side validation
```
