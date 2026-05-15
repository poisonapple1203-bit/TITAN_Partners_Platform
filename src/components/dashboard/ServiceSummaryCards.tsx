import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, PieChart, ArrowUpRight, Activity } from 'lucide-react';
import { useAssetStore } from '../../store/useAssetStore';
import { useProfitStore } from '../../store/useProfitStore';
import { useROIStore } from '../../store/useROIStore';
import { fetchMarketPrices, normalizeTicker, fetchExchangeRate } from '../../services/assetMarketData';

export function ServiceSummaryCards() {
  // --- Asset Data ---
  const assetRecords = useAssetStore((state) => state.records);
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(1400);

  // --- Profit Data ---
  const profitRecords = useProfitStore((state) => state.records);
  const selectedUser = useProfitStore((state) => state.selectedUser);

  // --- ROI Data ---
  const roiRecords = useROIStore((state) => state.records);

  useEffect(() => {
    const loadAssetData = async () => {
      const rate = await fetchExchangeRate();
      setExchangeRate(rate);

      const tickers = assetRecords
        .filter(r => r.accountType !== 'cash')
        .map(r => normalizeTicker(r.ticker));

      if (tickers.length > 0) {
        const uniqueTickers = Array.from(new Set(tickers));
        const realPrices = await fetchMarketPrices(uniqueTickers);
        setAssetPrices(prev => {
          const updated = { ...prev };
          assetRecords.forEach(r => {
            const norm = normalizeTicker(r.ticker);
            if (realPrices[norm]) updated[r.ticker] = realPrices[norm];
          });
          return updated;
        });
      }
    };
    loadAssetData();
  }, [assetRecords]);

  // Asset Calculation
  const assetSummary = useMemo(() => {
    let principalTotal = 0;
    let evaluatedTotal = 0;

    assetRecords.forEach(record => {
      const curPrice = record.accountType === 'cash' ? record.averagePrice : (assetPrices[record.ticker] || record.averagePrice);
      let pValue = record.shares * record.averagePrice;
      let eValue = record.shares * curPrice;

      if (record.currency === '$') {
        pValue *= exchangeRate;
        eValue *= exchangeRate;
      }

      principalTotal += pValue;
      evaluatedTotal += eValue;
    });

    const returnRate = principalTotal > 0 ? ((evaluatedTotal - principalTotal) / principalTotal * 100) : 0;
    return { principalTotal, evaluatedTotal, returnRate };
  }, [assetRecords, assetPrices, exchangeRate]);

  // Profit Calculation
  const totalProfit = useMemo(() => {
    return profitRecords
      .filter(r => r.user === selectedUser)
      .reduce((acc, r) => acc + r.profit, 0);
  }, [profitRecords, selectedUser]);

  // ROI Calculation (User A - 조핏)
  const userAROI = useMemo(() => {
    const userARecords = roiRecords
      .filter(r => r.user === 'A')
      .sort((a, b) => {
        const dateA = new Date(`${a.date.replace(/\./g, '-')}T${a.time}`).getTime();
        const dateB = new Date(`${b.date.replace(/\./g, '-')}T${b.time}`).getTime();
        return dateB - dateA;
      });
    return userARecords[0]?.rate || 0;
  }, [roiRecords]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Main Asset Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-dark border border-white/5 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-bold text-text-muted tracking-tight">자산 요약 현황</span>
        </div>

        <div className="flex flex-col gap-1 mb-8">
          <span className="text-text-muted text-xs font-medium uppercase tracking-widest opacity-60">총 평가 금액</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">
              ₩{assetSummary.evaluatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${assetSummary.returnRate >= 0 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
              {assetSummary.returnRate >= 0 ? '+' : ''}{assetSummary.returnRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-50">총 투자 원금</span>
            <span className="text-sm font-bold text-white/90">₩{assetSummary.principalTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-50">수익률 현황</span>
            <span className={`text-sm font-black ${assetSummary.returnRate >= 0 ? 'text-danger' : 'text-primary'}`}>
              {assetSummary.returnRate >= 0 ? '+' : ''}{(assetSummary.evaluatedTotal - assetSummary.principalTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Secondary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cumulative Profit Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface-dark border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none group-hover:bg-success/10 transition-all"></div>
          
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-success transition-colors" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider opacity-60">{selectedUser} 누적 수익</span>
            <span className={`text-2xl font-black tracking-tight ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}
              <span className="text-xs font-bold text-text-muted ml-1 opacity-40">KRW</span>
            </span>
          </div>
        </motion.div>

        {/* ROI User A Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-surface-dark border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none group-hover:bg-purple-500/10 transition-all"></div>

          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <PieChart className="w-4 h-4 text-text-muted group-hover:text-purple-400 transition-colors" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider opacity-60">조핏(User A) 수익률</span>
            <span className="text-2xl font-black text-purple-400 tracking-tight">
              {userAROI.toFixed(2)}%
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
