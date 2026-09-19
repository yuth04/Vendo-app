import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get-post-update-delete ----//
    notifications:`${BASE_URL}/api/v1/notifications`,
    readall:`${BASE_URL}/api/v1/notifications/read-all`,
    markRead: (id: number | string) => `${BASE_URL}/api/v1/notifications/${id}`,
    deleteNotification: (id: number | string) => `${BASE_URL}/api/v1/notifications/delete/${id}`,
    deleteAll: `${BASE_URL}/api/v1/notifications/delete-all`,
};