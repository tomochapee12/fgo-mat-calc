export type TabId = 'servants' | 'calculator' | 'inventory';

interface NavigationProps {
  tab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'servants', label: 'サーヴァント' },
  { id: 'calculator', label: '素材計算' },
  { id: 'inventory', label: '所持素材' },
];

export function Navigation({ tab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex border-b border-gray-700 bg-gray-800">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            tab === t.id
              ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-700/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
