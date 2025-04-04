import apiClient from './client';
import { UserRole } from '../types/user';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    address: string;
    phoneNumber: string;
    // Volunteer fields
    age?: number;
    // Organization fields
    description?: string;
    logo?: string;
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
  logo?: string;
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
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  sendVerificationCode: async (data: ForgotPasswordData): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  verifyCode: async (data: VerifyCodeData): Promise<void> => {
    await apiClient.post('/auth/verify-code', data);
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  googleLogin: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/google', { token });
    return response.data;
  },

  facebookLogin: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/facebook', { token });
    return response.data;
  },
}; 