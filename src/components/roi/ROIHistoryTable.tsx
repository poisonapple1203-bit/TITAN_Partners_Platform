import { useState } from 'react';
import { Edit2, Trash2, Clock, Info } from 'lucide-react';
import { useROIStore, type ROIRecord } from '../../store/useROIStore';

export function ROIHistoryTable() {
  const { records, deleteRecord, updateRecord, nicknames } = useROIStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  if (timestamps.length === 0) return null;

  return (
    <div className="bg-surface-dark rounded-3xl border border-white/5 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.01]">
              <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">날짜</th>
              <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-center">{nicknames.A}</th>
              <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-center">{nicknames.B}</th>
              <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-right">배율 (Ratio)</th>
              <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {timestamps.map((ts) => {
              const entryA = getEntry(ts, 'A');
              const entryB = getEntry(ts, 'B');
              const ratio = (entryA && entryB && entryB.rate !== 0) 
                ? (entryA.rate / entryB.rate).toFixed(2) 
                : null;

              return (
                <tr key={ts} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Timestamp */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-none mb-1">{ts.split(' ')[0]}</span>
                      <span className="text-[10px] text-text-muted font-medium">{ts.split(' ')[1]}</span>
                    </div>
                  </td>

                  {/* User A ROI */}
                  <td className="px-6 py-5 text-center">
                    {editingId === entryA?.id ? (
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
                    ) : (
                      <span className={`text-base font-black ${entryA ? 'text-primary' : 'text-white/10 italic text-xs'}`}>
                        {entryA ? `${entryA.rate.toFixed(2)}%` : '미입력'}
                      </span>
                    )}
                  </td>

                  {/* User B ROI */}
                  <td className="px-6 py-5 text-center">
                    {editingId === entryB?.id ? (
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
                    ) : (
                      <span className={`text-base font-black ${entryB ? 'text-secondary' : 'text-white/10 italic text-xs'}`}>
                        {entryB ? `${entryB.rate.toFixed(2)}%` : '미입력'}
                      </span>
                    )}
                  </td>

                  {/* Ratio */}
                  <td className="px-6 py-5 text-right">
                    {ratio ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-white tracking-tighter">
                          {ratio}배
                        </span>
                      </div>
                    ) : (
                      <span className="text-white/5">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {entryA && (
                        <div className="flex flex-col items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-[8px] font-bold text-primary uppercase">{nicknames.A}</span>
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(entryA)} className="p-1.5 hover:bg-primary/20 rounded-md text-text-muted hover:text-primary transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteRecord(entryA.id)} className="p-1.5 hover:bg-danger/20 rounded-md text-text-muted hover:text-danger transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      {entryB && (
                        <div className="flex flex-col items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-[8px] font-bold text-secondary uppercase">{nicknames.B}</span>
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(entryB)} className="p-1.5 hover:bg-secondary/20 rounded-md text-text-muted hover:text-secondary transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteRecord(entryB.id)} className="p-1.5 hover:bg-danger/20 rounded-md text-text-muted hover:text-danger transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-text-muted" />
        <p className="text-[11px] text-text-muted font-medium">동일 시점의 데이터를 비교하여 배율을 자동 계산합니다. 행에 마우스를 올리면 수정/삭제가 가능합니다.</p>
      </div>
    </div>
  );
}
