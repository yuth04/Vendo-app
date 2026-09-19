"use client";

import React, { useCallback, useMemo } from "react";
import { useWishlist } from "@/src/app/components/context/Wishlistcontext";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import ProductCard from "./cards/ProductCard";

interface Props {
    products: Product[];
}

const EMPTY_REVIEWS: Review[] = [];

export default function CompatibleProducts({ products }: Props) {
    const { isWishlisted, toggleWishlist } = useWishlist();
    const fetchReviews = useCallback(() => reviewClient.fetchAllReviews(), []);

    const { data: reviewsRes } = useApiData<Review[]>(fetchReviews, EMPTY_REVIEWS, true);

    const reviewsMap = useMemo<Map<number, Review[]>>(() => {
        const map  = new Map<number, Review[]>();
        const list = Array.isArray(reviewsRes) ? reviewsRes : [];
        list.forEach((r) => {
            const existing = map.get(r.product_id) ?? [];
            existing.push(r);
            map.set(r.product_id, existing);
        });
        return map;
    }, [reviewsRes]);

    return (
        <div className={`mb-16 ${products.length === 0 ? "hidden" : ""}`}>
            <div className="flex items-center gap-3 mb-8">
                <h2 className="text-[24px] sm:text-[36px] font-black custom-main-color-text tracking-tight">
                    Compatible Products
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p) => (
                    <ProductCard
                        key={p.id}
                        product={p}
                        reviews={reviewsMap.get(p.id) ?? []}
                        isLiked={isWishlisted(p.id)}
                        onToggleWishlist={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await toggleWishlist(p.id);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}