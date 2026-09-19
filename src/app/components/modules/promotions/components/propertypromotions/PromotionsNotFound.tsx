"use client";

import React from "react";
import Image from "next/image";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";

interface Props {
    count?: number;
}

export default function PromotionsNotFound({ count = 4 }: Props) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array(count).fill(0).map((_, i) => (
                <div key={`skeleton-${i}`}
                     className="flex flex-col gap-3 rounded-[2rem] border-2 card-theme p-4 bg-[var(--header-bg)]">
                    <div
                        className="bg-gray-100 aspect-[4/5] rounded-[30px] w-full flex flex-col items-center justify-center p-4 card-theme">
                        <div
                            className="relative w-20 h-20 bg-gray-100 mb-6 rounded-full flex items-center justify-center input-theme">
                            <Image src={Notfound} alt="Empty" width={40} height={40} className="opacity-30 grayscale"/>
                        </div>
                        <div className="space-y-3 text-center">
                            <h3 className="text-xl font-extrabold text-gray-400 tracking-tight">Products Not Found</h3>
                            <p className="text-[13px] text-gray-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                                There are no products available for this category yet.
                            </p>
                        </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-[30px] w-1/4 animate-pulse input-theme"/>
                    <div className="h-4 bg-gray-200 rounded-[30px] w-4/4 animate-pulse input-theme"/>
                    <div className="h-4 bg-gray-200 rounded-[30px] w-2/4 animate-pulse input-theme"/>
                </div>
            ))}
        </div>
    );
}