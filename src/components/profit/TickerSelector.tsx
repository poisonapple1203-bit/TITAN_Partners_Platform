import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProfitStore } from '../../store/useProfitStore';

export function TickerSelector() {
  const tickers = useProfitStore((state) => state.tickers);
  const selectedTicker = useProfitStore((state) => state.selectedTicker);
  const setSelectedTicker = useProfitStore((state) => state.setSelectedTicker);
  const addTicker = useProfitStore((state) => state.addTicker);

  const [isAdding, setIsAdding] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  const handleAdd = () => {
    const trimmed = newTicker.trim().toUpperCase();
    if (!trimmed) return;
    if (tickers.includes(trimmed)) {
      alert('이미 등록된 티커입니다.');
      return;
    }
    addTicker(trimmed);
    setSelectedTicker(trimmed);
    setNewTicker('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setIsAdding(false); setNewTicker(''); }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
      <button
        onClick={() => setSelectedTicker('ALL')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
          selectedTicker === 'ALL'
            ? 'bg-surface-dark border border-white/15 text-white shadow-md'
            : 'bg-transparent border border-white/8 text-text-muted hover:text-white hover:border-white/15'
        }`}
      >
        전체
      </button>

      {tickers.map((ticker) => {
        const isSelected = ticker === selectedTicker;
        return (
          <button
            key={ticker}
            onClick={() => setSelectedTicker(ticker)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              isSelected
                ? 'bg-surface-dark border border-white/15 text-white shadow-md'
                : 'bg-transparent border border-white/8 text-text-muted hover:text-white hover:border-white/15'
            }`}
          >
            {ticker}
          </button>
        );
      })}

      {/* 추가 버튼 / 입력 */}
      {isAdding ? (
        <div className="flex items-center gap-1 shrink-0">
          <input
            autoFocus
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AAPL"
            className="w-20 bg-background-dark border border-primary/40 rounded-full px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
          />
          <button onClick={handleAdd} className="p-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => { setIsAdding(false); setNewTicker(''); }} className="p-1.5 rounded-full hover:bg-white/5 text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full border border-dashed border-white/10 text-text-muted hover:text-white hover:border-white/20 transition-all shrink-0 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>추가</span>
        </button>
      )}
    </div>
  );
}
