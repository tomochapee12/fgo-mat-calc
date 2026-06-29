import { useContext } from 'react';
import { UserStateContext } from '@/contexts/user-state-context';
import type { UserStateContextType } from '@/contexts/user-state-context';

export function useUserStateContext(): UserStateContextType {
  const ctx = useContext(UserStateContext);
  if (!ctx) {
    throw new Error('useUserStateContext must be used within UserStateProvider');
  }
  return ctx;
}
