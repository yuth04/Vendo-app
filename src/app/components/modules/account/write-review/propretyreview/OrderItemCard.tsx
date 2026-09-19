"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { Review, ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import ProductReviewPanel from "./ProductReviewPanel";

interface Props {
    item: any;
    reviewsMap: Map<number, Review[]>;
    currentUser: ReviewUser | null;
    onReviewCreated: (productId: number, review: Review) => void;
    onReviewUpdated: (productId: number, review: Review) => void;
    onReviewDeleted: (productId: number, reviewId: number) => void;
}

export default function OrderItemCard({ item, reviewsMap, currentUser, onReviewCreated, onReviewUpdated, onReviewDeleted }: Props) {
    const productId      = Number(item.variant?.product?.id);
    const productReviews = reviewsMap.get(productId) ?? [];

    return (
        <div className="border-b border-gray-50 pb-8 last:border-0 last:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-8">
                    <div className="h-20 w-20 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-[20px] bg-gray-50 flex items-center justify-center border border-gray-100">
                        {item.variant?.product?.image ? (
                            <img src={item.variant.product.image} className="h-full w-full object-center" />
                        ) : (
                            <ShoppingBag className="text-gray-200" size={24} />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-lg sm:text-[22px] font-black text-[var(--header-text)]">
                            {item.variant?.product?.name}
                        </h4>
                        <div className="flex gap-x-3 text-[12px] font-bold text-gray-400">
                            <span>Qty: {item.quantity}</span>
                            <span className="bg-[#F0FDFA] px-3 py-1 text-[10px] font-black text-[#0D9488] border border-[#CCFBF1] rounded-full uppercase">
                                {item.variant?.size} • {item.variant?.color}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex sm:block justify-end">
                    <span className="text-xl sm:text-2xl font-black text-[var(--header-text)]">
                        ${item.subtotal}
                    </span>
                </div>
            </div>

            <ProductReviewPanel
                productId={productId}
                reviews={productReviews}
                currentUser={currentUser}
                onReviewCreated={onReviewCreated}
                onReviewUpdated={onReviewUpdated}
                onReviewDeleted={onReviewDeleted}
            />
        </div>
    );
}