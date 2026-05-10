import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '삭제',
  cancelText = '취소',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-surface-dark border border-white/10 rounded-2xl p-6 w-[360px] shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed mb-5">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            className="h-9 px-4 rounded-xl text-sm bg-background-dark border border-white/10 text-text-muted hover:bg-white/5 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="h-9 px-4 rounded-xl text-sm bg-danger text-white font-bold hover:bg-danger/90 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
