import { AuthService, LoginRequest, LoginResponse } from '@/services/authService';
import { logger } from '@/utils/logger/logger';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: LoginResponse | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const isAuth = await AuthService.isAuthenticated();
      const user = isAuth ? await AuthService.getAuthData() : null;
      setAuthState({ isAuthenticated: isAuth, isLoading: false, user });
    } catch (error) {
      logger.error('Error al verificar autenticación:', error);
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await AuthService.login(credentials);

      if ('access_token' in result) {
        setAuthState({ isAuthenticated: true, isLoading: false, user: result });
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.message };
      }
    } catch (error) {
      logger.error('Error en login:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await AuthService.logout();
    } catch (error) {
      logger.error('Error en logout:', error);
    } finally {
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
