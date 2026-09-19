'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

type NotificationType = 'success' | 'error';

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<NotificationType>('success');
    const [isExiting, setIsExiting] = useState(false);

    // Track active timeout to prevent multi-click overlaps
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const hideNotification = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setMessage(null);
            setIsExiting(false);
        }, 300); // Shrunk exit transition timeout for a snappier feel
    }, []);

    const showNotification = useCallback((msg: string, t: NotificationType) => {
        // Clear any lingering auto-hide timer from a previous alert
        if (timerRef.current) clearTimeout(timerRef.current);

        setMessage(msg);
        setType(t);
        setIsExiting(false);

        timerRef.current = setTimeout(() => {
            hideNotification();
        }, 3000);
    }, [hideNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {message && (
                /* Positioned: Centered cleanly with safe side margins on mobile, corner-aligned on desktop scales */
                <div className={`
                    fixed top-24 left-4 right-4 sm:left-auto sm:top-28 sm:right-10 z-[1000] transition-all duration-300 ease-in-out
                    ${isExiting
                    ? 'opacity-0 scale-95 translate-y-[-10px]'
                    : 'opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-top-4'}
                `}>
                    {/* Size: Compact layout with highly rounded corners (40px / 2.5rem) and full width flexibility on small screens */}
                    <div className={`
                        flex items-center justify-between gap-3 px-4 py-3 rounded-[2.5rem] shadow-lg w-full sm:max-w-sm text-white
                        ${type === 'success'
                        ? 'bg-gradient-to-r from-[#C1D0A4] to-[#6B8A64]'
                        : 'bg-gradient-to-r from-red-400 to-red-500'}
                    `}>

                        {/* Flex container grouping icon and message text together */}
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Smaller Icon Section */}
                            <div className="flex-shrink-0 w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {type === 'success' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            </div>

                            {/* Compact readable text size (Using normal whitespace layout to break rows elegantly on narrow mobile) */}
                            <span className="text-sm font-semibold tracking-tight whitespace-normal break-words px-1">
                                {message}
                            </span>
                        </div>

                        {/* Minimal Close Button */}
                        <button
                            onClick={hideNotification}
                            className="flex-shrink-0 w-6 h-6 rounded-full bg-black/5 hover:bg-black/15 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};