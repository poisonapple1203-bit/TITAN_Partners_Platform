import { motion } from 'framer-motion';
import { Target, ArrowUpRight, Layers } from 'lucide-react';
import { useROIStore } from '../../store/useROIStore';

export function ROISummaryCards() {
  const { records, selectedSnapshot, nicknames } = useROIStore();

  // Find records for the selected snapshot
  const snapshotData = selectedSnapshot ? {
    A: records.find(r => r.date === selectedSnapshot.date && r.time === selectedSnapshot.time && r.user === 'A'),
    B: records.find(r => r.date === selectedSnapshot.date && r.time === selectedSnapshot.time && r.user === 'B')
  } : null;

  const rateA = snapshotData?.A?.rate ?? null;
  const rateB = snapshotData?.B?.rate ?? null;
  const ratio = (rateA !== null && rateB !== null && rateB !== 0) ? (rateA / rateB).toFixed(2) : '-';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        label={`${nicknames.A} 수익률`}
        value={rateA !== null ? `${rateA.toFixed(2)}%` : '-'}
        icon={<Target className="w-5 h-5 text-primary" />}
        color="primary"
      />
      <StatCard 
        label={`${nicknames.B} 수익률`}
        value={rateB !== null ? `${rateB.toFixed(2)}%` : '-'}
        icon={<ArrowUpRight className="w-5 h-5 text-danger" />}
        color="danger"
      />
      <StatCard 
        label="선택 시점 배율 (A/B)"
        value={ratio !== '-' ? `${ratio}배` : '-'}
        icon={<Layers className="w-5 h-5 text-amber-400" />}
        color="amber"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'primary' | 'danger' | 'amber' }) {
  const colorMap = {
    primary: 'text-primary border-primary/20 bg-primary/5',
    danger: 'text-danger border-danger/20 bg-danger/5',
    amber: 'text-amber-400 border-amber-400/20 bg-amber-400/5'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-surface-dark border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl" />
      
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white tracking-tighter">
          {value}
        </span>
        {value !== '-' && (
          <span className="text-[10px] font-bold text-text-muted opacity-50">Snap</span>
        )}
      </div>
    </motion.div>
  );
}
