import { classBoardData, freeQuestData, manifest } from '@/data/loader';

interface HeaderProps {
  onHome: () => void;
  onResetAll: () => void;
}

export function Header({ onHome, onResetAll }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 border-b border-gray-700 px-3 py-3 backdrop-blur sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <h1 className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onHome}
            className="w-full text-left text-lg font-bold leading-tight text-white transition-colors hover:text-yellow-300 sm:text-xl"
          >
            FGO素材シミュレーター
            <span className="mt-0.5 block text-[10px] font-normal text-gray-400 sm:text-xs">
              Atlas: {formatDate(manifest.lastUpdated)} / フリクエ: {formatDate(freeQuestData.generatedAt)} / クラススコア: {formatDate(classBoardData.generatedAt)}
            </span>
          </button>
        </h1>
        <button
          type="button"
          onClick={onResetAll}
          className="shrink-0 rounded border border-red-500/40 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-200 sm:px-3"
        >
          一括リセット
        </button>
      </div>
    </header>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '不明';
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
