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
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="素材名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 placeholder-gray-400 focus:outline-none focus:border-yellow-400"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as ItemSortKey)}
          className="bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600"
        >
          <option value="rarity">レアリティ順</option>
          <option value="name">名前順</option>
          <option value="id">ID順</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
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
              className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm text-right border border-gray-600 focus:outline-none focus:border-yellow-400"
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
