import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Trash2, Menu, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { ServiceSummaryCards } from '../components/dashboard/ServiceSummaryCards';
import { useAssetStore, loadFromServer } from '../store/useAssetStore';
import { initProfitSync } from '../store/useProfitStore';
import { initROISync } from '../store/useROIStore';

export function MainDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetAccount = useAuthStore((state) => state.resetAccount);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  useEffect(() => {
    // 1. Sidebar open check
    if (location.state?.openSidebar) {
      setIsSidebarOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }

    // 2. ROI & Profit Real-time Sync
    const unsubROI = initROISync();
    const unsubProfit = initProfitSync();

    // 3. Asset Cloud Load
    const syncAssetData = async () => {
      const cloudData = await loadFromServer();
      if (cloudData) {
        useAssetStore.setState(cloudData);
      }
    };
    syncAssetData();

    return () => {
      unsubROI();
      unsubProfit();
    };
  }, [location, navigate]);

  const handleHeaderClick = () => {
    navigate('/main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-dark text-text-main pb-24 relative overflow-hidden">
      
      {/* Sidebars */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationDrawer isOpen={isNotiOpen} onClose={() => setIsNotiOpen(false)} />

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-30 relative">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-text-muted z-10"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button 
          onClick={handleHeaderClick} 
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center whitespace-nowrap"
        >
          <h1 className="text-xl font-bold tracking-tight">TITAN Partners.</h1>
        </button>

        <div className="flex items-center gap-1 z-10">
          <button 
            onClick={() => setIsNotiOpen(true)}
            className="p-2 rounded-full hover:bg-white/5 text-text-muted relative"
          >
            <Bell className="w-6 h-6" />
            {/* Mock notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          <div className="w-8 h-8 rounded-full bg-surface-dark flex items-center justify-center border border-white/10 ml-1 overflow-hidden">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary text-xs font-bold">
                {user?.nickname?.[0] || user?.name?.[0] || 'U'}
              </span>
            )}
          </div>
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col gap-8 px-6 pt-6"
      >
        {/* Hero Section */}
        <section>
          <div className="flex flex-col gap-0.5 px-1">
            <p className="text-text-muted text-[10px] font-black opacity-40 uppercase tracking-[0.15em]">안녕하세요,</p>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {user?.nickname || user?.name || '조대현'}님
              <span className="text-white ml-0.5">.</span>
            </h2>
          </div>
        </section>

        {/* Integrated Service Summaries */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] opacity-40">나의 투자 요약</h3>
            <div className="h-[1px] flex-1 bg-white/5 ml-4"></div>
          </div>
          <ServiceSummaryCards />
        </section>

        {/* Temporary Developer Settings for Testing */}
        <section className="mt-auto pt-8">
          <h3 className="text-sm font-semibold text-text-muted mb-4 px-2 uppercase tracking-wider">Developer Tools (Test)</h3>
          <div className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex flex-col gap-2">
            <button 
              onClick={logout}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <span className="font-medium">일반 로그아웃</span>
              <LogOut className="w-5 h-5 text-text-muted" />
            </button>
            <div className="h-[1px] bg-white/5 mx-4"></div>
            <button 
              onClick={resetAccount}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-danger/10 transition-colors text-left text-danger"
            >
              <span className="font-medium">강제 회원탈퇴 (초기화)</span>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
