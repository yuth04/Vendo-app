"use client"

import React from 'react'
import Link from 'next/link'
import {ShoppingBag, User, Bell, Trash2, MessageCircle, Ticket, Percent} from 'lucide-react'
import { NotificationItem } from "@/src/app/components/modules/notifications/core/models/notificationModel"

export const getNotificationConfig = (iconType: string) => {
    switch (iconType) {
        case 'shopping-bag':
            return {
                iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                Icon: ShoppingBag
            }
        case 'chat':
            return {
                iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
                iconColor: 'text-indigo-600 dark:text-indigo-400',
                Icon: MessageCircle
            }
        case 'discount':
            return {
                iconBg: 'bg-rose-50 dark:bg-rose-950/30',
                iconColor: 'text-rose-600 dark:text-rose-400',
                Icon: Percent
            }
        case 'user':
            return {
                iconBg: 'bg-sky-50 dark:bg-sky-950/30',
                iconColor: 'text-sky-600 dark:text-sky-400',
                Icon: User
            }
        default:
            return {
                iconBg: 'bg-gray-100 dark:bg-zinc-800/50',
                iconColor: 'text-gray-500 dark:text-gray-400',
                Icon: Bell
            }
    }
}

interface NotificationRowProps {
    notification: NotificationItem
    isDeleting: boolean
    onMarkAsRead: (notification: NotificationItem) => void
    onDelete: (e: React.MouseEvent, id: number) => void
    setCartOpen: (open: boolean) => void
}

const NotificationRow = React.memo(function NotificationRow({
                                                                notification,
                                                                isDeleting,
                                                                onMarkAsRead,
                                                                onDelete,
                                                                setCartOpen
                                                            }: NotificationRowProps) {
    const { iconBg, iconColor, Icon } = getNotificationConfig(notification.icon)

    const handleCardClick = () => {
        onMarkAsRead(notification)
        setCartOpen(false)
    }

    return (
        <Link
            href={notification.url || '#'}
            onClick={handleCardClick}
            className="relative flex items-start gap-4 px-4 py-3 border-b border-gray-300/50 last:border-0 hover:bg-gray-200/60 hver-card-theme hover:rounded-[10px] transition-colors cursor-pointer group select-none block text-inherit no-underline"
        >
            <div className="flex w-full items-start gap-4">
                <div className="w-2 flex justify-center pt-5 shrink-0">
                    {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={24} className={iconColor} />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-[16px] font-bold text-[var(--header-text)] leading-snug mb-0.5">
                        {notification.title}
                    </h4>
                    <p className="text-[14px] text-gray-500 font-normal leading-normal mb-1 break-words">
                        {notification.message}
                    </p>
                    <span className="text-[12px] text-gray-500 font-medium">
                        {notification.created_at_human}
                    </span>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(e, notification.id)
                }}
                disabled={isDeleting}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer z-10"
            >
                <Trash2 size={14} />
            </button>
        </Link>
    )
})

export default NotificationRow