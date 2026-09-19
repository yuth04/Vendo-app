"use client";

import React from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { SortOrder } from "@/src/app/components/modules/categories/components/FilterSidebar";

interface Props {
    categoryName: string;
    slug: string | null;
    parentCategoryName?: string | null;
    parentSlug?: string | null;
    filteredCount: number;
    brandsCount: number;
    totalPages: number;
    selectedBrand: string;
    sortOrder: SortOrder;
    minPrice: number;
    onClearBrand: () => void;
    onClearSort: () => void;
    onClearMinPrice: () => void;
    onOpenMobileFilter: () => void;
}

export default function CategoryBanner({
                                           categoryName,
                                           slug,
                                           parentCategoryName,
                                           parentSlug,
                                           filteredCount,
                                           brandsCount,
                                           totalPages,
                                           selectedBrand,
                                           sortOrder,
                                           minPrice,
                                           onClearBrand,
                                           onClearSort,
                                           onClearMinPrice,
                                           onOpenMobileFilter,
                                       }: Props) {

    const isBrandSelected = selectedBrand !== "ALL BRANDS";

    // FIXED: Only handle the "ALL" sentinel cleanly, keeping original casing intact for API names
    const formattedCategoryName = categoryName.trim().toUpperCase() === "ALL"
        ? "All Products"
        : categoryName;

    const formattedParentName = parentCategoryName ?? null;

    const lowercasedBrand = selectedBrand.toLowerCase();

    // FIXED: Dynamically build layout headers without destroying your category capitalization format strings
    const displayTitle = isBrandSelected
        ? (formattedCategoryName.toLowerCase() === "all products" ? selectedBrand : `${selectedBrand} — ${formattedCategoryName}`)
        : formattedCategoryName;

    return (
        <div className="custom-main-color-bg relative overflow-hidden rounded-xl w-full">
            <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle, #00000030 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            {/* Giant background initial character */}
            <span className="hidden sm:block absolute -right-6 top-1/2 -translate-y-1/2 text-[220px] font-black leading-none select-none pointer-events-none text-black/[0.06] tracking-tighter capitalize">
                {isBrandSelected ? lowercasedBrand.charAt(0) : formattedCategoryName.toLowerCase().charAt(0)}
            </span>
            <div className="absolute -top-16 -left-16 w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 left-1/3 w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-black/5" />

            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-6 sm:pb-8">
                <nav className="flex items-center gap-2 text-[11px] sm:text-[12px] font-black tracking-[0.2em] uppercase text-black/40 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                    <Link href="/" className="hover:text-black/70 cursor-pointer transition-colors flex-shrink-0">Home</Link>
                    <span className="text-black/20 flex-shrink-0">/</span>
                    <Link href="/categories/all" className="hover:text-black/70 cursor-pointer transition-colors flex-shrink-0">Categories</Link>
                    {formattedParentName && (
                        <>
                            <span className="text-black/20 flex-shrink-0">/</span>
                            {parentSlug ? (
                                <Link href={`/categories/${parentSlug}`} className="hover:text-black/70 cursor-pointer transition-colors flex-shrink-0">
                                    {formattedParentName}
                                </Link>
                            ) : (
                                <span className="text-black/80 flex-shrink-0">{formattedParentName}</span>
                            )}
                        </>
                    )}
                    {slug && (
                        <>
                            <span className="text-black/20 flex-shrink-0">/</span>
                            <span className="text-black/80 flex-shrink-0">{formattedCategoryName}</span>
                        </>
                    )}
                    {isBrandSelected && (
                        <>
                            <span className="text-black/20 flex-shrink-0">/</span>
                            <span className="text-black/80 capitalize uppercase flex-shrink-0">{lowercasedBrand}</span>
                        </>
                    )}
                </nav>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-black/10 rounded-full px-3 py-1 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-black/50" />
                            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-black/60">
                                {isBrandSelected ? `${selectedBrand} Collection` : "Collection"}
                            </span>
                        </div>

                        {/* Rendering standard API capitalization casing */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-tight sm:leading-none text-black mb-3 break-words">
                            {displayTitle}
                        </h1>

                        <p className="text-black/55 text-sm font-semibold max-w-xs sm:max-w-sm leading-relaxed">
                            Explore our curated {isBrandSelected ? <strong>{selectedBrand}</strong> : formattedCategoryName} collection quality products, handpicked for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 sm:flex items-stretch gap-px bg-black/10 rounded-2xl overflow-hidden w-full sm:w-auto self-start lg:self-auto">
                        {[
                            { value: filteredCount, label: "Items" },
                            { value: brandsCount,   label: "Brands" },
                            { value: totalPages,    label: "Pages" },
                        ].map(({ value, label }) => (
                            <div key={label} className="flex flex-col items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-black/5 gap-0.5 min-w-[60px] sm:min-w-[80px]">
                                <span className="text-xl sm:text-2xl font-black text-black leading-none">{value}</span>
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-black/50">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-black/10 gap-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-[70%] sm:max-w-none">
                        {isBrandSelected && (
                            <button
                                onClick={onClearBrand}
                                className="flex items-center gap-1.5 bg-black/25 hover:bg-black/40 text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm whitespace-nowrap"
                            >
                                {selectedBrand} <X size={12} strokeWidth={3} />
                            </button>
                        )}
                        {sortOrder !== "Newest Arrivals" && (
                            <button
                                onClick={onClearSort}
                                className="flex items-center gap-1.5 bg-black/10 hover:bg-black/20 text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
                            >
                                {sortOrder} <X size={12} strokeWidth={3} />
                            </button>
                        )}
                        {minPrice > 0 && (
                            <button
                                onClick={onClearMinPrice}
                                className="flex items-center gap-1.5 bg-black/10 hover:bg-black/20 text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                            >
                                Min: ${minPrice} <X size={9} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onOpenMobileFilter}
                        className="lg:hidden flex items-center gap-2 bg-white custom-main-color-text text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full input-theme shadow-sm flex-shrink-0 cursor-pointer"
                    >
                        <SlidersHorizontal size={12} /> Filters
                    </button>
                </div>
            </div>
        </div>
    );
}