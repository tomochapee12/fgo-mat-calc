import type { Servant } from '@/types/servant';
import { ServantCard } from './ServantCard';

interface ServantListProps {
  servants: Servant[];
  configuredIds: Set<number>;
  onSelect: (collectionNo: number) => void;
}

export function ServantList({ servants, configuredIds, onSelect }: ServantListProps) {
  if (servants.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        該当するサーヴァントが見つかりません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-3">
      {servants.map((s) => (
        <ServantCard
          key={s.collectionNo}
          servant={s}
          isConfigured={configuredIds.has(s.collectionNo)}
          onClick={() => onSelect(s.collectionNo)}
        />
      ))}
    </div>
  );
}
