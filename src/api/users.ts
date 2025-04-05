import apiClient from './client';
import { User } from '../types/user';

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
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    console.log(data);
    const response = await apiClient.put<User>('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.put('/users/me/password', data);
  },
}; 