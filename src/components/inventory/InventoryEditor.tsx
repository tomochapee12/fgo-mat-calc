import { useState, useMemo } from 'react';
import { useUserStateContext } from '@/contexts/UserStateContext';
import { items } from '@/data/loader';
import { ItemIcon } from '@/components/common/ItemIcon';

export function InventoryEditor() {
  const { state, dispatch } = useUserStateContext();
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(
    () =>
      query
        ? items.filter((item) => item.name.includes(query))
        : items,
    [query]
  );

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        placeholder="素材名で検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 placeholder-gray-400 focus:outline-none focus:border-yellow-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
          >
            <ItemIcon icon={item.icon} name={item.name} size={36} />
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
    </div>
  );
}
