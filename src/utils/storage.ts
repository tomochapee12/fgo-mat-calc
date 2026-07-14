import type {
  ClassScoreBoardState,
  PlanningSettings,
  ServantRosterState,
  UserState,
} from '@/types/user-state';

const STORAGE_KEY = 'fgo-calc-state';
const CURRENT_VERSION = 3;

export function createDefaultPlanningSettings(): PlanningSettings {
  return {
    currentAp: 0,
    maxAp: 140,
    bronzeApples: 0,
    silverApples: 0,
    goldApples: 0,
    purePrisms: 0,
    qpOwned: 0,
    qpPerRun: 1_200_000,
    qpQuestAp: 40,
    qpBonusPercent: 0,
  };
}

function normalizeRosterEntry(value: Partial<ServantRosterState> | undefined): ServantRosterState {
  return {
    owned: Boolean(value?.owned),
    npLevel: clampInt(value?.npLevel, 1, 5, 1),
    bondLevel: clampInt(value?.bondLevel, 0, 15, 0),
    coins: Math.max(0, Math.floor(Number(value?.coins) || 0)),
    priority: clampInt(value?.priority, 0, 5, 0),
  };
}

function normalizeSquareIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .map((id) => Math.floor(Number(id)))
      .filter((id) => Number.isFinite(id) && id > 0)
  )].sort((a, b) => a - b);
}

function normalizeClassScoreEntry(
  value: Partial<ClassScoreBoardState> | undefined
): ClassScoreBoardState {
  return {
    unlockedSquareIds: normalizeSquareIds(value?.unlockedSquareIds),
    targetSquareIds: normalizeSquareIds(value?.targetSquareIds),
  };
}

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function createDefaultState(): UserState {
  return {
    servants: {},
    inventory: {},
    roster: {},
    classScore: {},
    planning: createDefaultPlanningSettings(),
    version: CURRENT_VERSION,
  };
}

export function migrateUserState(value: unknown): UserState {
  if (!value || typeof value !== 'object') return createDefaultState();

  const parsed = value as Partial<UserState>;
  const defaults = createDefaultState();

  const rosterEntries = Object.entries(parsed.roster ?? {}).map(
    ([collectionNo, roster]) => [
      collectionNo,
      normalizeRosterEntry(roster as Partial<ServantRosterState>),
    ]
  );
  const classScoreEntries = Object.entries(parsed.classScore ?? {}).map(
    ([boardId, boardState]) => [
      boardId,
      normalizeClassScoreEntry(boardState as Partial<ClassScoreBoardState>),
    ]
  );

  return {
    servants: parsed.servants ?? defaults.servants,
    inventory: parsed.inventory ?? defaults.inventory,
    roster: Object.fromEntries(rosterEntries),
    classScore: Object.fromEntries(classScoreEntries),
    planning: normalizePlanningSettings(parsed.planning, defaults.planning),
    version: CURRENT_VERSION,
  };
}

function normalizePlanningSettings(
  value: Partial<PlanningSettings> | undefined,
  defaults: PlanningSettings
): PlanningSettings {
  return {
    currentAp: Math.max(0, Math.floor(Number(value?.currentAp) || defaults.currentAp)),
    maxAp: Math.max(1, Math.floor(Number(value?.maxAp) || defaults.maxAp)),
    bronzeApples: Math.max(0, Math.floor(Number(value?.bronzeApples) || defaults.bronzeApples)),
    silverApples: Math.max(0, Math.floor(Number(value?.silverApples) || defaults.silverApples)),
    goldApples: Math.max(0, Math.floor(Number(value?.goldApples) || defaults.goldApples)),
    purePrisms: Math.max(0, Math.floor(Number(value?.purePrisms) || defaults.purePrisms)),
    qpOwned: Math.max(0, Math.floor(Number(value?.qpOwned) || defaults.qpOwned)),
    qpPerRun: Math.max(0, Math.floor(Number(value?.qpPerRun) || defaults.qpPerRun)),
    qpQuestAp: Math.max(0, Math.floor(Number(value?.qpQuestAp) || defaults.qpQuestAp)),
    qpBonusPercent: Math.max(0, Math.floor(Number(value?.qpBonusPercent) || defaults.qpBonusPercent)),
  };
}

export function loadUserState(): UserState {
  if (typeof localStorage === 'undefined') return createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();

    return migrateUserState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

export function saveUserState(state: UserState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
