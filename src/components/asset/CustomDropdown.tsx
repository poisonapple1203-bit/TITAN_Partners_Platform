import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function CustomDropdown({ options, value, onChange, placeholder = '선택...', icon }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background-dark border transition-all text-left ${
          isOpen ? 'border-primary shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' : 'border-white/10'
        }`}
      >
        {icon && <div className="text-text-muted">{icon}</div>}
        <span className={`flex-1 text-sm ${selectedOption ? 'text-white font-medium' : 'text-text-muted/50'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 p-1.5 bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm transition-all ${
                value === option.value 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
