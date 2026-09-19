"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Product, VariantImage } from "@/src/app/components/modules/products/core/models/productsModel";

interface Props {
    product: Product;
    thumbnails: VariantImage[];
    activeImageUrl: string | null;
    hasDiscount: boolean;
    discountPct: number;
    onThumbnailClick: (url: string) => void;
}

export default function ProductImageGallery({
                                                product,
                                                thumbnails,
                                                activeImageUrl,
                                                hasDiscount,
                                                discountPct,
                                                onThumbnailClick,
                                            }: Props) {


    const currentIndex = thumbnails.findIndex((img) => img.image === activeImageUrl);

    const handlePreviousImage = () => {
        if (thumbnails.length === 0) return;
        const prevIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        onThumbnailClick(thumbnails[prevIndex].image);
    };

    const handleNextImage = () => {
        if (thumbnails.length === 0) return;
        const nextIndex = (currentIndex + 1) % thumbnails.length;
        onThumbnailClick(thumbnails[nextIndex].image);
    };

    return (
        <div className="lg:col-span-7 flex gap-4">
            {thumbnails.length > 0 && (
                <div className="flex flex-col gap-3 shrink-0">
                    {thumbnails.slice(0, 4).map((img: VariantImage) => (
                        <button
                            key={img.id}
                            onClick={() => onThumbnailClick(img.image)}
                            className={`w-[72px] h-[72px] rounded-2xl border-3 overflow-hidden transition-all flex items-center justify-center p-1.5 ${
                                activeImageUrl === img.image
                                    ? 'custom-main-border cursor-pointer bg-gray-50'
                                    : 'border-gray-100 hover:border-gray-300 bg-gray-50 cursor-pointer input-theme'
                            }`}
                        >
                            <Image
                                src={img.image}
                                alt={product.productName}
                                width={64}
                                height={64}
                                loading="lazy"
                                sizes="64px"
                                className="object-contain"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 relative group">

                <div className="absolute -top-4 -right-4 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none z-0"/>

                <div
                    className="relative z-10 rounded-3xl overflow-hidden flex items-center justify-center min-h-[630px] border border-gray-100 bg-white transition-all duration-300">

                    {activeImageUrl ? (
                        <>
                            <Image
                                key={activeImageUrl}
                                src={activeImageUrl}
                                alt={product.productName}
                                width={420}
                                height={420}
                                priority
                                loading="eager"
                                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.02] z-10"
                                sizes="(max-width: 768px) 100vw, 500px"
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-300 pointer-events-none z-20"/>

                            {thumbnails.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePreviousImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={24}/>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={24}/>
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-300 font-semibold text-sm flex flex-col items-center gap-3">
                            <Package size={40} className="opacity-30"/>
                            No Image Available
                        </div>
                    )}

                    {/* Badges */}
                    <div
                        className="absolute top-4 left-4 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow custom-main-color-bg z-30">
                        {product.brand?.name ?? 'Brand'}
                    </div>

                    {hasDiscount && (
                        <div
                            className="absolute top-4 right-4 custom-main-color-bg text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow z-30">
                            -{discountPct}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}