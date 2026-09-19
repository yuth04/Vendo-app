"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/src/app/components/context/Wishlistcontext";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { DiscountListResponse } from "@/src/app/components/modules/wishlist/core/models/wishlistModel";
import WishlistHeader from "@/src/app/components/modules/wishlist/components/propertywishlists/WishlistHeader";
import WishlistSkeleton from "@/src/app/components/modules/wishlist/components/propertywishlists/WishlistSkeleton";
import WishlistEmpty from "@/src/app/components/modules/wishlist/components/propertywishlists/WishlistEmpty";
import WishlistGrid from "@/src/app/components/modules/wishlist/components/propertywishlists/WishlistGrid";
import WishlistPagination from "@/src/app/components/modules/wishlist/components/propertywishlists/WishlistPagination";
import {wishlistService} from "@/src/app/components/modules/wishlist/core/services/wishlistService";
import {useWishlistData} from "@/src/app/components/modules/wishlist/core/hook/useWishlistData";


const ITEMS_PER_PAGE                                           = 8;
const EMPTY_DISCOUNT_RES: DiscountListResponse                 = { message: "", discount: [] };
const EMPTY_REVIEWS: Review[]                                  = [];

const Wishlist = () => {
    const [mounted, setMounted]         = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const router                        = useRouter();
    const backPath                      = useRef<string>("/");

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (typeof document === "undefined") return;
        backPath.current = wishlistService.getBackPath(document.referrer, window.location.origin);
    }, []);

    const fetchReviews   = useCallback(() => reviewClient.fetchAllReviews(), []);
    const fetchProduct   = useCallback(() => productClient.fetchProduct(),   []);
    const fetchDiscounts = useCallback(() => productClient.fetchDiscounts(), []);

    const { data: reviewsRes,  loading: reviewsLoading  } = useWishlistData<Review[]>(fetchReviews, EMPTY_REVIEWS, true);
    const { data: productRes,  loading: productsLoading } = useWishlistData(fetchProduct, undefined, true);
    const { data: discountRes, loading: discountLoading } = useWishlistData<DiscountListResponse>(fetchDiscounts, EMPTY_DISCOUNT_RES, true);

    const { wishlists, count, loading: wishlistLoading } = useWishlist();

    const isInitialLoading = !mounted || wishlistLoading || productsLoading || discountLoading;

    const handleBack = () => {
        if (window.history.length > 1) router.back();
        else router.push(backPath.current);
    };

    const reviewsMap = useMemo(() => {
        return wishlistService.createReviewsMap(reviewsRes);
    }, [reviewsRes]);

    const discountMap = useMemo(() => {
        return wishlistService.createDiscountMap(discountRes);
    }, [discountRes]);

    const productMap = useMemo(() => {
        return wishlistService.createProductMap(productRes, discountMap);
    }, [productRes, discountMap]);

    const enrichedWishlists = useMemo(() => {
        return wishlistService.enrichWishlists(wishlists, productMap);
    }, [wishlists, productMap]);

    const { currentItems, totalPages } = useMemo(() => {
        return wishlistService.PaginateItems(enrichedWishlists, currentPage, ITEMS_PER_PAGE);
    }, [enrichedWishlists, currentPage]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => { setCurrentPage(1); }, [count]);

    return (
        <div className="max-w-7xl mx-auto py-4 lg:py-10">
            <WishlistHeader
                count={count}
                isInitialLoading={isInitialLoading}
                onBack={handleBack}
            />

            {isInitialLoading ? (
                <WishlistSkeleton />
            ) : count === 0 ? (
                <WishlistEmpty onBack={handleBack} />
            ) : (
                <>
                    <WishlistGrid
                        currentItems={currentItems}
                        reviewsMap={reviewsMap}
                    />

                    {totalPages > 1 && (
                        <WishlistPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Wishlist;