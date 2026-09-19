"use client";

import React from "react";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { useWishlist } from "@/src/app/components/context/Wishlistcontext";
import ProductCard from "./ProductCard";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";

interface Props {
  loading: boolean;
  products: Product[];
  reviewsMap: Map<number, Review[]>;
}

export default function ProductGrid({ loading, products, reviewsMap }: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex flex-col gap-3 rounded-[2rem] border-2 card-theme p-4 bg-[var(--header-bg)]"
              >
                <div className="animate-pulse bg-gray-200/50 aspect-square rounded-2xl w-full" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded-[20px] w-1/3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded-[20px] w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded-[20px] w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              reviews={reviewsMap.get(product.id) ?? []}
              isLiked={isWishlisted(product.id)}
              onToggleWishlist={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await toggleWishlist(product.id);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Products Not Found"
          description="There are no products available matching this context right now."
          imageSrc={Notfound}
          buttonText="Reset Filters"
          onAction={() => window.location.reload()}
        />
      )}
    </>
  );
}
