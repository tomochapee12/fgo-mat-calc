import { createContext, useContext, type ReactNode } from 'react';
import { useUserState } from '@/hooks/useUserState';

type UserStateContextType = ReturnType<typeof useUserState>;

const UserStateContext = createContext<UserStateContextType | null>(null);

export function UserStateProvider({ children }: { children: ReactNode }) {
  const value = useUserState();
  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserStateContext(): UserStateContextType {
  const ctx = useContext(UserStateContext);
  if (!ctx) throw new Error('useUserStateContext must be used within UserStateProvider');
  return ctx;
}
