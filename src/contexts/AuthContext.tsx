import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import {
  LoginRequest,
  RegisterRequest,
  User,
  AuthState,
  ApiResponse,
  LoginResponse,
} from '../types/auth.types';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<ApiResponse<LoginResponse>>;
  register: (data: RegisterRequest) => Promise<ApiResponse<any>>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const [user, token, refreshToken] = await Promise.all([
        authService.getStoredUser(),
        authService.getStoredToken(),
        authService.getStoredRefreshToken(),
      ]);

      if (user && token && refreshToken) {
        setAuthState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await authService.login(credentials);

      if (response.valid && response.data) {
        const { user, auth } = response.data;
        setAuthState({
          user,
          token: auth.accessToken,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      return response;
    } catch (error: any) {
      console.error('Erro no AuthContext.login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        errorMessage = 'Erro de conexão. Verifique se a API está rodando e se a URL está correta.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Usuário ou senha inválidos';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        valid: false,
        message: errorMessage,
        data: null as any,
      };
    }
  };

  const register = async (data: RegisterRequest): Promise<ApiResponse<any>> => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return {
        valid: false,
        message: error?.response?.data?.message || 'Erro ao registrar usuário',
        data: null,
      };
    }
  };

  const logout = async () => {
    try {
      if (authState.user) {
        await authService.logout(authState.user.username);
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setAuthState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
