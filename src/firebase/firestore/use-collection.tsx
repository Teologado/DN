"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  startAt,
  endAt,
  type DocumentData,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

interface UseCollectionOptions<T> {
  // Define your query options here
}

export function useCollection<T>(
  queryOrRef: Query | CollectionReference | null,
  options?: UseCollectionOptions<T>
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!queryOrRef) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      queryOrRef,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('onSnapshot error:', err);
        const permissionError = new FirestorePermissionError({
          path: queryOrRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [queryOrRef]); // useMemo can be used here for complex queries

  return { data, isLoading, error };
}
