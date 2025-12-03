import { ApiConfig } from '../types/auth.types';

export const API_CONFIG: ApiConfig = {
  BASE_URL: 'http://192.168.0.102:5000',
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    REVOKE: '/api/auth/revoke',
  },
  STORAGE_KEYS: {
    ACCESS_TOKEN: '@auth:access_token',
    REFRESH_TOKEN: '@auth:refresh_token',
    USER: '@auth:user',
  },
  DEBUG: true, // Habilita logs de debug
};
