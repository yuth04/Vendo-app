"use client";

import {
  DiscountCategory,
  DiscountListResponse,
  Product as ProductType,
  TopSaleResponse,
  NewProductResponse,
} from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";

export const productsService = {
  /**
   * Filters a product list against space/hyphen-delimited search queries across
   * product name, description, brand, and category fields.
   */
  filterProducts(products: ProductType[], query: string): ProductType[] {
    if (!query.trim()) return products;

    const normalised = query.trim().toLowerCase().replace(/-/g, " ");
    const terms = normalised.split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const haystack = [
        p.productName,
        p.description,
        p.brand?.name,
        p.category?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return terms.every((term) => haystack.includes(term));
    });
  },

  /**
   * Constructs a fast-lookup Map (product_id -> discount_price) from the discount API payload.
   */
  buildDiscountMap(
    discountRes: DiscountListResponse | undefined,
  ): Map<number, number> {
    const map = new Map<number, number>();
    const list: DiscountCategory[] = discountRes?.discount ?? [];

    list.forEach((d) => {
      (d.products ?? []).forEach((p) => {
        if (p.id && p.discount_price) {
          map.set(Number(p.id), Number(p.discount_price));
        }
      });
    });

    return map;
  },

  /**
   * Groups review records into a Map keyed by product ID (product_id -> Review[]).
   */
  buildReviewsMap(reviewsRes: Review[] | undefined): Map<number, Review[]> {
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
   * Merges base products with top sales items, giving priority positioning to top sales.
   */
  mergeAllProducts(
    productRes: { product?: any[] } | undefined,
    topSalesRes: TopSaleResponse | undefined,
    discountMap: Map<number, number>,
    isTopSaleFilter: boolean,
  ): ProductType[] {
    const regularItems = (productRes?.product ?? []).map((p) => ({
      ...p,
      discount_price: discountMap.get(p.id) ?? null,
    }));

    if (isTopSaleFilter && topSalesRes?.products) {
      const topSaleItems: ProductType[] = topSalesRes.products.map((p) => ({
        id: p.id,
        productName: p.productName,
        description: p.description || "",
        price: p.price,
        discount_price: discountMap.get(p.id) ?? null,
        image: p.image || "",
        category: p.category ? { id: 0, name: p.category } : null,
        brand: null,
      })) as unknown as ProductType[];

      const topSaleIds = new Set(topSaleItems.map((item) => item.id));
      const remainingRegularItems = regularItems.filter(
        (item) => !topSaleIds.has(item.id),
      );

      return [...topSaleItems, ...remainingRegularItems];
    }

    return regularItems;
  },

  /**
   * Merges base products with newly fetched items for filter=new.
   */
  mergeNewProducts(
    newProductsRes: NewProductResponse | undefined,
    productRes: { product?: any[] } | undefined,
    discountMap: Map<number, number>,
  ): ProductType[] {
    const regularItems = (productRes?.product ?? []).map((p) => ({
      ...p,
      discount_price: discountMap.get(p.id) ?? null,
    }));

    if (!newProductsRes?.products?.length) return regularItems;

    const newItems: ProductType[] = newProductsRes.products.map((p) => ({
      id: p.id,
      productName: p.productName,
      description: "",
      price: p.price,
      discount_price: discountMap.get(p.id) ?? null,
      image: p.image || "",
      category: p.category ? { id: 0, name: p.category } : null,
      brand: null,
    })) as unknown as ProductType[];

    const newIds = new Set(newItems.map((item) => item.id));
    const remainingRegularItems = regularItems.filter(
      (item) => !newIds.has(item.id),
    );

    return [...newItems, ...remainingRegularItems];
  },

  /**
   * Slices product data array according to target page offset and items-per-page limit.
   */
  getPaginatedData(
    filteredProducts: ProductType[],
    currentPage: number,
    productsPerPage: number,
  ) {
    const total = Math.ceil(filteredProducts.length / productsPerPage) || 1;
    const start = (currentPage - 1) * productsPerPage;

    return {
      currentProducts: filteredProducts.slice(start, start + productsPerPage),
      totalPages: total,
    };
  },
};
