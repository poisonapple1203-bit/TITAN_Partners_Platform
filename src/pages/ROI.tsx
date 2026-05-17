import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { ROIInputForm } from '../components/roi/ROIInputForm';
import { ROIHistoryTable } from '../components/roi/ROIHistoryTable';
import { initROISync } from '../store/useROIStore';

export default function ROI() {
  const navigate = useNavigate();

  useEffect(() => {
    initROISync();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-dark text-text-main pb-12">
      <header className="flex items-center px-4 py-5 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-30">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-text-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight ml-2">수익률 비교</h1>
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
