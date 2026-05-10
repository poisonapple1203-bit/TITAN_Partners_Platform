import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useROIStore, type ROIRecord } from '../../store/useROIStore';
import { ConfirmModal } from '../ConfirmModal';

export function ROIHistoryTable() {
  const { records, deleteRecord, updateRecord, nicknames } = useROIStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Group by timestamp to compare A and B at the same time
  const timestamps = Array.from(new Set(records.map(h => `${h.date} ${h.time}`))).sort().reverse();

  const getEntry = (timestamp: string, user: 'A' | 'B') => {
    return records.find(h => `${h.date} ${h.time}` === timestamp && h.user === user);
  };

  const handleEdit = (entry: ROIRecord) => {
    setEditingId(entry.id);
    setEditValue(entry.rate.toString());
  };

  const handleUpdate = async (entry: ROIRecord) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      await updateRecord(entry.id, val, entry.user, entry.date, entry.time);
    }
    setEditingId(null);
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteRecord(pendingDeleteId);
    }
    setIsDeleteModalOpen(false);
    setPendingDeleteId(null);
  };

  if (timestamps.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white">수익률 기록 현황</h3>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-0.5">Real-time Comparison</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-text-muted">
          {timestamps.length} Snapshots
        </div>
      </div>

      {/* Card List - Legacy Style */}
      <div className="grid grid-cols-1 gap-4">
        {timestamps.map((ts) => {
          const entryA = getEntry(ts, 'A');
          const entryB = getEntry(ts, 'B');
          const [date, time] = ts.split(' ');
          const ratio = (entryA && entryB && entryB.rate !== 0) 
            ? (entryA.rate / entryB.rate).toFixed(2) 
            : null;

          return (
            <div key={ts} className="bg-surface-dark rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col divide-y divide-white/[0.03]">
              {/* Row: Date */}
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">날짜</span>
                <span className="text-sm font-black text-white">{date}</span>
              </div>

              {/* Row: Time */}
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">시간</span>
                <span className="text-sm font-black text-white">{time}</span>
              </div>

              {/* Row: User A */}
              <div className="px-6 py-4 flex justify-between items-center bg-primary/5">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">{nicknames.A}</span>
                <div className="flex items-center gap-3">
                  {editingId === entryA?.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleUpdate(entryA!)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(entryA!)}
                        autoFocus
                        className="w-20 bg-background-dark border border-primary/50 rounded-lg px-2 py-1 text-sm text-center text-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className={`text-lg font-black ${entryA ? 'text-primary' : 'text-white/10 italic text-xs'}`}>
                      {entryA ? `${entryA.rate.toFixed(2)}%` : '미입력'}
                    </span>
                  )}
                  {entryA && (
                    <div className="flex gap-1 ml-2">
                      <button 
                        onClick={() => handleEdit(entryA)}
                        className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-text-muted hover:text-white hover:bg-white/10 transition-all"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => requestDelete(entryA.id)}
                        className="px-2 py-1 rounded-md bg-danger/10 border border-danger/20 text-[10px] font-bold text-danger/80 hover:text-danger hover:bg-danger/20 transition-all"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row: User B */}
              <div className="px-6 py-4 flex justify-between items-center bg-amber-400/5">
                <span className="text-xs font-bold text-amber-400/60 uppercase tracking-widest">{nicknames.B}</span>
                <div className="flex items-center gap-3">
                  {editingId === entryB?.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleUpdate(entryB!)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(entryB!)}
                        autoFocus
                        className="w-20 bg-background-dark border border-primary/50 rounded-lg px-2 py-1 text-sm text-center text-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className={`text-lg font-black ${entryB ? 'text-amber-400' : 'text-secondary'}`}>
                      {entryB ? `${entryB.rate.toFixed(2)}%` : '미입력'}
                    </span>
                  )}
                  {entryB && (
                    <div className="flex gap-1 ml-2">
                      <button 
                        onClick={() => handleEdit(entryB)}
                        className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-text-muted hover:text-white hover:bg-white/10 transition-all"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => requestDelete(entryB.id)}
                        className="px-2 py-1 rounded-md bg-danger/10 border border-danger/20 text-[10px] font-bold text-danger/80 hover:text-danger hover:bg-danger/20 transition-all"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row: Ratio */}
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">배율</span>
                <span className="text-lg font-black text-white">
                  {ratio ? `${ratio}배` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="수익률 기록 삭제"
        message="정말 이 수익률 기록을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="영구 삭제"
      />
    </div>
  );
}
