"use client";

import React from "react";
import Image from "next/image";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import CategoryProductCard from "./CategoryProductCard";

const ITEMS_PER_PAGE = 6;

interface Props {
    loading: boolean;
    products: Product[];
    reviewsMap: Map<number, Review[]>;
    maxPriceCap: number;
    onClearFilters: () => void;
}

export default function CategoryProductGrid({ loading, products, reviewsMap, maxPriceCap, onClearFilters }: Props) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 xl:grid-cols-3 gap-y-4">
            {loading ? (
                Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-[2rem] border-2 card-theme p-4 bg-[var(--header-bg)]">
                        <div className="animate-pulse bg-gray-200/50 aspect-square rounded-2xl w-full"/>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded-[20px] w-1/3 animate-pulse"/>
                            <div className="h-4 bg-gray-200 rounded-[20px] w-full animate-pulse"/>
                            <div className="h-4 bg-gray-200 rounded-[20px] w-1/2 animate-pulse"/>
                        </div>
                    </div>
                ))
            ) : products.length > 0 ? (
                products.map((product) => (
                    <CategoryProductCard
                        key={product.id}
                        product={product}
                        reviews={reviewsMap.get(product.id) ?? []}
                    />
                ))
            ) : (
                <div className="col-span-full py-20 px-4">
                    <div className="max-w-sm mx-auto text-center">
                        <div className="w-20 h-20 custom-main-color-card rounded-3xl flex items-center justify-center mx-auto mb-6 border custom-main-border">
                            <Image src={Notfound} alt="Empty" width={40} height={40} className="opacity-40 grayscale" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight mb-2">No Products Found</h3>
                        <p className="text-[13px] text-gray-400 font-medium leading-relaxed mb-5">
                            Try adjusting your filters or browse another category.
                        </p>
                        <button
                            onClick={onClearFilters}
                            className="px-5 py-2.5 custom-main-color-bg text-gray-900 rounded-full text-[11px] font-black uppercase tracking-wider transition-all hover:bg-[#d4cf50] cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}