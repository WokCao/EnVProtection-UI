import { create } from 'zustand';
import { UserRole } from '../types/user';
import { authApi } from '../api/auth';

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
      console.log(response);
      localStorage.setItem('token', response.token);
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
      console.log(response);
      localStorage.setItem('token', response.token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Registration failed' });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User) => {
    set({ user });
  },
})); 