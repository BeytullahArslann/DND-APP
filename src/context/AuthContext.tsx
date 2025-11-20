import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, appId } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Create or update user document in Firestore
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
              await setDoc(userRef, {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName,
                  photoURL: currentUser.photoURL,
                  createdAt: serverTimestamp(),
                  friends: [], // List of friend UIDs
                  rooms: [] // List of room IDs user belongs to
              });
          } else {
              // Update last login or other fields if needed
              await setDoc(userRef, {
                  lastLogin: serverTimestamp(),
                  displayName: currentUser.displayName, // Sync name changes
                  photoURL: currentUser.photoURL
              }, { merge: true });
          }
        } catch (err) {
          console.error("Error updating user profile:", err);
          // Don't block auth state on profile update fail, but maybe log it
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Error signing in with Google", err);
      const authError = err as AuthError;
      if (authError.code === 'auth/unauthorized-domain') {
        setError('Bu alan adı (domain) Firebase Console\'da yetkilendirilmemiş. Lütfen Authentication > Settings > Authorized Domains kısmına ekleyin.');
      } else if (authError.code === 'auth/popup-closed-by-user') {
        setError('Giriş penceresi kapatıldı.');
      } else {
        setError('Giriş yapılırken bir hata oluştu: ' + authError.message);
      }
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Error signing out", err);
      setError('Çıkış yapılırken bir hata oluştu.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
