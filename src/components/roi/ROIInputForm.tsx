import { useState, useRef, useEffect } from 'react';
import { User, Calendar, Clock, Info } from 'lucide-react';
import { useROIStore } from '../../store/useROIStore';
import { DayPicker } from '../profit/PeriodDatePicker';
import { TimePicker } from '../TimePicker';

export function ROIInputForm() {
  const { currentUser, setCurrentUser, addRecord, nicknames } = useROIStore();
  
  const now = new Date();
  const defaultDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const defaultTime = now.toTimeString().slice(0, 5);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [roi, setRoi] = useState('0.00');

  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(now.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(now.getMonth());
  const datePopoverRef = useRef<HTMLDivElement>(null);

  // click outside for date picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePopoverRef.current && !datePopoverRef.current.contains(e.target as Node)) {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const roiValue = parseFloat(roi);
    if (isNaN(roiValue)) return;

    await addRecord(roiValue, date, time);
    setRoi('0.00');
  };

  return (
    <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-xl relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <form onSubmit={handleSave} className="flex flex-col gap-6 relative z-10">
        {/* User Toggle */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 bg-background-dark p-1 rounded-2xl border border-white/5 flex relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-dark rounded-xl shadow-lg border border-white/10 transition-all duration-300 ease-out ${
                currentUser === 'B' ? 'left-[calc(50%+2px)]' : 'left-1'
              }`}
            />
            <button
              type="button"
              onClick={() => setCurrentUser('A')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl z-10 transition-colors ${
                currentUser === 'A' ? 'text-white' : 'text-text-muted hover:text-white/60'
              }`}
            >
              {nicknames.A} 모드
            </button>
            <button
              type="button"
              onClick={() => setCurrentUser('B')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl z-10 transition-colors ${
                currentUser === 'B' ? 'text-white' : 'text-text-muted hover:text-white/60'
              }`}
            >
              {nicknames.B} 모드
            </button>
          </div>
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 relative" ref={datePopoverRef}>
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

        {/* ROI Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 text-text-muted">
            <Info className="w-3.5 h-3.5" />
            <label className="text-xs font-bold uppercase tracking-wider">수익률 (%)</label>
          </div>
          <div className="relative group">
            <input
              type="number"
              step="0.01"
              value={roi}
              onChange={(e) => setRoi(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full bg-background-dark border border-white/5 rounded-2xl px-5 py-5 text-right font-black text-2xl text-white focus:outline-none focus:border-primary transition-all group-hover:border-white/10"
            />
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="text-primary font-bold text-sm tracking-tighter uppercase opacity-50">Value</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-light text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 group"
        >
          <span>저장</span>
        </button>
      </form>
    </div>
  );
}
