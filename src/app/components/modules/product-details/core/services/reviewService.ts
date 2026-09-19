'use client';

import {
    DiscountCategory,
    Product,
    ProductVariant
} from "@/src/app/components/modules/products/core/models/productsModel";

export const reviewService = {
    /**
     * Resolves matching variant items matching specific configurations
     */
    findSelectedVariant(product: Product | null, size: string, color: string): ProductVariant | undefined {
        return product?.variants?.find((v) => v.size === size && v.color === color);
    },

    /**
     * Maps product lists to internal pricing hashes
     */
    buildDiscountMap(discounts: DiscountCategory[]): Map<number, number> {
        const map = new Map<number, number>();
        discounts.forEach((d) => {
            (d.products ?? []).forEach((p) => {
                if (p.id && p.discount_price) map.set(Number(p.id), parseFloat(p.discount_price));
            });
        });
        return map;
    },

    /**
     * Maps global discount values back down to array items
     */
    mapCompatibleWithDiscounts(compatible: Product[], discountMap: Map<number, number>): Product[] {
        return compatible.map((p) => ({ ...p, discount_price: discountMap.get(p.id) ?? null }));
    },

    /**
     * Evaluates markdown rates, absolute differentials, and dynamic price keys
     */
    calculatePricing(product: Product | null, discountMap: Map<number, number>) {
        const productDiscountPrice = product ? (discountMap.get(product.id) ?? null) : null;
        const hasDiscount          = productDiscountPrice != null;
        const originalPrice        = Number(product?.price ?? 0);
        const discountedPrice      = productDiscountPrice ?? originalPrice;
        const discountPct          = hasDiscount ? Math.round((1 - discountedPrice / originalPrice) * 100) : 0;

        return {
            hasDiscount,
            originalPrice,
            discountedPrice,
            discountPct
        };
    },

    /**
     * Builds and sequences images associated to current configurations
     */
    getCurrentVariantImages(selectedVariant: ProductVariant | undefined, variantImages: ProductVariant[]) {
        if (!selectedVariant) return [];
        const match = variantImages.find((v) => v.id === selectedVariant.id);
        return (match?.images ?? []).sort((a, b) => a.position - b.position);
    },

    /**
     * Pools all child variant images into single sequential list
     */
    getAllImages(variantImages: ProductVariant[]) {
        return variantImages.flatMap((v) => v.images).sort((a, b) => a.position - b.position);
    },

    /**
     * Picks fallback gallery stacks when standard variations are missing
     */
    getThumbnails(currentVariantImages: any[], allImages: any[]) {
        return currentVariantImages.length ? currentVariantImages : allImages;
    },


    /**
     * Extract clean distinct sizes from properties
     */
    getUniqueSizes(product: Product | null): string[] {
        return [...new Set((product?.variants ?? []).map((v: ProductVariant) => v.size))];
    },

    /**
     * Extract clean distinct color codes from properties
     */
    getUniqueColors(product: Product | null): string[] {
        return [...new Set((product?.variants ?? []).map((v: ProductVariant) => v.color))];
    }
};