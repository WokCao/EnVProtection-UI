import apiClient from './client';
import { User, UserRole } from '../types/user';

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
    } catch (error: any) {
      throw new Error('Invalid token');
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.put('/users/me/password', data);
  },
}; 