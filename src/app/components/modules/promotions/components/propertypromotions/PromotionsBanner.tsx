"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import { DiscountCategory } from "@/src/app/components/modules/products/core/models/productsModel";

interface Props {
    targetCategory: DiscountCategory;
    onBack: () => void;
}

export default function PromotionsBanner({ targetCategory, onBack }: Props) {
    return (
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] rounded-[2.5rem] mt-[-38px] sm:mt-[-15px] max-h-[520px] min-h-[180px] overflow-hidden group shadow-md bg-gray-100">
            <Image
                src={targetCategory.banner_image!}
                alt={targetCategory.name ?? "Promotion"}
                fill
                priority
                className="object-center transition-transform duration-700 ease-out group-hover:scale-103"
                sizes="(max-w-1280px) 100vw, 1280px"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10 pointer-events-none" />

            {targetCategory.start_date && targetCategory.end_date && (
                <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-10 bg-black/30 backdrop-blur-md px-4 py-2 rounded-[2.5rem] border border-white/20 flex items-center gap-2">
                    <Calendar size={14} className="text-white opacity-80" />
                    <span className="text-[12px] font-bold text-white tracking-wide">
                        {targetCategory.start_date}{" "}
                        <span className="text-gray-300 font-bold text-[14px] px-0.5">to</span>{" "}
                        {targetCategory.end_date}
                    </span>
                </div>
            )}

            <button
                onClick={onBack}
                className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-[2.5rem] bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 transition-all cursor-pointer active:scale-90"
            >
                <ArrowLeft className="text-white w-5 h-5" strokeWidth={2.5} />
            </button>
        </div>
    );
}