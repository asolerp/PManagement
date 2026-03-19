import { useState, useEffect, createContext, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '@/config/firebase';
import { getCompany } from '@/services/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force token refresh so custom claims (companyId, role) are available
          await firebaseUser.getIdToken(true);
          const tokenResult = await firebaseUser.getIdTokenResult();
          if (import.meta.env.DEV) {
            console.debug('[Auth] UID:', firebaseUser.uid, 'Token claims:', tokenResult.claims);
          }

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Check if user is admin
            if (data.role !== 'admin') {
              setError('Solo los administradores pueden acceder a este panel.');
              await firebaseSignOut(auth);
              setUser(null);
              setUserData(null);
              setCompany(null);
            } else {
              // Sincronizar custom claims (companyId, role) para que las reglas de Firestore permitan leer
              if (data.companyId && data.role) {
                try {
                  const syncFn = httpsCallable(functions, 'syncTenantClaims');
                  await syncFn();
                  await firebaseUser.getIdToken(true);
                } catch (syncErr) {
                  if (import.meta.env.DEV) {
                    console.warn('[Auth] syncTenantClaims:', syncErr?.message);
                  }
                }
              }
              setUser(firebaseUser);
              setUserData(data);
              setError(null);
              if (data.companyId) {
                const companyData = await getCompany(data.companyId);
                setCompany(companyData);
              } else {
                setCompany(null);
              }
            }
          } else {
            setError('Usuario no encontrado.');
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setCompany(null);
          }
        } catch (err) {
          // Log detallado para depurar permisos Firestore
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
            setCompany(null);
            setError(null);
          } else {
            setError('Error al cargar datos del usuario.');
          }
        }
      } else {
        setUser(null);
        setUserData(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshCompany = async () => {
    if (userData?.companyId) {
      const companyData = await getCompany(userData.companyId);
      setCompany(companyData);
    }
  };

  const refreshUserData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) setUserData(userDoc.data());
  };

  /** Sincroniza custom claims (companyId, role) y refresca el token. Útil si ves "Missing or insufficient permissions". */
  const syncTenantClaimsAndRefresh = async () => {
    const u = auth.currentUser;
    if (!u) throw new Error('No hay sesión');
    const syncFn = httpsCallable(functions, 'syncTenantClaims');
    await syncFn();
    await u.getIdToken(true);
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No poner loading=false aquí: onAuthStateChanged lo hará cuando tenga userData y company
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
      if (err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/user-not-found') {
        setError(
          'No hay ningún usuario con este email. Si te registraste en la web de registro, ' +
          'asegúrate de que el dashboard use el mismo proyecto Firebase (revisa .env: VITE_FIREBASE_PROJECT_ID).'
        );
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
        company,
        loading,
        error,
        signIn,
        signOut,
        refreshCompany,
        refreshUserData,
        syncTenantClaimsAndRefresh,
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
