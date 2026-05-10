import { useState, useRef, useEffect } from 'react';
import { useProfitStore } from '../../store/useProfitStore';
import { DayPicker } from './PeriodDatePicker';
import { TimePicker } from '../TimePicker';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="relative flex-1 flex flex-col gap-1.5" ref={popoverRef}>
          <label className="text-xs text-text-muted px-1">날짜</label>
          <input 
            type="text" 
            value={date}
            readOnly
            onClick={() => setIsDatePickerOpen(true)}
            className="w-full bg-background-dark border border-white/5 rounded-2xl px-4 py-3.5 text-center text-sm text-white font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
          />
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
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs text-text-muted px-1">시간</label>
          <TimePicker value={time} onChange={setTime} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted px-1">수익</label>
        <input 
          type="text" 
          inputMode="numeric"
          value={profit}
          onChange={(e) => handleNumberFormat(e.target.value)}
          placeholder="0"
          className="w-full bg-background-dark border border-white/5 rounded-2xl px-5 py-4 text-right font-bold text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <button 
        type="submit"
        className="w-full mt-2 bg-success text-background-dark font-bold py-4 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(34,197,94,0.3)]"
      >
        <span>저장</span>
      </button>
    </form>
  );
}
