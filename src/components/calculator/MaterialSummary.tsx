import { useMemo } from 'react';
import { useUserStateContext } from '@/contexts/UserStateContext';
import { servants, itemMap } from '@/data/loader';
import { calculateNeededMaterials, calculateDeficit } from '@/utils/calculator';
import { ItemIcon } from '@/components/common/ItemIcon';

export function MaterialSummary() {
  const { state } = useUserStateContext();

  const result = useMemo(
    () => calculateNeededMaterials(servants, state),
    [state]
  );

  const deficit = useMemo(
    () => calculateDeficit(result.materials, state.inventory),
    [result, state.inventory]
  );

  const configuredCount = Object.keys(state.servants).length;

  if (configuredCount === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>サーヴァントの育成設定がありません</p>
        <p className="text-sm mt-2">
          サーヴァントタブで育成計画を設定してください
        </p>
      </div>
    );
  }

  const materialEntries = Array.from(result.materials.entries())
    .map(([itemId, amount]) => ({
      itemId,
      needed: amount,
      owned: state.inventory[itemId] ?? 0,
      deficit: deficit.get(itemId) ?? 0,
      item: itemMap.get(itemId),
    }))
    .filter((e) => e.item)
    .sort((a, b) => b.deficit - a.deficit);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-2">概要</h3>
        <p className="text-sm text-gray-400">
          設定サーヴァント数: {configuredCount}体
        </p>
        <p className="text-sm text-yellow-400">
          必要QP: {result.qp.toLocaleString()}
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">必要素材一覧</h3>
        <div className="space-y-2">
          {materialEntries.map((entry) => (
            <div
              key={entry.itemId}
              className="flex items-center gap-3 py-1 border-b border-gray-700 last:border-0"
            >
              <ItemIcon
                icon={entry.item!.icon}
                name={entry.item!.name}
                size={32}
              />
              <span className="text-sm text-gray-200 flex-1">
                {entry.item!.name}
              </span>
              <span className="text-sm text-gray-400">
                所持: {entry.owned}
              </span>
              <span className="text-sm text-yellow-400">
                必要: {entry.needed}
              </span>
              {entry.deficit > 0 && (
                <span className="text-sm text-red-400 font-medium">
                  不足: {entry.deficit}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
