import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { firestore } from '../lib/firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, deleteDoc, doc, updateDoc,
} from 'firebase/firestore';

export type PeriodType = '전체' | '일별' | '월별' | '연별';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ProfitRecord {
  id: string;
  user: string;
  ticker: string;
  date: string; // YYYY.MM.DD
  time: string; // HH:MM
  profit: number;
  createdAt: number;
}

interface ProfitState {
  records: ProfitRecord[];
  tickers: string[];
  userNames: string[];
  selectedUser: string;
  selectedTicker: string;
  selectedPeriod: PeriodType;
  dateRange: DateRange;
  syncError: string | null;
  
  setSelectedPeriod: (period: PeriodType) => void;
  setSelectedUser: (user: string) => void;
  setSelectedTicker: (ticker: string) => void;
  setDateRange: (range: DateRange) => void;
  
  addRecord: (record: Omit<ProfitRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  updateRecord: (id: string, record: Omit<ProfitRecord, 'id' | 'createdAt'>) => Promise<void>;
  
  addTicker: (ticker: string) => void;
  deleteTicker: (ticker: string) => void;
  setRecords: (records: ProfitRecord[]) => void;
  setSyncError: (error: string | null) => void;
}

// 레코드 날짜 문자열("YYYY.MM.DD")을 Date로 파싱하는 유틸
export function parseRecordDate(dateStr: string): Date {
  const parts = dateStr.split('.');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// ─── Firestore Collection Reference ──────────────────
const COLLECTION_NAME = 'records_new';

export const useProfitStore = create<ProfitState>()(
  immer((set) => ({
    records: [],
    tickers: ['SOXL', 'TQQQ'],
    userNames: ['poisonapple1203', 'juribong2'],
    selectedUser: 'poisonapple1203',
    selectedTicker: 'ALL',
    selectedPeriod: '전체',
    dateRange: { from: new Date(2020, 0, 1), to: new Date() },
    syncError: null,
    
    setSelectedPeriod: (period) => set((state) => {
      state.selectedPeriod = period;
      const today = new Date();
      if (period === '일별') {
        state.dateRange = { from: today, to: today };
      } else if (period === '월별') {
        state.dateRange = { from: startOfMonth(today), to: endOfMonth(today) };
      } else if (period === '연별') {
        state.dateRange = { from: startOfYear(today), to: endOfYear(today) };
      } else {
        state.dateRange = { from: new Date(2020, 0, 1), to: today };
      }
    }),

    setSelectedUser: (user) => set((state) => {
      state.selectedUser = user;
    }),
    
    setSelectedTicker: (ticker) => set((state) => { state.selectedTicker = ticker; }),
    
    setDateRange: (range) => set((state) => { state.dateRange = range; }),
    
    setRecords: (records) => set((state) => { state.records = records; }),
    setSyncError: (error) => set((state) => { state.syncError = error; }),
    
    addRecord: async (recordData) => {
      try {
        await addDoc(collection(firestore, COLLECTION_NAME), {
          ...recordData,
          createdAt: serverTimestamp(),
        });
        console.log('[Firestore] Record added ✓');
      } catch (e) {
        console.error('[Firestore] Failed to add record:', e);
      }
    },
    
    deleteRecord: async (id) => {
      try {
        await deleteDoc(doc(firestore, COLLECTION_NAME, id));
        console.log('[Firestore] Record deleted ✓');
      } catch (e) {
        console.error('[Firestore] Failed to delete record:', e);
      }
    },
    
    updateRecord: async (id, recordData) => {
      try {
        await updateDoc(doc(firestore, COLLECTION_NAME, id), {
          ...recordData,
        });
        console.log('[Firestore] Record updated ✓');
      } catch (e) {
        console.error('[Firestore] Failed to update record:', e);
      }
    },
    
    addTicker: (ticker) => set((state) => {
      if (!state.tickers.includes(ticker)) {
        state.tickers.push(ticker);
      }
    }),
    
    deleteTicker: (ticker) => set((state) => {
      state.tickers = state.tickers.filter((t) => t !== ticker);
      if (state.selectedTicker === ticker) {
        state.selectedTicker = 'ALL';
      }
    }),
  }))
);

// ─── Firestore Real-time Sync (like initROISync) ─────
export const initProfitSync = () => {
  const q = query(collection(firestore, COLLECTION_NAME), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const records: ProfitRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let mappedUser = data.user;
      if (mappedUser === '조핏') mappedUser = 'poisonapple1203';
      else if (mappedUser === '봉핏') mappedUser = 'juribong2';

      records.push({
        id: docSnap.id,
        user: mappedUser,
        ticker: data.ticker,
        date: data.date,
        time: data.time,
        profit: data.profit,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      });
    });
    useProfitStore.getState().setRecords(records);
    useProfitStore.getState().setSyncError(null);
    console.log(`[Firestore] Profit records synced: ${records.length} records ✓`);
  }, (error) => {
    console.error('[Firestore] Error subscribing to profit records:', error);
    useProfitStore.getState().setSyncError(error.message);
  });

  return unsubscribe;
};
