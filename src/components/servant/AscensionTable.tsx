import type { Servant } from '@/types/servant';
import { MaterialRow } from '@/components/common/MaterialRow';

interface AscensionTableProps {
  servant: Servant;
}

export function AscensionTable({ servant }: AscensionTableProps) {
  const stages = Object.entries(servant.ascension).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  if (stages.length === 0) {
    return <p className="text-sm text-gray-500">霊基再臨データなし</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-yellow-400">霊基再臨</h4>
      {stages.map(([level, cost]) => (
        <div key={level} className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400 mb-2">
            第{Number(level) + 1}再臨
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
