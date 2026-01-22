"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, type DocumentReference } from 'firebase/firestore';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

export function useDoc<T>(docRef: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('onSnapshot error:', err);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, isLoading, error };
}
