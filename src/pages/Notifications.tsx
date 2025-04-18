import { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { Notification as NotificationObject } from '../types/notification';
import { BellIcon } from '@heroicons/react/16/solid';
import { Link } from 'react-router-dom';

export default function Notifications() {
    const { user } = useAuthStore();
    const {
        notifications,
        isLoading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotificationStore();

    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadNotifications();
    }, [filter, page]);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value as 'all' | 'unread');
    };

    const filteredNotifications = notifications.filter(notification =>
        filter === 'all' || !notification.isRead
    );

    const paginatedNotifications = filteredNotifications.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread Only</option>
                    </select>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
            ) : paginatedNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg ${notification.isRead ? 'bg-white' : 'bg-green-50'
                                } border border-gray-200`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src={notification.avatarUrl || '/default-avatar.png'}
                                        alt="Organization"
                                        className="h-10 w-10 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <Link to={`/projects/${notification.projectId}`} className="flex-1">
                                            <p className="text-sm text-gray-900">
                                                {getNotificationMessage(notification)}
                                            </p>
                                        </Link>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="text-sm text-green-600 hover:text-green-700 z-10"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 