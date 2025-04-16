import apiClient from './client';
import { NotificationResponse } from '../types/notification';
import axios from 'axios';

export const notificationsApi = {
  getNotifications: async (page = 1, limit = 10): Promise<NotificationResponse> => {
    try {
      const response = await apiClient.get<NotificationResponse>('/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get notifications. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting notifications.');
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to mark notification ${notificationId} as read. Please try again!`);
      }
      throw new Error('An unexpected error occurred during marking notification as read.');
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to mark all notifications as read. Please try again!');
      }
      throw new Error('An unexpected error occurred during marking all notifications as read.');
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get unread notifications count. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting unread notifications count.');
    }
  },

  canSendNotification: async (type: string, projectId: string): Promise<{ canSend: boolean; reason?: string }> => {
    try {
      const response = await apiClient.get<{ canSend: boolean; reason?: string }>('/notifications/can-send', {
        params: { type, projectId }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to check notification permission. Please try again!');
      }
      throw new Error('An unexpected error occurred during checking notification permission.');
    }
  }
}; 