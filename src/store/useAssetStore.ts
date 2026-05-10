import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AccountType = 'irp' | 'pension' | 'stock' | 'cash' | 'isa' | '';

export interface AssetRecord {
  id: string;
  accountType: AccountType;
  ticker: string;
  shares: number;
  averagePrice: number;
  currency: '$' | '₩';
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
}

interface AssetStore {
  users: User[];
  currentUserId: string;
  userRecords: Record<string, AssetRecord[]>; // userId -> records
  
  // Getters (selectors)
  getRecords: () => AssetRecord[];
  getCurrentUser: () => User | undefined;
  
  // Actions
  setCurrentUser: (userId: string) => void;
  updateUserName: (userId: string, name: string) => void;
  addRecord: (record: Omit<AssetRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, record: Partial<AssetRecord>) => void;
  removeRecord: (id: string) => void;
  
  editingRecordId: string | null;
  setEditingRecordId: (id: string | null) => void;
  
  // Legacy compatibility
  records: AssetRecord[]; 
}

// ─── Cloud Sync Helper ───────────────────────────────
let syncTimer: ReturnType<typeof setTimeout> | null = null;

const WORKER_URL = 'https://asset-dashboard.poisonapple1203.workers.dev';

const syncToServer = (state: Pick<AssetStore, 'users' | 'currentUserId' | 'userRecords'>) => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const payload = {
        users: state.users,
        currentUserId: state.currentUserId,
        userRecords: state.userRecords,
      };
      await fetch(`${WORKER_URL}/api/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[Sync] Asset data saved to cloud ✓');
    } catch (e) {
      console.warn('[Sync] Failed to save asset data to cloud:', e);
    }
  }, 800);
};

export const loadFromServer = async (): Promise<Partial<AssetStore> | null> => {
  try {
    const res = await fetch(`${WORKER_URL}/api/data`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.userRecords && Object.keys(data.userRecords).length > 0) {
      console.log('[Sync] Asset data loaded from cloud ✓');
      return data;
    }
    return null;
  } catch (e) {
    console.warn('[Sync] Could not load asset data from cloud, using local data:', e);
    return null;
  }
};

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      users: [
        { id: 'user-1', name: '조핏' },
        { id: 'user-2', name: '봉핏' }
      ],
      currentUserId: 'user-1',
      userRecords: {
        'user-1': [],
        'user-2': []
      },
      
      editingRecordId: null,
      setEditingRecordId: (id) => set({ editingRecordId: id }),

      records: [],

      getRecords: () => {
        const state = get();
        return state.userRecords[state.currentUserId] || [];
      },

      getCurrentUser: () => {
        const state = get();
        return state.users.find(u => u.id === state.currentUserId);
      },

      setCurrentUser: (userId) => set((state) => {
        const newRecords = state.userRecords[userId] || [];
        return { 
          currentUserId: userId,
          records: newRecords 
        };
      }),

      updateUserName: (userId, name) => {
        set((state) => ({
          users: state.users.map(u => u.id === userId ? { ...u, name } : u)
        }));
        const state = get();
        syncToServer({ users: state.users, currentUserId: state.currentUserId, userRecords: state.userRecords });
      },

      addRecord: (record) => {
        set((state) => {
          const userId = state.currentUserId;
          const newRecord: AssetRecord = { 
            ...record, 
            id: crypto.randomUUID(), 
            createdAt: Date.now() 
          };
          
          const currentUserRecords = state.userRecords[userId] || [];
          const updatedUserRecords = {
            ...state.userRecords,
            [userId]: [...currentUserRecords, newRecord]
          };

          return {
            userRecords: updatedUserRecords,
            records: updatedUserRecords[userId]
          };
        });
        const state = get();
        syncToServer({ users: state.users, currentUserId: state.currentUserId, userRecords: state.userRecords });
      },

      updateRecord: (id, record) => {
        set((state) => {
          const userId = state.currentUserId;
          const currentUserRecords = state.userRecords[userId] || [];
          const updatedUserRecords = {
            ...state.userRecords,
            [userId]: currentUserRecords.map(r => r.id === id ? { ...r, ...record } : r)
          };

          return {
            userRecords: updatedUserRecords,
            records: updatedUserRecords[userId],
            editingRecordId: null 
          };
        });
        const state = get();
        syncToServer({ users: state.users, currentUserId: state.currentUserId, userRecords: state.userRecords });
      },

      removeRecord: (id) => {
        set((state) => {
          const userId = state.currentUserId;
          const currentUserRecords = state.userRecords[userId] || [];
          const updatedUserRecords = {
            ...state.userRecords,
            [userId]: currentUserRecords.filter(r => r.id !== id)
          };

          return {
            userRecords: updatedUserRecords,
            records: updatedUserRecords[userId],
            editingRecordId: state.editingRecordId === id ? null : state.editingRecordId 
          };
        });
        const state = get();
        syncToServer({ users: state.users, currentUserId: state.currentUserId, userRecords: state.userRecords });
      }
    }),
    {
      name: 'asset-storage',
      partialize: (state) => ({ 
        users: state.users, 
        currentUserId: state.currentUserId, 
        userRecords: state.userRecords,
        records: state.userRecords[state.currentUserId] || [] 
      }),
    }
  )
);
