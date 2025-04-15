import { create } from 'zustand';
import { UserRole } from '../types/user';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';

interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  address: string;
  phoneNumber: string;

  age?: number;

  description?: string;
  logo?: string;
  website?: string;
  foundedDate?: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  reloadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed' });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Registration failed' });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await authApi.logout(localStorage.getItem("accessToken"), localStorage.getItem("refreshToken"));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User) => {
    set({ user });
  },

  reloadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersApi.getProfile();
      set({ user: response, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Unauthorized' });
    } finally {
      set({ isLoading: false });
    }
  }
})); 