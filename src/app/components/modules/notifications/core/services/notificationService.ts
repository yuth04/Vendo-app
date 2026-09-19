'use client';

import { ApiResponse } from "@/src/app/components/services/utils/models";
import { notificationsClient } from "@/src/app/components/modules/notifications/core/api/notificationClient";
import { NotificationResponse } from "@/src/app/components/modules/notifications/core/models/notificationModel";


export const notificationService = {
    async getNotifications(signal?: AbortSignal): Promise<ApiResponse<NotificationResponse>> {
        try {
            const response = await notificationsClient.getNotifications();
            return {
                data: response,
                error: null,
                category: undefined,
                message: "Notifications fetched successfully",
                status: "success"
            };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to fetch notifications" },
                category: undefined,
                message: "",
                status: ""
            };
        }
    },

    async markAsRead(id: number | string): Promise<ApiResponse<any>> {
        try {
            const response = await notificationsClient.markAsRead(id);
            return {
                data: response,
                error: null,
                category: undefined,
                message: "Notification marked as read successfully",
                status: "success"
            };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to mark notification as read" },
                category: undefined,
                message: "",
                status: ""
            };
        }
    },

    async markAllAsRead(): Promise<ApiResponse<any>> {
        try {
            const response = await notificationsClient.markAllAsRead();
            return {
                data: response,
                error: null,
                category: undefined,
                message: "All notifications marked as read successfully",
                status: "success"
            };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to mark all notifications as read" },
                category: undefined,
                message: "",
                status: ""
            };
        }
    },

    async deleteNotification(id: number | string): Promise<ApiResponse<any>> {
        try {
            const response = await notificationsClient.deleteNotification(id);
            return {
                data: response,
                error: null,
                category: undefined,
                message: "Notification deleted successfully",
                status: "success"
            };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to delete notification" },
                category: undefined,
                message: "",
                status: ""
            };
        }
    },

    async deleteAllNotifications(): Promise<ApiResponse<any>> {
        try {
            const response = await notificationsClient.deleteAllNotifications();
            return {
                data: response,
                error: null,
                category: undefined,
                message: "All notifications deleted successfully",
                status: "success"
            };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to delete all notifications" },
                category: undefined,
                message: "",
                status: ""
            };
        }
    },
};