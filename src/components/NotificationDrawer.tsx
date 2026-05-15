import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
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

          {/* Drawer from Right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute top-0 right-0 bottom-0 w-[60%] max-w-[240px] bg-surface-dark border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Noti</h2>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-white/5 text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-text-muted">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>새로운 알림이 없습니다.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
