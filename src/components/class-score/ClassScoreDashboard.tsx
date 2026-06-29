import { useMemo, useState } from 'react';
import { classBoards, itemMap } from '@/data/loader';
import { ItemIcon } from '@/components/common/ItemIcon';
import { useUserStateContext } from '@/hooks/useUserStateContext';
import type { ClassBoard, ClassBoardLine, ClassBoardSquare } from '@/types/class-board';
import {
  getAvailableSquareIds,
  getClassScoreBoardState,
  getRequiredLineIdsForBoard,
  getRequiredSquareIdsForBoard,
  getRouteToSquare,
  getRouteToSquareWithLines,
  getSquareTone,
  summarizeClassScoreRoute,
} from '@/utils/class-score';
import { compareByRarity } from '@/utils/item-sort';

const TONE_STYLES: Record<
  ReturnType<typeof getSquareTone>,
  { fill: string; stroke: string; glow: string; label: string }
> = {
  selected: { fill: '#facc15', stroke: '#fef9c3', glow: '#fde047', label: '選択中' },
  unlocked: { fill: '#38bdf8', stroke: '#e0f2fe', glow: '#7dd3fc', label: '解放済み' },
  target: { fill: '#f97316', stroke: '#ffedd5', glow: '#fb923c', label: '目標' },
  required: { fill: '#22d3ee', stroke: '#cffafe', glow: '#67e8f9', label: '目標経路' },
  available: { fill: '#22c55e', stroke: '#dcfce7', glow: '#86efac', label: '解放可能' },
  lock: { fill: '#64748b', stroke: '#cbd5e1', glow: '#94a3b8', label: 'ロック' },
  blank: { fill: '#475569', stroke: '#94a3b8', glow: '#64748b', label: '空白' },
  default: { fill: '#1f2937', stroke: '#64748b', glow: '#334155', label: '未選択' },
};

interface ClassScoreLineView {
  line: ClassBoardLine;
  prev: ClassBoardSquare;
  next: ClassBoardSquare;
  stroke: string;
  isActive: boolean;
  isSelectedRoute: boolean;
}

