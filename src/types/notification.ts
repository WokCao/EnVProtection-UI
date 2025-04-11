export type NotificationType = 'PROJECT_UPDATE' | 'PROJECT_JOIN' | 'PROJECT_QUIT';

export interface Notification {
  id: string;
  type: NotificationType;
  projectName: string;
  projectId?: string;
  createdAt: Date;
  isRead: boolean;
  avatarUrl?: string;
}

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
} 