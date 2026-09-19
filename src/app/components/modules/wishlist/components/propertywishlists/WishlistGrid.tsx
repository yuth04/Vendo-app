"use client";

import React from "react";
import { useWishlist } from "@/src/app/components/context/Wishlistcontext";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import WishlistCard from "./WishlistCard";

interface WishlistItem {
    id: number;
    product_id: number;
    product: any;
}

interface Props {
    currentItems: WishlistItem[];
    reviewsMap: Map<number, Review[]>;
}

export default function WishlistGrid({ currentItems, reviewsMap }: Props) {
    const { toggleWishlist } = useWishlist();

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 gap-y-4">
            {currentItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                return (
                    <WishlistCard
                        key={item.id}
                        itemId={item.id}
                        product={product}
                        reviews={reviewsMap.get(product.id) ?? []}
                        onToggleWishlist={toggleWishlist}
                    />
                );
            })}
        </div>
    );
}