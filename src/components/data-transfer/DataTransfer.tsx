import { useMemo, useState } from 'react';
import { useUserStateContext } from '@/hooks/useUserStateContext';
import {
  formatUserStateExport,
  parseUserStateExport,
} from '@/utils/state-transfer';

export function DataTransfer() {
  const { state, dispatch } = useUserStateContext();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const exportText = useMemo(() => formatUserStateExport(state), [state]);
  const summary = useMemo(() => {
    const configuredServants = Object.keys(state.servants).length;
    const ownedInventory = Object.values(state.inventory).filter((amount) => amount > 0).length;
    const rosterEntries = Object.keys(state.roster).length;
    const classScoreTargets = Object.values(state.classScore).reduce(
      (sum, board) => sum + board.targetSquareIds.length,
      0
    );

    return [
      { label: '育成設定', value: `${configuredServants}体` },
      { label: '所持素材', value: `${ownedInventory}種` },
      { label: '所持メモ', value: `${rosterEntries}体` },
      { label: 'クラススコア目標', value: `${classScoreTargets}個` },
    ];
  }, [state]);

  const copyExportText = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setMessage('出力テキストをコピーしました。');
    } catch {
      setMessage('コピーできませんでした。テキスト欄から選択してください。');
    }
  };

  const downloadExportText = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fgo-mat-calc-state-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('出力テキストを保存しました。');
  };

  const readImportFile = async (file: File | undefined) => {
    if (!file) return;
    setImportText(await file.text());
    setMessage(`${file.name} を読み込みました。`);
  };

  const importState = () => {
    if (!window.confirm('入力データで現在の設定を上書きします。よろしいですか？')) {
      return;
    }

    try {
      const imported = parseUserStateExport(importText);
      dispatch({ type: 'IMPORT_STATE', state: imported });
      setMessage('入力データから設定を復元しました。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '入力データを読み込めませんでした。');
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((entry) => (
          <div key={entry.label} className="rounded-lg bg-gray-800 p-4">
            <div className="text-xs text-gray-400">{entry.label}</div>
            <div className="mt-1 text-xl font-semibold text-white">{entry.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-white">文字データ出力</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyExportText()}
              className="rounded border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-gray-700"
            >
              コピー
            </button>
            <button
              type="button"
              onClick={downloadExportText}
              className="rounded bg-yellow-500 px-3 py-2 text-xs font-medium text-gray-950 hover:bg-yellow-400"
            >
              TXT保存
            </button>
          </div>
        </div>
        <textarea
          value={exportText}
          readOnly
          className="h-72 w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 font-mono text-xs text-gray-100 focus:border-yellow-400 focus:outline-none"
        />
      </section>

      <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-white">文字データ入力</h2>
          <label className="cursor-pointer rounded border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-gray-700">
            ファイル読込
            <input
              type="file"
              accept="text/plain,application/json,.txt,.json"
              onChange={(event) => void readImportFile(event.target.files?.[0])}
              className="hidden"
            />
          </label>
        </div>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="保存した文字データを貼り付け"
          className="h-48 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 font-mono text-xs text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={importState}
            disabled={importText.trim().length === 0}
            className="rounded bg-yellow-500 px-3 py-2 text-xs font-medium text-gray-950 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            入力データで復元
          </button>
          {message && <span className="text-xs text-yellow-300">{message}</span>}
        </div>
      </section>
    </div>
  );
}
