import { createContext } from 'react';
import type { useUserState } from '@/hooks/useUserState';

export type UserStateContextType = ReturnType<typeof useUserState>;

export const UserStateContext = createContext<UserStateContextType | null>(null);
