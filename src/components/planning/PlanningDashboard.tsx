import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useUserStateContext } from '@/hooks/useUserStateContext';
import { classBoards, freeQuests, itemMap, servants } from '@/data/loader';
import type { Item } from '@/types/item';
import type { PlanningSettings, TargetPreset } from '@/types/user-state';
import {
  buildConflictEntries,
  buildMaterialEntries,
  buildMaterialPressure,
  buildPurePrismPlan,
  estimateApPlan,
  estimateQpPlan,
  getSourceLabels,
  recommendFreeQuests,
} from '@/utils/action-plan';
import {
  calculateNeededMaterials,
  calculateServantNeedBreakdown,
} from '@/utils/calculator';
import {
  getItemCategoryLabel,
  getPurePrismCost,
} from '@/utils/item-metadata';
import { migrateUserState } from '@/utils/storage';
import { ItemIcon } from '@/components/common/ItemIcon';

const PRESETS: { id: TargetPreset; label: string }[] = [
  { id: 'final-ascension', label: '全員 最終再臨' },
  { id: 'skills-10', label: '全員 スキル10' },
  { id: 'append-2-10', label: '全員 アペンド2を10' },
  { id: 'full-basic', label: '全員 最終再臨+スキル10' },
];

export function PlanningDashboard() {
  const { state, dispatch } = useUserStateContext();
  const [message, setMessage] = useState('');

  const calculation = useMemo(
    () => calculateNeededMaterials(servants, state, classBoards),
    [state]
  );
  const breakdown = useMemo(
    () => calculateServantNeedBreakdown(servants, state, classBoards),
    [state]
  );
  const entries = useMemo(
    () => buildMaterialEntries(calculation.materials, state.inventory, itemMap),
    [calculation.materials, state.inventory]
  );
  const deficits = useMemo(
    () => entries.filter((entry) => entry.deficit > 0),
    [entries]
  );
  const questRecommendations = useMemo(
    () => recommendFreeQuests(deficits, freeQuests, 3),
    [deficits]
  );
  const pressure = useMemo(
    () => buildMaterialPressure(entries, breakdown, questRecommendations),
    [breakdown, entries, questRecommendations]
  );
  const conflicts = useMemo(() => buildConflictEntries(pressure), [pressure]);
  const purePrismPlan = useMemo(
    () => buildPurePrismPlan(deficits, state.planning, questRecommendations),
    [deficits, questRecommendations, state.planning]
  );
  const apPlan = useMemo(
    () => estimateApPlan(questRecommendations, state.planning),
    [questRecommendations, state.planning]
  );
  const qpPlan = useMemo(
    () => estimateQpPlan(state, calculation.qp),
    [calculation.qp, state]
  );
  const sourceMatrix = useMemo(
    () =>
      pressure.slice(0, 16).map((entry) => {
        const bestQuest =
          questRecommendations
            .filter((recommendation) => recommendation.itemId === entry.itemId)
            .sort((a, b) => a.apPerDrop - b.apPerDrop)[0] ?? null;
        const purePrismCost = getPurePrismCost(entry.item);
        const exchangeHint = purePrismCost
          ? `プリズム${purePrismCost}/個`
          : '周回中心';

        return {
          entry,
          bestQuest,
          sourceLabels: getSourceLabels(
            entry.itemId,
            questRecommendations,
            entry.item
          ).join(' / '),
          exchangeHint,
        };
      }),
    [pressure, questRecommendations]
  );

  const configuredCount = Object.keys(state.servants).length;
  const ownedCount = Object.values(state.roster).filter((entry) => entry.owned).length;
  const classScoreTargetCount = Object.values(state.classScore).reduce(
    (sum, board) => sum + board.targetSquareIds.length,
    0
  );

  const updatePlanning = (planning: Partial<PlanningSettings>) => {
    dispatch({ type: 'SET_PLANNING', planning });
  };

  const exportState = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fgo-mat-calc-state-v${state.version}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('現在の計画をJSONとして書き出しました。');
  };

  const importState = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = migrateUserState(JSON.parse(await file.text()));
      dispatch({ type: 'IMPORT_STATE', state: imported });
      setMessage('JSONから計画を読み込みました。');
    } catch {
      setMessage('JSONを読み込めませんでした。');
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <section className="grid gap-3 md:grid-cols-5">
        <SummaryCard label="設定サーヴァント" value={`${configuredCount}体`} />
        <SummaryCard label="所持メモ" value={`${ownedCount}体`} />
        <SummaryCard label="クラススコア目標" value={`${classScoreTargetCount}個`} />
        <SummaryCard label="不足素材" value={`${deficits.length}種`} tone="warn" />
        <SummaryCard
          label="推定周回AP"
          value={apPlan.totalAp > 0 ? apPlan.totalAp.toLocaleString() : '-'}
        />
      </section>

      <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">計画管理</h2>
            <p className="mt-1 text-xs text-gray-400">
              保存/読込、一括プリセット、AP・QP・プリズムをここで管理します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportState}
              className="rounded border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-gray-700"
            >
              JSON保存
            </button>
            <label className="cursor-pointer rounded border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-gray-700">
              JSON読込
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => void importState(event.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {message && <p className="mt-2 text-xs text-yellow-300">{message}</p>}

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-medium text-gray-300">一括ターゲット</h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'APPLY_PRESET_TO_CONFIGURED',
                      preset: preset.id,
                    })
                  }
                  disabled={configuredCount === 0}
                  className="rounded bg-gray-700 px-3 py-2 text-xs text-gray-100 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <PlanningInputs planning={state.planning} onChange={updatePlanning} />
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <ActionPanel title="AP見積もり">
          <div className="space-y-1 text-sm text-gray-200">
            <p>必要AP: {apPlan.totalAp.toLocaleString()}</p>
            <p>手持ちAP換算: {apPlan.availableAp.toLocaleString()}</p>
            <p>残AP: {apPlan.remainingAp.toLocaleString()}</p>
            <p>自然回復: 約{apPlan.naturalRecoveryHours.toFixed(1)}時間</p>
            <p>追加金リンゴ目安: {apPlan.goldApplesNeeded.toLocaleString()}個</p>
          </div>
        </ActionPanel>
        <ActionPanel title="QP不足" empty={qpPlan.deficit === 0 ? 'QP不足はありません。' : undefined}>
          {qpPlan.deficit > 0 && (
            <div className="space-y-1 text-sm text-gray-200">
              <p>不足QP: {qpPlan.deficit.toLocaleString()}</p>
              <p>宝物庫目安: {qpPlan.runs.toLocaleString()}周 / {qpPlan.ap.toLocaleString()}AP</p>
            </div>
          )}
        </ActionPanel>
        <ActionPanel
          title="ピュアプリズム"
          empty={purePrismPlan.length === 0 ? '購入候補はありません。' : undefined}
        >
          <div className="space-y-2">
            {purePrismPlan.slice(0, 5).map((entry) => (
              <MaterialLine
                key={entry.itemId}
                item={entry.item}
                detail={`${entry.buyable}個 / ${entry.prismCost}プリズム`}
              />
            ))}
          </div>
        </ActionPanel>
      </section>

      <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <h2 className="mb-3 text-sm font-medium text-white">不足素材アクション</h2>
        {pressure.length === 0 ? (
          <p className="text-sm text-gray-400">不足素材はありません。</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {pressure.slice(0, 12).map((entry) => (
              <div key={entry.itemId} className="rounded border border-gray-700 bg-gray-900/40 p-3">
                <div className="flex items-center gap-2">
                  <ItemIcon icon={entry.item.icon} name={entry.item.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-gray-100">{entry.item.name}</div>
                    <div className="text-xs text-gray-500">{getItemCategoryLabel(entry.item)}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-red-300">不足 {entry.deficit}</div>
                    <div className="text-gray-500">必要 {entry.needed}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {getSourceLabels(entry.itemId, questRecommendations, entry.item).map((label) => (
                    <span
                      key={label}
                      className="rounded bg-gray-700 px-2 py-0.5 text-[10px] text-gray-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  使用予定: {entry.users.slice(0, 3).join(' / ')}
                  {entry.users.length > 3 ? ` ほか${entry.users.length - 3}体` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <h2 className="mb-3 text-sm font-medium text-white">素材入手手段マトリクス</h2>
        {sourceMatrix.length === 0 ? (
          <p className="text-sm text-gray-400">不足素材はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-gray-400">
                <tr>
                  <th className="px-2 py-2">素材</th>
                  <th className="px-2 py-2">不足</th>
                  <th className="px-2 py-2">入手手段</th>
                  <th className="px-2 py-2">最良フリクエ</th>
                  <th className="px-2 py-2">AP/個</th>
                  <th className="px-2 py-2">補助判断</th>
                </tr>
              </thead>
              <tbody>
                {sourceMatrix.map(({ entry, bestQuest, sourceLabels, exchangeHint }) => (
                  <tr key={entry.itemId} className="border-t border-gray-700">
                    <td className="px-2 py-2 text-gray-100">
                      <div className="flex items-center gap-2">
                        <ItemIcon icon={entry.item.icon} name={entry.item.name} size={24} />
                        <span>{entry.item.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-red-300">{entry.deficit.toLocaleString()}</td>
                    <td className="px-2 py-2 text-gray-300">{sourceLabels}</td>
                    <td className="px-2 py-2 text-gray-300">
                      {bestQuest
                        ? `${bestQuest.quest.warLongName} / ${bestQuest.quest.name}`
                        : '-'}
                    </td>
                    <td className="px-2 py-2 text-yellow-300">
                      {bestQuest ? bestQuest.apPerDrop.toFixed(1) : '-'}
                    </td>
                    <td className="px-2 py-2 text-gray-400">{exchangeHint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
        <h2 className="mb-3 text-sm font-medium text-white">おすすめフリクエ</h2>
        {questRecommendations.length === 0 ? (
          <p className="text-sm text-gray-400">不足素材に対応する恒常フリクエ候補がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-gray-400">
                <tr>
                  <th className="px-2 py-2">素材</th>
                  <th className="px-2 py-2">クエスト</th>
                  <th className="px-2 py-2">AP/個</th>
                  <th className="px-2 py-2">推定周回</th>
                  <th className="px-2 py-2">副産物</th>
                </tr>
              </thead>
              <tbody>
                {questRecommendations.slice(0, 20).map((recommendation) => {
                  const item = itemMap.get(recommendation.itemId);
                  if (!item) return null;
                  return (
                    <tr key={`${recommendation.itemId}-${recommendation.quest.id}`} className="border-t border-gray-700">
                      <td className="px-2 py-2 text-gray-100">{item.name}</td>
                      <td className="px-2 py-2 text-gray-300">
                        {recommendation.quest.warLongName} / {recommendation.quest.name}
                        <span className="ml-1 text-gray-500">AP{recommendation.quest.ap}</span>
                      </td>
                      <td className="px-2 py-2 text-yellow-300">{recommendation.apPerDrop.toFixed(1)}</td>
                      <td className="px-2 py-2 text-gray-300">
                        {recommendation.estimatedRuns.toLocaleString()}周 / {recommendation.estimatedAp.toLocaleString()}AP
                      </td>
                      <td className="px-2 py-2 text-gray-400">
                        {recommendation.sideDropItemIds
                          .map((itemId) => itemMap.get(itemId)?.name)
                          .filter(Boolean)
                          .join(' / ') || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <ActionPanel
          title="素材衝突"
          empty={conflicts.length === 0 ? '複数目標で取り合う不足素材はありません。' : undefined}
        >
          <div className="space-y-2">
            {conflicts.slice(0, 8).map((entry) => (
              <MaterialLine
                key={entry.itemId}
                item={entry.item}
                detail={`不足${entry.deficit} / ${entry.users.slice(0, 3).join('、')}`}
              />
            ))}
          </div>
        </ActionPanel>
      </section>
    </div>
  );
}

interface PlanningInputsProps {
  planning: PlanningSettings;
  onChange: (planning: Partial<PlanningSettings>) => void;
}

function PlanningInputs({ planning, onChange }: PlanningInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      <NumberInput label="現在AP" value={planning.currentAp} onChange={(currentAp) => onChange({ currentAp })} />
      <NumberInput label="最大AP" value={planning.maxAp} onChange={(maxAp) => onChange({ maxAp })} />
      <NumberInput label="金リンゴ" value={planning.goldApples} onChange={(goldApples) => onChange({ goldApples })} />
      <NumberInput label="銀リンゴ" value={planning.silverApples} onChange={(silverApples) => onChange({ silverApples })} />
      <NumberInput label="銅リンゴ" value={planning.bronzeApples} onChange={(bronzeApples) => onChange({ bronzeApples })} />
      <NumberInput label="ピュアプリズム" value={planning.purePrisms} onChange={(purePrisms) => onChange({ purePrisms })} />
      <NumberInput label="所持QP" value={planning.qpOwned} onChange={(qpOwned) => onChange({ qpOwned })} />
      <NumberInput label="宝物庫QP/周" value={planning.qpPerRun} onChange={(qpPerRun) => onChange({ qpPerRun })} />
      <NumberInput label="宝物庫AP" value={planning.qpQuestAp} onChange={(qpQuestAp) => onChange({ qpQuestAp })} />
      <NumberInput label="QPボーナス%" value={planning.qpBonusPercent} onChange={(qpBonusPercent) => onChange({ qpBonusPercent })} />
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <label className="space-y-1">
      <span className="text-gray-400">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) =>
          onChange(Math.max(0, Math.floor(Number(event.target.value) || 0)))
        }
        className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-2 text-right text-gray-100"
      />
    </label>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'warn';
}

function SummaryCard({ label, value, tone = 'default' }: SummaryCardProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={tone === 'warn' ? 'mt-1 text-xl font-semibold text-red-300' : 'mt-1 text-xl font-semibold text-white'}>
        {value}
      </div>
    </div>
  );
}

interface ActionPanelProps {
  title: string;
  empty?: string;
  children: ReactNode;
}

function ActionPanel({ title, empty, children }: ActionPanelProps) {
  return (
    <section className="rounded-lg bg-gray-800 p-3 sm:p-4">
      <h2 className="mb-3 text-sm font-medium text-white">{title}</h2>
      {empty ? <p className="text-sm text-gray-400">{empty}</p> : children}
    </section>
  );
}

interface MaterialLineProps {
  item: Item;
  detail: string;
}

function MaterialLine({ item, detail }: MaterialLineProps) {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-700 p-2">
      <ItemIcon icon={item.icon} name={item.name} size={28} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-gray-100">{item.name}</div>
        <div className="truncate text-xs text-gray-400">{detail}</div>
      </div>
    </div>
  );
}
