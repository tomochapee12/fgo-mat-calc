import type { LevelCost } from '@/types/servant';
import { MaterialRow } from '@/components/common/MaterialRow';

interface SkillTableProps {
  title: string;
  skills: Record<number, LevelCost>;
}

export function SkillTable({ title, skills }: SkillTableProps) {
  const levels = Object.entries(skills).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  if (levels.length === 0) {
    return <p className="text-sm text-gray-500">{title}データなし</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-yellow-400">{title}</h4>
      {levels.map(([level, cost]) => (
        <div key={level} className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400 mb-2">
            Lv.{Number(level) + 1} → Lv.{Number(level) + 2}
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
