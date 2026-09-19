"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    isSearchMode: boolean;
    searchQuery: string;
    filteredCount: number;
    loading: boolean;
}

export default function ProductPageHeader({ isSearchMode, searchQuery, filteredCount, loading }: Props) {
    const router       = useRouter();
    const displayQuery = searchQuery.replace(/-/g, " ");

    return (
        <div className="mb-10 py-0 sm:py-4">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => {
                        if (isSearchMode || displayQuery) {
                            router.push("/products");
                        } else {
                            router.push("/");
                        }
                    }}
                    disabled={loading && !isSearchMode}
                    className={`p-1.5 md:p-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center card-theme rounded-full border border-transparent custom-main-color-border-hover transition-all cursor-pointer active:scale-90 touch-none ${loading ? "opacity-70" : ""}`}
                >
                    <ArrowLeft size={30} className="text-[var(--header-text)]" />
                </button>

                {isSearchMode ? (
                    <div className="w-full">
                        <h1 className="text-[24px] sm:text-[30px] md:text-[30px] lg:text-[36px] mt-2 sm:mt-4 font-black text-[var(--header-text)] uppercase tracking-tight leading-tight">
                            Results for{" "}
                            <span className="custom-main-color-text block sm:inline-block max-w-full break-all">
                                &ldquo;{displayQuery}&rdquo;
                            </span>
                        </h1>
                        <p className="text-[12px] sm:text-sm text-gray-400 mt-1 leading-relaxed flex items-center gap-1">
                            <span className="font-bold text-[18px] custom-main-color-text text-[var(--header-text)]">
                                {filteredCount}
                            </span>
                            <span>product{filteredCount !== 1 ? "s" : ""} found</span>
                            <span className="hidden sm:inline">
                                &nbsp;&mdash;&nbsp; Showing matches across names, descriptions, brands, and categories
                            </span>
                        </p>
                    </div>
                ) : (
                    <h1 className="text-[24px] sm:text-[30px] md:text-[30px] lg:text-[36px] font-black custom-main-color-text">
                        All Products
                    </h1>
                )}
            </div>
        </div>
    );
}