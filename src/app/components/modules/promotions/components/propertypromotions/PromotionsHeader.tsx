"use client";

import React from "react";
import { ArrowLeft, Calendar, Copy, Ticket } from "lucide-react";
import { DiscountCategory } from "@/src/app/components/modules/products/core/models/productsModel";

interface Props {
    slug: string | undefined;
    targetCategory: DiscountCategory | null;
    slugItemsCount: number;
    allCategoriesCount: number;
    loading: boolean;
    copiedCode: string | null;
    onBack: () => void;
    onCopy: (code: string) => void;
}

export default function PromotionsHeader({
                                             slug,
                                             targetCategory,
                                             slugItemsCount,
                                             allCategoriesCount,
                                             loading,
                                             copiedCode,
                                             onBack,
                                             onCopy,
                                         }: Props) {
    const hasBanner = slug && targetCategory?.banner_image;

    return (
        <div className="lg:py-8">
            {!hasBanner && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 md:p-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center card-theme rounded-full border border-transparent custom-main-color-border-hover transition-all cursor-pointer active:scale-90 touch-none"
                    >
                        <ArrowLeft className="text-[var(--header-text)] w-5 h-5 md:w-7 md:h-7" strokeWidth={2.5} />
                    </button>
                    <h1 className="text-[20px] sm:text-[30px] md:text-[32px] lg:text-[36px] font-bold custom-main-color-text">
                        {slug ? (targetCategory?.name ?? "All Promotion") : "All Promotion"}
                    </h1>
                </div>
            )}

            {hasBanner && (
                <h1 className="text-[20px] sm:text-[30px] md:text-[32px] lg:text-[36px] font-bold custom-main-color-text mt-2">
                    {targetCategory!.name}
                </h1>
            )}

            {slug && targetCategory?.description && (
                <p className="text-sm text-gray-400 mt-1">{targetCategory.description}</p>
            )}

            {slug && targetCategory?.coupon && (
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        onClick={() => onCopy(targetCategory!.coupon!.code)}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-dashed border-gray-400 text-xs font-bold transition-all hover:border-black dark:hover:border-white cursor-pointer"
                    >
                        <Ticket size={12} />
                        {targetCategory.coupon.code}
                        <Copy size={12} />
                        {copiedCode === targetCategory.coupon.code && (
                            <span className="text-[10px] text-green-500">Copied!</span>
                        )}
                    </button>
                </div>
            )}

            {!loading && (
                <p className="text-[12px] text-gray-400 mt-2">
                    {slug
                        ? slugItemsCount > 0
                            ? `${slugItemsCount} deal${slugItemsCount !== 1 ? "s" : ""} available`
                            : ""
                        : allCategoriesCount > 0
                            ? `${allCategoriesCount} active promotion${allCategoriesCount !== 1 ? "s" : ""}`
                            : ""}
                </p>
            )}
        </div>
    );
}