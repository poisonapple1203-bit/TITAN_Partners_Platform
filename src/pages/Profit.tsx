import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfitInputForm } from '../components/profit/ProfitInputForm';
import { ProfitHistoryTable } from '../components/profit/ProfitHistoryTable';
import { ProfitSummaryCard } from '../components/profit/ProfitSummaryCard';
import { PeriodDatePicker } from '../components/profit/PeriodDatePicker';
import { useProfitStore, type PeriodType, initProfitSync } from '../store/useProfitStore';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const PERIODS: PeriodType[] = ['전체', '연별', '월별', '일별'];

export function Profit() {
  const navigate = useNavigate();
  const selectedPeriod = useProfitStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useProfitStore((state) => state.setSelectedPeriod);
  const isGuest = useAuthStore((state) => state.isGuest);
  const syncError = useProfitStore((state) => state.syncError);
  const totalRecordsCount = useProfitStore((state) => state.records.length);

  useEffect(() => {
    const unsubscribe = initProfitSync();
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background-dark text-text-main pb-12">
      <header className="flex items-center px-4 py-5 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-30">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 text-text-muted"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight ml-2">수익 기록 관리</h1>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-1 p-4 md:p-6 flex flex-col gap-6 ${isGuest ? 'sensitive-data' : ''}`}
      >
        {syncError ? (
          <div className="bg-danger/10 border border-danger/20 text-danger text-xs px-4 py-3 rounded-2xl flex flex-col gap-1">
            <span className="font-bold">⚠️ Firestore 동기화 오류 발생</span>
            <span className="font-mono">{syncError}</span>
            <span className="text-white/40 mt-1">※ Firebase 보안 규칙(Security Rules)이나 네트워크 상태를 확인하세요.</span>
          </div>
        ) : (
          <div className="text-[10px] text-white/20 text-right -mb-4 px-1">
            ✓ Firestore 연결 상태 양호 (동기화된 총 레코드: {totalRecordsCount}개)
          </div>
        )}
        <section>
          <ProfitInputForm />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 bg-background-dark border border-white/5 rounded-2xl p-1">
              {PERIODS.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                    selectedPeriod === period 
                      ? 'bg-surface-dark text-white shadow-sm' 
                      : 'text-text-muted hover:text-white/80'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <PeriodDatePicker />
          </div>
          
          <ProfitSummaryCard />
          
          <ProfitHistoryTable />
        </section>
      </motion.main>
    </div>
  );
}
