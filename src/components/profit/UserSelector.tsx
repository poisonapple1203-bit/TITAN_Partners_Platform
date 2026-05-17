import { User } from 'lucide-react';
import { useProfitStore } from '../../store/useProfitStore';
import { getDisplayName } from '../../utils/userUtils';

export function UserSelector() {
  const userNames = useProfitStore((state) => state.userNames);
  const selectedUser = useProfitStore((state) => state.selectedUser);
  const setSelectedUser = useProfitStore((state) => state.setSelectedUser);

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <User className="w-5 h-5" />
      </div>
      <div className="flex-1 flex gap-2">
        {userNames.map((user) => (
          <button
            key={user}
            onClick={() => setSelectedUser(user)}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl border transition-all ${
              selectedUser === user
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'bg-background-dark border-white/5 text-text-muted hover:text-white/60'
            }`}
          >
            {getDisplayName(user)}
          </button>
        ))}
      </div>
    </div>
  );
}
