import { axiosInstance } from '../../../services/api';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'system';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export const notificationAPI = {
    getNotifications: async (): Promise<AppNotification[]> => {
        const response = await axiosInstance.get<{ success: boolean; data: AppNotification[] }>('/notifications');
        return response.data.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await axiosInstance.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await axiosInstance.put('/notifications/read-all');
    }
};
