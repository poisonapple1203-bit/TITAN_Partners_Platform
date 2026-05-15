import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, TrendingUp, History, Shield, Settings, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Home', id: 'home', path: '/main' },
  { icon: PieChart, label: 'Asset', id: 'asset', path: '/asset' },
  { icon: TrendingUp, label: 'Profit', id: 'profit', path: '/profit' },
  { icon: History, label: 'ROI', id: 'roi', path: '/roi' },
  { icon: Shield, label: 'Data Access', id: 'data-access', path: '/data-access' },
  { icon: Settings, label: 'Settings', id: 'settings', path: '/settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path, { state: { fromSidebar: true } });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute top-0 left-0 bottom-0 w-[60%] max-w-[240px] bg-surface-dark border-r border-white/5 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <h2 className="text-xl font-bold text-primary">Menu</h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-white/5 text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <ul className="flex flex-col gap-1 px-3">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <item.icon className="w-5 h-5 text-text-muted" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-t border-white/5 safe-padding-bottom">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left text-text-muted hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
