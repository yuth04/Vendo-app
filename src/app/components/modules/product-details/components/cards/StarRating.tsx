"use client";

import { Star } from "lucide-react";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import React from "react";

interface Props {
    reviews: Review[];
}

export default function StarRating({ reviews }: Props) {
    const getStarsFromCount = (count: number): number => {
        if (count >= 8) return 5;
        if (count >= 5) return 4;
        if (count >= 3) return 3;
        if (count >= 2) return 2;
        if (count >= 1) return 1;
        return 0;
    };

    return (
        <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <React.Fragment key={i}>
                        <Star
                            size={12}
                            className={`sm:hidden ${
                                i < getStarsFromCount(reviews.length)
                                    ? "fill-yellow-400 stroke-yellow-400"
                                    : "fill-none stroke-gray-300"
                            }`}
                        />
                        <Star
                            size={15}
                            className={`hidden sm:block ${
                                i < getStarsFromCount(reviews.length)
                                    ? "fill-yellow-400 stroke-yellow-400"
                                    : "fill-none stroke-gray-300"
                            }`}
                        />
                    </React.Fragment>
                ))}
            </div>
            <span className="text-[10px] sm:text-[12px] text-gray-500 font-bold ml-1">
                ({reviews.length})
            </span>
        </div>

    )
        ;
}