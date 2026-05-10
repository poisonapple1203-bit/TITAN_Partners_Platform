import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProfitInputForm } from '../components/profit/ProfitInputForm';
import { ProfitHistoryTable } from '../components/profit/ProfitHistoryTable';
import { ProfitSummaryCard } from '../components/profit/ProfitSummaryCard';
import { TickerSelector } from '../components/profit/TickerSelector';
import { PeriodDatePicker } from '../components/profit/PeriodDatePicker';
import { useProfitStore, type PeriodType } from '../store/useProfitStore';

const PERIODS: PeriodType[] = ['전체', '연별', '월별', '일별'];

export function Profit() {
  const navigate = useNavigate();
  const selectedPeriod = useProfitStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useProfitStore((state) => state.setSelectedPeriod);

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
        className="flex-1 p-4 md:p-6 flex flex-col gap-6"
      >
        {/* 티커 선택 칩 */}
        <section className="px-1">
          <TickerSelector />
        </section>

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
