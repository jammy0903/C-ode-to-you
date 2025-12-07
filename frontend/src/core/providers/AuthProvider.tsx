/**
 * @file AuthProvider.tsx
 * @description Authentication context provider - exposes useAuth hook to component tree
 *
 * @principles
 * - SRP: ✅ Single responsibility: provide auth context to children
 * - Composition: ✅ Wraps useAuth hook in React Context
 * - DIP: ✅ Components depend on context, not hook directly
 *
 * @components
 * - AuthProvider: React.FC - Context provider wrapping useAuth
 *
 * @hooks
 * - useAuthContext(): AuthContextType - Access auth state from any component
 *
 * @context
 * - AuthContextType: ReturnType<typeof useAuth> - All auth state and actions
 *
 * @notes
 * - Must be used within QueryClientProvider (useAuth uses TanStack Query)
 * - Session restoration handled automatically by useAuth's useQuery
 */
import React, { createContext, useContext } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  // 초기 세션 복구는 useAuth hook에서 자동으로 처리됨

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

