"use client";

import React from "react";
import { ArrowLeft, Heart } from "lucide-react";

interface Props {
    onBack: () => void;
}

export default function WishlistEmpty({ onBack }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                <Heart size={40} className="text-red-300" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-[16px] sm:text-[20px] font-extrabold">Your wishlist is empty</h2>
                <p className="text-gray-400 text-sm max-w-xs">
                    Save products you love by tapping the heart icon.
                </p>
            </div>
            <button
                onClick={onBack}
                className="flex items-center gap-2 custom-main-color-bg text-white px-6 py-3 rounded-xl font-bold text-sm transition hover:opacity-90 cursor-pointer"
            >
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
    );
}