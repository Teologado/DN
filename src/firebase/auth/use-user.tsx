"use client";

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';

export interface UserHook {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

export function useUser(): UserHook {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // If auth is not ready, we are not loading.
      // We are waiting for the provider to initialize.
      // This might be debatable, but it prevents a flash of loading state.
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  return {
    user,
    profile: profile ?? null,
    isLoading: isLoading || (!!user && isProfileLoading),
  };
}
