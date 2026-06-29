import type { ClassBoard, ClassBoardSquare } from '@/types/class-board';
import type { ClassScoreBoardState, UserState } from '@/types/user-state';
import type { CalculationResult } from '@/utils/calculator';

export interface ClassScoreNeedBreakdown {
  boardId: number;
  boardName: string;
  squareIds: number[];
  materials: Map<number, number>;
  qp: number;
}

export interface ClassScoreRouteSummary {
  squareIds: Set<number>;
  materials: Map<number, number>;
  qp: number;
}

export interface ClassScoreRoute {
  squareIds: number[];
  lineIds: number[];
}

export function getClassScoreBoardState(
  userState: UserState,
  boardId: number
): ClassScoreBoardState {
  return (
    userState.classScore[boardId] ?? {
      unlockedSquareIds: [],
      targetSquareIds: [],
    }
  );
}

export function getRouteToSquare(
  board: ClassBoard,
  state: ClassScoreBoardState,
  targetSquareId: number
): number[] {
  return getRouteToSquareWithLines(board, state, targetSquareId).squareIds;
}

export function getRouteToSquareWithLines(
  board: ClassBoard,
  state: ClassScoreBoardState,
  targetSquareId: number
): ClassScoreRoute {
  const squareMap = new Map(board.squares.map((square) => [square.id, square]));
  if (!squareMap.has(targetSquareId)) return { squareIds: [], lineIds: [] };

  const unlocked = new Set(state.unlockedSquareIds);
  if (unlocked.has(targetSquareId)) return { squareIds: [], lineIds: [] };

  const startIds = board.squares
    .filter((square) => square.flags.includes('start'))
    .map((square) => square.id);
  const roots = new Set([...state.unlockedSquareIds, ...startIds]);
  const outgoing = new Map<number, { nextSquareId: number; lineId: number }[]>();
  const incoming = new Map<number, { prevSquareId: number; lineId: number }[]>();

  for (const line of board.lines) {
    const next = outgoing.get(line.prevSquareId) ?? [];
    next.push({ nextSquareId: line.nextSquareId, lineId: line.id });
    outgoing.set(line.prevSquareId, next);

    const prev = incoming.get(line.nextSquareId) ?? [];
    prev.push({ prevSquareId: line.prevSquareId, lineId: line.id });
    incoming.set(line.nextSquareId, prev);
  }

  const bestCost = new Map<number, number>();
  const previous = new Map<number, { squareId: number; lineId: number } | null>();
  const queue: { id: number; cost: number }[] = [];

  for (const root of roots) {
    if (!squareMap.has(root)) continue;
    const cost = unlocked.has(root) ? 0 : getSquareCostValue(squareMap.get(root)!);
    bestCost.set(root, cost);
    previous.set(root, null);
    queue.push({ id: root, cost });
  }

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;
    if (current.cost !== bestCost.get(current.id)) continue;
    if (current.id === targetSquareId) break;

    for (const edge of outgoing.get(current.id) ?? []) {
      const nextId = edge.nextSquareId;
      const nextSquare = squareMap.get(nextId);
      if (!nextSquare) continue;
      const nextCost =
        current.cost + (unlocked.has(nextId) ? 0 : getSquareCostValue(nextSquare));
      if (nextCost < (bestCost.get(nextId) ?? Number.POSITIVE_INFINITY)) {
        bestCost.set(nextId, nextCost);
        previous.set(nextId, { squareId: current.id, lineId: edge.lineId });
        queue.push({ id: nextId, cost: nextCost });
      }
    }
  }

  if (!previous.has(targetSquareId)) {
    return collectAllPrerequisites(targetSquareId, unlocked, incoming);
  }

  const squareIds: number[] = [];
  const lineIds: number[] = [];
  let cursor: number | null | undefined = targetSquareId;
  while (cursor !== null && cursor !== undefined) {
    if (!unlocked.has(cursor)) squareIds.push(cursor);
    const prev = previous.get(cursor);
    if (prev) lineIds.push(prev.lineId);
    cursor = prev?.squareId ?? null;
  }
  return {
    squareIds: squareIds.reverse(),
    lineIds: lineIds.reverse(),
  };
}

export function getRequiredSquareIdsForBoard(
  board: ClassBoard,
  state: ClassScoreBoardState
): Set<number> {
  const squareIds = new Set<number>();
  for (const targetId of state.targetSquareIds) {
    for (const squareId of getRouteToSquare(board, state, targetId)) {
      squareIds.add(squareId);
    }
  }
  return squareIds;
}

