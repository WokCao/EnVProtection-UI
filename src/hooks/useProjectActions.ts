import { useState } from 'react';
import { projectsApi } from '../api/projects';
import { notificationsApi } from '../api/notifications';
import { useNotificationStore } from '../store/notificationStore';

export function useProjectActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUnreadCount } = useNotificationStore();

  const handleProjectAction = async (
    action: 'join' | 'quit',
    projectId: string,
    onSuccess?: () => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we can send a notification
      // const { canSend, reason } = await notificationsApi.canSendNotification(
      //   action === 'join' ? 'PROJECT_JOIN' : 'PROJECT_QUIT',
      //   projectId
      // );

      // if (!canSend) {
      //   setError(reason || 'Action temporarily unavailable. Please try again later.');
      //   return;
      // }

      // Perform the action
      if (action === 'join') {
        await projectsApi.joinProject(projectId);
      } else {
        await projectsApi.quitProject(projectId);
      }

      // Update notification count
      await updateUnreadCount();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} project`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleProjectAction,
    isLoading,
    error,
  };
} 