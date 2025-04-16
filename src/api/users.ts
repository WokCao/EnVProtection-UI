import apiClient from './client';
import { User, UserRole } from '../types/user';
import axios from 'axios';

interface GetProfileResponse {
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
}

interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  age?: number;

  description?: string;
  website?: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<GetProfileResponse>('/users/me');
      return response.data as User;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get user profile. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting user profile.');
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    try {
      const response = await apiClient.put<User>('/users/me', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to update profile. Please try again!');
      }
      throw new Error('An unexpected error occurred during updating profile.');
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      await apiClient.put('/users/me/password', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to change password. Please try again!');
      }
      throw new Error('An unexpected error occurred during changing password.');
    }
  },
}; 