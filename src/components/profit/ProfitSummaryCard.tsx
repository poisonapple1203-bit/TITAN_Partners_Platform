import { startOfDay, endOfDay } from 'date-fns';
import { useProfitStore, parseRecordDate } from '../../store/useProfitStore';
import { getDisplayName } from '../../utils/userUtils';

export function ProfitSummaryCard() {
  const selectedPeriod = useProfitStore((state) => state.selectedPeriod);
  const selectedTicker = useProfitStore((state) => state.selectedTicker);
  const selectedUser = useProfitStore((state) => state.selectedUser);
  const records = useProfitStore((state) => state.records);
  const dateRange = useProfitStore((state) => state.dateRange);

  // 현재 선택된 티커 + 기간 + 사용자 에 맞게 실제 필터링
  const filteredRecords = records
    .filter(r => r.user === selectedUser)
    .filter(r => selectedTicker === 'ALL' || r.ticker === selectedTicker)
    .filter(r => {
      const rDate = parseRecordDate(r.date);
      return rDate >= startOfDay(dateRange.from) && rDate <= endOfDay(dateRange.to);
    });

  const totalProfit = filteredRecords.reduce((acc, r) => acc + r.profit, 0);
  const isPositive = totalProfit > 0;
  const isNegative = totalProfit < 0;

  return (
    <div className="bg-surface-dark border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col gap-2 relative overflow-hidden">
      {/* 장식용 배경 글로우 효과 */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-20 ${isPositive ? 'bg-success' : isNegative ? 'bg-danger' : 'bg-primary'}`}></div>

      <div className="flex items-center justify-between z-10">
        <h3 className="text-sm font-medium text-text-muted">
          {getDisplayName(selectedUser)}님의 {selectedPeriod} 누적 수익 <span className="text-white/40 ml-1">| {selectedTicker === 'ALL' ? '전체 종목' : selectedTicker}</span>
        </h3>
      </div>
      
      <div className="flex items-baseline gap-2 z-10 mt-1">
        <span className={`text-3xl font-bold tracking-tight ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-white'}`}>
          {isPositive ? '+' : ''}{totalProfit.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted font-medium">KRW</span>
      </div>
    </div>
  );
}
