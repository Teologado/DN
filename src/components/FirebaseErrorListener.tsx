"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Error:", error.toString());
      toast({
        variant: "destructive",
        title: "Error de Permisos",
        description: error.message,
      });

      // In a real app, you might want to throw the error in dev
      if (process.env.NODE_ENV === 'development') {
        // This will be caught by Next.js's error overlay
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
