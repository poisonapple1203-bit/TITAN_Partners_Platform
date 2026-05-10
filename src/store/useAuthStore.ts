import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  nickname?: string; // added nickname
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  setNickname: (nickname: string) => void;
  logout: () => void;
  resetAccount: () => void; // for testing force delete
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      setNickname: (nickname) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, nickname } : null 
        })),
      logout: () => set({ user: null, isAuthenticated: false }),
      resetAccount: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('titan-auth-storage'); // force clear
      },
    }),
    {
      name: 'titan-auth-storage',
    }
  )
);
