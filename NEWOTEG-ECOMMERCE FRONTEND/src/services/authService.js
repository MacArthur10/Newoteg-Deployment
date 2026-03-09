// Auth Service - User authentication and registration
// Handles login, registration, and token management

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

const AUTH_STORAGE_KEY = 'newoteg_auth';

export const authService = {
  // ── Registration ──────────────────────────────────────────────
  async register(email, password, fullName, phone) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        fullName,
        phone,
      });

      // Store auth data
      const authData = {
        user: response.user,
        token: response.accessToken,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      apiClient.setToken(response.accessToken);

      return authData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // ── Login ─────────────────────────────────────────────────────
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Store auth data
      const authData = {
        user: response.user,
        token: response.accessToken,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      apiClient.setToken(response.accessToken);

      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // ── Logout ────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    apiClient.clearToken();
  },

  // ── Get Current User ──────────────────────────────────────────
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        apiClient.setToken(authData.token);
        return authData;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
    return null;
  },

  // ── Check if Authenticated ────────────────────────────────────
  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};

export default authService;
