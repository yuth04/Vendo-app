"use client";

import React from "react";
import { Star } from "lucide-react";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";

interface Props {
    reviews: Review[];
}

//--- the stars  total review count ---//
const getStarsFromCount = (count: number): number => {
    if (count >= 8) return 5;
    if (count >= 5) return 4;
    if (count >= 3) return 3;
    if (count >= 2) return 2;
    if (count >= 1) return 1;
    return 0;
};

//--- the performance label text based on review count ---//
const getLabelFromCount = (count: number): string => {
    if (count >= 7) return "Very good";
    if (count >= 4) return "Good";
    if (count >= 1) return "Average";
    return "No Ratings";
};

export default function ReviewsHeader({ reviews }: Props) {
    const safeReviews = Array.isArray(reviews) ? reviews : [];

    const starsToFill = getStarsFromCount(safeReviews.length);
    const dynamicLabel = getLabelFromCount(safeReviews.length);

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-black">Customer Reviews</h3>
                <p className="text-xs text-gray-400 font-medium mt-2">
                    {safeReviews.length} {safeReviews.length === 1 ? "review" : "reviews"}
                </p>
            </div>
            {safeReviews.length > 0 && (
                <div
                    className="flex items-center gap-2 bg-[#E3DE61]/10 border border-[#E3DE61]/30 rounded-2xl px-4 py-2">
                    <p className="text-[14px] text-gray-400 font-bold mt-0.5">
                        {safeReviews.length} {safeReviews.length === 1 ? "" : ""}
                    </p>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={11}
                                    fill={i < starsToFill ? "#FACC15" : "none"}
                                    stroke={i < starsToFill ? "#FACC15" : "#D1D5DB"}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">
                            {dynamicLabel}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}