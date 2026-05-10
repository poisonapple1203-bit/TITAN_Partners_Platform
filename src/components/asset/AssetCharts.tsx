import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAssetStore } from '../../store/useAssetStore';
import { getTickerDisplayName } from '../../utils/tickerMapping';
import { fetchMarketPrices, normalizeTicker, fetchExchangeRate } from '../../services/assetMarketData';

const COLORS = ['#3b82f6', '#f97316', '#a855f7', '#10b981', '#fb7185', '#0ea5e9', '#eab308', '#6366f1', '#ec4899'];

const ACCOUNT_TYPE_LABELS = {
  irp: 'IRP',
  pension: '연금저축펀드',
  stock: '일반주식',
  cash: '현금',
  isa: 'ISA'
};

const ACCOUNT_COLORS = {
  irp: '#a855f7',
  pension: '#f59e0b',
  stock: '#3b82f6',
  cash: '#10b981',
  isa: '#ef4444'
};

const FALLBACK_EXCHANGE_RATE = 1400;

export function AssetCharts() {
  const records = useAssetStore((state) => state.records);
  const [displayCurrency, setDisplayCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_EXCHANGE_RATE);
  const [isLoadingFX, setIsLoadingFX] = useState(true);
  const loadData = async () => {
    // 1. Fetch Exchange Rate
    const rate = await fetchExchangeRate();
    setExchangeRate(rate);
    setIsLoadingFX(false);

    // 2. Fetch Market Prices
    const relevantTickers = records
      .filter(r => r.accountType !== 'cash')
      .map(r => normalizeTicker(r.ticker));

    if (relevantTickers.length > 0) {
      const uniqueTickers = Array.from(new Set(relevantTickers));
      const realPrices = await fetchMarketPrices(uniqueTickers);

      if (Object.keys(realPrices).length > 0) {
        setCurrentPrices(prev => {
          const updated = { ...prev };
          records.forEach(record => {
            const normalized = normalizeTicker(record.ticker);
            if (realPrices[normalized]) {
              updated[record.ticker] = realPrices[normalized];
            }
          });
          return updated;
        });
      }
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [records]);

  const { accountData, tickerData, totalPrincipal, totalEvaluated, totalReturnRate } = useMemo(() => {
    const accMap: Record<string, number> = {};
    const ticMap: Record<string, { evaluated: number; principal: number; ticker: string; currency: string }> = {};
    let principalTotal = 0;
    let evaluatedTotal = 0;

    records.forEach(record => {
      const curPrice = record.accountType === 'cash' ? record.averagePrice : (currentPrices[record.ticker] || record.averagePrice);

      let pValue = record.shares * record.averagePrice;
      let eValue = record.shares * curPrice;

      let pValueConverted = pValue;
      let eValueConverted = eValue;

      if (displayCurrency === 'KRW' && record.currency === '$') {
        pValueConverted = pValue * exchangeRate;
        eValueConverted = eValue * exchangeRate;
      } else if (displayCurrency === 'USD' && record.currency === '₩') {
        pValueConverted = pValue / exchangeRate;
        eValueConverted = eValue / exchangeRate;
      }

      principalTotal += pValueConverted;
      evaluatedTotal += eValueConverted;

      accMap[record.accountType] = (accMap[record.accountType] || 0) + eValueConverted;

      if (!ticMap[record.ticker]) {
        ticMap[record.ticker] = { evaluated: 0, principal: 0, ticker: record.ticker, currency: record.currency };
      }
      ticMap[record.ticker].evaluated += eValueConverted;
      ticMap[record.ticker].principal += pValueConverted;
    });

    const accountData = Object.entries(accMap).map(([key, value]) => {
      const pSum = records
        .filter(r => r.accountType === key)
        .reduce((sum, r) => {
          let pVal = r.shares * r.averagePrice;
          if (displayCurrency === 'KRW' && r.currency === '$') pVal *= exchangeRate;
          else if (displayCurrency === 'USD' && r.currency === '₩') pVal /= exchangeRate;
          return sum + pVal;
        }, 0);

      return {
        name: ACCOUNT_TYPE_LABELS[key as keyof typeof ACCOUNT_TYPE_LABELS],
        value,
        principal: pSum,
        returnRate: pSum > 0 ? ((value - pSum) / pSum * 100) : 0,
        key
      };
    }).filter(d => d.value > 0);

    const tickerData = Object.values(ticMap).map((data) => ({
      name: getTickerDisplayName(data.ticker),
      value: data.evaluated,
      principal: data.principal,
      returnRate: data.principal > 0 ? ((data.evaluated - data.principal) / data.principal * 100) : 0
    })).filter(d => d.value > 0);

    tickerData.sort((a, b) => b.value - a.value);

    const returnRate = principalTotal > 0 ? ((evaluatedTotal - principalTotal) / principalTotal * 100) : 0;

    return {
      accountData,
      tickerData,
      totalPrincipal: principalTotal,
      totalEvaluated: evaluatedTotal,
      totalReturnRate: returnRate
    };
  }, [records, displayCurrency, currentPrices, exchangeRate]);

  const isEmpty = records.length === 0;
  const currencySymbol = displayCurrency === 'KRW' ? '₩' : '$';
  const maxDigits = displayCurrency === 'KRW' ? 0 : 2;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && !isEmpty) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-dark/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
          <p className="text-white font-bold text-base mb-3 border-b border-white/5 pb-2">{payload[0].name}</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">평가액</span>
              <span className="text-white font-bold">{currencySymbol}{payload[0].value.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">투자액</span>
              <span className="text-white/80 font-medium">{currencySymbol}{data.principal.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">수익률</span>
              <span className={`font-bold ${data.returnRate >= 0 ? 'text-danger' : 'text-primary'}`}>
                {data.returnRate >= 0 ? '+' : ''}{data.returnRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
              <span className="text-text-muted">비중</span>
              <span className="text-white font-bold">{((payload[0].value / totalEvaluated) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full overflow-hidden">
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-60">현재 환율</span>
            <span className="text-xs font-bold text-primary">
              1$ = {isLoadingFX ? '...' : `${exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}₩`}
            </span>
          </div>
          
          <div className="flex bg-background-dark border border-white/5 rounded-xl p-1 relative min-w-[140px]">
            <motion.div 
              className="absolute top-1 bottom-1 bg-primary rounded-lg shadow-lg shadow-primary/20"
              initial={false}
              animate={{
                left: displayCurrency === 'KRW' ? 4 : '50%',
                right: displayCurrency === 'KRW' ? '50%' : 4
              }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
            <button
              onClick={() => setDisplayCurrency('KRW')}
              className={`flex-1 py-1.5 text-xs font-bold relative z-10 transition-colors ${displayCurrency === 'KRW' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              KRW
            </button>
            <button
              onClick={() => setDisplayCurrency('USD')}
              className={`flex-1 py-1.5 text-xs font-bold relative z-10 transition-colors ${displayCurrency === 'USD' ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              USD
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex flex-col gap-1 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none group-hover:bg-primary/20 transition-all"></div>
            <span className="text-xs font-bold text-primary tracking-wide uppercase opacity-80">총 평가 금액</span>
            <span className="text-2xl font-black text-white tracking-tight">
              {currencySymbol}{totalEvaluated.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}
            </span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-surface-dark border border-white/5 p-6 rounded-3xl flex flex-col gap-1"
          >
            <span className="text-xs font-bold text-text-muted tracking-wide uppercase opacity-60">총 투자 원금</span>
            <span className="text-2xl font-bold text-white/90 tracking-tight">
              {currencySymbol}{totalPrincipal.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}
            </span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className={`bg-surface-dark border p-6 rounded-3xl flex flex-col gap-1 ${totalReturnRate >= 0 ? 'border-danger/20' : 'border-primary/20'}`}
          >
            <span className="text-xs font-bold text-text-muted tracking-wide uppercase opacity-60">전체 수익률</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black tracking-tight ${totalReturnRate >= 0 ? 'text-danger' : 'text-primary'}`}>
                {totalReturnRate >= 0 ? '+' : ''}{totalReturnRate.toFixed(2)}%
              </span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${totalReturnRate >= 0 ? 'text-danger' : 'text-primary'} opacity-80`}>
                {totalReturnRate >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(totalEvaluated - totalPrincipal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Chart */}
        <div className="bg-surface-dark border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-0">
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-bold text-white/80">자산 종류별 비중</h4>
          </div>
          
          <div className="w-full h-[260px] relative -mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={isEmpty ? [{ value: 1 }] : accountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={isEmpty ? 0 : 4}
                  isAnimationActive={!isEmpty}
                >
                  {isEmpty ? (
                    <Cell fill="rgba(255,255,255,0.03)" />
                  ) : (
                    accountData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={ACCOUNT_COLORS[entry.key as keyof typeof ACCOUNT_COLORS] || COLORS[index % COLORS.length]} 
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))
                  )}
                  <Label
                    content={({ viewBox: { cx, cy } }: any) => (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={cx} dy="-1.2em" className="fill-white/60 text-[10px] font-bold uppercase tracking-wider">Total Value</tspan>
                        <tspan x={cx} dy="1.2em" className="fill-white text-lg font-black tracking-tighter">
                          {currencySymbol}{totalEvaluated.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>
                {!isEmpty && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {accountData.map((entry, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: ACCOUNT_COLORS[entry.key as keyof typeof ACCOUNT_COLORS] || COLORS[index % COLORS.length] }} />
                <span className="text-[11px] font-bold text-text-muted whitespace-nowrap">{entry.name}</span>
                <span className="text-[11px] font-black text-white/40">{((entry.value / totalEvaluated) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker Chart */}
        <div className="bg-surface-dark border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-0">
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-bold text-white/80">종목별 비중</h4>
          </div>
          
          <div className="w-full h-[260px] relative -mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={isEmpty ? [{ value: 1 }] : tickerData.slice(0, 9)}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={isEmpty ? 0 : 4}
                  isAnimationActive={!isEmpty}
                >
                  {isEmpty ? (
                    <Cell fill="rgba(255,255,255,0.03)" />
                  ) : (
                    tickerData.slice(0, 9).map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))
                  )}
                  <Label
                    content={({ viewBox: { cx, cy } }: any) => (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={cx} dy="-1.2em" className="fill-white/60 text-[10px] font-bold uppercase tracking-wider">Total Value</tspan>
                        <tspan x={cx} dy="1.2em" className="fill-white text-lg font-black tracking-tighter">
                          {currencySymbol}{totalEvaluated.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}
                        </tspan>
                      </text>
                    )}
                  />
                </Pie>
                {!isEmpty && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {tickerData.slice(0, 15).map((entry, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-[11px] font-bold text-text-muted whitespace-nowrap">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
