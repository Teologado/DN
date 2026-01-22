"use client";

import { useAppContext } from "@/contexts/app-provider";
import type { User } from "@/lib/types";

// We create a compatible user object that mimics the Firebase user object structure
// to minimize changes in the components that consume it.
type CompatibleUser = User & {
    displayName: string;
    photoURL: string | null;
}

export interface UserHook {
  user: CompatibleUser | null;
  profile: User | null;
  isLoading: boolean;
}

export function useUser(): UserHook {
    const { state, isInitialized } = useAppContext();
    
    const compatUser = state.currentUser ? {
      ...state.currentUser,
      displayName: state.currentUser.name,
      photoURL: null, // We don't have photo URLs in this local version
    } : null;

    return {
        user: compatUser,
        profile: state.currentUser,
        isLoading: !isInitialized,
    };
}
