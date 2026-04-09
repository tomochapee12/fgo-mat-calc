import type { UserState } from '@/types/user-state';

const STORAGE_KEY = 'fgo-calc-state';
const CURRENT_VERSION = 1;

function createDefaultState(): UserState {
  return {
    servants: {},
    inventory: {},
    version: CURRENT_VERSION,
  };
}

export function loadUserState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();

    const parsed: UserState = JSON.parse(raw);

    // Version migration (future-proofing)
    if (parsed.version < CURRENT_VERSION) {
      // Add migration logic here as versions increment
      parsed.version = CURRENT_VERSION;
    }

    return parsed;
  } catch {
    return createDefaultState();
  }
}

export function saveUserState(state: UserState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
