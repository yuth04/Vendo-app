"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import { notificationService } from "@/src/app/components/modules/notifications/core/services/notificationService"
import { NotificationItem } from "@/src/app/components/modules/notifications/core/models/notificationModel"
import { useAlert } from "@/src/app/components/context/AlertContext"
import NotificationHeader from "@/src/app/components/modules/notifications/components/Notificationheader";
import NotificationList from "@/src/app/components/modules/notifications/components/Notificationlist";
import NotificationFooter from "@/src/app/components/modules/notifications/components/Notificationfooter";

interface NotificationDrawerProps {
    cartOpen: boolean
    setCartOpen: (open: boolean) => void
    userId?: string | number
}

export default function NotificationDrawer({ cartOpen, setCartOpen, userId }: NotificationDrawerProps) {
    const { showToast, showConfirm } = useAlert()

    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false)
    const [isClearingAll, setIsClearingAll] = useState<boolean>(false)
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
    const [showAll, setShowAll] = useState<boolean>(false)
    const [optionsOpen, setOptionsOpen] = useState<boolean>(false)

    const optionsRef = useRef<HTMLDivElement>(null)

    // 1. Lock body scroll on open
    useEffect(() => {
        let timeoutId: number;
        if (cartOpen) {
            timeoutId = window.requestAnimationFrame(() => {
                document.body.style.overflow = 'hidden'
            });
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            cancelAnimationFrame(timeoutId);
            document.body.style.overflow = ''
        }
    }, [cartOpen])

    // 2. Fetch notifications on open
    useEffect(() => {
        if (!cartOpen) return;

        const fetchLiveNotifications = async () => {
            setIsLoading(true)
            setErrorMessage(null)
            setShowAll(false)
            try {
                const response = await notificationService.getNotifications()
                if (response.error) {
                    setErrorMessage(response.error.message)
                } else if (response.data && Array.isArray(response.data.data)) {
                    setNotifications(response.data.data)
                } else if (response.data && Array.isArray((response.data as any).orders)) {
                    setNotifications((response.data as any).orders)
                } else {
                    console.warn("Data structure received unexpected format:", response.data)
                }
            } catch (err) {
                console.error("Error executing fetch live notifications:", err)
                setErrorMessage("An unexpected error occurred.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchLiveNotifications()
    }, [cartOpen])

    // 3. Real-Time Pusher Subscriptions
    useEffect(() => {
        const currentUserId = userId || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth_user") || "{}").id : null)
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

        if (!currentUserId || !cartOpen) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
            authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        const channelName = `private-user.${currentUserId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind('notification.received', (data: { notification: NotificationItem }) => {
            if (data && data.notification) {
                setNotifications(prev => {
                    const exists = prev.some(n => n.id === data.notification.id);
                    if (exists) return prev;
                    showToast(data.notification.message, "success");
                    return [data.notification, ...prev];
                });
            }
        });

        return () => {
            channel.unbind('notification.received');
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        }
    }, [userId, cartOpen, showToast])

    // 4. Click outside to dismiss context menus
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
                setOptionsOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // 5. Auth State listeners / Reset Data cleaners
    useEffect(() => {
        const resetOnLogout = () => {
            setNotifications([])
            setErrorMessage(null)
            setShowAll(false)
            setOptionsOpen(false)
            setIsLoading(false)
            setCartOpen(false)
        }

        window.addEventListener("auth:logout", resetOnLogout)

        const handleStorage = (e: StorageEvent) => {
            if ((e.key === "auth_token" || e.key === "auth_user") && !e.newValue) {
                resetOnLogout()
            }
        }
        window.addEventListener("storage", handleStorage)

        let hadToken = typeof window !== "undefined" && !!localStorage.getItem("auth_token")
        const pollInterval = window.setInterval(() => {
            const hasToken = !!localStorage.getItem("auth_token")
            if (hadToken && !hasToken) {
                resetOnLogout()
            }
            hadToken = hasToken
        }, 1000)

        return () => {
            window.removeEventListener("auth:logout", resetOnLogout)
            window.removeEventListener("storage", handleStorage)
            window.clearInterval(pollInterval)
        }
    }, [setCartOpen])

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleMarkAsRead = useCallback(async (notification: NotificationItem) => {
        if (notification.is_read) return

        setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        )

        try {
            const response = await notificationService.markAsRead(notification.id)
            if (response.error) {
                console.error("Failed to mark notification as read:", response.error.message)
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: false } : n)
                )
            }
        } catch (err) {
            console.error("Error executing mark as read:", err)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: false } : n)
            )
        }
    }, [])

    const handleMarkAllAsRead = useCallback(async () => {
        setOptionsOpen(false)

        const currentUnread = notifications.filter(n => !n.is_read).length
        if (currentUnread === 0) return

        const previousNotifications = notifications
        setIsMarkingAll(true)

        // Optimistically update notifications to be read locally
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

        try {
            const response = await notificationService.markAllAsRead()
            if (response.error) {
                console.error("Failed to mark all notifications as read:", response.error.message)
                setNotifications(previousNotifications)
                showToast("Failed to mark all notifications as read.", "error")
            } else {
                // Triggers exactly 1 success alert safely outside the loop state setter cycle
                showToast("All notifications marked as read.", "success")
            }
        } catch (err) {
            console.error("Error executing mark all as read:", err)
            setNotifications(previousNotifications)
            showToast("Failed to mark all notifications as read.", "error")
        } finally {
            setIsMarkingAll(false)
        }
    }, [notifications, showToast])

    const handleDeleteNotification = useCallback(async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()

        const confirmed = await showConfirm({
            title: "Delete notification?",
            message: "This notification will be permanently removed.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger",
        })
        if (!confirmed) return

        setDeletingIds(prevIds => {
            if (prevIds.has(id)) return prevIds
            return new Set(prevIds).add(id)
        })

        setNotifications(prev => prev.filter(n => n.id !== id))

        try {
            const response = await notificationService.deleteNotification(id)
            if (response.error) {
                console.error("Failed to delete notification:", response.error.message)
                const recovery = await notificationService.getNotifications()
                if (recovery.data && Array.isArray(recovery.data.data)) {
                    setNotifications(recovery.data.data)
                }
                showToast("Failed to delete notification.", "error")
            } else {
                showToast("Notification deleted successfully.", "success")
            }
        } catch (err) {
            console.error("Error executing delete notification:", err)
            showToast("Failed to delete notification.", "error")
        } finally {
            setDeletingIds(prevIds => {
                const next = new Set(prevIds)
                next.delete(id)
                return next
            })
        }
    }, [showConfirm, showToast])

    const handleClearAll = useCallback(async () => {
        if (isClearingAll) return

        const confirmed = await showConfirm({
            title: "Clear all notifications?",
            message: "All notifications will be permanently removed. This action cannot be undone.",
            confirmLabel: "Clear all",
            cancelLabel: "Cancel",
            variant: "danger",
        })
        if (!confirmed) return

        const previousNotifications = notifications
        setNotifications([])
        setIsClearingAll(true)

        try {
            const response = await notificationService.deleteAllNotifications()
            if (response.error) {
                console.error("Failed to clear all notifications:", response.error.message)
                setNotifications(previousNotifications)
                showToast("Failed to clear notifications.", "error")
            } else {
                showToast("All notifications deleted successfully.", "success")
            }
        } catch (err) {
            console.error("Error executing clear all notifications:", err)
            setNotifications(previousNotifications)
            showToast("Failed to clear notifications.", "error")
        } finally {
            setIsClearingAll(false)
        }
    }, [isClearingAll, notifications, showConfirm, showToast])

    return (
        <>
            <div
                onClick={() => setCartOpen(false)}
                className={`fixed inset-0 z-[1100] bg-black/40 transition-opacity duration-200 ${
                    cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] card-theme border-l border-gray-200 z-[1101] shadow-2xl flex flex-col transition-transform duration-200 ease-out will-change-transform ${
                    cartOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <NotificationHeader
                    unreadCount={unreadCount}
                    optionsOpen={optionsOpen}
                    optionsRef={optionsRef}
                    isMarkingAll={isMarkingAll}
                    onToggleOptions={() => setOptionsOpen(prev => !prev)}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onClose={() => setCartOpen(false)}
                />

                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar card-theme">
                    <NotificationList
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                        notifications={notifications}
                        showAll={showAll}
                        deletingIds={deletingIds}
                        onToggleShowAll={() => setShowAll(prev => !prev)}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                        setCartOpen={setCartOpen}
                    />
                </div>

                {notifications.length > 0 && (
                    <NotificationFooter
                        isClearingAll={isClearingAll}
                        onClearAll={handleClearAll}
                    />
                )}
            </div>
        </>
    )
}