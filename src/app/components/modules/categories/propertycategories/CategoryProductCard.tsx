"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useWishlist } from "@/src/app/components/context/Wishlistcontext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";
import { User } from "@/src/app/components/modules/auth/core/models/authModel";

interface Props {
    product: Product;
    reviews: Review[];
}

export default function CategoryProductCard({ product, reviews }: Props) {
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { showToast } = useAlert();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
        const onAuthUpdate = () => setUser(authService.getStoredUser());
        window.addEventListener('auth-updated', onAuthUpdate);
        return () => window.removeEventListener('auth-updated', onAuthUpdate);
    }, []);

    const imageSrc        = product.image || "";
    const wishlisted      = isWishlisted(product.id);
    const hasDiscount     = product.discount_price != null;
    const originalPrice   = Number(product.price);
    const discountedPrice = product.discount_price ?? originalPrice;
    const discountPct     = hasDiscount
        ? Math.round((1 - discountedPrice / originalPrice) * 100)
        : 0;

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (user) {
            if (!wishlisted) {
                showToast(
                    `Successfully added "${product.productName}" to your wishlist.`,
                    "success",
                    "Added to Favorites"
                );
            } else {
                showToast(
                    `Removed "${product.productName}" from your wishlist.`,
                    "info",
                    "Removed from Favorites"
                );
            }
        }

        await toggleWishlist(product.id);
    };

    const getStarsFromCount = (count: number): number => {
        if (count >= 8) return 5;
        if (count >= 5) return 4;
        if (count >= 3) return 3;
        if (count >= 2) return 2;
        if (count >= 1) return 1;
        return 0;
    };

    return (
        <div className="flex flex-col group cursor-pointer rounded-[2rem] border-2 card-theme p-4 transition-all duration-500 hover:shadow-md custom-main-color-border-hover bg-[var(--header-bg)]">
            <Link href={`/product-details/${product.id}`} className="w-full h-full relative flex flex-col">
                <div className="relative rounded-2xl h-44 sm:h-60 overflow-hidden flex items-center justify-center mb-4 bg-neutral-50/50">
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={product.productName}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-contain transition-transform duration-[1000ms] ease-out group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="text-gray-200 text-xs italic font-bold">
                            [{product.productName}]
                        </div>
                    )}

                    {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10 custom-main-color-bg text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-95">
                            -{discountPct}%
                        </div>
                    )}

                    <button
                        onClick={handleWishlistClick}
                        className={`absolute top-3 right-1.5 sm:right-2 p-2 sm:p-2.5 rounded-full shadow-md transition-all duration-300 z-10 card-theme cursor-pointer text-[var(--header-text)] ${
                            wishlisted ? "text-red-500 scale-110" : "hover:text-red-500 hover:scale-105 active:scale-95"
                        }`}
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={18} className={wishlisted ? "fill-red-500 stroke-red-500" : ""} />
                    </button>
                </div>

                <div className="px-2 flex flex-col flex-1 justify-between">
                    <div>
                        <p className="text-[10px] sm:text-[12px] font-black tracking-widest uppercase custom-main-color-text truncate">
                            {product.brand?.name || 'Unknown Brand'}
                        </p>
                        <h2 className="text-[14px] sm:text-[18px] font-black leading-tight line-clamp-2 sm:min-h-[3.5rem] mt-2 sm:mt-3 text-[var(--header-text)] transition-colors duration-300 group-hover:text-blue-300">
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
                        <div className="h-[1px] input-theme w-full mb-4"/>
                        <div className="flex items-center gap-2 pb-2">
                            {hasDiscount ? (
                                <>
                                    <span className="text-[18px] text-[var(--header-text)] font-black">
                                        ${discountedPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </span>
                                    <span
                                        className="text-[12px] sm:text-[14px] font-semibold text-gray-400 line-through">
                                        ${originalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[16px] sm:text-[18px] font-black text-[var(--header-text)]">
                                    ${originalPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}