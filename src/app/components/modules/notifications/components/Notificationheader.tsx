"use client"

import React, { RefObject } from 'react'
import { X, MoreHorizontal } from 'lucide-react'
import NotificationOptionsMenu from "@/src/app/components/modules/notifications/components/Notificationoptionsmenu";


interface NotificationHeaderProps {
    unreadCount: number
    optionsOpen: boolean
    optionsRef: RefObject<HTMLDivElement | null>
    isMarkingAll: boolean
    onToggleOptions: () => void
    onMarkAllAsRead: () => void
    onClose: () => void
}

export default function NotificationHeader({
                                               unreadCount,
                                               optionsOpen,
                                               optionsRef,
                                               isMarkingAll,
                                               onToggleOptions,
                                               onMarkAllAsRead,
                                               onClose
                                           }: NotificationHeaderProps) {
    return (
        <div className="p-5 flex items-center justify-between border-b border-gray-200/50">
            <div className="flex items-center gap-2.5 text-gray-900">
                <h3 className="text-lg font-bold text-[var(--header-text)]">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        {unreadCount} New
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* More Options Trigger */}
                <div className="relative" ref={optionsRef}>
                    <button
                        onClick={onToggleOptions}
                        className="w-9 h-9 rounded-full card-theme flex items-center justify-center text-gray-500 cursor-pointer"
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {optionsOpen && (
                        <NotificationOptionsMenu
                            isMarkingAll={isMarkingAll}
                            unreadCount={unreadCount}
                            onMarkAllAsRead={onMarkAllAsRead}
                        />
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full card-theme flex items-center justify-center text-gray-500 cursor-pointer"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}