"use client";

import React, { useState, useEffect } from "react";
import { Heart, Minus, Plus, Star, Shield, Truck, RotateCcw, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { Product, ProductVariant } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";
import { User } from "@/src/app/components/modules/auth/core/models/authModel";


type CartStatus = 'idle' | 'loading' | 'success' | 'error';

interface Props {
    product: Product;
    reviews: Review[];
    selectedVariant: ProductVariant | undefined;
    uniqueSizes: string[];
    uniqueColors: string[];
    selectedSize: string;
    selectedColor: string;
    quantity: number;
    hasDiscount: boolean;
    discountedPrice: number;
    originalPrice: number;
    wishlisted: boolean;
    cartStatus: CartStatus;
    cartError: string | null;
    cartBtnDisabled: boolean;
    onSelectSize: (size: string) => void;
    onSelectColor: (color: string) => void;
    onQuantityChange: (qty: number) => void;
    onAddToCart: () => void;
    onToggleWishlist: () => void;
}

export default function ProductPurchaseInfo({
                                                product,
                                                reviews,
                                                selectedVariant,
                                                uniqueSizes,
                                                uniqueColors,
                                                selectedSize,
                                                selectedColor,
                                                quantity,
                                                hasDiscount,
                                                discountedPrice,
                                                originalPrice,
                                                wishlisted,
                                                cartStatus,
                                                cartError,
                                                cartBtnDisabled,
                                                onSelectSize,
                                                onSelectColor,
                                                onQuantityChange,
                                                onAddToCart,
                                                onToggleWishlist,
                                            }: Props) {
    const { showToast } = useAlert();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
        const onAuthUpdate = () => setUser(authService.getStoredUser());
        window.addEventListener('auth-updated', onAuthUpdate);
        return () => window.removeEventListener('auth-updated', onAuthUpdate);
    }, []);

    const safeReviews = Array.isArray(reviews) ? reviews : [];

    const getStarsFromCount = (count: number): number => {
        if (count >= 8) return 5;
        if (count >= 5) return 4;
        if (count >= 3) return 3;
        if (count >= 2) return 2;
        if (count >= 1) return 1;
        return 0;
    };

    const inStock = (selectedVariant?.stock ?? 0) > 0;

    // Filter available sizes based strictly on the selected color
    const availableSizes = selectedColor
        ? uniqueSizes.filter((size) =>
            product?.variants?.some((v) => v.color === selectedColor && v.size === size)
        )
        : uniqueSizes;

    // Custom handler when changing colors to auto-select the first available size
    const handleColorChange = (color: string) => {
        onSelectColor(color);

        // Find sizes matching this new color
        const validSizesForColor = uniqueSizes.filter((size) =>
            product?.variants?.some((v) => v.color === color && v.size === size)
        );

        // Auto-select the first size option found for this color
        if (validSizesForColor.length > 0) {
            onSelectSize(validSizesForColor[0]);
        }
    };

    const handleWishlistClick = () => {
        onToggleWishlist();

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
    };

    return (
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
                <h1 className="text-[24px] sm:text-[48px] font-black leading-tight tracking-tight mb-4">
                    {product.productName}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
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
                    <span className="text-sm text-gray-400 font-medium">
                        ({safeReviews.length} {safeReviews.length === 1 ? 'Review' : 'Reviews'})
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'}`}/>
                        {inStock ? `In Stock · ${selectedVariant?.stock} left` : 'Out of Stock'}
                    </span>
                </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
                {hasDiscount ? (
                    <>
                        <span className="text-[24px] sm:text-[36px] font-black leading-none">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        <span
                            className="text-[16px] sm:text-[20px] font-semibold text-gray-400 line-through leading-none mb-1">
                            ${originalPrice.toFixed(2)}
                        </span>
                    </>
                ) : (
                    <span className="text-[24px] sm:text-[36px] font-black leading-none">
                        ${originalPrice.toFixed(2)}
                    </span>
                )}
            </div>

            <div className="h-px card-theme w-full" />

            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

            {/* Colors */}
            {uniqueColors.length > 0 && (
                <div>
                    <p className="text-[14px] font-black text-gray-400 mb-3">Color</p>
                    <div className="flex gap-2 flex-wrap">
                        {uniqueColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorChange(color)}
                                className={`px-4 py-2 rounded-[20px] text-sm font-bold border-2 transition-all ${
                                    selectedColor === color
                                        ? 'custom-main-color-bg custom-main-color-border cursor-pointer'
                                        : 'border-gray-200 text-gray-600 custom-main-color-border-hover input-theme cursor-pointer'
                                }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sizes */}
            {availableSizes.length > 0 && (
                <div>
                    <p className="text-[14px] font-black text-gray-400 mb-3">Size</p>
                    <div className="flex gap-2 flex-wrap">
                        {availableSizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => onSelectSize(size)}
                                className={`h-10 sm:h-12 min-w-[40px] sm:min-w-[48px] px-3 rounded-full text-sm font-black border-2 transition-all flex items-center justify-center whitespace-nowrap ${
                                    selectedSize === size
                                        ? 'custom-main-color-bg custom-main-color-border cursor-pointer text-white'
                                        : 'text-gray-700 border-gray-200 custom-main-color-border-hover input-theme cursor-pointer'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            <div>
                <p className="text-[14px] font-black text-gray-400 mb-3">Quantity</p>
                <div className="flex items-center gap-4 w-fit input-theme rounded-[20px] p-1.5 border border-gray-100">
                    <button
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-[20px] flex items-center justify-center transition-colors font-bold text-gray-900 hover:opacity-80 custom-main-color-bg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-[16px] sm:text-[18px] font-black min-w-[32px] text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={() => onQuantityChange(Math.min(selectedVariant?.stock ?? 1, quantity + 1))}
                        disabled={!selectedVariant || quantity >= (selectedVariant?.stock ?? 1)}
                        className="w-10 h-10 rounded-[30px] flex items-center justify-center transition-colors font-bold text-gray-900 hover:opacity-80 custom-main-color-bg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                {selectedVariant && selectedVariant.stock <= 5 && (
                    <p className="mt-2 text-xs font-semibold text-amber-500">
                        Only {selectedVariant.stock} left in stock
                    </p>
                )}
                {selectedVariant && quantity >= selectedVariant.stock && selectedVariant.stock > 5 && (
                    <p className="mt-2 text-xs font-semibold text-amber-500">
                        Max quantity reached ({selectedVariant.stock} available)
                    </p>
                )}
            </div>

            {/* ADD TO CART + WISHLIST */}
            <div className="flex flex-col gap-2 pt-1">
                <div className="flex gap-3">
                    <button
                        onClick={onAddToCart}
                        disabled={cartBtnDisabled}
                        className={`
                            flex-1 font-black py-4 rounded-[20px] flex items-center justify-center gap-2.5
                            transition-all shadow-lg text-[16px] sm:text-[18px]
                            custom-main-color-bg text-gray-900
                            ${cartBtnDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-85'}
                            ${cartStatus === 'success' ? '!bg-emerald-400 !text-white' : ''}
                            ${cartStatus === 'error'   ? '!bg-red-400   !text-white'   : ''}
                        `}
                    >
                        {cartStatus === 'loading' && <Loader2 size={20} className="animate-spin" />}
                        {cartStatus === 'success' && <CheckCircle size={20} />}
                        {cartStatus === 'error'   && <AlertCircle size={20} />}
                        {cartStatus === 'idle'    && <HiOutlineShoppingBag size={22} />}
                        {cartStatus === 'loading' && 'Adding…'}
                        {cartStatus === 'success' && 'Added to Cart!'}
                        {cartStatus === 'error'   && 'Failed — Retry'}
                        {cartStatus === 'idle'    && 'Add to Cart'}
                    </button>

                    <button
                        onClick={handleWishlistClick}
                        className={`flex-1 font-black py-4 rounded-[20px] flex items-center justify-center gap-2.5 transition-all hover:opacity-85 text-gray-900 shadow-lg text-[16px] sm:text-[18px] cursor-pointer ${
                            wishlisted ? 'custom-main-color-button' : 'border-gray-200 cursor-pointer custom-main-color-bg'
                        }`}
                    >
                        <Heart
                            size={20}
                            fill={wishlisted ? "#EF4444" : "none"}
                            className={wishlisted ? "text-red-500" : "text-gray-900"}
                        />
                        Favorite
                    </button>
                </div>

                {cartStatus === 'error' && cartError && (
                    <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 px-1">
                        <AlertCircle size={13} />
                        {cartError}
                    </p>
                )}
                {!selectedVariant && (
                    <p className="text-xs text-amber-500 font-semibold flex items-center gap-1.5 px-1">
                        <AlertCircle size={13} />
                        Please select a size and color before adding to cart.
                    </p>
                )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                    { icon: Truck,     label: 'Free Delivery',   sub: 'Orders over $100' },
                    { icon: RotateCcw, label: 'Free Returns',    sub: '30-day policy'    },
                    { icon: Shield,    label: '2-Year Warranty', sub: 'Full coverage'    },
                ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl border border-gray-100 input-theme">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 custom-main-color-card">
                            <Icon size={16} className="custom-main-color-icon" />
                        </div>
                        <div>
                            <p className="text-[12px] font-black leading-tight">{label}</p>
                            <p className="text-[10px] font-bold my-4">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}