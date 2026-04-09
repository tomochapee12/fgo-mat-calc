import type { LevelCost } from '@/types/servant';
import { MaterialRow } from '@/components/common/MaterialRow';

interface CostumeTableProps {
  costumes: Record<string, LevelCost>;
}

export function CostumeTable({ costumes }: CostumeTableProps) {
  const entries = Object.entries(costumes);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-yellow-400">霊衣開放</h4>
      {entries.map(([costumeId, cost]) => (
        <div key={costumeId} className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400 mb-2">
            霊衣 #{costumeId}
          </div>
          <div className="space-y-1">
            {cost.materials.map((m) => (
              <MaterialRow key={m.itemId} itemId={m.itemId} amount={m.amount} />
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            QP: {cost.qp.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
