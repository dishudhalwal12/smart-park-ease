import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseConfigError, hasFirebaseConfig } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(firebaseConfigError);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (authError) => {
        setError(authError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    if (!firebaseAuth) {
      throw new Error(firebaseConfigError || 'Firebase Auth is not configured.');
    }

    setError('');
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return credential.user;
  };

  const signUp = async (email, password) => {
    if (!firebaseAuth) {
      throw new Error(firebaseConfigError || 'Firebase Auth is not configured.');
    }

    setError('');
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return credential.user;
  };

  const signOut = async () => {
    if (!firebaseAuth) {
      throw new Error(firebaseConfigError || 'Firebase Auth is not configured.');
    }

    setError('');
    await firebaseSignOut(firebaseAuth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      setError,
      signIn,
      signUp,
      signOut,
      hasFirebaseConfig,
      firebaseConfigError,
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}