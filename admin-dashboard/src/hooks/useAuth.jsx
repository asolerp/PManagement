import { useState, useEffect, createContext, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

const AuthContext = createContext(null);

const STATIC_COMPANY = { name: 'Port Management', onboardingComplete: true };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();

            if (data.role !== 'admin') {
              setError('Solo los administradores pueden acceder a este panel.');
              await firebaseSignOut(auth);
              setUser(null);
              setUserData(null);
            } else {
              setUser(firebaseUser);
              setUserData(data);
              setError(null);
            }
          } else {
            setError('Usuario no encontrado.');
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
          }
        } catch (err) {
          console.error('Error fetching user data:', {
            code: err?.code,
            message: err?.message,
            name: err?.name,
            uid: firebaseUser?.uid,
            path: firebaseUser ? `users/${firebaseUser.uid}` : null,
            fullError: err
          });
          const isPermissionError = err?.code === 'permission-denied' || err?.message?.includes('permission');
          if (isPermissionError) {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setError(null);
          } else {
            setError('Error al cargar datos del usuario.');
          }
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) setUserData(userDoc.data());
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
      if (err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No hay ningún usuario con este email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Inténtalo más tarde.');
      } else {
        setError(err?.message || 'Error al iniciar sesión.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        company: STATIC_COMPANY,
        loading,
        error,
        signIn,
        signOut,
        refreshUserData,
        refreshCompany: () => {},
        isAuthenticated: !!user && !!userData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
