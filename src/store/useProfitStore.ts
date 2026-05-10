import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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
}

interface ProfitState {
  records: ProfitRecord[];
  tickers: string[];
  selectedUser: string;
  selectedTicker: string;
  selectedPeriod: PeriodType;
  dateRange: DateRange;
  
  setSelectedPeriod: (period: PeriodType) => void;
  setSelectedTicker: (ticker: string) => void;
  setDateRange: (range: DateRange) => void;
  
  addRecord: (record: Omit<ProfitRecord, 'id'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, record: Omit<ProfitRecord, 'id'>) => void;
  
  addTicker: (ticker: string) => void;
  deleteTicker: (ticker: string) => void;
}

// 레코드 날짜 문자열("YYYY.MM.DD")을 Date로 파싱하는 유틸
export function parseRecordDate(dateStr: string): Date {
  const parts = dateStr.split('.');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

const mockRecords: ProfitRecord[] = [
  { id: '1', user: '조핏', ticker: 'SOXL', date: '2026.05.06', time: '06:50', profit: 1464209 },
  { id: '2', user: '조핏', ticker: 'SOXL', date: '2026.04.24', time: '23:46', profit: 100080 },
  { id: '3', user: '조핏', ticker: 'SOXL', date: '2026.04.22', time: '06:09', profit: 225657 },
  { id: '4', user: '조핏', ticker: 'SOXL', date: '2026.04.17', time: '06:09', profit: 168423 },
];

export const useProfitStore = create<ProfitState>()(
  immer((set) => ({
    records: mockRecords,
    tickers: ['SOXL', 'TQQQ'],
    selectedUser: '조핏',
    selectedTicker: 'ALL',
    selectedPeriod: '전체',
    dateRange: { from: new Date(2020, 0, 1), to: new Date() },
    
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
    
    setSelectedTicker: (ticker) => set((state) => { state.selectedTicker = ticker; }),
    
    setDateRange: (range) => set((state) => { state.dateRange = range; }),
    
    addRecord: (recordData) => set((state) => {
      state.records.unshift({ ...recordData, id: Date.now().toString() });
    }),
    
    deleteRecord: (id) => set((state) => {
      state.records = state.records.filter((r) => r.id !== id);
    }),
    
    updateRecord: (id, recordData) => set((state) => {
      const index = state.records.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.records[index] = { ...recordData, id };
      }
    }),
    
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
