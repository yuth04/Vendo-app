"use client"

import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { NotificationItem } from "@/src/app/components/modules/notifications/core/models/notificationModel"
import NotificationEmptyState from "@/src/app/components/modules/notifications/components/ Notificationemptystate";
import NotificationRow from "@/src/app/components/modules/notifications/components/Notificationrow";


const VISIBLE_LIMIT = 6

interface NotificationListProps {
    isLoading: boolean
    errorMessage: string | null
    notifications: NotificationItem[]
    showAll: boolean
    deletingIds: Set<number>
    onToggleShowAll: () => void
    onMarkAsRead: (notification: NotificationItem) => void
    onDelete: (e: React.MouseEvent, id: number) => void
    setCartOpen: (open: boolean) => void // 👈 1. Added type verification configuration
}

export default function NotificationList({
                                             isLoading,
                                             errorMessage,
                                             notifications,
                                             showAll,
                                             deletingIds,
                                             onToggleShowAll,
                                             onMarkAsRead,
                                             onDelete,
                                             setCartOpen
                                         }: NotificationListProps) {
    const visibleNotifications = showAll ? notifications : notifications.slice(0, VISIBLE_LIMIT)
    const hasMore = notifications.length > VISIBLE_LIMIT

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"/>
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className="h-full flex items-center justify-center p-6 text-center text-sm text-red-500">
                {errorMessage}
            </div>
        )
    }

    if (notifications.length === 0) {
        return <NotificationEmptyState />
    }

    return (
        <>
            {visibleNotifications.map((notification) => (
                <NotificationRow
                    key={notification.id}
                    notification={notification}
                    isDeleting={deletingIds.has(notification.id)}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    setCartOpen={setCartOpen}
                />
            ))}

            {hasMore && (
                <div className="px-4 py-3 flex justify-center">
                    <button
                        onClick={onToggleShowAll}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp size={14} />
                                Show less
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} />
                                Show {notifications.length - VISIBLE_LIMIT} more
                            </>
                        )}
                    </button>
                </div>
            )}
        </>
    )
}