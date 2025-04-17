import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/16/solid';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { Notification as NotificationObject } from '../types/notification';
import { useClickOutside } from '../hooks/useClickOutside';

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    updateUnreadCount,
  } = useNotificationStore();

  useClickOutside(notificationRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Update unread count periodically
    const interval = setInterval(updateUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    if (notification.projectId) {
      navigate(`/projects/${notification.projectId}`);
    }
    setIsOpen(false);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  const getNotificationMessage = (notification: NotificationObject) => {
    if (!notification.projectName) return 'No project name';

    switch (notification.type) {
      case 'PROJECT_FORCE_TO_QUIT':
        return (
          <span>
            You have been removed from <span className="font-bold">{notification.projectName}</span>
          </span>
        );
      case 'PROJECT_UPDATE':
        return (
          <span>
            <span className="font-bold">{notification.projectName}</span> has just been updated
          </span>
        );
      case 'PROJECT_JOIN':
        return (
          <span>
            {user?.role === 'ORGANIZATION' ? (
              <>
                <span className="font-bold">{notification.projectName}</span> has a new volunteer
              </>
            ) : (
              <>
                You have joined <span className="font-bold">{notification.projectName}</span>
              </>
            )}
          </span>
        );
      case 'PROJECT_QUIT':
        return (
          <span>
            {user?.role === 'ORGANIZATION' ? (
              <>
                <span className="font-bold">{notification.projectName}</span> has a volunteer left
              </>
            ) : (
              <>
                You have left <span className="font-bold">{notification.projectName}</span>
              </>
            )}
          </span>
        );
      default:
        return 'No message';
    }
  };

  return (
    <div className="relative !ml-0" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 focus:outline-none"
        title="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {notifications.length > 0 && notifications.some((n) => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">No notifications</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-lg cursor-pointer ${notification.isRead
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-green-50 hover:bg-green-100'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={notification.avatarUrl || '/default-avatar.png'}
                          alt={'Organization'}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-900">
                            {getNotificationMessage(notification)}
                          </p>
                          {!notification.isRead && (
                            <span className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm text-green-600 hover:text-green-700"
              >
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 