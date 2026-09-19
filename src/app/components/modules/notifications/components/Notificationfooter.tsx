"use client"

import React from 'react'
import { Trash2 } from 'lucide-react'

interface NotificationFooterProps {
    isClearingAll: boolean
    onClearAll: () => void
}

export default function NotificationFooter({ isClearingAll, onClearAll }: NotificationFooterProps) {
    return (
        <div className="p-4 border-t border-gray-200/50">
            <button
                onClick={onClearAll}
                disabled={isClearingAll}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300/50 hover:border-red-400 text-xs font-semibold text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 size={14} />
                {isClearingAll ? "Clearing..." : "Clear all notifications"}
            </button>
        </div>
    )
}