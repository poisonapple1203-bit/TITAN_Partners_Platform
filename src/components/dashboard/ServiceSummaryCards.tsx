import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAssetStore } from '../../store/useAssetStore';
import { useProfitStore } from '../../store/useProfitStore';
import { useROIStore } from '../../store/useROIStore';
import { fetchMarketPrices, normalizeTicker, fetchExchangeRate } from '../../services/assetMarketData';

export function ServiceSummaryCards() {
  const navigate = useNavigate();
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
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Main Asset Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate('/asset')}
        className="bg-surface-dark border border-white/5 p-7 rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-primary/10 transition-all duration-700"></div>
        
        <div className="flex flex-col gap-1.5 mb-10">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80 mb-1">자산 요약 현황</span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-white tracking-tighter">
              ₩{assetSummary.evaluatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className={`text-xs font-bold ${assetSummary.returnRate >= 0 ? 'text-danger' : 'text-primary'}`}>
              {assetSummary.returnRate >= 0 ? '+' : ''}{assetSummary.returnRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">총 투자 원금</span>
            <span className="text-sm font-bold text-white/80 tracking-tight">₩{assetSummary.principalTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">평가 손익</span>
            <span className={`text-sm font-black tracking-tight ${assetSummary.returnRate >= 0 ? 'text-danger' : 'text-primary'}`}>
              {assetSummary.returnRate >= 0 ? '+' : ''}{(assetSummary.evaluatedTotal - assetSummary.principalTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Secondary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cumulative Profit Card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => navigate('/profit')}
          className="bg-surface-dark border border-white/5 p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-success/10 transition-all"></div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-success uppercase tracking-[0.15em] opacity-70">{selectedUser} 누적 수익</span>
            <span className={`text-xl font-black tracking-tight ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}
              <span className="text-[10px] font-bold text-text-muted ml-1 opacity-30 uppercase">KRW</span>
            </span>
          </div>
        </motion.div>

        {/* ROI User A Card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => navigate('/roi')}
          className="bg-surface-dark border border-white/5 p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-purple-500/10 transition-all"></div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.15em] opacity-70">조핏(User A) 수익률</span>
            <span className="text-xl font-black text-purple-400 tracking-tight">
              {userAROI.toFixed(2)}%
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
