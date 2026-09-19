"use client"

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import Link from "next/link";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import Image from "next/image";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { useWishlist } from "@/src/app/components/context/Wishlistcontext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";
import { User } from "@/src/app/components/modules/auth/core/models/authModel";
import {
    EMPTY_REVIEWS,
    EMPTY_TOP_SALES_RES,
    TopSaleProduct,
    TopSaleResponse,
    DiscountCategory,
    DiscountListResponse,
    BrandListResponse,
} from "@/src/app/components/modules/products/core/models/productsModel";
import NotFound from "@/src/app/components/helpers/components/NotFound";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";



const EMPTY_DISCOUNT_RES: DiscountListResponse = { message: "", discount: [] };
const EMPTY_BRAND_RES: BrandListResponse = { data: { brands: [] }, message: "", success: false } as any;

const TopSale = () => {
    const [activeTabName, setActiveTabName] = useState<string | "All">("All");
    const [user, setUser] = useState<User | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { showToast } = useAlert();

    useEffect(() => {
        setUser(authService.getStoredUser());
        const onAuthUpdate = () => setUser(authService.getStoredUser());
        window.addEventListener('auth-updated', onAuthUpdate);
        return () => window.removeEventListener('auth-updated', onAuthUpdate);
    }, []);

    const fetchTopSales  = useCallback(() => productClient.fetchTopSales(), []) as () => Promise<any>;
    const fetchDiscounts = useCallback(() => productClient.fetchDiscounts(), []) as () => Promise<any>;
    const fetchReviews   = useCallback(() => reviewClient.fetchAllReviews(), []);
    const fetchBrands    = useCallback(() => productClient.fetchBrandProduct(), []) as () => Promise<any>;

    const { data: topSalesRes,  loading: isTopSalesLoading  } = useApiData<TopSaleResponse>(fetchTopSales,  EMPTY_TOP_SALES_RES,  true);
    const { data: discountRes,  loading: isDiscountLoading  } = useApiData<DiscountListResponse>(fetchDiscounts, EMPTY_DISCOUNT_RES, true);
    const { data: reviewsRes,   loading: isReviewLoading    } = useApiData<Review[]>(fetchReviews, EMPTY_REVIEWS, true);
    const { data: brandsRes,    loading: isBrandsLoading    } = useApiData<BrandListResponse>(fetchBrands, EMPTY_BRAND_RES, true);

    const { isWishlisted, toggleWishlist } = useWishlist();

    const discountMap = useMemo<Map<number, number>>(() => {
        const map = new Map<number, number>();
        const list: DiscountCategory[] = discountRes?.discount ?? [];
        list.forEach((d) => {
            (d.products ?? []).forEach((p) => {
                if (p.id && p.discount_price) {
                    map.set(Number(p.id), parseFloat(p.discount_price));
                }
            });
        });
        return map;
    }, [discountRes]);

    // Map product id → brand name from brands API
    const brandNameMap = useMemo<Map<number, string>>(() => {
        const map = new Map<number, string>();
        const brands = (brandsRes as any)?.data?.brands ?? (brandsRes as any)?.brands ?? [];
        brands.forEach((brand: any) => {
            (brand.products ?? []).forEach((p: any) => {
                map.set(Number(p.id), brand.name);
            });
        });
        return map;
    }, [brandsRes]);

    const productsList = useMemo<TopSaleProduct[]>(() => {
        return topSalesRes?.products ?? [];
    }, [topSalesRes]);

    const dynamicCategories = useMemo<string[]>(() => {
        const uniqueCats = new Set<string>();
        productsList.forEach((p) => {
            if (p.category) uniqueCats.add(p.category);
        });
        return Array.from(uniqueCats);
    }, [productsList]);

    const reviewsMap = useMemo<Map<number, Review[]>>(() => {
        const map = new Map<number, Review[]>();
        const list = Array.isArray(reviewsRes) ? reviewsRes : [];
        list.forEach((r) => {
            const existing = map.get(r.product_id) ?? [];
            existing.push(r);
            map.set(r.product_id, existing);
        });
        return map;
    }, [reviewsRes]);

    const filteredProducts = useMemo(() => {
        if (activeTabName === "All") return productsList;
        return productsList.filter((p) => p.category === activeTabName);
    }, [activeTabName, productsList]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - 200 : scrollLeft + 200,
                behavior: 'smooth',
            });
        }
    };

    const getStarsFromCount = (count: number): number => {
        if (count >= 8) return 5;
        if (count >= 5) return 4;
        if (count >= 3) return 3;
        if (count >= 2) return 2;
        if (count >= 1) return 1;
        return 0;
    };

    const handleWishlistClick = async (e: React.MouseEvent, product: TopSaleProduct, wishlisted: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (user) {
            if (!wishlisted) {
                showToast(`Successfully added "${product.productName}" to your wishlist.`, "success", "Added to Favorites");
            } else {
                showToast(`Removed "${product.productName}" from your wishlist.`, "info", "Removed from Favorites");
            }
        }
        await toggleWishlist(product.id);
    };

    const loading = isTopSalesLoading || isDiscountLoading || isReviewLoading || isBrandsLoading;

    return (
        <section className="max-w-7xl mx-auto py-2 sm:py-5">
            {/* Header + category scroll tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-14">
                <div className="flex items-center gap-3">
                    <h2 className="text-[24px] sm:text-[30px] md:text-[30px] lg:text-[36px] font-bold custom-main-color-text">
                        Top Sales
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="flex-shrink-0 w-10 h-10 rounded-[20px] border-2 card-theme flex items-center justify-center custom-main-color-border-hover transition-all shadow-sm cursor-pointer"
                    >
                        <ChevronLeft size={35} strokeWidth={1.5}/>
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-[300px] sm:max-w-md lg:max-w-xl"
                    >
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-200 rounded-[20px] h-10 w-20 flex-shrink-0"/>
                            ))
                        ) : dynamicCategories.length === 0 ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-400 rounded-[20px] h-10 w-20 flex-shrink-0 input-theme"/>
                            ))
                        ) : (
                            <>
                                <button
                                    key="tab-all"
                                    onClick={() => setActiveTabName('All')}
                                    className={`px-6 py-2 rounded-[20px] text-[14px] font-black whitespace-nowrap cursor-pointer border-2 card-theme ${
                                        activeTabName === 'All' ? 'custom-main-color-bg text-white' : 'custom-main-color-border-hover'
                                    }`}
                                >
                                    All Products
                                </button>
                                {dynamicCategories.map((catName) => (
                                    <button
                                        key={catName}
                                        onClick={() => setActiveTabName(catName)}
                                        className={`px-6 py-2 rounded-[20px] text-[14px] font-black whitespace-nowrap cursor-pointer border-2 card-theme ${
                                            activeTabName === catName ? 'custom-main-color-bg text-white' : 'custom-main-color-border-hover'
                                        }`}
                                    >
                                        {catName}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="flex-shrink-0 w-10 h-10 rounded-[20px] border-2 card-theme flex items-center justify-center custom-main-color-border-hover transition-all shadow-sm cursor-pointer"
                    >
                        <ChevronRight size={35} strokeWidth={1.5}/>
                    </button>
                </div>
            </div>

            {/* Products grid / conditional state handler */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 gap-y-4 min-h-[400px]">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={`skeleton-${i}`} className="flex flex-col gap-3 rounded-[2rem] border-2 card-theme p-4 bg-[var(--header-bg)]">
                            <div className="animate-pulse bg-gray-200/50 aspect-square rounded-2xl w-full"/>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded-[20px] w-1/3 animate-pulse"/>
                                <div className="h-4 bg-gray-200 rounded-[20px] w-full animate-pulse"/>
                                <div className="h-4 bg-gray-200 rounded-[20px] w-1/2 animate-pulse"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 gap-y-4 min-h-[400px]">
                    {filteredProducts.slice(0, 4).map((product) => {
                        const imageSrc = product.image || "";
                        const hoverImageSrc = (product as any).hoverImage || imageSrc;
                        const wishlisted = isWishlisted(product.id);

                        const dynamicDiscountPrice = discountMap.get(product.id) ?? null;
                        const hasDiscount = dynamicDiscountPrice != null;
                        const originalPrice   = Number(product.price);
                        const discountedPrice = dynamicDiscountPrice ?? originalPrice;

                        const productReviews = reviewsMap.get(product.id) ?? [];
                        const avgRating = productReviews.length > 0
                            ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
                            : 0;

                        const brandName = brandNameMap.get(product.id) ?? '';

                        return (
                            <div
                                key={product.id}
                                className="flex flex-col group cursor-pointer rounded-[2rem] border-2 card-theme p-4 transition-all duration-500 hover:shadow-md custom-main-color-border-hover bg-[var(--header-bg)]"
                            >
                                <Link href={`/product-details/${product.id}`} className="w-full h-full relative flex flex-col">
                                    <div className="relative rounded-2xl overflow-hidden flex items-center h-44 sm:h-60 justify-center mb-4 bg-neutral-50/50">
                                        {imageSrc ? (
                                            <>
                                                <Image
                                                    src={imageSrc}
                                                    alt={product.productName}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className={`object-contain transition-all duration-700 ease-in-out ${
                                                        hoverImageSrc !== imageSrc ? "group-hover:opacity-0 group-hover:scale-[1.02]" : "group-hover:scale-[1.03]"
                                                    }`}
                                                />
                                                {hoverImageSrc !== imageSrc && (
                                                    <Image
                                                        src={hoverImageSrc}
                                                        alt={`${product.productName} alternate view`}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        className="object-contain opacity-0 group-hover:opacity-100 scale-[1.01] group-hover:scale-[1.03] transition-all duration-700 ease-in-out absolute inset-0"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-xs italic font-bold text-center px-2 opacity-20">
                                                [{product.productName}]
                                            </div>
                                        )}

                                        {hasDiscount && (
                                            <div className="absolute top-3 left-3 z-10 custom-main-color-bg text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-95">
                                                -{Math.round((1 - discountedPrice / originalPrice) * 100)}%
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => handleWishlistClick(e, product, wishlisted)}
                                            className={`absolute top-3 right-1.5 sm:right-2 p-2 sm:p-2.5 rounded-full shadow-md transition-all duration-300 z-10 card-theme cursor-pointer text-[var(--header-text)] ${
                                                wishlisted ? "text-red-500 scale-110" : "hover:text-red-500 hover:scale-105 active:scale-95"
                                            }`}
                                            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                        >
                                            <Heart size={18} className={wishlisted ? "fill-red-500 stroke-red-500" : ""}/>
                                        </button>
                                    </div>

                                    <div className="px-2 flex flex-col flex-1 justify-between">
                                        <div>
                                            <p className="text-[10px] sm:text-[12px] font-black tracking-widest uppercase custom-main-color-text truncate">
                                                {brandName || 'Brand'}
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
                                                                    i < getStarsFromCount(productReviews.length)
                                                                        ? "fill-yellow-400 stroke-yellow-400"
                                                                        : "fill-none stroke-gray-300"
                                                                }`}
                                                            />
                                                            <Star
                                                                size={15}
                                                                className={`hidden sm:block ${
                                                                    i < getStarsFromCount(productReviews.length)
                                                                        ? "fill-yellow-400 stroke-yellow-400"
                                                                        : "fill-none stroke-gray-300"
                                                                }`}
                                                            />
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                <span
                                                    className="text-[10px] sm:text-[12px] text-gray-500 font-bold ml-1">
                                                    ({productReviews.length})
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="h-[1px] input-theme w-full mb-4"/>
                                            <div className="flex items-center gap-2 pb-2">
                                                <span
                                                    className="text-[16px] sm:text-[18px] text-[var(--header-text)] font-black">
                                                    ${discountedPrice.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                </span>
                                                {hasDiscount && (
                                                    <span
                                                        className="text-[12px] sm:text-[14px] font-semibold text-gray-400 line-through">
                                                        ${originalPrice.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : activeTabName !== "All" ? (
                <NotFound
                    title="Products Not Found"
                    description="There are no products available for this category selection yet."
                    imageSrc={Notfound}
                />
            ) : (
                <EmptyState
                    title="No Top Sales Found"
                    description="The sales inventory catalog is currently empty right now."
                    imageSrc={Notfound}
                    buttonText="Refresh Page"
                    onAction={() => window.location.reload()}
                />
            )}

            <div className="py-4 sm:py-8 flex justify-end">
                <Link
                    href="/products?filter=topsale"
                    className="flex items-center gap-2 group custom-main-color-text font-black text-[16px] sm:text-[20px]"
                >
                    <span>Show More</span>
                    <ArrowRight size={24} className="transition-transform group-hover:translate-x-2"/>
                </Link>
            </div>
        </section>
    );
};

export default TopSale;