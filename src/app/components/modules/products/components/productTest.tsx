"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  DiscountListResponse,
  Product as ProductType,
  TopSaleResponse,
  NewProductResponse,
  EMPTY_NEW_PRODUCTS_RES,
} from "@/src/app/components/modules/products/core/models/productsModel";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import ProductPageHeader from "./ProductPageHeader";
import ProductGrid from "./ProductGrid";
import ProductPagination from "./ProductPagination";
import { productsService } from "@/src/app/components/modules/products/core/services/productsService";
import { searchService } from "@/src/app/components/layout/header/search/core/services/searchService";
import { ImageSearchProduct } from "@/src/app/components/layout/header/search/core/models/searchModel";

const EMPTY_DISCOUNT_RES: DiscountListResponse = { message: "", discount: [] };
const EMPTY_TOP_SALES_RES: TopSaleResponse = {
  success: false,
  message: "",
  products: [],
};
const EMPTY_REVIEWS: Review[] = [];

const Product = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") ?? "";
  const isTopSaleFilter = searchParams.get("filter") === "topsale";
  const isNewFilter = searchParams.get("filter") === "new"; // ← add
  const isImageSearch = searchParams.get("imageSearch") === "true";
  const isSearchMode = !!searchQuery;
  const productsPerPage = 16;

  const [isMounted, setIsMounted] = useState(false);
  const [imageResults, setImageResults] = useState<ImageSearchProduct[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isImageSearch) {
      setImageResults([]);
      return;
    }
    const results = searchService.getStoredImageResults();
    setImageResults(results || []);
  }, [isImageSearch, searchQuery]);

  useEffect(() => {
    if (!isImageSearch && searchQuery) {
      searchService.clearImageResults();
    }
  }, [isImageSearch, searchQuery]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, isTopSaleFilter, isNewFilter, isImageSearch]);

  const fetchProducts = useCallback(
    () => productClient.fetchProduct(),
    [],
  ) as () => Promise<any>;
  const fetchDiscounts = useCallback(
    () => productClient.fetchDiscounts(),
    [],
  ) as () => Promise<any>;
  const fetchTopSales = useCallback(
    () => productClient.fetchTopSales(),
    [],
  ) as () => Promise<any>;
  const fetchReviews = useCallback(() => reviewClient.fetchAllReviews(), []);
  const fetchNewProducts = useCallback(
    () => productClient.fetchNewProducts(),
    [],
  ) as () => Promise<any>; // ← add

  const { data: productRes, loading: isProductLoading } = useApiData(
    fetchProducts,
    undefined,
    true,
  );
  const { data: discountRes, loading: isDiscountLoading } =
    useApiData<DiscountListResponse>(fetchDiscounts, EMPTY_DISCOUNT_RES, true);
  const { data: topSalesRes, loading: isTopSalesLoading } =
    useApiData<TopSaleResponse>(fetchTopSales, EMPTY_TOP_SALES_RES, true);
  const { data: reviewsRes, loading: isReviewLoading } = useApiData<Review[]>(
    fetchReviews,
    EMPTY_REVIEWS,
    true,
  );
  const { data: newProductsRes, loading: isNewProductsLoading } =
    useApiData<NewProductResponse>(
      fetchNewProducts,
      EMPTY_NEW_PRODUCTS_RES,
      true,
    ); // ← add

  const loading =
    isProductLoading ||
    isDiscountLoading ||
    isTopSalesLoading ||
    isReviewLoading ||
    isNewProductsLoading;

  const discountMap = useMemo<Map<number, number>>(() => {
    return productsService.buildDiscountMap(discountRes);
  }, [discountRes]);

  const reviewsMap = useMemo<Map<number, Review[]>>(() => {
    return productsService.buildReviewsMap(reviewsRes);
  }, [reviewsRes]);

  const allProducts = useMemo<ProductType[]>(() => {
    // ← handle filter=new
    if (isNewFilter) {
      return productsService.mergeNewProducts(
        newProductsRes as any,
        productRes,
        discountMap,
      );
    }
    return productsService.mergeAllProducts(
      productRes,
      topSalesRes,
      discountMap,
      isTopSaleFilter,
    );
  }, [
    productRes,
    discountMap,
    topSalesRes,
    isTopSaleFilter,
    isNewFilter,
    newProductsRes,
  ]);

  const imageSearchProducts = useMemo<ProductType[]>(() => {
    if (!isImageSearch || imageResults.length === 0) return [];

    if (!allProducts || allProducts.length === 0) {
      return imageResults.map((r: any) => ({
        id: Number(r.id || r.productId || r.product_id || 0),
        productName: r.productName || r.name || "Visual Match",
        image: r.image || "",
        price: r.price || 0,
        description: r.description || "",
      })) as unknown as ProductType[];
    }

    const productMap = new Map<string, ProductType>();
    allProducts.forEach((p) => {
      if (p && p.id) productMap.set(String(p.id), p);
    });

    const mapped = imageResults
      .map((r: any) => {
        const targetId = String(r.id || r.productId || r.product_id || "");
        return productMap.get(targetId);
      })
      .filter((p): p is ProductType => p !== undefined);

    if (mapped.length === 0 && imageResults.length > 0) {
      return imageResults.map((r: any) => ({
        id: Number(r.id || r.productId || r.product_id || 0),
        productName: r.productName || r.name || "Visual Match",
        image: r.image || "",
        price: r.price || 0,
        description: r.description || "",
      })) as unknown as ProductType[];
    }

    return mapped;
  }, [isImageSearch, imageResults, allProducts]);

  const filteredProducts = useMemo<ProductType[]>(() => {
    if (!isMounted) return [];
    if (isImageSearch) return imageSearchProducts;
    if (isSearchMode)
      return productsService.filterProducts(allProducts, searchQuery);
    return allProducts;
  }, [
    isMounted,
    isImageSearch,
    imageSearchProducts,
    isSearchMode,
    allProducts,
    searchQuery,
  ]);

  const { currentProducts, totalPages } = useMemo(() => {
    return productsService.getPaginatedData(
      filteredProducts,
      currentPage,
      productsPerPage,
    );
  }, [filteredProducts, currentPage, productsPerPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const finalSearchQuery = isImageSearch ? "visual search" : searchQuery;
  const finalProductsCount = isMounted ? filteredProducts.length : 0;

  return (
    <div className="max-w-7xl mx-auto py-2 sm:py-4 px-4">
      <ProductPageHeader
        isSearchMode={isSearchMode || isImageSearch}
        searchQuery={finalSearchQuery}
        filteredCount={finalProductsCount}
        loading={loading && finalProductsCount === 0}
      />

      <ProductGrid
        loading={(loading && finalProductsCount === 0) || !isMounted}
        products={currentProducts}
        reviewsMap={reviewsMap}
      />

      {!loading && isMounted && totalPages > 1 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Product;
