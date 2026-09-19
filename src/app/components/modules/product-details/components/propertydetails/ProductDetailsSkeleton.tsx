"use client";

import React from "react";

export default function ProductDetailsSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 flex gap-4">
                    <div className="flex flex-col gap-3">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="w-20 h-20 animate-pulse bg-gray-100 rounded-2xl" />
                        ))}
                    </div>
                    <div className="flex-1 animate-pulse bg-gray-100 rounded-3xl min-h-[500px]" />
                </div>
                <div className="lg:col-span-5 space-y-5 pt-4">
                    {[80, 60, 40, 90, 70, 50].map((w, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 h-5 rounded-xl" style={{ width: `${w}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}