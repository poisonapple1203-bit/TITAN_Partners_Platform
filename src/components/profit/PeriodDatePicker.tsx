import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  format,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  getDaysInMonth,
  getDay,
  startOfDay, endOfDay,
} from 'date-fns';
import { useProfitStore } from '../../store/useProfitStore';

export function PeriodDatePicker() {
  const selectedPeriod = useProfitStore((s) => s.selectedPeriod);
  const dateRange = useProfitStore((s) => s.dateRange);
  const setDateRange = useProfitStore((s) => s.setDateRange);

  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const popoverRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 표시 텍스트
  const getLabel = () => {
    if (selectedPeriod === '전체') return '전체 기간';
    if (selectedPeriod === '월별') return format(dateRange.from, 'yyyy.MM');
    if (selectedPeriod === '연별') return format(dateRange.from, 'yyyy') + '년';
    // 일별
    return format(dateRange.from, 'yyyy.MM.dd');
  };

  // 전체일 때는 피커 비활성
  const isDisabled = selectedPeriod === '전체';

  return (
    <div className="relative" ref={popoverRef}>
      <button type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all whitespace-nowrap w-[120px] ${
          isDisabled
            ? 'bg-background-dark border-white/5 text-text-muted cursor-default'
            : 'bg-background-dark border-white/10 text-text-muted hover:text-white hover:border-white/20 cursor-pointer'
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        {getLabel()}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {selectedPeriod === '일별' && (
            <DayPicker
              year={pickerYear}
              month={pickerMonth}
              selectedDate={dateRange.from}
              onChangeMonth={(y, m) => { setPickerYear(y); setPickerMonth(m); }}
              onSelect={(date) => {
                setDateRange({ from: startOfDay(date), to: endOfDay(date) });
                setIsOpen(false);
              }}
            />
          )}
          {selectedPeriod === '월별' && (
            <MonthPicker
              year={pickerYear}
              selectedDate={dateRange.from}
              onChangeYear={setPickerYear}
              onSelect={(year, month) => {
                const target = new Date(year, month, 1);
                setDateRange({ from: startOfMonth(target), to: endOfMonth(target) });
                setIsOpen(false);
              }}
            />
          )}
          {selectedPeriod === '연별' && (
            <YearPicker
              centerYear={pickerYear}
              selectedDate={dateRange.from}
              onChangeCenterYear={setPickerYear}
              onSelect={(year) => {
                const target = new Date(year, 0, 1);
                setDateRange({ from: startOfYear(target), to: endOfYear(target) });
                setIsOpen(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── 일별: 커스텀 달력 ───
export function DayPicker({
  year, month, selectedDate, onChangeMonth, onSelect,
}: {
  year: number;
  month: number;
  selectedDate: Date;
  onChangeMonth: (y: number, m: number) => void;
  onSelect: (date: Date) => void;
}) {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const firstDayOfWeek = getDay(new Date(year, month, 1)); // 0=Sun
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const goPrev = () => {
    if (month === 0) onChangeMonth(year - 1, 11);
    else onChangeMonth(year, month - 1);
  };
  const goNext = () => {
    if (month === 11) onChangeMonth(year + 1, 0);
    else onChangeMonth(year, month + 1);
  };

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="p-4 w-[280px]">
      {/* 헤더: 연월 이동 */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
        <button type="button" onClick={goPrev} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-white tracking-wide">{year}.{String(month + 1).padStart(2, '0')}</span>
        <button type="button" onClick={goNext} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted py-1">{d}</div>
        ))}
      </div>
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => <div key={`b-${b}`} />)}
        {days.map((day) => {
          const thisDate = new Date(year, month, day);
          const isSelected =
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === day;

          return (
            <button type="button"
              key={day}
              onClick={() => onSelect(thisDate)}
              className={`h-9 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-success text-background-dark font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 월별: 3×4 월 그리드 ───
function MonthPicker({
  year, selectedDate, onChangeYear, onSelect,
}: {
  year: number;
  selectedDate: Date;
  onChangeYear: (y: number) => void;
  onSelect: (year: number, month: number) => void;
}) {
  return (
    <div className="p-4 w-[280px]">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
        <button type="button" onClick={() => onChangeYear(year - 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-white tracking-widest">{year}년</span>
        <button type="button" onClick={() => onChangeYear(year + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, i) => {
          const isSelected = selectedDate.getFullYear() === year && selectedDate.getMonth() === i;
          return (
            <button type="button"
              key={i}
              onClick={() => onSelect(year, i)}
              className={`h-10 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-success text-background-dark font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {i + 1}월
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 연별: 3×3 연도 그리드 ───
function YearPicker({
  centerYear, selectedDate, onChangeCenterYear, onSelect,
}: {
  centerYear: number;
  selectedDate: Date;
  onChangeCenterYear: (y: number) => void;
  onSelect: (year: number) => void;
}) {
  const startYear = centerYear - 4;

  return (
    <div className="p-4 w-[280px]">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
        <button type="button" onClick={() => onChangeCenterYear(centerYear - 9)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-text-muted tracking-widest">{startYear} – {startYear + 8}</span>
        <button type="button" onClick={() => onChangeCenterYear(centerYear + 9)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => {
          const yr = startYear + i;
          const isSelected = selectedDate.getFullYear() === yr;
          return (
            <button type="button"
              key={yr}
              onClick={() => onSelect(yr)}
              className={`h-10 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-success text-background-dark font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {yr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
