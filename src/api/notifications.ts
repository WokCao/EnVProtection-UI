import apiClient from './client';
import { NotificationResponse } from '../types/notification';

export const notificationsApi = {
  getNotifications: async (page = 1, limit = 10): Promise<NotificationResponse> => {
    const response = await apiClient.get<NotificationResponse>('/notifications', {
      params: { page, limit }
    });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  canSendNotification: async (type: string, projectId: string): Promise<{ canSend: boolean; reason?: string }> => {
    const response = await apiClient.get<{ canSend: boolean; reason?: string }>('/notifications/can-send', {
      params: { type, projectId }
    });
    return response.data;
  }
}; 