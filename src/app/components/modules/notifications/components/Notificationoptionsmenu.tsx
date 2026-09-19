"use client"

import React from 'react'
import { Check, MessageCircle } from 'lucide-react'

interface NotificationOptionsMenuProps {
    isMarkingAll: boolean
    unreadCount: number
    onMarkAllAsRead: () => void
}

export default function NotificationOptionsMenu({
                                                    isMarkingAll,
                                                    unreadCount,
                                                    onMarkAllAsRead
                                                }: NotificationOptionsMenuProps) {
    return (
        <div className="absolute right-0 top-11 w-56 card-theme rounded-2xl  shadow-xl py-1.5 z-10">
            <button
                onClick={onMarkAllAsRead}
                disabled={isMarkingAll || unreadCount === 0}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors shrink-0 ${
                        unreadCount > 0
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-gray-400 dark:text-gray-500"
                    }`}>
                        <MessageCircle size={16} className={isMarkingAll ? "animate-spin" : ""} />
                    </span>
                    <span>{isMarkingAll ? "Marking..." : "Mark all as read"}</span>
                </span>
                {unreadCount === 0 &&
                    <Check size={16} className="text-blue-600 dark:text-blue-400"/>}
            </button>
        </div>
    )
}