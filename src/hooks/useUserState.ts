import { useReducer, useEffect, useState } from 'react';
import type {
  ClassScoreBoardState,
  PlanningSettings,
  ServantRosterState,
  TargetPreset,
  UserState,
  ServantLevels,
} from '@/types/user-state';
import { createDefaultState, loadUserState, migrateUserState, saveUserState } from '@/utils/storage';
import { applyTargetPreset, getDefaultLevels } from '@/utils/servant-levels';

type Action =
  | { type: 'SET_SERVANT_LEVELS'; collectionNo: number; levels: ServantLevels }
  | { type: 'RESET_SERVANT'; collectionNo: number }
  | { type: 'RESET_ALL' }
  | { type: 'SET_INVENTORY_ITEM'; itemId: number; amount: number }
  | { type: 'SET_INVENTORY_BULK'; items: Record<number, number>; mode: 'replace' | 'add' }
  | { type: 'SET_ROSTER_ENTRY'; collectionNo: number; roster: Partial<ServantRosterState> }
  | { type: 'SET_PLANNING'; planning: Partial<PlanningSettings> }
  | { type: 'SET_CLASS_SCORE_BOARD'; boardId: number; board: Partial<ClassScoreBoardState> }
  | { type: 'APPLY_PRESET_TO_CONFIGURED'; preset: TargetPreset }
  | { type: 'IMPORT_STATE'; state: UserState };

function reducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case 'SET_SERVANT_LEVELS':
      return {
        ...state,
        servants: {
          ...state.servants,
          [action.collectionNo]: action.levels,
        },
      };
    case 'RESET_SERVANT': {
      const { [action.collectionNo]: _, ...rest } = state.servants;
      void _;
      return { ...state, servants: rest };
    }
    case 'RESET_ALL':
      return {
        ...state,
        servants: {},
      };
    case 'SET_INVENTORY_ITEM':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [action.itemId]: action.amount,
        },
      };
    case 'SET_INVENTORY_BULK': {
      const inventory =
        action.mode === 'replace' ? { ...state.inventory } : { ...state.inventory };
      for (const [itemId, amount] of Object.entries(action.items)) {
        const key = Number(itemId);
        const nextAmount =
          action.mode === 'add' ? (inventory[key] ?? 0) + amount : amount;
        inventory[key] = Math.max(0, Math.floor(nextAmount));
      }
      return { ...state, inventory };
    }
    case 'SET_ROSTER_ENTRY':
      return {
        ...state,
        roster: {
          ...state.roster,
          [action.collectionNo]: mergeRosterEntry(
            state.roster[action.collectionNo],
            action.roster
          ),
        },
      };
    case 'SET_PLANNING':
      return {
        ...state,
        planning: {
          ...state.planning,
          ...action.planning,
        },
      };
    case 'SET_CLASS_SCORE_BOARD':
      return {
        ...state,
        classScore: {
          ...state.classScore,
          [action.boardId]: mergeClassScoreBoardState(
            state.classScore[action.boardId],
            action.board
          ),
        },
      };
    case 'APPLY_PRESET_TO_CONFIGURED': {
      const servants = Object.fromEntries(
        Object.entries(state.servants).map(([collectionNo, levels]) => [
          collectionNo,
          applyTargetPreset(levels ?? getDefaultLevels(), action.preset),
        ])
      );
      return { ...state, servants };
    }
    case 'IMPORT_STATE':
      return migrateUserState(action.state);
    default:
      return state;
  }
}

function uniqueSortedIds(ids: number[] | undefined): number[] {
  return [...new Set((ids ?? []).map((id) => Math.floor(Number(id))).filter((id) => id > 0))]
    .sort((a, b) => a - b);
}

function mergeClassScoreBoardState(
  current: Partial<ClassScoreBoardState> | undefined,
  update: Partial<ClassScoreBoardState>
): ClassScoreBoardState {
  return {
    unlockedSquareIds: update.unlockedSquareIds
      ? uniqueSortedIds(update.unlockedSquareIds)
      : uniqueSortedIds(current?.unlockedSquareIds),
    targetSquareIds: update.targetSquareIds
      ? uniqueSortedIds(update.targetSquareIds)
      : uniqueSortedIds(current?.targetSquareIds),
  };
}

function mergeRosterEntry(
  current: Partial<ServantRosterState> | undefined,
  update: Partial<ServantRosterState>
): ServantRosterState {
  return {
    owned: update.owned ?? current?.owned ?? false,
    npLevel: update.npLevel ?? current?.npLevel ?? 1,
    bondLevel: update.bondLevel ?? current?.bondLevel ?? 0,
    coins: update.coins ?? current?.coins ?? 0,
    priority: update.priority ?? current?.priority ?? 0,
  };
}

export function useUserState() {
  const [state, dispatch] = useReducer(reducer, undefined, createDefaultState);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      dispatch({ type: 'IMPORT_STATE', state: loadUserState() });
      setStorageLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (storageLoaded) saveUserState(state);
  }, [state, storageLoaded]);

  return { state, dispatch } as const;
}
