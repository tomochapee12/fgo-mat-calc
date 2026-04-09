import type { ServantFilters, SortKey } from '@/hooks/useFilteredServants';
import { CLASS_ORDER, CLASS_NAMES } from '@/utils/constants';

interface ServantFilterProps {
  filters: ServantFilters;
  onChange: (filters: ServantFilters) => void;
}

export function ServantFilter({ filters, onChange }: ServantFilterProps) {
  const toggleClass = (cls: string) => {
    const next = new Set(filters.classes);
    if (next.has(cls)) next.delete(cls);
    else next.add(cls);
    onChange({ ...filters, classes: next });
  };

  const toggleRarity = (r: number) => {
    const next = new Set(filters.rarities);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    onChange({ ...filters, rarities: next });
  };

  return (
    <div className="p-3 space-y-3 bg-gray-800 border-b border-gray-700">
      <input
        type="text"
        placeholder="サーヴァント名で検索..."
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 placeholder-gray-400 focus:outline-none focus:border-yellow-400"
      />
      <div className="flex flex-wrap gap-1">
        {CLASS_ORDER.map((cls) => (
          <button
            key={cls}
            onClick={() => toggleClass(cls)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filters.classes.has(cls)
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {CLASS_NAMES[cls] ?? cls}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => toggleRarity(r)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filters.rarities.has(r)
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {'★'.repeat(r) || '☆0'}
            </button>
          ))}
        </div>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
          className="bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600"
        >
          <option value="collectionNo">No.順</option>
          <option value="rarity">レアリティ順</option>
          <option value="class">クラス順</option>
        </select>
      </div>
    </div>
  );
}
