import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Wallet, Hash, DollarSign, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { TICKER_NAMES, searchTickersByName } from '../../utils/tickerMapping';
import { useAssetStore, type AccountType, type AssetRecord } from '../../store/useAssetStore';
import { getTickerInfo } from '../../services/assetMarketData';

export function AssetInputForm() {
  const addRecord = useAssetStore((state) => state.addRecord);
  const updateRecord = useAssetStore((state) => state.updateRecord);
  const editingRecordId = useAssetStore((state) => state.editingRecordId);
  const setEditingRecordId = useAssetStore((state) => state.setEditingRecordId);
  const records = useAssetStore((state) => state.records);

  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashCurrency, setCashCurrency] = useState<'KRW' | 'USD'>('KRW');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [fetchedName, setFetchedName] = useState('');
  const [searchResults, setSearchResults] = useState<{ ticker: string, name: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingRecordId) {
      const record = records.find(r => r.id === editingRecordId);
      if (record) {
        setAccountType(record.accountType);
        if (record.accountType === 'cash') {
          setCashCurrency(record.currency === '$' ? 'USD' : 'KRW');
          setCashAmount(record.averagePrice.toString());
        } else {
          setTicker(record.ticker);
          setShares(record.shares.toString());
          setAveragePrice(record.averagePrice.toString());
          setFetchedName('');
        }

        const formElement = document.getElementById('asset-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [editingRecordId, records]);

  // Auto-trigger search for Korean 6-digit codes
  useEffect(() => {
    if (/^[0-9]{6}$/.test(ticker) && !fetchedName) {
      const timer = setTimeout(() => handleSearchTicker(ticker), 600);
      return () => clearTimeout(timer);
    }
  }, [ticker]);

  const handleSearchTicker = async (tickerToSearch: string = ticker) => {
    if (!tickerToSearch || tickerToSearch.length < 2 || tickerToSearch === '고유계정대') return;
    setSearchError('');
    const info = await getTickerInfo(tickerToSearch);
    if (info) {
      setFetchedName(info.name);
      if (!averagePrice) setAveragePrice(info.price.toString());
    } else {
      setSearchError('종목 정보를 찾을 수 없습니다.');
      setFetchedName('');
    }
  };

  const handleTickerChange = (value: string) => {
    setTicker(value);
    setSearchError('');
    if (fetchedName) setFetchedName('');

    const matches = searchTickersByName(value);
    setSearchResults(matches);
    setShowResults(matches.length > 0);
  };

  const handleSelectResult = (item: { ticker: string, name: string }) => {
    setTicker(item.ticker);
    setFetchedName(item.name);
    setShowResults(false);
    if (item.ticker !== '고유계정대') {
      handleSearchTicker(item.ticker);
    }
  };

  const isKorean = !!TICKER_NAMES[ticker.toUpperCase()] || fetchedName.includes('KODEX') || fetchedName.includes('TIGER') || /^[0-9]{6}$/.test(ticker.toUpperCase()) || ticker.trim() === '고유계정대';
  const currency = isKorean ? '₩' : '$';
  const isCustomCash = ticker.trim() === '고유계정대' || ticker.trim() === 'EA119';

  const accountOptions = [
    { value: 'irp', label: 'IRP' },
    { value: 'pension', label: '연금저축펀드' },
    { value: 'stock', label: '일반주식' },
    { value: 'cash', label: '현금' },
    { value: 'isa', label: 'ISA' }
  ];

  const formatWithCommas = (value: string) => {
    if (!value) return '';
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  };

  const parseCommas = (value: string) => value.replace(/,/g, '');

  const resetForm = () => {
    setAccountType('');
    setTicker('');
    setShares('');
    setAveragePrice('');
    setCashAmount('');
    setCashCurrency('KRW');
    setFetchedName('');
    setSearchError('');
    setSearchResults([]);
    setShowResults(false);
    setEditingRecordId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'cash') {
      if (!cashAmount) return;
    } else {
      if (!ticker || (!isCustomCash && !shares) || !averagePrice) return;
    }

    setIsSubmitting(true);
    const recordData: Omit<AssetRecord, 'id' | 'createdAt'> = {
      accountType: accountType as AccountType,
      ticker: accountType === 'cash' ? cashCurrency : ticker.toUpperCase(),
      shares: accountType === 'cash' || isCustomCash ? 1 : Number(parseCommas(shares)),
      averagePrice: accountType === 'cash' ? Number(parseCommas(cashAmount)) : Number(parseCommas(averagePrice)),
      currency: (accountType === 'cash' ? (cashCurrency === 'USD' ? '$' : '₩') : currency) as '$' | '₩',
    };

    setTimeout(() => {
      if (editingRecordId) {
        updateRecord(editingRecordId, recordData);
      } else {
        addRecord(recordData);
      }
      resetForm();
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div id="asset-form" className="bg-surface-dark border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2.5 rounded-xl">
          <PlusCircle className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          {editingRecordId ? '자산 정보 수정' : '새 자산 등록'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-muted px-1 uppercase tracking-wider">자산 종류</label>
          <CustomDropdown
            options={accountOptions}
            value={accountType}
            onChange={(val) => setAccountType(val as AccountType)}
            placeholder="자산 종류 선택..."
            icon={<Wallet className="w-4 h-4" />}
          />
        </div>

        <AnimatePresence mode="wait">
          {accountType === 'cash' ? (
            <motion.div 
              key="cash-fields"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted px-1 uppercase tracking-wider">통화 선택</label>
                <CustomDropdown
                  options={[{ value: 'KRW', label: 'KRW (원화)' }, { value: 'USD', label: 'USD (달러)' }]}
                  value={cashCurrency}
                  onChange={(val) => setCashCurrency(val as 'KRW' | 'USD')}
                  icon={<DollarSign className="w-4 h-4" />}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted px-1 uppercase tracking-wider">금액</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold pointer-events-none transition-colors group-focus-within:text-primary">
                    {cashCurrency === 'USD' ? '$' : '₩'}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-background-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-medium"
                    placeholder="0"
                    value={formatWithCommas(cashAmount)}
                    onChange={(e) => setCashAmount(parseCommas(e.target.value))}
                    required
                  />
                </div>
              </div>
            </motion.div>
          ) : accountType ? (
            <motion.div 
              key="asset-fields"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-text-muted px-1 uppercase tracking-wider">티커 검색</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none transition-colors group-focus-within:text-primary" />
                  <input
                    type="text"
                    className="w-full bg-background-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-medium"
                    placeholder="예: aapl, 005930, Tiger..."
                    value={ticker}
                    onChange={(e) => handleTickerChange(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {showResults && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 z-50 mt-2 p-1.5 bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[250px] overflow-y-auto"
                    >
                      {searchResults.map((item) => (
                        <button
                          key={item.ticker}
                          type="button"
                          onClick={() => handleSelectResult(item)}
                          className="w-full flex flex-col gap-0.5 px-4 py-2.5 rounded-xl text-left hover:bg-white/5 transition-colors group"
                        >
                          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</span>
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5" /> {item.ticker}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Message */}
                {(fetchedName || TICKER_NAMES[ticker.toUpperCase()] || searchError) && (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mt-2 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                      searchError ? 'bg-danger/5 border-danger/10 text-danger' : 'bg-primary/5 border-primary/10 text-primary'
                    }`}
                  >
                    {searchError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>
                      {(fetchedName && fetchedName !== ticker.toUpperCase() ? fetchedName : '') || TICKER_NAMES[ticker.toUpperCase()] || ticker.toUpperCase()}
                      {searchError && ` : ${searchError}`}
                    </span>
                  </motion.div>
                )}
              </div>

              <div className={`grid gap-4 ${isCustomCash ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {!isCustomCash && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-muted px-1 uppercase tracking-wider">주수</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full bg-background-dark border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="0"
                      value={formatWithCommas(shares)}
                      onChange={(e) => setShares(parseCommas(e.target.value))}
                      required
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-muted px-1 uppercase tracking-wider">
                    {isCustomCash ? (ticker.trim() === 'EA119' ? '평가금액' : '금액') : '평단가'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold pointer-events-none transition-colors group-focus-within:text-primary">
                      {currency === '$' ? '$' : '₩'}
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full bg-background-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="0"
                      value={formatWithCommas(averagePrice)}
                      onChange={(e) => setAveragePrice(parseCommas(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl gap-3"
            >
              <div className="bg-white/5 p-4 rounded-full">
                <Search className="w-8 h-8 text-text-muted/30" />
              </div>
              <p className="text-sm text-text-muted/50 font-medium">자산 종류를 먼저 선택해주세요</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-4">
          {editingRecordId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-text-muted hover:bg-white/5 transition-all"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !accountType || (accountType === 'cash' ? !cashAmount : (!ticker || (!isCustomCash && !shares) || !averagePrice))}
            className={`flex-[2] py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              isSubmitting || !accountType || (accountType === 'cash' ? !cashAmount : (!ticker || (!isCustomCash && !shares) || !averagePrice))
                ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                : 'bg-primary text-white hover:brightness-110 shadow-primary/20 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? '처리 중...' : (editingRecordId ? '수정 완료하기' : '자산 추가하기')}
          </button>
        </div>
      </form>
    </div>
  );
}
