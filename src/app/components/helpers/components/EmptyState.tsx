'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import DefaultNotFound from '@/src/app/components/assets/icons/main-icon/data-not-found.png';

// Standardized types for global reuse flexibility
interface EmptyStateProps {
    title?: string;
    description?: string;
    imageSrc?: string | StaticImageData;
    buttonText?: string;
    onAction?: () => void;
}

const RefreshIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);

export default function EmptyState({
                                       title = "No properties found",
                                       description = "We couldn't find any results for this category. Try exploring other options.",
                                       imageSrc = DefaultNotFound,
                                       buttonText = "Retry Connection",
                                       onAction
                                   }: EmptyStateProps) {

    // Default action triggers window refresh if no custom handler is supplied globally
    const handleDefaultAction = () => {
        if (onAction) {
            onAction();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 sm:p-16 border border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-[2.5rem] bg-[var(--header-bg)] min-h-[300px] sm:min-h-[400px]">
            {/* Squircle Icon Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 card-theme rounded-2xl flex items-center justify-center shadow-sm">
                <Image
                    src={imageSrc}
                    alt={title}
                    width={32}
                    height={32}
                    className="opacity-40 grayscale sm:w-10 sm:h-10 object-contain"
                />
            </div>

            {/* Typography Content */}
            <div className="mt-5 sm:mt-6 text-center max-w-sm space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--header-text)] tracking-tight">
                    {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-medium leading-relaxed px-4">
                    {description}
                </p>
            </div>

            {/* Action Button Section */}
            <div className="mt-6 sm:mt-8">
                <button
                    onClick={handleDefaultAction}
                    className="flex items-center justify-center gap-2.5 px-8 py-3.5 custom-main-color-button custom-main-color-button-hover active:scale-95 text-white rounded-full font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                >
                    <RefreshIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    <span>{buttonText}</span>
                </button>
            </div>
        </div>
    );
}