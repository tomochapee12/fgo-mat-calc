interface HeaderProps {
  onHome: () => void;
  onResetAll: () => void;
}

export function Header({ onHome, onResetAll }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 border-b border-gray-700 px-3 py-3 backdrop-blur sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <button
          type="button"
          onClick={onHome}
          className="min-w-0 flex-1 text-left text-lg font-bold leading-tight text-white transition-colors hover:text-yellow-300 sm:text-xl"
        >
          FGO素材シミュレーター
        </button>
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
