import type { ReactNode } from 'react';
import { useUserState } from '@/hooks/useUserState';
import { UserStateContext } from '@/contexts/user-state-context';

export function UserStateProvider({ children }: { children: ReactNode }) {
  const value = useUserState();
  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
}
