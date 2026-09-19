"use client"

import React from 'react'

export default function NotificationEmptyState() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <svg
                className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            ><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                No Notifications !
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-[240px]">
                You have no new alerts right now.
            </p>
        </div>
    )
}