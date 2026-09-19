"use client";

import React from "react";

export default function WishlistSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-[2rem] border-2 card-theme p-4">
                    <div className="animate-pulse bg-gray-200/50 aspect-square rounded-2xl w-full" />
                    <div className="px-2 space-y-3">
                        <div className="h-4 bg-gray-200 rounded-[20px] w-1/3 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded-[20px] w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded-[20px] w-1/2 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}