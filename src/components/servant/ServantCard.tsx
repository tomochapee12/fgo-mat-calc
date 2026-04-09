import type { Servant } from '@/types/servant';
import { CLASS_NAMES } from '@/utils/constants';

interface ServantCardProps {
  servant: Servant;
  isConfigured: boolean;
  onClick: () => void;
}

export function ServantCard({ servant, isConfigured, onClick }: ServantCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center p-2 rounded-lg transition-colors hover:bg-gray-700 ${
        isConfigured ? 'bg-gray-700/70 ring-1 ring-yellow-400/50' : 'bg-gray-800'
      }`}
    >
      <img
        src={servant.face}
        alt={servant.name}
        width={56}
        height={56}
        className="rounded"
        loading="lazy"
      />
      <div className="mt-1 text-xs text-center leading-tight">
        <div className="text-gray-200 truncate w-20">{servant.name}</div>
        <div className="text-gray-500">
          {'★'.repeat(servant.rarity)} {CLASS_NAMES[servant.className] ?? servant.className}
        </div>
      </div>
      {isConfigured && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400" />
      )}
    </button>
  );
}
