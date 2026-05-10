import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const setNickname = useAuthStore((state) => state.setNickname);
  
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (location.state?.fromSidebar) {
      navigate('/main', { state: { openSidebar: true }, replace: true });
    } else {
      navigate(-1);
    }
  };

  // Update local state if global state changes
  useEffect(() => {
    if (user?.nickname) {
      setNicknameInput(user.nickname);
    }
  }, [user?.nickname]);

  const handleSave = () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length > 10) {
      setError('닉네임은 최대 10자까지 가능합니다.');
      return;
    }
    if (trimmed === user?.nickname) {
      // No change
      navigate('/main', { replace: true });
      return;
    }

    setIsSaving(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      setNickname(trimmed);
      setIsSaving(false);
      navigate('/main', { replace: true }); // Go straight to main
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-dark text-text-main">
      <header className="flex items-center px-4 py-5 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-30">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-text-muted"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight ml-2">설정 (Settings)</h1>
      </header>

      <motion.main 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 flex flex-col gap-8"
      >
        <section className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <h2 className="text-xl font-bold mb-2 relative z-10">프로필 관리</h2>
          <p className="text-text-muted text-sm mb-6 relative z-10">메인 화면에 표시될 닉네임을 변경할 수 있습니다.</p>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="nickname" className="text-sm font-medium text-text-muted px-1">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nicknameInput}
              onChange={(e) => {
                setNicknameInput(e.target.value);
                if (error) setError('');
              }}
              placeholder="새 닉네임 입력 (최대 10자)"
              className="w-full bg-background-dark border border-white/5 rounded-2xl px-4 py-4 text-white placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all relative z-10"
            />
            {error && <p className="text-danger text-sm px-1 mt-1 relative z-10">{error}</p>}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !nicknameInput.trim()}
            className="w-full mt-8 bg-primary text-background-dark font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all active:scale-[0.98] relative z-10"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>저장</span>
            )}
          </button>
        </section>
      </motion.main>
    </div>
  );
}
