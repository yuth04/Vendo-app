"use client";

import React from "react";
import { CheckCircle, MessageSquare, Star } from "lucide-react";
import { Review, ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";

const MAIN      = "#FACC15";
const MAIN_DARK = "#FACC15";

interface Props {
    reviews: Review[];
    currentUser: ReviewUser | null;
    myReview: Review | null;
    panelOpen: boolean;
    formSuccess: boolean;
    onTogglePanel: () => void;
}

export default function ReviewSummaryBar({ reviews, currentUser, myReview, panelOpen, formSuccess, onTogglePanel }: Props) {
    const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            size={13}
                            fill={s <= Math.round(avgRating) ? MAIN : "none"}
                            stroke={s <= Math.round(avgRating) ? MAIN_DARK : "#D1D5DB"}
                        />
                    ))}
                </div>
                <span className="text-xs font-bold text-gray-400">
                    {reviews.length > 0
                        ? `${Number(avgRating.toFixed(1))} (${reviews.length} ${reviews.length === 1 ? "Review" : "Reviews"})`
                        : "No reviews yet"}
                </span>
            </div>

            {formSuccess && (
                <span
                    className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-[11px] font-black">
                    <CheckCircle size={12} /> Submitted!
                </span>
            )}

            {currentUser && !myReview && (
                <button
                    onClick={onTogglePanel}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DE61]/40 bg-[#E3DE61]/10 text-[11px] font-black text-[#c9c44a] hover:bg-[#E3DE61]/20 transition-colors cursor-pointer"
                >
                    <MessageSquare size={11} />
                    {panelOpen ? "Cancel" : "Write a Review"}
                </button>
            )}
        </div>
    );
}