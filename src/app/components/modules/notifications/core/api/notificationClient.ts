import { apiClient } from "@/src/app/components/services/api/apiClient";
import { NotificationResponse } from "@/src/app/components/modules/notifications/core/models/notificationModel";
import { ENDPOINTS } from "@/src/app/components/modules/notifications/core/api/endponints";

export const notificationsClient = {
    getNotifications: async (): Promise<NotificationResponse> => {
        const response = await apiClient.get(ENDPOINTS.notifications);
        if (response && 'data' in response) {
            return response as unknown as NotificationResponse;
        }

        return response as unknown as NotificationResponse;
    },

    markAsRead: async (id: number | string): Promise<any> => {
        const response = await apiClient.patch(ENDPOINTS.markRead(id), {});

        if (response && 'data' in response) {
            return response as unknown as any;
        }

        return response as unknown as any;
    },

    markAllAsRead: async (): Promise<any> => {
        const response = await apiClient.patch(ENDPOINTS.readall, {});

        if (response && 'data' in response) {
            return response as unknown as any;
        }

        return response as unknown as any;
    },

    deleteNotification: async (id: number | string): Promise<any> => {
        const response = await apiClient.delete(ENDPOINTS.deleteNotification(id));

        if (response && 'data' in response) {
            return response as unknown as any;
        }

        return response as unknown as any;
    },

    deleteAllNotifications: async (): Promise<any> => {
        const response = await apiClient.delete(ENDPOINTS.deleteAll);

        if (response && 'data' in response) {
            return response as unknown as any;
        }
        return response as unknown as any;
    },
};