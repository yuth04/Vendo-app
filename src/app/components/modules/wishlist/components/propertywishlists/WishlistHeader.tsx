"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
    count: number;
    isInitialLoading: boolean;
    onBack: () => void;
}

export default function WishlistHeader({ count, isInitialLoading, onBack }: Props) {
    return (
        <div className="flex flex-col mb-8 w-full">
            {/* Top row: Breadcrumbs and Item Counter */}
            <div className="flex items-center justify-between w-full">
                <nav className="flex items-center gap-2 text-[14px] font-black tracking-[0.2em] uppercase text-[var(--header-text)] ">
                    <Link href="/" className="text-[var(--header-text)] cursor-pointer transition-colors">Home</Link>
                    <span className="text-[var(--header-text)] ">/</span>
                    <p className="text-[var(--header-text)] transition-colors">Wishlist</p>
                </nav>

                {!isInitialLoading && count > 0 && (
                    <span className="text-sm font-semibold text-gray-500">
                        {count} {count === 1 ? "item" : "items"}
                    </span>
                )}
            </div>

            {/* Bottom row: Heading Title Block - ONLY shows when users have added items to favorites */}
            {!isInitialLoading && count > 0 && (
                <div className="flex items-center py-6 gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 md:p-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center card-theme rounded-full border border-transparent custom-main-color-border-hover transition-all cursor-pointer active:scale-90"
                    >
                        <ArrowLeft size={30} className="text-[var(--header-text)]"/>
                    </button>
                    <h1 className="text-[24px] sm:text-[30px] md:text-[32px] lg:text-[36px] font-bold custom-main-color-text">
                        My Wishlist
                    </h1>
                </div>
            )}
        </div>
    );
}