export function ClassScoreDashboard() {
  const { state, dispatch } = useUserStateContext();
  const [boardId, setBoardId] = useState(classBoards[0]?.id ?? 1);
  const [selectedSquareId, setSelectedSquareId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const board = useMemo(
    () => classBoards.find((entry) => entry.id === boardId) ?? classBoards[0],
    [boardId]
  );
  const boardState = useMemo(
    () => getClassScoreBoardState(state, board.id),
    [board.id, state]
  );
  const squareMap = useMemo(
    () => new Map(board.squares.map((square) => [square.id, square])),
    [board]
  );
  const unlockedIds = useMemo(
    () => new Set(boardState.unlockedSquareIds),
    [boardState.unlockedSquareIds]
  );
  const targetIds = useMemo(
    () => new Set(boardState.targetSquareIds),
    [boardState.targetSquareIds]
  );
  const defaultSquare = useMemo(
    () =>
      board.squares.find((square) => targetIds.has(square.id)) ??
      board.squares.find((square) => square.flags.includes('start')) ??
      board.squares[0] ??
      null,
    [board, targetIds]
  );
  const selectedSquare =
    selectedSquareId !== null && squareMap.has(selectedSquareId)
      ? squareMap.get(selectedSquareId)!
      : defaultSquare;
  const effectiveSelectedSquareId = selectedSquare?.id ?? null;
  const requiredIds = useMemo(
    () => getRequiredSquareIdsForBoard(board, boardState),
    [board, boardState]
  );
  const requiredLineIds = useMemo(
    () => getRequiredLineIdsForBoard(board, boardState),
    [board, boardState]
  );
  const availableIds = useMemo(
    () => getAvailableSquareIds(board, boardState),
    [board, boardState]
  );
  const selectedRoute = useMemo(
    () =>
      selectedSquare
        ? new Set(getRouteToSquare(board, boardState, selectedSquare.id))
        : new Set<number>(),
    [board, boardState, selectedSquare]
  );
  const selectedRouteLineIds = useMemo(
    () =>
      selectedSquare
        ? new Set(getRouteToSquareWithLines(board, boardState, selectedSquare.id).lineIds)
        : new Set<number>(),
    [board, boardState, selectedSquare]
  );
  const summary = useMemo(
    () => summarizeClassScoreRoute(board, requiredIds),
    [board, requiredIds]
  );

  const setBoardState = (next: {
    unlockedSquareIds?: number[];
    targetSquareIds?: number[];
  }) => {
    dispatch({ type: 'SET_CLASS_SCORE_BOARD', boardId: board.id, board: next });
  };

  const toggleTarget = (squareId: number) => {
    const targets = toggleId(boardState.targetSquareIds, squareId);
    setBoardState({ targetSquareIds: targets });
  };

  const addRouteToTargets = (squareIds: Iterable<number>) => {
    setBoardState({
      targetSquareIds: unionIds(boardState.targetSquareIds, [...squareIds]),
    });
  };

  const toggleUnlocked = (squareId: number) => {
    const willUnlock = !unlockedIds.has(squareId);
    setBoardState({
      unlockedSquareIds: toggleId(boardState.unlockedSquareIds, squareId),
      targetSquareIds: willUnlock
        ? boardState.targetSquareIds.filter((id) => id !== squareId)
        : boardState.targetSquareIds,
    });
  };

  const markRouteUnlocked = (squareIds: Iterable<number>) => {
    const routeIds = [...squareIds];
    setBoardState({
      unlockedSquareIds: unionIds(boardState.unlockedSquareIds, routeIds),
      targetSquareIds: boardState.targetSquareIds.filter(
        (id) => !routeIds.includes(id)
      ),
    });
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <section className="rounded-lg border border-cyan-500/20 bg-gray-900 p-3 shadow-[0_0_40px_rgba(8,145,178,0.16)] sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">クラススコア</h2>
            <p className="mt-1 text-xs text-gray-400">
              Atlasのクラスボード座標を使い、目標ノードまでの未解放経路と必要素材を集計します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBoardState({ targetSquareIds: [] })}
              className="rounded border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-gray-800"
            >
              目標をクリア
            </button>
            <button
              type="button"
              onClick={() => setBoardState({ unlockedSquareIds: [] })}
              className="rounded border border-gray-600 px-3 py-2 text-xs text-gray-200 hover:bg-gray-800"
            >
              解放状態をクリア
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {classBoards.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setBoardId(entry.id);
                setSelectedSquareId(null);
                setZoom(1);
              }}
              className={`shrink-0 rounded border px-3 py-2 text-xs transition-colors ${
                entry.id === board.id
                  ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
            >
              {entry.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border border-cyan-500/20 bg-[#070b16]">
          <div className="flex flex-col gap-3 border-b border-cyan-500/20 bg-gray-950/80 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">{board.name}</h3>
              <p className="text-xs text-gray-400">
                解放済み {unlockedIds.size} / 目標 {targetIds.size} / 必要経路 {requiredIds.size}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>拡大</span>
              <input
                type="range"
                min={0.75}
                max={1.8}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-28 accent-cyan-300"
              />
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="rounded border border-gray-700 px-2 py-1 hover:bg-gray-800"
              >
                全体
              </button>
            </div>
          </div>

          <ResourceStrip board={board} summary={summary} />

          <ClassBoardMap
            board={board}
            selectedSquareId={effectiveSelectedSquareId}
            selectedRouteIds={selectedRoute}
            selectedRouteLineIds={selectedRouteLineIds}
            unlockedIds={unlockedIds}
            targetIds={targetIds}
            requiredIds={requiredIds}
            requiredLineIds={requiredLineIds}
            availableIds={availableIds}
            zoom={zoom}
            onSelect={setSelectedSquareId}
          />

          <StatusLegend />
        </div>

        <aside className="space-y-3">
          <NodeDetailPanel
            square={selectedSquare}
            routeIds={selectedRoute}
            board={board}
            isUnlocked={selectedSquare ? unlockedIds.has(selectedSquare.id) : false}
            isTarget={selectedSquare ? targetIds.has(selectedSquare.id) : false}
            onToggleTarget={toggleTarget}
            onAddRouteToTargets={addRouteToTargets}
            onToggleUnlocked={toggleUnlocked}
            onMarkRouteUnlocked={markRouteUnlocked}
          />
          <RequiredMaterialsPanel summary={summary} inventory={state.inventory} />
        </aside>
      </section>
    </div>
  );
}

function ClassBoardMap({
  board,
  selectedSquareId,
  selectedRouteIds,
  selectedRouteLineIds,
  unlockedIds,
  targetIds,
  requiredIds,
  requiredLineIds,
  availableIds,
  zoom,
  onSelect,
}: {
  board: ClassBoard;
  selectedSquareId: number | null;
  selectedRouteIds: Set<number>;
  selectedRouteLineIds: Set<number>;
  unlockedIds: Set<number>;
  targetIds: Set<number>;
  requiredIds: Set<number>;
  requiredLineIds: Set<number>;
  availableIds: Set<number>;
  zoom: number;
  onSelect: (squareId: number) => void;
}) {
  const padding = 150;
  const fullWidth = board.bounds.maxX - board.bounds.minX + padding * 2;
  const fullHeight = board.bounds.maxY - board.bounds.minY + padding * 2;
  const centerX = (board.bounds.minX + board.bounds.maxX) / 2;
  const centerY = (board.bounds.minY + board.bounds.maxY) / 2;
  const viewWidth = fullWidth / zoom;
  const viewHeight = fullHeight / zoom;
  const viewBox = `${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`;
  const squareMap = new Map(board.squares.map((square) => [square.id, square]));
  const lineViews = board.lines
    .map((line) => {
      const prev = squareMap.get(line.prevSquareId);
      const next = squareMap.get(line.nextSquareId);
      if (!prev || !next) return null;
      const isSelectedRoute =
        selectedRouteLineIds.has(line.id) ||
        isRouteConnection(prev, next, selectedRouteIds, unlockedIds);
      const isRequired =
        requiredLineIds.has(line.id) ||
        isRouteConnection(prev, next, requiredIds, unlockedIds);
      const isUnlocked =
        (unlockedIds.has(prev.id) && unlockedIds.has(next.id)) ||
        (prev.flags.includes('start') && unlockedIds.has(next.id)) ||
        (next.flags.includes('start') && unlockedIds.has(prev.id));
      const isActive = isSelectedRoute || isRequired || isUnlocked;
      const stroke = isSelectedRoute
        ? '#facc15'
        : isUnlocked
          ? '#7dd3fc'
          : isRequired
            ? '#22d3ee'
            : '#475569';
      return { line, prev, next, stroke, isActive, isSelectedRoute };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <div
      className="relative min-h-[520px] overflow-hidden sm:min-h-[620px]"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(14,116,144,.28), transparent 28%), radial-gradient(circle at 20% 20%, rgba(59,130,246,.22), transparent 24%), linear-gradient(135deg, #050816 0%, #0f172a 48%, #111827 100%)',
      }}
    >
      <svg
        viewBox={viewBox}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`${board.name} クラススコア星図`}
      >
        <defs>
          <filter id={`class-score-glow-${board.id}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`class-score-node-${board.id}`}>
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="58%" stopColor="#38bdf8" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.92" />
          </radialGradient>
        </defs>

        <g opacity="0.22">
          {[220, 380, 540, 700, 860].map((radius) => (
            <circle
              key={radius}
              cx={0}
              cy={0}
              r={radius}
              fill="none"
              stroke="#60a5fa"
              strokeWidth={2}
            />
          ))}
          {Array.from({ length: 18 }, (_, index) => {
            const angle = (Math.PI * 2 * index) / 18;
            return (
              <line
                key={index}
                x1={Math.cos(angle) * 140}
                y1={Math.sin(angle) * 140}
                x2={Math.cos(angle) * 980}
                y2={Math.sin(angle) * 980}
                stroke="#3b82f6"
                strokeWidth={1.5}
              />
            );
          })}
        </g>

        <g>
          {lineViews
            .filter((entry) => !entry.isActive)
            .map((entry) => (
              <ClassScoreLine
                key={entry.line.id}
                boardId={board.id}
                entry={entry}
              />
            ))}
        </g>

        <g>
          {lineViews
            .filter((entry) => entry.isActive)
            .map((entry) => (
              <ClassScoreLine
                key={entry.line.id}
                boardId={board.id}
                entry={entry}
              />
            ))}
        </g>

        <g>
          {board.squares.map((square) => {
            const tone = getSquareTone(
              square,
              selectedSquareId,
              unlockedIds,
              targetIds,
              requiredIds,
              availableIds
            );
            const style = TONE_STYLES[tone];
            const radius = square.skillType === 'lock' ? 24 : 28;
            const clipId = `class-score-clip-${board.id}-${square.id}`;
            return (
              <g
                key={square.id}
                data-square-id={square.id}
                role="button"
                tabIndex={0}
                aria-label={`${square.name} ${style.label}`}
                transform={`translate(${square.x} ${square.y})`}
                onClick={() => onSelect(square.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(square.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <defs>
                  <clipPath id={clipId}>
                    <circle cx={0} cy={0} r={radius - 7} />
                  </clipPath>
                </defs>
                <circle
                  r={radius + 10}
                  fill={style.glow}
                  opacity={tone === 'default' || tone === 'blank' ? 0.08 : 0.28}
                  filter={`url(#class-score-glow-${board.id})`}
                />
                <circle
                  r={radius}
                  fill={`url(#class-score-node-${board.id})`}
                  stroke={style.stroke}
                  strokeWidth={tone === 'selected' ? 5 : 3}
                />
                {square.icon ? (
                  <image
                    href={square.icon}
                    x={-(radius - 7)}
                    y={-(radius - 7)}
                    width={(radius - 7) * 2}
                    height={(radius - 7) * 2}
                    clipPath={`url(#${clipId})`}
                    opacity={tone === 'default' || tone === 'blank' ? 0.54 : 1}
                  />
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#e5e7eb"
                    fontSize={24}
                    fontWeight={700}
                  >
                    {square.skillType === 'lock' ? 'L' : '*'}
                  </text>
                )}
                {targetIds.has(square.id) && (
                  <path
                    d="M0 -45 L8 -25 L30 -25 L12 -12 L20 10 L0 -3 L-20 10 L-12 -12 L-30 -25 L-8 -25 Z"
                    fill="#facc15"
                    stroke="#fef08a"
                    strokeWidth={2}
                  />
                )}
              </g>
            );
          })}
        </g>

        <g pointerEvents="none">
          {lineViews
            .filter((entry) => entry.isActive)
            .map((entry) => (
              <ClassScoreLine
                key={`overlay-${entry.line.id}`}
                boardId={board.id}
                entry={entry}
                overlay
              />
            ))}
        </g>
      </svg>
    </div>
  );
}

function ClassScoreLine({
  boardId,
  entry,
  overlay = false,
}: {
  boardId: number;
  entry: ClassScoreLineView;
  overlay?: boolean;
}) {
  const activeStrokeWidth = 6;
  return (
    <line
      data-line-id={overlay ? undefined : entry.line.id}
      data-line-overlay-id={overlay ? entry.line.id : undefined}
      x1={entry.prev.x}
      y1={entry.prev.y}
      x2={entry.next.x}
      y2={entry.next.y}
      stroke={entry.stroke}
      strokeWidth={entry.isActive ? activeStrokeWidth : 3}
      strokeLinecap="round"
      opacity={entry.isActive ? 1 : 0.52}
      filter={!overlay && entry.isActive ? `url(#class-score-glow-${boardId})` : undefined}
    />
  );
}

function ResourceStrip({
  board,
  summary,
}: {
  board: ClassBoard;
  summary: ReturnType<typeof summarizeClassScoreRoute>;
}) {
  return (
    <div className="grid gap-2 border-b border-cyan-500/20 bg-gray-950/50 p-3 sm:grid-cols-5">
      <div className="rounded border border-gray-800 bg-gray-900/80 p-2">
        <div className="text-[10px] text-gray-500">目標QP</div>
        <div className="text-sm font-medium text-yellow-300">
          {summary.qp.toLocaleString()}
        </div>
      </div>
      {board.displayItemIds.map((itemId) => {
        const item = itemMap.get(itemId);
        const needed = summary.materials.get(itemId) ?? 0;
        if (!item) return null;
        return (
          <div key={itemId} className="flex items-center gap-2 rounded border border-gray-800 bg-gray-900/80 p-2">
            <ItemIcon icon={item.icon} name={item.name} size={28} />
            <div className="min-w-0">
              <div className="truncate text-[11px] text-gray-300">{item.name}</div>
              <div className="text-sm font-medium text-cyan-200">{needed.toLocaleString()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NodeDetailPanel({
  square,
  routeIds,
  board,
  isUnlocked,
  isTarget,
  onToggleTarget,
  onAddRouteToTargets,
  onToggleUnlocked,
  onMarkRouteUnlocked,
}: {
  square: ClassBoardSquare | null;
  routeIds: Set<number>;
  board: ClassBoard;
  isUnlocked: boolean;
  isTarget: boolean;
  onToggleTarget: (squareId: number) => void;
  onAddRouteToTargets: (squareIds: Iterable<number>) => void;
  onToggleUnlocked: (squareId: number) => void;
  onMarkRouteUnlocked: (squareIds: Iterable<number>) => void;
}) {
  if (!square) {
    return (
      <section className="rounded-lg bg-gray-800 p-4">
        <p className="text-sm text-gray-400">ノードを選択してください。</p>
      </section>
    );
  }

  const routeSummary = summarizeClassScoreRoute(board, routeIds);
  const routeCount = routeIds.size;

  return (
    <section className="rounded-lg bg-gray-800 p-4">
      <div className="flex items-start gap-3">
        {square.icon ? (
          <img src={square.icon} alt={square.name} className="h-12 w-12 rounded-full border border-cyan-300/60 bg-gray-950 p-1" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-full border border-gray-600 bg-gray-900 text-xs text-gray-400">
            {square.skillType === 'lock' ? 'LOCK' : 'NODE'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white">{square.name}</h3>
          <p className="mt-1 text-xs text-gray-500">ID {square.id} / {getSquareTypeLabel(square)}</p>
        </div>
      </div>

      {square.detail && (
        <p className="mt-3 whitespace-pre-wrap rounded border border-gray-700 bg-gray-900/70 p-3 text-xs leading-relaxed text-gray-300">
          {square.detail}
        </p>
      )}

      {square.lock && (
        <div className="mt-3 rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-100">
          <div className="font-medium">ロック条件</div>
          <div className="mt-1 text-yellow-200/80">
            {square.lock.message || `${square.lock.condType} ${square.lock.condTargetId}`}
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <InfoTile label="このノードQP" value={square.qp.toLocaleString()} />
        <InfoTile label="経路ノード" value={`${routeCount}個`} />
        <InfoTile label="経路QP" value={routeSummary.qp.toLocaleString()} />
      </div>

      <div className="mt-3 space-y-2">
        <MaterialCostList square={square} />
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          disabled={isUnlocked}
          onClick={() => onToggleTarget(square.id)}
          className="rounded bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
        >
          {isTarget ? '目標から外す' : '目標に追加'}
        </button>
        <button
          type="button"
          disabled={routeIds.size === 0}
          onClick={() => onAddRouteToTargets(routeIds)}
          className="rounded border border-cyan-500/50 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
        >
          経路を目標に追加
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggleUnlocked(square.id)}
            className="rounded border border-sky-500/50 px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/10"
          >
            {isUnlocked ? '未解放に戻す' : '解放済みにする'}
          </button>
          <button
            type="button"
            disabled={routeIds.size === 0}
            onClick={() => onMarkRouteUnlocked(routeIds)}
            className="rounded border border-sky-500/50 px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
          >
            経路を解放済みにする
          </button>
        </div>
      </div>
    </section>
  );
}

function RequiredMaterialsPanel({
  summary,
  inventory,
}: {
  summary: ReturnType<typeof summarizeClassScoreRoute>;
  inventory: Record<number, number>;
}) {
  const entries = [...summary.materials.entries()]
    .map(([itemId, amount]) => {
      const item = itemMap.get(itemId);
      if (!item) return null;
      const owned = inventory[itemId] ?? 0;
      return {
        itemId,
        item,
        amount,
        owned,
        deficit: Math.max(0, amount - owned),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => compareByRarity(a.item, b.item));

  return (
    <section className="rounded-lg bg-gray-800 p-4">
      <h3 className="text-sm font-medium text-white">目標までの必要素材</h3>
      <p className="mt-1 text-xs text-gray-500">
        この集計は素材計算・行動計画にも反映されます。
      </p>
      <div className="mt-3 rounded border border-gray-700 bg-gray-900/70 p-3">
        <div className="text-xs text-gray-400">QP</div>
        <div className="text-lg font-semibold text-yellow-300">
          {summary.qp.toLocaleString()}
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">目標素材はありません。</p>
      ) : (
        <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div key={entry.itemId} className="flex items-center gap-2 rounded border border-gray-700 p-2">
              <ItemIcon icon={entry.item.icon} name={entry.item.name} size={30} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-gray-100">{entry.item.name}</div>
                <div className="text-[11px] text-gray-500">所持 {entry.owned.toLocaleString()}</div>
              </div>
              <div className="text-right text-xs">
                <div className="text-yellow-300">必要 {entry.amount.toLocaleString()}</div>
                {entry.deficit > 0 && (
                  <div className="text-red-300">不足 {entry.deficit.toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MaterialCostList({ square }: { square: ClassBoardSquare }) {
  if (square.qp === 0 && square.items.length === 0) {
    return <p className="text-xs text-gray-500">このノードの素材消費はありません。</p>;
  }
  return (
    <div className="rounded border border-gray-700 bg-gray-900/70 p-3">
      <div className="mb-2 text-xs font-medium text-gray-300">このノードの消費</div>
      {square.qp > 0 && (
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-gray-300">QP</span>
          <span className="text-yellow-300">{square.qp.toLocaleString()}</span>
        </div>
      )}
      <div className="space-y-2">
        {square.items.map((entry) => {
          const item = itemMap.get(entry.itemId);
          if (!item) return null;
          return (
            <div key={entry.itemId} className="flex items-center gap-2">
              <ItemIcon icon={item.icon} name={item.name} size={26} />
              <span className="min-w-0 flex-1 truncate text-xs text-gray-200">{item.name}</span>
              <span className="text-xs text-yellow-300">x{entry.amount.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusLegend() {
  const tones: ReturnType<typeof getSquareTone>[] = [
    'unlocked',
    'target',
    'required',
    'available',
    'lock',
    'default',
  ];
  return (
    <div className="flex flex-wrap gap-2 border-t border-cyan-500/20 bg-gray-950/70 p-3 text-[11px] text-gray-300">
      {tones.map((tone) => (
        <div key={tone} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: TONE_STYLES[tone].fill, boxShadow: `0 0 10px ${TONE_STYLES[tone].glow}` }}
          />
          {TONE_STYLES[tone].label}
        </div>
      ))}
    </div>
  );
}

function isRouteConnection(
  prev: ClassBoardSquare,
  next: ClassBoardSquare,
  routeIds: Set<number>,
  unlockedIds: Set<number>
): boolean {
  if (routeIds.has(prev.id) && routeIds.has(next.id)) return true;
  if (unlockedIds.has(prev.id) && routeIds.has(next.id)) return true;
  if (unlockedIds.has(next.id) && routeIds.has(prev.id)) return true;
  if (prev.flags.includes('start') && routeIds.has(next.id)) return true;
  return next.flags.includes('start') && routeIds.has(prev.id);
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-gray-700 bg-gray-900/70 p-2">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="mt-1 truncate text-xs font-medium text-gray-100">{value}</div>
    </div>
  );
}

function getSquareTypeLabel(square: ClassBoardSquare): string {
  if (square.skillType === 'lock') return 'ツアーロック';
  if (square.skillType === 'commandSpell') return '令呪強化';
  if (square.skillType === 'passive') return 'パッシブ';
  if (square.flags.includes('blank')) return '空白';
  return square.skillType;
}

function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id)
    ? ids.filter((entry) => entry !== id)
    : unionIds(ids, [id]);
}

function unionIds(current: number[], additions: number[]): number[] {
  return [...new Set([...current, ...additions])]
    .map((id) => Math.floor(Number(id)))
    .filter((id) => id > 0)
    .sort((a, b) => a - b);
}