export function getRequiredLineIdsForBoard(
  board: ClassBoard,
  state: ClassScoreBoardState
): Set<number> {
  const lineIds = new Set<number>();
  for (const targetId of state.targetSquareIds) {
    for (const lineId of getRouteToSquareWithLines(board, state, targetId).lineIds) {
      lineIds.add(lineId);
    }
  }
  return lineIds;
}

export function summarizeClassScoreRoute(
  board: ClassBoard,
  squareIds: Iterable<number>
): ClassScoreRouteSummary {
  const ids = new Set(squareIds);
  const squareMap = new Map(board.squares.map((square) => [square.id, square]));
  const materials = new Map<number, number>();
  let qp = 0;

  for (const squareId of ids) {
    const square = squareMap.get(squareId);
    if (!square) continue;
    qp += square.qp;
    for (const item of square.items) {
      materials.set(item.itemId, (materials.get(item.itemId) ?? 0) + item.amount);
    }
  }

  return { squareIds: ids, materials, qp };
}

export function calculateClassScoreNeeds(
  boards: ClassBoard[],
  userState: UserState
): CalculationResult {
  const result: CalculationResult = { materials: new Map(), qp: 0 };

  for (const board of boards) {
    const boardState = getClassScoreBoardState(userState, board.id);
    const squareIds = getRequiredSquareIdsForBoard(board, boardState);
    const summary = summarizeClassScoreRoute(board, squareIds);
    result.qp += summary.qp;
    for (const [itemId, amount] of summary.materials) {
      result.materials.set(itemId, (result.materials.get(itemId) ?? 0) + amount);
    }
  }

  return result;
}

export function calculateClassScoreNeedBreakdown(
  boards: ClassBoard[],
  userState: UserState
): ClassScoreNeedBreakdown[] {
  return boards
    .map((board) => {
      const boardState = getClassScoreBoardState(userState, board.id);
      const squareIds = [...getRequiredSquareIdsForBoard(board, boardState)];
      if (squareIds.length === 0) return null;
      const summary = summarizeClassScoreRoute(board, squareIds);
      return {
        boardId: board.id,
        boardName: board.name,
        squareIds,
        materials: summary.materials,
        qp: summary.qp,
      };
    })
    .filter((entry): entry is ClassScoreNeedBreakdown => entry !== null);
}

export function getAvailableSquareIds(
  board: ClassBoard,
  state: ClassScoreBoardState
): Set<number> {
  const unlocked = new Set(state.unlockedSquareIds);
  const available = new Set<number>();
  for (const square of board.squares) {
    if (unlocked.has(square.id)) continue;
    if (square.flags.includes('start')) {
      available.add(square.id);
      continue;
    }
    const incoming = board.lines.filter((line) => line.nextSquareId === square.id);
    if (incoming.some((line) => unlocked.has(line.prevSquareId))) {
      available.add(square.id);
    }
  }
  return available;
}

export function getSquareTone(
  square: ClassBoardSquare,
  selectedSquareId: number | null,
  unlockedIds: Set<number>,
  targetIds: Set<number>,
  requiredIds: Set<number>,
  availableIds: Set<number>
): 'selected' | 'unlocked' | 'target' | 'required' | 'available' | 'lock' | 'blank' | 'default' {
  if (square.id === selectedSquareId) return 'selected';
  if (unlockedIds.has(square.id)) return 'unlocked';
  if (targetIds.has(square.id)) return 'target';
  if (requiredIds.has(square.id)) return 'required';
  if (availableIds.has(square.id)) return 'available';
  if (square.skillType === 'lock') return 'lock';
  if (square.flags.includes('blank')) return 'blank';
  return 'default';
}

function getSquareCostValue(square: ClassBoardSquare): number {
  return (
    square.qp / 500_000 +
    square.items.reduce((sum, item) => sum + item.amount, 0) +
    (square.skillType === 'lock' ? 5 : 0)
  );
}

function collectAllPrerequisites(
  targetSquareId: number,
  unlocked: Set<number>,
  incoming: Map<number, { prevSquareId: number; lineId: number }[]>
): ClassScoreRoute {
  const visited = new Set<number>();
  const lineIds = new Set<number>();

  function visit(squareId: number): void {
    if (visited.has(squareId) || unlocked.has(squareId)) return;
    visited.add(squareId);
    for (const edge of incoming.get(squareId) ?? []) {
      lineIds.add(edge.lineId);
      visit(edge.prevSquareId);
    }
  }

  visit(targetSquareId);
  return {
    squareIds: [...visited],
    lineIds: [...lineIds],
  };
}
