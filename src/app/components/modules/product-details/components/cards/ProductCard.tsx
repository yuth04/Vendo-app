"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";
import { User } from "@/src/app/components/modules/auth/core/models/authModel";
import StarRating from "./StarRating";
import PriceDisplay from "./PriceDisplay";

interface Props {
    product: Product;
    reviews: Review[];
    isLiked: boolean;
    onToggleWishlist: (e: React.MouseEvent) => void;
}

export default function ProductCard({ product, reviews, isLiked, onToggleWishlist }: Props) {
    const { showToast } = useAlert();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
        const onAuthUpdate = () => setUser(authService.getStoredUser());
        window.addEventListener('auth-updated', onAuthUpdate);
        return () => window.removeEventListener('auth-updated', onAuthUpdate);
    }, []);

    const original = Number(product.price);
    const discountPrice = product.discount_price ?? null;

    const hasDiscount = discountPrice != null;
    const discounted = discountPrice ?? original;

    const discountPct = hasDiscount
        ? Math.round((1 - discounted / original) * 100)
        : 0;

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (user) {
            if (!isLiked) {
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

        onToggleWishlist(e);
    };

    return (
        <div className="flex flex-col group cursor-pointer rounded-[2rem] border-2 card-theme p-4 mb-4 transition-all duration-500 hover:shadow-md custom-main-color-border-hover bg-[var(--header-bg)]">
            <Link href={`/product-details/${product.id}`} className="w-full h-full relative flex flex-col">

                {/* Image container */}
                <div className="relative rounded-2xl overflow-hidden flex items-center h-44 sm:h-60 justify-center mb-4 border-none bg-neutral-50/50">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.productName}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain transition-transform duration-[1000ms] ease-out group-hover:scale-[1.02] mix-blend-multiply dark:mix-blend-normal"
                        />
                    ) : (
                        <div className="text-xs italic font-bold text-center px-2 opacity-20">
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
                            isLiked ? "text-red-500 scale-110" : "hover:text-red-500 hover:scale-105 active:scale-95"
                        }`}
                        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={18} className={isLiked ? "fill-red-500 stroke-red-500" : ""} />
                    </button>
                </div>

                {/* Info */}
                <div className="px-2 flex flex-col flex-1 justify-between">
                    <div>
                        <p className="text-[10px] sm:text-[12px] font-black tracking-widest uppercase custom-main-color-text truncate">
                            {product.brand?.name || "Unknown Brand"}
                        </p>
                        <h2 className="text-[14px] sm:text-[18px] font-black leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[3.5rem] mt-2 sm:mt-3 text-[var(--header-text)] transition-colors duration-300 group-hover:text-blue-300">
                            {product.productName}
                        </h2>

                        <StarRating reviews={reviews}/>
                    </div>

                    <div>
                        <div className="h-[1px] card-theme w-full mb-4"/>
                        <PriceDisplay
                            price={original}
                            discountPrice={discountPrice}
                        />
                    </div>
                </div>
            </Link>
        </div>
    );
}