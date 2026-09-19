"use client";

import React from "react";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import PromotionProductCard from "./PromotionProductCard";
import PromotionsPagination from "./PromotionsPagination";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";


interface FlatItem {
    discountId: number;
    amount: string;
    type: string;
    product: any;
}

interface Props {
    currentItems: FlatItem[];
    slugItemsCount: number;
    currentPage: number;
    totalPages: number;
    brandMap: Map<number, string>;
    reviewsMap: Map<number, Review[]>;
    onPrev: () => void;
    onNext: () => void;
    onSetPage: (page: number) => void;
}

export default function PromotionsSlugView({
                                               currentItems,
                                               slugItemsCount,
                                               currentPage,
                                               totalPages,
                                               brandMap,
                                               reviewsMap,
                                               onPrev,
                                               onNext,
                                               onSetPage,
                                           }: Props) {
    return currentItems.length > 0 ? (
        <>
            <div className="flex items-center justify-end mb-6">
                <span className="text-[12px] font-black card-theme custom-main-color-text border px-4 py-1.5 rounded-full">
                    {slugItemsCount} product{slugItemsCount !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 gap-y-10">
                {currentItems.map((row, i) => (
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

            {totalPages > 1 && (
                <PromotionsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSetPage={onSetPage}
                />
            )}
        </>
    ) : (
        <EmptyState
            title="Promotions Not Found"
            description="There are no promotional items available under this view right now."
            imageSrc={Notfound}
            buttonText="Refresh Promotions"
            onAction={() => window.location.reload()}
        />
    );
}