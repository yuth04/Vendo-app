"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Brand} from "@/src/app/components/modules/products/core/models/productsModel";

interface BrandCardProps {
    brand: Brand;
    idx: number;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, idx }) => {
    return (
        <Link
            href={`/categories/all?brand=${encodeURIComponent(brand.name)}`}
            className="group flex-shrink-0 w-[calc((100vw-3rem-2rem)/3)] sm:w-[150px] p-4 sm:p-6 border-2 rounded-[1.5rem] sm:rounded-[2.5rem] brand-card-base card-theme transition-all duration-500 flex flex-col items-center justify-center gap-3 sm:gap-5 cursor-pointer"
        >
            <div className="relative w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                {brand.image ? (
                    <Image
                        src={brand.image}
                        alt={brand.name}
                        fill
                        className="object-contain icon-theme"
                        sizes="(max-width: 640px) 48px, 80px"
                    />
                ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold tracking-widest opacity-40 input-theme">
                        No Logo
                    </div>
                )}
            </div>
            <span className="text-[12px] sm:text-sm font-black text-center transition-colors group-hover:brand-text-primary line-clamp-1">
                {brand.name}
            </span>
        </Link>
    );
};