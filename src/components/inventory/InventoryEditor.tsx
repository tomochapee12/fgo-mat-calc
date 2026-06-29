import { useState, useMemo } from 'react';
import { useUserStateContext } from '@/hooks/useUserStateContext';
import { items } from '@/data/loader';
import type { Item } from '@/types/item';
import { kanaIncludes } from '@/utils/kana';
import { compareByRarity } from '@/utils/item-sort';
import { findItemByLooseName, getItemCategoryLabel } from '@/utils/item-metadata';
import { ItemIcon } from '@/components/common/ItemIcon';
import { ItemReverseLookup } from './ItemReverseLookup';

type ItemSortKey = 'rarity' | 'name' | 'id';
type ImportMode = 'replace' | 'add';

export function InventoryEditor() {
  const { state, dispatch } = useUserStateContext();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortKey, setSortKey] = useState<ItemSortKey>('rarity');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [importMessage, setImportMessage] = useState('');

  const categories = useMemo(
    () => [...new Set(items.map(getItemCategoryLabel))].sort((a, b) => a.localeCompare(b, 'ja')),
    []
  );

  const filteredItems = useMemo(() => {
    const list = query
      ? items.filter((item) => kanaIncludes(item.name, query))
      : items;

    const categorized =
      category === 'all'
        ? list
        : list.filter((item) => getItemCategoryLabel(item) === category);

    const sorted = [...categorized];
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
  }, [category, query, sortKey]);

  const importInventory = () => {
    const parsed = parseInventoryText(importText);
    if (Object.keys(parsed.items).length === 0) {
      setImportMessage('取り込める行がありません。例: 凶骨,120');
      return;
    }

    dispatch({
      type: 'SET_INVENTORY_BULK',
      items: parsed.items,
      mode: importMode,
    });
    setImportMessage(
      `${parsed.matched}件を${importMode === 'add' ? '加算' : '上書き'}しました` +
        (parsed.unmatched.length > 0
          ? `。未一致: ${parsed.unmatched.slice(0, 5).join(' / ')}`
          : '。')
    );
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <div className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <h3 className="mb-2 text-sm font-medium text-white">CSV/貼り付け取り込み</h3>
        <p className="mb-3 text-xs text-gray-400">
          1行に「素材名,数量」または「素材名 タブ 数量」を貼り付けてください。略称は一部対応しています。
        </p>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder={'凶骨,120\n竜の牙,80'}
          className="h-24 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
        />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={importMode}
            onChange={(event) => setImportMode(event.target.value as ImportMode)}
            className="rounded border border-gray-600 bg-gray-700 px-2 py-2 text-xs text-gray-300"
          >
            <option value="replace">一致素材を上書き</option>
            <option value="add">一致素材に加算</option>
          </select>
          <button
            type="button"
            onClick={importInventory}
            className="rounded bg-yellow-500 px-3 py-2 text-xs font-medium text-gray-950 hover:bg-yellow-400"
          >
            取り込む
          </button>
          {importMessage && (
            <span className="text-xs text-gray-300">{importMessage}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="素材名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-gray-600 bg-gray-700 px-2 py-2 text-xs text-gray-300 sm:py-1"
        >
          <option value="all">全カテゴリ</option>
          {categories.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
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
              <span className="ml-2 text-[10px] text-gray-500">
                {getItemCategoryLabel(item)}
              </span>
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

function parseInventoryText(text: string): {
  items: Record<number, number>;
  matched: number;
  unmatched: string[];
} {
  const result: Record<number, number> = {};
  const unmatched: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^(.+?)[,\t ]+([0-9０-９,，]+)$/);
    if (!match) {
      unmatched.push(line);
      continue;
    }

    const item = findItemByLooseName(match[1]);
    const amount = Number(match[2].replace(/[，,]/g, ''));
    if (!item || !Number.isFinite(amount)) {
      unmatched.push(match[1]);
      continue;
    }
    result[item.id] = Math.max(0, Math.floor(amount));
  }

  return {
    items: result,
    matched: Object.keys(result).length,
    unmatched,
  };
}
