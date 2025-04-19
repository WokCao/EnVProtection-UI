import apiClient from './client';
import { UserRole } from '../types/user';
import axios from 'axios';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    address: string;
    phoneNumber: string;
    avatar: string;
    createdAt: Date;
    // Volunteer fields
    age?: number;
    // Organization fields
    description?: string;
    website?: string;
    foundedDate?: Date;
  };
}

interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  address: string;
  phoneNumber: string;
  // Volunteer fields
  age?: number;
  // Organization fields
  description?: string;
  avatar?: string;
  website?: string;
  foundedDate?: Date;
}

interface ForgotPasswordData {
  email: string;
}

interface VerifyCodeData {
  email: string;
  code: string;
}

interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to login. Please try again!');
      }
      throw new Error('An unexpected error occurred during login.');
    }
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to register. Please try again!');
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  },

  
  logout: async (accessToken: string | null, refreshToken: string | null): Promise<void> => {
    try {
      await apiClient.delete('/auth/sessions/current', {
        headers: {
          'Authorization': accessToken || '',
          'X-Stack-GreenFuture-Refresh-Token': refreshToken || ''
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to logout. Please try again!');
      }
      throw new Error('An unexpected error occurred during logout.');
    }
  },


  sendVerificationCode: async (data: ForgotPasswordData): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to send verification code.');
      }
      throw new Error('An unexpected error occurred while sending verification code.');
    }
  },

  verifyCode: async (data: VerifyCodeData): Promise<void> => {
    try {
      await apiClient.post('/auth/verify-code', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Code verification failed.');
      }
      throw new Error('An unexpected error occurred during code verification.');
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Password reset failed. Please try again.');
      }
      throw new Error('An unexpected error occurred during password reset.');
    }
  },

  googleLogin: async (token: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/google', { token });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Google login failed.');
      }
      throw new Error('An unexpected error occurred during Google login.');
    }
  },

  facebookLogin: async (token: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/facebook', { token });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Facebook login failed.');
      }
      throw new Error('An unexpected error occurred during Facebook login.');
    }
  },
}; 