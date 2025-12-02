export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  tokenRefresh: string;
}

export interface User {
  id: string;
  username: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expireRefreshToken: string; // Backend usa "expireRefreshToken", não "expiration"
}

export interface LoginResponse {
  user: User;
  auth: TokenResponse; // Backend usa "auth", não "token"
}

export interface ApiResponse<T> {
  valid: boolean;
  message: string;
  data: T;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
    REFRESH_TOKEN: string;
    REVOKE: string;
  };
  STORAGE_KEYS: {
    ACCESS_TOKEN: string;
    REFRESH_TOKEN: string;
    USER: string;
  };
  DEBUG?: boolean;
}
