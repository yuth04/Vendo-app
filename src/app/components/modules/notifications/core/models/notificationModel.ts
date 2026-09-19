export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    icon: 'shopping-bag' | 'user' | 'chat'| 'discount' | string;
    url: string;
    is_read: boolean;
    created_at: string;
    created_at_human: string;
}

export interface NotificationResponse {
    message: string;
    data: NotificationItem[];
}