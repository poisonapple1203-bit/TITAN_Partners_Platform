import { useState } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useProfitStore, parseRecordDate, type ProfitRecord } from '../../store/useProfitStore';
import { ConfirmModal } from '../ConfirmModal';

export function ProfitHistoryTable() {
  const records = useProfitStore((state) => state.records);
  const deleteRecord = useProfitStore((state) => state.deleteRecord);
  const updateRecord = useProfitStore((state) => state.updateRecord);
  const selectedTicker = useProfitStore((state) => state.selectedTicker);
  const selectedUser = useProfitStore((state) => state.selectedUser);
  const dateRange = useProfitStore((state) => state.dateRange);

  // 인라인 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', profit: '' });
  
  // 삭제 확인 모달 상태
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const filteredRecords = records
    .filter(r => r.user === selectedUser)
    .filter(r => selectedTicker === 'ALL' || r.ticker === selectedTicker)
    .filter(r => {
      const rDate = parseRecordDate(r.date);
      return rDate >= startOfDay(dateRange.from) && rDate <= endOfDay(dateRange.to);
    })
    .sort((a, b) => {
      const dA = parseRecordDate(a.date).getTime();
      const dB = parseRecordDate(b.date).getTime();
      if (dA !== dB) return dB - dA;
      return b.time.localeCompare(a.time);
    });
  
  const totalProfit = filteredRecords.reduce((acc, r) => acc + r.profit, 0);

  // 수정 시작: 해당 행을 입력 필드로 전환
  const handleEditStart = (record: ProfitRecord) => {
    setEditingId(record.id);
    setEditForm({
      date: record.date,
      time: record.time,
      profit: record.profit.toLocaleString(),
    });
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
  };

  // 수정 저장
  const handleEditSave = (id: string) => {
    const parsedProfit = parseInt(editForm.profit.replace(/,/g, ''), 10);
    if (isNaN(parsedProfit)) {
      alert('올바른 수익 금액을 입력해주세요.');
      return;
    }
    updateRecord(id, {
      user: selectedUser,
      ticker: selectedTicker,
      date: editForm.date,
      time: editForm.time,
      profit: parsedProfit,
    });
    setEditingId(null);
  };

  // 수익 입력 시 숫자 포맷팅 (음수 허용)
  const handleEditProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const onlyNums = rawValue.replace(/[^0-9-]/g, '');
    let finalStr = onlyNums;
    if (onlyNums.startsWith('-')) {
      finalStr = '-' + onlyNums.slice(1).replace(/-/g, '');
    } else {
      finalStr = onlyNums.replace(/-/g, '');
    }
    if (finalStr === '' || finalStr === '-') {
      setEditForm({ ...editForm, profit: finalStr });
      return;
    }
    const num = parseInt(finalStr, 10);
    if (!isNaN(num)) {
      setEditForm({ ...editForm, profit: num.toLocaleString() });
    }
  };

  return (
    <div className="bg-surface-dark border border-white/5 rounded-3xl overflow-hidden flex flex-col mt-4">
      {/* 하단: 스크롤 가능한 기록 테이블 */}

      {/* 하단: 스크롤 가능한 기록 테이블 */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[340px] text-sm text-left">
          <thead className="text-xs text-text-muted bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-5 py-4 font-medium">날짜</th>
              <th className="px-2 py-4 font-medium text-center">시간</th>
              <th className="px-2 py-4 font-medium text-right">수익</th>
              <th className="px-5 py-4 font-medium text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted text-xs">
                  기록이 없습니다.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record: ProfitRecord) => {
                const isEditing = editingId === record.id;

                // ── 인라인 편집 모드 ──
                if (isEditing) {
                  return (
                    <tr key={record.id} className="border-b border-white/5 bg-white/[0.03]">
                      <td className="px-3 py-3">
                        <input
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full bg-background-dark border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={editForm.time}
                          onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                          className="w-full bg-background-dark border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={editForm.profit}
                          onChange={handleEditProfitChange}
                          inputMode="numeric"
                          className="w-full bg-background-dark border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSave(record.id)}
                            className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors"
                            aria-label="저장"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-1.5 text-text-muted hover:bg-white/10 rounded-md transition-colors"
                            aria-label="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // ── 일반 표시 모드 ──
                const isPos = record.profit > 0;
                const isNeg = record.profit < 0;
                
                return (
                  <tr key={record.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-text-muted whitespace-nowrap">{record.date}</td>
                    <td className="px-2 py-4 text-text-muted text-center whitespace-nowrap">{record.time}</td>
                    <td className={`px-2 py-4 font-bold text-right whitespace-nowrap ${isPos ? 'text-success' : isNeg ? 'text-danger' : 'text-white'}`}>
                      {isPos ? '+' : ''}{record.profit.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditStart(record)}
                          className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          aria-label="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setRecordToDelete(record.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={recordToDelete !== null}
        title="수익 기록 삭제"
        message={
          <>
            정말로 이 수익 기록을 삭제하시겠습니까?
            <br />
            <span className="text-xs text-white/40 mt-1 inline-block">삭제된 기록은 복구할 수 없습니다.</span>
          </>
        }
        onConfirm={() => {
          if (recordToDelete) {
            deleteRecord(recordToDelete);
            setRecordToDelete(null);
          }
        }}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
}
