"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useRouter, useParams } from "next/navigation";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import {
    Brand,
    DiscountCategory,
    DiscountListResponse,
} from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import PromotionsBanner from "@/src/app/components/modules/promotions/components/propertypromotions/PromotionsBanner";
import PromotionsHeader from "@/src/app/components/modules/promotions/components/propertypromotions/PromotionsHeader";
import PromotionsSkeleton from "@/src/app/components/modules/promotions/components/propertypromotions/PromotionsSkeleton";
import PromotionsSlugView from "@/src/app/components/modules/promotions/components/propertypromotions/PromotionsSlugView";
import PromotionsAllView from "@/src/app/components/modules/promotions/components/propertypromotions/PromotionsAllView";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";



const ITEMS_PER_PAGE                                           = 8;
const EMPTY_BRANDS: Brand[]                                    = [];
const EMPTY_REVIEWS: Review[]                                  = [];

function flattenCategory(category: DiscountCategory) {
    const seen = new Set<number>();
    return (category.products ?? [])
        .map((product) => ({
            discountId: category.id,
            amount:     category.amount,
            type:       category.type,
            product,
        }))
        .filter(({ product }) => {
            if (seen.has(product.id)) return false;
            seen.add(product.id);
            return true;
        });
}

interface PromotionsProps {
    initialSlug?: string;
}

const Promotions = ({ initialSlug }: PromotionsProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedCode, setCopiedCode]   = useState<string | null>(null);
    const router                        = useRouter();
    const params                        = useParams();
    const slug                          = initialSlug || (params?.slug as string | undefined);

    const fetchDiscounts = useCallback(() => productClient.fetchDiscounts(), []);
    const { data: discountRes, loading, error } = useApiData<DiscountListResponse>(
        fetchDiscounts,
        { message: "", discount: [] },
        true,
    );

    const fetchBrands = useCallback(() => productClient.fetchBrandProduct(), []);
    const { data: brandsRes } = useApiData<{ brands: Brand[] }>(fetchBrands, { brands: EMPTY_BRANDS }, true);

    const fetchReviews = useCallback(() => reviewClient.fetchAllReviews(), []);
    const { data: reviewsRes } = useApiData<Review[]>(fetchReviews, EMPTY_REVIEWS, true);

    const categoryRes = discountRes?.discount ?? [];

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const brandMap = useMemo<Map<number, string>>(() => {
        const map = new Map<number, string>();
        (brandsRes?.brands ?? []).forEach((b) => map.set(b.id, b.name));
        return map;
    }, [brandsRes]);

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

    const targetCategory = useMemo(() => {
        if (!slug || !Array.isArray(categoryRes)) return null;
        return categoryRes.find((cat) => cat.slug === slug) ?? null;
    }, [categoryRes, slug]);

    const slugItems = useMemo(
        () => (targetCategory ? flattenCategory(targetCategory) : []),
        [targetCategory],
    );

    const allCategories = useMemo(() => {
        if (!Array.isArray(categoryRes)) return [];
        return categoryRes
            .filter((cat) => (cat.products ?? []).length > 0)
            .map((cat) => ({ category: cat, items: flattenCategory(cat) }))
            .filter(({ items }) => items.length > 0);
    }, [categoryRes]);

    const totalPages = Math.max(1, Math.ceil(slugItems.length / ITEMS_PER_PAGE));

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return slugItems.slice(start, start + ITEMS_PER_PAGE);
    }, [slugItems, currentPage]);

    const goPrev = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    const goNext = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    return (
        <section className="pb-12 font-sans">

            {slug && targetCategory?.banner_image && (
                <PromotionsBanner
                    targetCategory={targetCategory}
                    onBack={() => router.back()}
                />
            )}

            <PromotionsHeader
                slug={slug}
                targetCategory={targetCategory}
                slugItemsCount={slugItems.length}
                allCategoriesCount={allCategories.length}
                loading={loading}
                copiedCode={copiedCode}
                onBack={() => router.back()}
                onCopy={handleCopy}
            />

            <div className="max-w-7xl mx-auto">
                {loading && <PromotionsSkeleton count={8} />}

                {!loading && error && (
                    <EmptyState
                        title="Failed to Load Promotions"
                        description="An unexpected error occurred while fetching promotional data."
                        imageSrc={Notfound}
                        buttonText="Retry Connection"
                        onAction={() => window.location.reload()}
                    />
                )}

                {!loading && !error && slug && (
                    <PromotionsSlugView
                        currentItems={currentItems}
                        slugItemsCount={slugItems.length}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        brandMap={brandMap}
                        reviewsMap={reviewsMap}
                        onPrev={goPrev}
                        onNext={goNext}
                        onSetPage={setCurrentPage}
                    />
                )}

                {!loading && !error && !slug && (
                    <PromotionsAllView
                        allCategories={allCategories}
                        brandMap={brandMap}
                        reviewsMap={reviewsMap}
                    />
                )}
            </div>
        </section>
    );
};

export default Promotions;