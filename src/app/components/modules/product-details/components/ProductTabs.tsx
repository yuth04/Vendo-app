"use client";

import React from "react";
import DetailsTab from "@/src/app/components/modules/product-details/components/DetailsTab";
import ReviewsTab from "@/src/app/components/modules/product-details/components/ReviewsTab";
import { Product, ProductVariant } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";

interface Props {
    product: Product;
    variantImages: ProductVariant[];
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    reviewsLoading: boolean;
    reviewError: string | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProductTabs({
                                        product,
                                        variantImages,
                                        reviews,
                                        setReviews,
                                        reviewsLoading,
                                        reviewError,
                                        activeTab,
                                        onTabChange,
                                    }: Props) {
    const safeReviews = Array.isArray(reviews) ? reviews : [];

    return (
        <>
            <div className="flex gap-1 mb-8 bg-gray-50 p-1.5 rounded-2xl w-fit border border-gray-100 input-theme">
                {['Details', 'Reviews'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${
                            activeTab === tab ? 'custom-main-color-bg cursor-pointer' : 'text-gray-400 custom-main-color-text-hover cursor-pointer'
                        }`}
                    >
                        {tab}
                        {tab === 'Reviews' && safeReviews.length > 0 && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-black/10">
                                {safeReviews.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="mb-20 p-8 bg-gray-50 input-theme rounded-3xl border border-gray-100 min-h-[200px]">
                {activeTab === 'Details' && (
                    <DetailsTab product={product} variantImages={variantImages} />
                )}
                {activeTab === 'Reviews' && (
                    <ReviewsTab
                        productId={product.id}
                        reviews={reviews}
                        setReviews={setReviews}
                        reviewsLoading={reviewsLoading}
                        reviewError={reviewError}
                    />
                )}
            </div>
        </>
    );
}