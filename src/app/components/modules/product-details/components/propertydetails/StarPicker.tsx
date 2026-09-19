"use client";

import React from "react";
import { Star } from "lucide-react";

interface Props {
    rating: number;
    size?: number;
    onSelect: (star: number) => void;
}

export default function StarPicker({ rating, size = 24, onSelect }: Props) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onSelect(star)}
                        className="transition-transform hover:scale-110 cursor-pointer">
                    <Star
                        size={size}
                        fill={star <= rating ? "#FACC15" : "none"}
                        stroke={star <= rating ? "#FACC15" : "#D1D5DB"}
                    />
                </button>
            ))}
        </div>
    );
}