import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import { api } from './api.service';
import {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  LoginResponse,
  User,
} from '../types/auth.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {

      const response = await api.post<ApiResponse<LoginResponse>>(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data.valid && response.data.data) {
        const { user, auth } = response.data.data;
        await this.saveAuthData(user, auth.accessToken, auth.refreshToken);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  }

  async logout(username: string): Promise<void> {
    try {
      await api.post(`${API_CONFIG.ENDPOINTS.REVOKE}/${username}`);
    } catch (error) {
    } finally {
      await this.clearAuthData();
    }
  }

  async saveAuthData(user: User, accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user)],
      [API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
  }

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      API_CONFIG.STORAGE_KEYS.USER,
      API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
      API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  }

  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  }

  async getStoredRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export const authService = new AuthService();
