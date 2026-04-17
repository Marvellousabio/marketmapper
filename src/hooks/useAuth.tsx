'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
     // Ensure Firebase is available (client-side only)
     if (!auth || !db) {
       setLoading(false);
       return;
     }

     const authInstance = auth;
     const firestore = db;

     const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser: FirebaseUser | null) => {
       if (firebaseUser) {
         // Get additional user data from Firestore
         const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
         if (userDoc.exists()) {
           const userData = userDoc.data();
           setUser({
             id: firebaseUser.uid,
             email: firebaseUser.email!,
             displayName: firebaseUser.displayName || userData.displayName || '',
             photoURL: firebaseUser.photoURL || undefined,
             createdAt: userData.createdAt?.toDate() || new Date(),
             location: userData.location,
             businessType: userData.businessType,
             skills: userData.skills,
           });
         } else {
           // Create user document if it doesn't exist
           const newUser: User = {
             id: firebaseUser.uid,
             email: firebaseUser.email!,
             displayName: firebaseUser.displayName || '',
             photoURL: firebaseUser.photoURL || undefined,
             createdAt: new Date(),
           };
           // Filter out undefined values for Firestore
           const userDataToSave = Object.fromEntries(
             Object.entries(newUser).filter((entry) => entry[1] !== undefined)
           );
           await setDoc(doc(firestore, 'users', firebaseUser.uid), {
             ...userDataToSave,
             createdAt: new Date(),
           });
           setUser(newUser);
         }
       } else {
         setUser(null);
       }
       setLoading(false);
     });

     return () => unsubscribe();
   }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('signUp called with:', { email, password: password ? '[REDACTED]' : undefined, displayName });
    try {
      console.log('Attempting to create user with Firebase...');
      if (!auth) throw new Error('Auth not initialized');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', result.user.uid);

      console.log('Updating profile...');
      await updateProfile(result.user, { displayName });
      console.log('Profile updated successfully');

      // Create user document in Firestore
      const userData = {
        displayName,
        email,
        createdAt: new Date(),
      };

      console.log('Creating Firestore document...');
      if (!db) throw new Error('Firestore not initialized');
      await setDoc(doc(db, 'users', result.user.uid), userData);
      console.log('SignUp process completed successfully');
      console.log('Firestore document created successfully');
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};