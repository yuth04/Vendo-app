"use client";

import React from "react";
import { DiscountCategory } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import PromotionsCategorySection from "./PromotionsCategorySection";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";

interface FlatItem {
    discountId: number;
    amount: string;
    type: string;
    product: any;
}

interface Props {
    allCategories: { category: DiscountCategory; items: FlatItem[] }[];
    brandMap: Map<number, string>;
    reviewsMap: Map<number, Review[]>;
}

export default function PromotionsAllView({ allCategories, brandMap, reviewsMap }: Props) {
    return allCategories.length > 0 ? (
        <>
            {allCategories.map(({ category, items }) => (
                <PromotionsCategorySection
                    key={category.id}
                    category={category}
                    items={items}
                    brandMap={brandMap}
                    reviewsMap={reviewsMap}
                />
            ))}
        </>
    ) : (
        <EmptyState
            title="Promotions Not Found"
            description="There are no promotional categories available to display right now."
            imageSrc={Notfound}
            buttonText="Refresh Promotions"
            onAction={() => window.location.reload()}
        />
    );
}