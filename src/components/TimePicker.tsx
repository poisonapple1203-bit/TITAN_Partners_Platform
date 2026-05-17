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
        className="w-full bg-background-dark border border-white/5 rounded-2xl px-4 py-3.5 text-center text-sm text-white font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer hover:bg-white/5"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-1 w-[200px] flex flex-col">
          <div className="flex h-[220px] relative">
            {/* Center Glass Highlight Lens */}
            <div className="absolute top-[107px] left-0 right-0 h-[36px] bg-white/[0.04] border-y border-white/10 pointer-events-none z-10" />
            
            {/* Center colon separator */}
            <div className="absolute top-[107px] left-[50%] -translate-x-[50%] h-[36px] flex items-center justify-center text-sm font-black text-white/50 pointer-events-none z-30 select-none">
              :
            </div>
            
            {/* 3D Gradient Fade Masks */}
            <div className="absolute top-[30px] left-0 right-0 h-[50px] bg-gradient-to-b from-surface-dark via-surface-dark/60 to-transparent pointer-events-none z-20" />
            <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-surface-dark via-surface-dark/60 to-transparent pointer-events-none z-20" />

            {/* 시(Hour) 다이얼 */}
            <div className="flex-1 border-r border-white/5 flex flex-col relative">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center py-2 border-b border-white/5 bg-background-dark/50 z-30">시</div>
              <div 
                ref={hourRef} 
                className="flex-1 overflow-y-auto py-[77px] snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {Array.from({ length: 24 }).map((_, h) => {
                  const isActive = h === currentHour;
                  return (
                    <button type="button"
                      key={h}
                      data-selected={isActive}
                      onClick={() => handleSelectHour(h)}
                      className={`w-full py-2 text-center text-sm font-semibold transition-all snap-center h-[36px] flex items-center justify-center ${
                        isActive
                          ? 'text-primary font-black scale-110 z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                          : 'text-text-muted hover:text-white/80'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 분(Minute) 다이얼 */}
            <div className="flex-1 flex flex-col relative">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center py-2 border-b border-white/5 bg-background-dark/50 z-30">분</div>
              <div 
                ref={minuteRef} 
                className="flex-1 overflow-y-auto py-[77px] snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {Array.from({ length: 60 }).map((_, m) => {
                  const isActive = m === currentMinute;
                  return (
                    <button type="button"
                      key={m}
                      data-selected={isActive}
                      onClick={() => handleSelectFull(currentHour, m)}
                      className={`w-full py-2 text-center text-sm font-semibold transition-all snap-center h-[36px] flex items-center justify-center ${
                        isActive
                          ? 'text-primary font-black scale-110 z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                          : 'text-text-muted hover:text-white/80'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NOW Preset Button */}
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const h = String(now.getHours()).padStart(2, '0');
              const m = String(now.getMinutes()).padStart(2, '0');
              onChange(`${h}:${m}`);
              setIsOpen(false);
            }}
            className="w-full py-3.5 text-xs font-black text-primary bg-background-dark/60 hover:bg-primary/10 border-t border-white/5 transition-all text-center tracking-wider active:scale-[0.98]"
          >
            현재 시간으로 설정
          </button>
        </div>
      )}
    </div>
  );
}
