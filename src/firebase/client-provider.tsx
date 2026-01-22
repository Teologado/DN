"use client";

import React, { useState, useEffect } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Initialize Firebase only on the client
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  if (!firebase) {
    // You can render a loading state here if needed
    return null;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
