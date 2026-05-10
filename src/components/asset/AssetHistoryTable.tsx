import { useState, useMemo } from 'react';
import { Pencil, Trash2, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { useAssetStore, type AssetRecord } from '../../store/useAssetStore';
import { getTickerDisplayName } from '../../utils/tickerMapping';
import { ConfirmModal } from '../ConfirmModal';

const ACCOUNT_TYPE_LABELS = {
  irp: 'IRP',
  pension: '연금저축',
  stock: '일반주식',
  cash: '현금',
  isa: 'ISA'
};

const ACCOUNT_COLORS = {
  irp: 'text-purple-400 bg-purple-500/10',
  pension: 'text-amber-400 bg-amber-500/10',
  stock: 'text-blue-400 bg-blue-500/10',
  cash: 'text-emerald-400 bg-emerald-500/10',
  isa: 'text-rose-400 bg-rose-500/10'
};

export function AssetHistoryTable() {
  const records = useAssetStore((state) => state.records);
  const removeRecord = useAssetStore((state) => state.removeRecord);
  const setEditingRecordId = useAssetStore((state) => state.setEditingRecordId);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => b.createdAt - a.createdAt);
  }, [records]);

  return (
    <div className="bg-surface-dark border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl h-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-white tracking-tight">
          최근 등록 자산
        </h3>
        <span className="text-xs font-bold text-text-muted bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          {records.length}개
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar max-h-[600px]">
        {sortedRecords.length === 0 ? (
          <div className="bg-background-dark/20 border border-white/5 border-dashed rounded-2xl py-16 flex flex-col items-center justify-center gap-3">
            <div className="bg-white/5 p-4 rounded-full">
              <Wallet className="w-8 h-8 text-text-muted/20" />
            </div>
            <p className="text-sm text-text-muted/40 font-medium">등록된 자산이 없습니다.</p>
          </div>
        ) : (
          sortedRecords.map((record) => (
            <AssetCard 
              key={record.id} 
              record={record} 
              onEdit={() => setEditingRecordId(record.id)}
              onDelete={() => setRecordToDelete(record.id)}
            />
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={recordToDelete !== null}
        title="자산 기록 삭제"
        message="정말로 이 자산을 삭제하시겠습니까?"
        onConfirm={() => {
          if (recordToDelete) {
            removeRecord(recordToDelete);
            setRecordToDelete(null);
          }
        }}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
}

function AssetCard({ record, onEdit, onDelete }: { 
  record: AssetRecord, 
  onEdit: () => void,
  onDelete: () => void
}) {
  const formattedDate = format(record.createdAt, 'yy. MM. dd. HH:mm');
  const currencySymbol = record.currency;
  const displayName = getTickerDisplayName(record.ticker);
  const isCash = record.accountType === 'cash';

  return (
    <div className="bg-background-dark/40 border border-white/5 rounded-2xl p-5 relative transition-all hover:bg-white/[0.05] group">
      {/* Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <button 
          onClick={onEdit}
          className="p-2 text-text-muted hover:text-white bg-white/5 rounded-lg transition-colors"
          title="수정"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 text-text-muted hover:text-danger bg-white/5 rounded-lg transition-colors"
          title="삭제"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {/* Tag */}
        <div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/5 uppercase tracking-wider ${ACCOUNT_COLORS[record.accountType as keyof typeof ACCOUNT_COLORS]}`}>
            {ACCOUNT_TYPE_LABELS[record.accountType as keyof typeof ACCOUNT_TYPE_LABELS]}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white tracking-tight">
          {displayName}
        </h4>

        {/* Details Line */}
        <div className="flex items-center gap-2 text-[11px] text-text-muted/70 font-bold">
          {isCash ? (
            <span>{currencySymbol}{record.averagePrice.toLocaleString()}</span>
          ) : (
            <span>
              {record.shares.toLocaleString()}주 @ {currencySymbol}{record.averagePrice.toLocaleString(undefined, { maximumFractionDigits: record.currency === '$' ? 2 : 0 })}
            </span>
          )}
          <span className="opacity-30">|</span>
          <span className="flex items-center gap-1">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
