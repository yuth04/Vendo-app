"use client";

import React from "react";

export default function WriteReviewPageSkeleton() {
    return (
        <div className="min-h-screen p-4 md:py-8 space-y-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="max-w-4xl mx-auto h-64 rounded-[40px] bg-gray-100 animate-pulse" />
            ))}
        </div>
    );
}