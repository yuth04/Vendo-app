"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { DiscountCategory } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import PromotionProductCard from "./PromotionProductCard";

const ITEMS_PER_PAGE = 8;

interface FlatItem {
    discountId: number;
    amount: string;
    type: string;
    product: any;
}

interface Props {
    category: DiscountCategory;
    items: FlatItem[];
    brandMap: Map<number, string>;
    reviewsMap: Map<number, Review[]>;
}

export default function PromotionsCategorySection({ category, items, brandMap, reviewsMap }: Props) {
    return (
        <div className="mb-12 sm:mb-16 sm:px-0">
            {/* Header section adjusted for stacked mobile spacing */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between justify-start gap-4 mb-6 sm:mb-8">
                <div className="min-w-0 w-full sm:w-auto">
                    <Link href={`/promotions/${category.slug}`} className="inline-block max-w-full">
                        <h2 className="text-[22px] sm:text-[30px] font-black custom-main-color-text break-words leading-tight">
                            {category.name}
                        </h2>
                    </Link>

                    {category.description && (
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2 sm:line-clamp-none">
                            {category.description}
                        </p>
                    )}

                    {/* Compact, responsive single-line date pill badge */}
                    <div className="mt-3 sm:mt-2 px-3 py-1.5 rounded-full card-theme custom-main-color-border-card flex items-center justify-between sm:justify-start gap-2 w-full sm:w-fit overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                            <Calendar size={13} className="custom-main-color-icon shrink-0 sm:scale-110" />
                            <span className="text-[10px] sm:text-[12px] font-bold text-[var(--header-text)] whitespace-nowrap">
                                {category.start_date}
                            </span>
                        </div>
                        <span className="text-[10px] sm:text-[14px] font-bold text-gray-400 custom-main-color-text px-1 transform scale-90 sm:scale-100 shrink-0">
                            to
                        </span>
                        <div className="text-[10px] sm:text-[12px] font-bold text-[var(--header-text)] whitespace-nowrap min-w-0 text-right sm:text-left shrink-0">
                            {category.end_date}
                        </div>
                    </div>
                </div>

                {/* Count badge layout snaps nicely to right side on desktop, aligned left/full on mobile */}
                <div className="flex sm:block shrink-0">
                    <Link
                        href={`/promotions/${category.slug}`}
                        className="text-[10px] sm:text-[14px] font-black custom-main-color-text border card-theme px-4 py-1.5 sm:py-2 rounded-full hover:opacity-80 transition-all whitespace-nowrap text-center justify-center items-center w-fit"
                    >
                        {items.length} Product{items.length !== 1 ? "s" : ""}
                    </Link>
                </div>
            </div>

            {/* Product items card layout grid view layout matrix setup */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 gap-y-4 sm:gap-y-10">
                {items.slice(0, ITEMS_PER_PAGE).map((row, i) => (
                    <PromotionProductCard
                        key={`${row.discountId}-${row.product.id}-${i}`}
                        discountId={row.discountId}
                        product={row.product}
                        amount={row.amount}
                        type={row.type}
                        brandName={brandMap.get(row.product.brand_id) ?? "Unknown Brand"}
                        reviews={reviewsMap.get(row.product.id) ?? []}
                        index={i}
                    />
                ))}
            </div>

            {items.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-8 sm:mt-10">
                    <Link
                        href={`/promotions/${category.slug}`}
                        className="inline-flex items-center justify-center gap-2 custom-main-color-bg text-white text-[11px] sm:text-[12px] font-black uppercase tracking-widest px-6 sm:px-8 py-3 rounded-full transition-all active:scale-95 w-full sm:w-auto"
                    >
                        See all {items.length} deals <ChevronRight size={14} />
                    </Link>
                </div>
            )}
        </div>
    );
}