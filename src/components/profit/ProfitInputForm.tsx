import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { useProfitStore } from '../../store/useProfitStore';
import { DayPicker } from './PeriodDatePicker';
import { TimePicker } from '../TimePicker';
import { UserSelector } from './UserSelector';
import { TickerSelector } from './TickerSelector';

export function ProfitInputForm() {
  const addRecord = useProfitStore((state) => state.addRecord);
  const selectedUser = useProfitStore((state) => state.selectedUser);
  const selectedTicker = useProfitStore((state) => state.selectedTicker);

  const now = new Date();
  // format YYYY.MM.DD
  const defaultDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  // format HH:MM
  const defaultTime = now.toTimeString().slice(0, 5);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [profit, setProfit] = useState('');

  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(now.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(now.getMonth());
  const popoverRef = useRef<HTMLDivElement>(null);

  // click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  const getSelectedDateObj = () => {
    const parts = date.split('.');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !profit) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const profitNum = Number(profit.replace(/,/g, ''));
    if (isNaN(profitNum)) {
      alert('숫자만 입력 가능합니다.');
      return;
    }

    addRecord({
      user: selectedUser,
      ticker: selectedTicker,
      date,
      time,
      profit: profitNum,
    });

    setProfit('');
  };

  const handleNumberFormat = (val: string) => {
    // allow negative sign
    const numeric = val.replace(/[^-0-9]/g, '');
    if (numeric === '' || numeric === '-') {
      setProfit(numeric);
      return;
    }
    setProfit(Number(numeric).toLocaleString());
  };

  return (
    <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-xl relative z-20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
        <UserSelector />
        
        <TickerSelector />

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 relative" ref={popoverRef}>
            <div className="flex items-center gap-2 px-1 text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <label className="text-xs font-bold uppercase tracking-wider">날짜</label>
            </div>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full bg-background-dark border border-white/5 rounded-2xl px-4 py-4 text-center text-sm text-white font-medium focus:outline-none focus:border-primary transition-all hover:bg-white/5"
            >
              {date}
            </button>
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                <DayPicker
                  year={pickerYear}
                  month={pickerMonth}
                  selectedDate={getSelectedDateObj()}
                  onChangeMonth={(y, m) => { setPickerYear(y); setPickerMonth(m); }}
                  onSelect={(d) => {
                    setDate(`${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`);
                    setIsDatePickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1 text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <label className="text-xs font-bold uppercase tracking-wider">시간</label>
            </div>
            <TimePicker value={time} onChange={setTime} />
          </div>
        </div>

        {/* Profit Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 text-text-muted">
            <DollarSign className="w-3.5 h-3.5" />
            <label className="text-xs font-bold uppercase tracking-wider">수익 금액 (KRW)</label>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              inputMode="numeric"
              value={profit}
              onChange={(e) => handleNumberFormat(e.target.value)}
              placeholder="0"
              className="w-full bg-background-dark border border-white/5 rounded-2xl px-5 py-5 text-right font-black text-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all group-hover:border-white/10"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 group"
        >
          <span>저장</span>
        </button>
      </form>
    </div>
  );
}
