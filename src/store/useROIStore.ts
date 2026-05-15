import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as dbSet, update as dbUpdate, remove as dbRemove } from 'firebase/database';

export interface ROIRecord {
  id: string;
  user: 'A' | 'B';
  date: string;
  time: string;
  rate: number;
}

interface ROIState {
  records: ROIRecord[];
  nicknames: { A: string; B: string };
  currentUser: 'A' | 'B';
  selectedSnapshot: { date: string; time: string } | null;
  
  // Actions
  setRecords: (records: ROIRecord[]) => void;
  setNicknames: (nicknames: { A: string; B: string }) => void;
  setCurrentUser: (user: 'A' | 'B') => void;
  setSelectedSnapshot: (snapshot: { date: string; time: string } | null) => void;
  
  // Firebase Sync Actions
  addRecord: (rate: number, date: string, time: string) => Promise<void>;
  updateRecord: (id: string, rate: number, user: 'A' | 'B', date: string, time: string) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  updateNickname: (user: 'A' | 'B', name: string) => Promise<void>;
}

const TELEGRAM_TOKEN = "8676707157:AAEiMmp4pk7_9__jfe4peMrw-Ly91M1M4qY";
const CHAT_IDS = { A: "5860122423", B: "8626776238" };

async function sendTelegramPush(nicknames: { A: string; B: string }, sender: 'A' | 'B', rate: number, date: string, time: string, isEdit = false) {
  const receiverId = CHAT_IDS[sender === 'A' ? 'B' : 'A'];
  const title = isEdit ? "수익률 수정 알림" : "수익률 입력 알림";
  const message = `🔔 [${title}]\n\n${nicknames[sender]}님이 ${isEdit ? '수정' : '입력'}했습니다!\n📈 수익률: ${rate.toFixed(2)}%\n⏰ 시점: ${date} ${time}\n\n👉 <a href="https://titanpartners.pages.dev/roi">확인하러가기</a>`;
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: receiverId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error('Telegram Push Failed:', e);
  }
}

export const useROIStore = create<ROIState>((set, get) => ({
  records: [],
  nicknames: { A: '조핏', B: '봉핏' },
  currentUser: 'A',
  selectedSnapshot: null,

  setRecords: (records) => set({ records }),
  setNicknames: (nicknames) => set({ nicknames }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setSelectedSnapshot: (selectedSnapshot) => set({ selectedSnapshot }),

  addRecord: async (rate, date, time) => {
    const { currentUser, nicknames } = get();
    const newId = Date.now().toString();
    const newRecord: ROIRecord = { id: newId, user: currentUser, date, time, rate };
    
    await dbSet(ref(db, `records/${newId}`), newRecord);
    await sendTelegramPush(nicknames, currentUser, rate, date, time);
  },

  updateRecord: async (id, rate, user, date, time) => {
    const { nicknames } = get();
    await dbUpdate(ref(db, `records/${id}`), { rate });
    await sendTelegramPush(nicknames, user, rate, date, time, true);
  },

  deleteRecord: async (id) => {
    await dbRemove(ref(db, `records/${id}`));
  },

  updateNickname: async (user, name) => {
    await dbUpdate(ref(db, `nicknames`), { [user]: name });
  }
}));

// Initialize Listeners
export const initROISync = () => {
  const unsubNicknames = onValue(ref(db, 'nicknames'), (snapshot) => {
    const val = snapshot.val();
    if (val) useROIStore.getState().setNicknames(val);
  });

  const unsubRecords = onValue(ref(db, 'records'), (snapshot) => {
    const val = snapshot.val();
    const records = val ? Object.values(val) as ROIRecord[] : [];
    useROIStore.getState().setRecords(records);
  });

  return () => {
    unsubNicknames();
    unsubRecords();
  };
};
