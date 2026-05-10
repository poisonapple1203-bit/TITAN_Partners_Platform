import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function Landing() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Mock Google Login delay
    setTimeout(() => {
      // Simulate random logic: 50% chance of new user (no nickname) or existing user
      const isNewUser = Math.random() > 0.5;
      
      const mockUser = {
        id: `google-user-${Date.now()}`,
        name: 'Mock User',
        email: 'user@example.com',
        nickname: isNewUser ? undefined : 'TitanInvestor',
      };
      
      login(mockUser);
      
      if (isNewUser) {
        navigate('/signup');
      } else {
        navigate('/main');
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] p-8 pb-12 bg-background-dark text-text-main">
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary mb-4 tracking-tight">TITAN</h1>
          <p className="text-text-muted text-lg">
            당신의 자산을 지휘하는<br/>단 하나의 파트너
          </p>
        </motion.div>
        
        {/* Placeholder for future Lottie animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-48 h-48 rounded-full bg-surface-dark border border-white/5 shadow-2xl flex items-center justify-center mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
          <span className="text-text-muted/50 text-sm">Lottie Animation</span>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-semibold text-lg transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              구글로 시작하기
            </>
          )}
        </button>
        <p className="text-center text-xs text-text-muted mt-6">
          시작함으로써 TITAN의 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </motion.div>
    </div>
  );
}
