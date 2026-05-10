import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, UserCircle2 } from 'lucide-react';
import { ROIInputForm } from '../components/roi/ROIInputForm';
import { ROIHistoryTable } from '../components/roi/ROIHistoryTable';
import { initROISync, useROIStore } from '../store/useROIStore';

export default function ROI() {
  const { nicknames, updateNickname, currentUser, setCurrentUser } = useROIStore();
  const navigate = useNavigate();

  useEffect(() => {
    initROISync();
  }, []);

  const handleChangeNickname = async (user: 'A' | 'B') => {
    const newName = prompt('새 닉네임을 입력하세요:', nicknames[user]);
    if (newName && newName.trim()) {
      await updateNickname(user, newName.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-dark text-text-main pb-12">
      {/* 100% Identical Header to Asset.tsx */}
      <header className="flex items-center justify-between px-4 py-5 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-30">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-text-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight ml-2">수익률 비교</h1>
        </div>

        {/* User Nickname Chips inside Header (Asset.tsx style) */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {(['A', 'B'] as const).map((userKey) => (
            <button
              key={userKey}
              onClick={() => {
                // Clicking the active user allows rename, clicking inactive switches mode
                if (currentUser === userKey) {
                  handleChangeNickname(userKey);
                } else {
                  setCurrentUser(userKey);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentUser === userKey 
                  ? 'bg-surface-dark text-white shadow-lg' 
                  : 'text-text-muted hover:text-white/80'
              }`}
            >
              <UserCircle2 className={`w-3.5 h-3.5 ${currentUser === userKey ? 'text-primary' : 'text-text-muted'}`} />
              {nicknames[userKey]}
            </button>
          ))}
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 md:p-6 flex flex-col gap-6"
      >
        {/* Input Form */}
        <ROIInputForm />

        {/* History Table */}
        <ROIHistoryTable />
      </motion.main>
    </div>
  );
}
