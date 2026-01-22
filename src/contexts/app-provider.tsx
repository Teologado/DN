"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useMemo } from 'react';
import type { AppState } from '@/lib/types';
import { initialData } from '@/lib/store';
import { appReducer, Action } from './app-reducer';

const STORAGE_KEY = 'parish-hall-booking';

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return initialData;
    }
    const { halls, bookings, notifications, settings, users, currentUser } = JSON.parse(serializedState);
    return { ...initialData, halls, bookings, notifications, settings, users: users || [], currentUser: currentUser || null };
  } catch (error) {
    console.warn("Could not load state from localStorage", error);
    return initialData;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialData);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadedState = loadState();
    dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
    setIsInitialized(true);
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('Service Worker registered.', registration))
                .catch(error => console.error('Service Worker registration failed:', error));
        });
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        const stateToSave = {
          halls: state.halls,
          bookings: state.bookings,
          notifications: state.notifications,
          settings: state.settings,
          users: state.users,
          currentUser: state.currentUser,
        };
        const serializedState = JSON.stringify(stateToSave);
        localStorage.setItem(STORAGE_KEY, serializedState);
      } catch (error) {
        console.error("Could not save state to localStorage", error);
      }
    }
  }, [state, isInitialized]);

  const contextValue = useMemo(() => ({ state, dispatch, isInitialized }), [state, isInitialized]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
