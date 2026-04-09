import { useReducer, useEffect } from 'react';
import type { UserState, ServantLevels } from '@/types/user-state';
import { loadUserState, saveUserState } from '@/utils/storage';

type Action =
  | { type: 'SET_SERVANT_LEVELS'; collectionNo: number; levels: ServantLevels }
  | { type: 'RESET_SERVANT'; collectionNo: number }
  | { type: 'SET_INVENTORY_ITEM'; itemId: number; amount: number }
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
    case 'SET_INVENTORY_ITEM':
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [action.itemId]: action.amount,
        },
      };
    case 'IMPORT_STATE':
      return action.state;
    default:
      return state;
  }
}

export function useUserState() {
  const [state, dispatch] = useReducer(reducer, null, loadUserState);

  useEffect(() => {
    saveUserState(state);
  }, [state]);

  return { state, dispatch } as const;
}
