'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';

interface UserState {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: UserState | null;
  isLoading: boolean;
  authError: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserState>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

/**
 * Translates Firebase error codes into user-friendly messages.
 * Covers the most common auth failure scenarios.
 */
function getFirebaseErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in your Firebase project. Add it to Authentication → Settings → Authorized Domains in the Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is not enabled. Go to Firebase Console → Authentication → Sign-in method → enable Google provider.';
    case 'auth/user-disabled':
      return 'This account has been disabled by an administrator.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with a different sign-in method for this email.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    default:
      // Include the raw code for unexpected errors so it can be debugged
      return error?.message || `Authentication failed (${code || 'unknown error'}).`;
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  authError: null,
  clearError: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  signInWithGoogle: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear any displayed error message
  const clearError = useCallback(() => setAuthError(null), []);

  // Initialize and listen to native Firebase Auth state change events
  useEffect(() => {
    // Listen to Firebase auth changes, ensuring persistency on page refresh natively
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real Firebase sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setIsLoading(false);
      const msg = getFirebaseErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  }, []);

  // Real Firebase sign up with email, password, and custom display name
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        await fbUpdateProfile(credential.user, { displayName: name });
        // Force state sync
        setUser({
          uid: credential.user.uid,
          displayName: name,
          email: email,
          photoURL: credential.user.photoURL || undefined,
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = getFirebaseErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  }, []);

  // Real Firebase Google Sign-In popup trigger
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection so user can pick which Google account
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      // onAuthStateChanged listener will handle setting the user
    } catch (err: any) {
      setIsLoading(false);
      const msg = getFirebaseErrorMessage(err);
      setAuthError(msg);
      console.error('Google Sign-In error:', err.code, err.message);
      throw err;
    }
  }, []);

  // Real Firebase sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Firebase sign out failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real Firebase profile updates
  const updateUserProfile = useCallback(async (updates: Partial<UserState>) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const profileUpdates: { displayName?: string; photoURL?: string } = {};
        if (updates.displayName) profileUpdates.displayName = updates.displayName;
        if (updates.photoURL) profileUpdates.photoURL = updates.photoURL;

        await fbUpdateProfile(currentUser, profileUpdates);
        
        // Update local react state dynamically
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...updates
          };
        });
      }
    } catch (err) {
      console.error('Firebase profile update failed:', err);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        clearError,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}



