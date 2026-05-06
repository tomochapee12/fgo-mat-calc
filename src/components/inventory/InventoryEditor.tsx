import { useState, useMemo } from 'react';
import { useUserStateContext } from '@/contexts/UserStateContext';
import { items } from '@/data/loader';
import type { Item } from '@/types/item';
import { kanaIncludes } from '@/utils/kana';
import { compareByRarity } from '@/utils/item-sort';
import { ItemIcon } from '@/components/common/ItemIcon';
import { ItemReverseLookup } from './ItemReverseLookup';

type ItemSortKey = 'rarity' | 'name' | 'id';

export function InventoryEditor() {
  const { state, dispatch } = useUserStateContext();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<ItemSortKey>('rarity');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const filteredItems = useMemo(() => {
    const list = query
      ? items.filter((item) => kanaIncludes(item.name, query))
      : items;

    const sorted = [...list];
    switch (sortKey) {
      case 'rarity':
        sorted.sort(compareByRarity);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      case 'id':
        sorted.sort((a, b) => a.id - b.id);
        break;
    }
    return sorted;
  }, [query, sortKey]);

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="素材名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as ItemSortKey)}
          className="rounded border border-gray-600 bg-gray-700 px-2 py-2 text-xs text-gray-300 sm:py-1"
        >
          <option value="rarity">レアリティ順</option>
          <option value="name">名前順</option>
          <option value="id">ID順</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex min-h-16 items-center gap-3 rounded-lg bg-gray-800 p-3"
          >
            <button
              onClick={() => setSelectedItem(item)}
              className="shrink-0 hover:opacity-80 transition-opacity"
              title="逆引き: このアイテムを使うサーヴァント"
            >
              <ItemIcon icon={item.icon} name={item.name} size={36} />
            </button>
            <span className="text-sm text-gray-200 flex-1 truncate">
              {item.name}
            </span>
            <input
              type="number"
              min={0}
              value={state.inventory[item.id] ?? 0}
              onChange={(e) =>
                dispatch({
                  type: 'SET_INVENTORY_ITEM',
                  itemId: item.id,
                  amount: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-2 text-right text-sm text-white focus:border-yellow-400 focus:outline-none sm:py-1"
            />
          </div>
        ))}
      </div>

      {selectedItem && (
        <ItemReverseLookup
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
