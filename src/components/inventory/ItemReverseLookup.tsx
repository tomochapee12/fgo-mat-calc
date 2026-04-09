import { useMemo } from 'react';
import type { Item } from '@/types/item';
import { servants } from '@/data/loader';
import { buildReverseLookup } from '@/utils/reverse-lookup';
import { ItemIcon } from '@/components/common/ItemIcon';

interface ItemReverseLookupProps {
  item: Item;
  onClose: () => void;
}

export function ItemReverseLookup({ item, onClose }: ItemReverseLookupProps) {
  const lookup = useMemo(() => buildReverseLookup(servants), []);
  const usages = lookup.get(item.id) ?? [];
  const grandTotal = usages.reduce((sum, u) => sum + u.totalAmount, 0);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <ItemIcon icon={item.icon} name={item.name} size={40} />
          <div>
            <h3 className="text-white font-medium">{item.name}</h3>
            <p className="text-xs text-gray-400">
              {usages.length}体 / 合計 {grandTotal}個
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-2">
          {usages.length === 0 ? (
            <p className="text-sm text-gray-500">このアイテムを使うサーヴァントはいません</p>
          ) : (
            usages.map((u) => (
              <div
                key={u.collectionNo}
                className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0"
              >
                <img
                  src={u.face}
                  alt={u.name}
                  width={36}
                  height={36}
                  className="rounded shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 truncate">{u.name}</div>
                  <div className="text-xs text-gray-500">
                    {u.details.map((d) => `${d.category}:${d.amount}`).join(' / ')}
                  </div>
                </div>
                <span className="text-sm text-yellow-400 font-medium shrink-0">
                  ×{u.totalAmount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
