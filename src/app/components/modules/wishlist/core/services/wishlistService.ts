'use client';

import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { DiscountCategory, DiscountListResponse } from "@/src/app/components/modules/wishlist/core/models/wishlistModel";

export const wishlistService = {
    /**
     * Determines the optimal local fallback path parsing the history entry referrer safely
     */
    getBackPath(referrer: string, origin: string): string {
        try {
            if (referrer) {
                const url = new URL(referrer);
                if (url.origin === origin) {
                    return url.pathname + url.search;
                }
            }
        } catch {
            // Safe fallback
        }
        return "/";
    },

    /**
     * Aggregates reviews arrays indexing them by key relationships
     */
    createReviewsMap(reviewsRes: Review[] | undefined): Map<number, Review[]> {
        const map = new Map<number, Review[]>();
        const list = Array.isArray(reviewsRes) ? reviewsRes : [];
        list.forEach((r) => {
            const existing = map.get(r.product_id) ?? [];
            existing.push(r);
            map.set(r.product_id, existing);
        });
        return map;
    },

    /**
     * Maps calculated decimal variables extracted across categorical promotional indices
     */
    createDiscountMap(discountRes: DiscountListResponse | undefined): Map<number, number> {
        const map = new Map<number, number>();
        const list: DiscountCategory[] = discountRes?.discount ?? [];
        list.forEach((d) => {
            (d.products ?? []).forEach((p) => {
                if (p.id && p.discount_price) {
                    const price = parseFloat(p.discount_price);
                    if (!isNaN(price)) map.set(Number(p.id), price);
                }
            });
        });
        return map;
    },

    /**
     * Builds product indexes embedding calculated reduction references
     */
    createProductMap(productRes: any, discountMap: Map<number, number>): Map<number, Product> {
        const map = new Map<number, Product>();
        (productRes?.product ?? []).forEach((p: any) =>
            map.set(p.id, { ...p, discount_price: discountMap.get(p.id) ?? null })
        );
        return map;
    },

    /**
     * Merges relational details matching products directly into collections lists
     */
    enrichWishlists(wishlists: any[], productMap: Map<number, Product>): any[] {
        return wishlists.map((item) => ({
            ...item,
            product: productMap.get(item.product_id) ?? item.product ?? null,
        }));
    },

    /**
     * Evaluates window bounds calculating sub-slice positions
     */
    PaginateItems(enrichedWishlists: any[], currentPage: number, itemsPerPage: number) {
        const total = Math.ceil(enrichedWishlists.length / itemsPerPage) || 1;
        const start = (currentPage - 1) * itemsPerPage;
        return {
            currentItems: enrichedWishlists.slice(start, start + itemsPerPage),
            totalPages: total,
        };
    }
};