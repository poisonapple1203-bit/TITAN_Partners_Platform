import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const timeParts = value ? value.split(':') : ['00', '00'];
  const currentHour = parseInt(timeParts[0] || '0', 10);
  const currentMinute = parseInt(timeParts[1] || '0', 10);

  // 외부 클릭 시 닫힘 처리
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 팝업이 열릴 때 선택된 시간으로 자동 스크롤
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        hourRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center', behavior: 'instant' });
        minuteRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center', behavior: 'instant' });
      }, 50);
    }
  }, [isOpen]);

  const handleSelectFull = (hour: number, minute: number) => {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    onChange(`${h}:${m}`);
    setIsOpen(false);
  };

  const handleSelectHour = (hour: number) => {
    const h = String(hour).padStart(2, '0');
    const m = String(currentMinute).padStart(2, '0');
    onChange(`${h}:${m}`);
  };

  return (
    <div className="relative w-full" ref={popoverRef}>
      <input
        type="text"
        value={value}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background-dark border border-white/5 rounded-2xl px-4 py-3.5 text-center text-sm text-white font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1 w-[200px]">
          <div className="flex h-[220px]">
            {/* 시(Hour) 다이얼 */}
            <div className="flex-1 border-r border-white/5 flex flex-col">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center py-2 border-b border-white/5 bg-background-dark/50">시</div>
              <div ref={hourRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {Array.from({ length: 24 }).map((_, h) => {
                  const isActive = h === currentHour;
                  return (
                    <button type="button"
                      key={h}
                      data-selected={isActive}
                      onClick={() => handleSelectHour(h)}
                      className={`w-full py-2 text-center text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-success/15 text-success font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                          : 'text-text-muted hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 분(Minute) 다이얼 */}
            <div className="flex-1 flex flex-col">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center py-2 border-b border-white/5 bg-background-dark/50">분</div>
              <div ref={minuteRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {Array.from({ length: 60 }).map((_, m) => {
                  const isActive = m === currentMinute;
                  return (
                    <button type="button"
                      key={m}
                      data-selected={isActive}
                      onClick={() => handleSelectFull(currentHour, m)}
                      className={`w-full py-2 text-center text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-success/15 text-success font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                          : 'text-text-muted hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
