import { useProfitStore } from '../../store/useProfitStore';

export function UserSelector() {
  const userNames = useProfitStore((state) => state.userNames);
  const selectedUser = useProfitStore((state) => state.selectedUser);
  const setSelectedUser = useProfitStore((state) => state.setSelectedUser);

  return (
    <div className="flex items-center justify-end gap-2 mb-2 px-1">
      <span className="text-xs text-text-muted font-medium mr-1">사용자:</span>
      <div className="flex bg-background-dark/50 border border-white/5 rounded-xl p-1">
        {userNames.map((user) => (
          <button
            key={user}
            onClick={() => setSelectedUser(user)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedUser === user
                ? 'bg-primary text-background-dark shadow-lg shadow-primary/20 scale-105'
                : 'text-text-muted hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {user}
          </button>
        ))}
      </div>
    </div>
  );
}
