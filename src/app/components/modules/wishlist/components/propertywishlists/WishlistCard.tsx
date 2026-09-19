"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";

const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    itemId: number;
    product: Product;
    reviews: Review[];
    onToggleWishlist: (productId: number) => void;
}

export default function WishlistCard({ itemId, product, reviews, onToggleWishlist }: Props) {
    const { showToast } = useAlert();

    const imageSrc        = product.image || product.category?.image || "";
    const hasDiscount     = product.discount_price != null;
    const originalPrice   = Number(product.price);
    const discountedPrice = hasDiscount ? Number(product.discount_price) : originalPrice;
    const discountPct     = hasDiscount
        ? Math.round((1 - discountedPrice / originalPrice) * 100)
        : 0;

    const getStarsFromCount = (count: number): number => {
        if (count >= 8) return 5;
        if (count >= 5) return 4;
        if (count >= 3) return 3;
        if (count >= 2) return 2;
        if (count >= 1) return 1;
        return 0;
    };

    const handleWishlistClick = () => {
        showToast(
            `Removed "${product.productName}" from your wishlist.`,
            "info",
            "Removed from Favorites"
        );
        onToggleWishlist(product.id);
    };

    return (
        <div key={itemId} className="flex flex-col group cursor-pointer rounded-[2rem] border-2 card-theme p-4 transition-all duration-500 hover:shadow-md custom-main-color-border-hover bg-[var(--header-bg)]">

            {/* Image */}
            <div className="relative h-44 sm:h-60 rounded-2xl overflow-hidden flex items-center justify-center mb-4 bg-neutral-50/50">
                {imageSrc ? (
                    <Link href={`/product-details/${product.id}`} className="w-full h-full relative block">
                        <Image
                            src={imageSrc}
                            alt={product.productName}
                            fill
                            sizes="33vw"
                            className="object-contain transition-transform duration-[1000ms] ease-out group-hover:scale-[1.02] mix-blend-multiply dark:mix-blend-normal"
                        />
                    </Link>
                ) : (
                    <div className="opacity-30 text-center">
                        <Image src={Notfound} alt="No" width={40} height={40} className="mx-auto grayscale" />
                        <span className="text-[10px] font-bold">No image</span>
                    </div>
                )}

                {hasDiscount && (
                    <div className="absolute top-3 left-3 z-10 custom-main-color-bg text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-95">
                        -{discountPct}%
                    </div>
                )}

                <button
                    onClick={handleWishlistClick}
                    className="absolute top-3 right-3 p-2.5 rounded-full shadow-md text-red-500 card-theme hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer z-10"
                >
                    <Heart size={18} className="fill-red-500 stroke-red-500" />
                </button>
            </div>

            {/* Info */}
            <div className="px-2 flex flex-col flex-1 justify-between">
                <div>
                    <p className="text-[10px] sm:text-[12px] font-black tracking-widest uppercase custom-main-color-text truncate">
                        {product.brand?.name || 'Unknown Brand'}
                    </p>
                    <h2 className="text-[14px] sm:text-[18px] font-black leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[3.5rem] mt-2 sm:mt-3 text-[var(--header-text)] transition-colors duration-300 group-hover:text-blue-300">
                        {product.productName}
                    </h2>

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
                </div>

                <div>
                    <div className="h-[1px] card-theme w-full mb-3"/>
                    <div className="flex items-center gap-2 pb-1">
                        <span className="text-[16px] sm:text-[18px] font-black text-[var(--header-text)]">
                            ${fmt(discountedPrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-[12px] sm:text-[14px] font-semibold text-gray-400 line-through">
                                ${fmt(originalPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}