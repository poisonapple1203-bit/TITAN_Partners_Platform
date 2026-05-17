import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function SignUp() {
  const navigate = useNavigate();
  const setNickname = useAuthStore((state) => state.setNickname);
  const [nicknameInput, setNicknameInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameInput.trim().length < 2) return;
    
    await setNickname(nicknameInput.trim());
    navigate('/main');
  };

  return (
    <div className="flex flex-col min-h-[100dvh] p-8 bg-background-dark text-text-main">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 mb-10"
      >
        <h1 className="text-3xl font-bold mb-3">반갑습니다!</h1>
        <p className="text-text-muted text-lg leading-relaxed">
          TITAN에서 사용할<br />멋진 닉네임을 지어주세요.
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col"
      >
        <div className="flex-1">
          <input
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="예: 워렌버핏"
            className="w-full bg-transparent border-b-2 border-surface-dark focus:border-primary py-4 text-2xl outline-none transition-colors placeholder:text-surface-dark"
            autoFocus
          />
          {nicknameInput.length > 0 && nicknameInput.length < 2 && (
            <p className="text-danger text-sm mt-2">닉네임은 2자 이상 입력해주세요.</p>
          )}
        </div>

        <div className="safe-padding-bottom pb-6">
          <button
            type="submit"
            disabled={nicknameInput.trim().length < 2}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-semibold text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            시작하기
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.form>
    </div>
  );
}
