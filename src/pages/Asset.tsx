import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AssetInputForm } from '../components/asset/AssetInputForm';
import { AssetCharts } from '../components/asset/AssetCharts';
import { AssetHistoryTable } from '../components/asset/AssetHistoryTable';
import { useAssetStore, loadFromServer } from '../store/useAssetStore';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export function Asset() {
  const navigate = useNavigate();
  const users = useAssetStore((state) => state.users);
  const currentUserId = useAssetStore((state) => state.currentUserId);
  const setCurrentUser = useAssetStore((state) => state.setCurrentUser);
  const isGuest = useAuthStore((state) => state.isGuest);

  // Load from cloud on mount
  useEffect(() => {
    const syncData = async () => {
      const cloudData = await loadFromServer();
      if (cloudData) {
        useAssetStore.setState(cloudData);
      }
    };
    syncData();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-dark text-text-main pb-12">
      <header className="flex items-center justify-between px-4 py-5 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-30">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-text-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight ml-2">자산 현황 관리</h1>
        </div>

        {/* User Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentUserId === user.id 
                  ? 'bg-surface-dark text-white shadow-lg' 
                  : 'text-text-muted hover:text-white/80'
              }`}
            >
              <UserCircle2 className={`w-3.5 h-3.5 ${currentUserId === user.id ? 'text-primary' : 'text-text-muted'}`} />
              {user.name}
            </button>
          ))}
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-1 p-4 md:p-6 flex flex-col gap-8 max-w-7xl mx-auto w-full ${isGuest ? 'sensitive-data' : ''}`}
      >
        {/* Charts Section */}
        <section>
          <AssetCharts />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
          {/* Input Section */}
          <section className="sticky top-24">
            <AssetInputForm />
          </section>

          {/* Table Section */}
          <section className="flex-1 min-w-0">
            <AssetHistoryTable />
          </section>
        </div>
      </motion.main>
    </div>
  );
}
