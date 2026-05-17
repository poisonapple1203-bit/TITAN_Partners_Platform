import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { firestore } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  isGuest: boolean;
  login: (userData: User) => void;
  setNickname: (nickname: string) => Promise<void>;
  syncNickname: () => Promise<void>;
  logout: () => void;
  resetAccount: () => void; // for testing force delete
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      login: (userData) => {
        const email = (userData.email || '').toLowerCase().trim();
        const isGuest = email !== 'poisonapple1203@gmail.com' && email !== 'juribong2@gmail.com';
        set({ user: userData, isAuthenticated: true, isGuest });
      },
      
      setNickname: async (nickname) => {
        const { user } = get();
        if (!user) return;
        
        // 1. Update Firestore
        try {
          const docId = user.email || user.id;
          await setDoc(doc(firestore, 'user_profiles', docId), {
            nickname,
            updatedAt: Date.now()
          }, { merge: true });
        } catch (e) {
          console.error('[Firestore] Failed to save nickname:', e);
        }

        // 2. Update Local State
        set({ user: { ...user, nickname } });
      },

      syncNickname: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const docId = user.email || user.id;
          const docSnap = await getDoc(doc(firestore, 'user_profiles', docId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.nickname && data.nickname !== user.nickname) {
              set({ user: { ...user, nickname: data.nickname } });
            }
          }
        } catch (e) {
          console.error('[Firestore] Failed to sync nickname:', e);
        }
      },

      logout: () => set({ user: null, isAuthenticated: false, isGuest: false }),
      resetAccount: () => {
        set({ user: null, isAuthenticated: false, isGuest: false });
        localStorage.removeItem('titan-auth-storage'); // force clear
      },
    }),
    {
      name: 'titan-auth-storage',
    }
  )
);
