'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import DefaultNotFound from '@/src/app/components/assets/icons/main-icon/data-not-found.png';

interface NotFoundProps {
    title?: string;
    description?: string;
    imageSrc?: string | StaticImageData;
}

export default function NotFound({
                                     title = "No properties found",
                                     description = "We couldn't find any results for this category. Try exploring other options.",
                                     imageSrc = DefaultNotFound,
                                 }: NotFoundProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center p-8 sm:p-16 border border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-[2.5rem] bg-[var(--header-bg)] min-h-[260px] sm:min-h-[340px]">
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
        </div>
    );
}