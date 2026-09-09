import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export interface AuthState {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

// Mock auth uses session storage, while the UI store uses local storage.
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        signIn: () => set({ isAuthenticated: true }, false, 'auth/signIn'),
        signOut: () => set({ isAuthenticated: false }, false, 'auth/signOut'),
      }),
      {
        name: 'watchlog_auth',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'WatchLog Auth' }
  )
);
