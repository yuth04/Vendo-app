"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import FilterSidebar, { SidebarProps, SortOrder } from "@/src/app/components/modules/categories/components/FilterSidebar";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import { homeClient } from "@/src/app/components/modules/home/core/api/homeClient";
import { Brand, DiscountCategory, Product } from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { ParentCategory } from "@/src/app/components/modules/home/core/models/homeModel";
import CategoryBanner from "../propertycategories/CategoryBanner";
import CategoryMobileFilter from "../propertycategories/CategoryMobileFilter";
import CategoryProductGrid from "../propertycategories/CategoryProductGrid";
import CategoryPagination from "../propertycategories/CategoryPagination";

const ITEMS_PER_PAGE = 6;

let _cachedProducts:      Product[]          = [];
let _cachedBrands:        Brand[]            = [];
let _cachedDiscounts:     DiscountCategory[] = [];
let _cachedReviews:       Review[]           = [];
let _cachedParentCats:    ParentCategory[]   = [];
let _isFetched    = false;
let _isFetching   = false;
let _fetchPromise: Promise<void> | null      = null;

function fetchOnce(): Promise<void> {
    if (_isFetched) return Promise.resolve();
    if (_isFetching && _fetchPromise) return _fetchPromise;

    _isFetching   = true;
    _fetchPromise = Promise.all([
        productClient.fetchProduct(),
        productClient.fetchBrandProduct(),
        productClient.fetchDiscounts(),
        reviewClient.fetchAllReviews(),
        homeClient.fetchParentCategories(),
    ]).then(([productRes, brandRes, discountRes, reviewRes, parentCatRes]) => {
        _cachedProducts  = productRes?.data?.product ?? [];
        _cachedBrands    = brandRes?.data?.brands ?? [];
        const dRes       = discountRes as any;
        _cachedDiscounts = dRes?.data?.discount ?? dRes?.discount ?? [];
        _cachedReviews   = Array.isArray(reviewRes?.data) ? reviewRes.data : [];

        let parentData: ParentCategory[] = [];
        if (Array.isArray(parentCatRes)) {
            parentData = parentCatRes as unknown as ParentCategory[];
        } else if (parentCatRes && Array.isArray((parentCatRes as any).data)) {
            parentData = (parentCatRes as any).data as ParentCategory[];
        } else if ((parentCatRes as any)?.data && Array.isArray(((parentCatRes as any).data as any).data)) {
            parentData = ((parentCatRes as any).data as any).data as ParentCategory[];
        }
        _cachedParentCats = parentData;

        _isFetched  = true;
        _isFetching = false;
    }).catch(() => {
        _cachedProducts   = [];
        _cachedBrands     = [];
        _cachedDiscounts  = [];
        _cachedReviews    = [];
        _cachedParentCats = [];
        _isFetched        = true;
        _isFetching       = false;
    });

    return _fetchPromise;
}

function normalizeToSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function alnumOnly(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface CategoriesProps {
    initialParentSlug?: string;
    initialSlug?: string;
}

const Categories = ({ initialParentSlug, initialSlug }: CategoriesProps) => {
    const params       = useParams();
    const searchParams = useSearchParams();

    const rawParentSlug = initialParentSlug || (typeof params?.parentSlug === "string" ? params.parentSlug : null);
    const rawSlug       = initialSlug || (typeof params?.slug === "string" ? params.slug : null);

    const [rawProducts,      setRawProducts]      = useState<Product[]>(_cachedProducts);
    const [allBrands,        setAllBrands]        = useState<Brand[]>(_cachedBrands);
    const [discounts,        setDiscounts]        = useState<DiscountCategory[]>(_cachedDiscounts);
    const [reviews,          setReviews]          = useState<Review[]>(_cachedReviews);
    const [parentCategories, setParentCategories] = useState<ParentCategory[]>(_cachedParentCats);
    const [loading,          setLoading]          = useState<boolean>(!_isFetched);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState<string>("ALL BRANDS");
    const [sortOrder,     setSortOrder]     = useState<SortOrder>("Newest Arrivals");
    const [minPrice,      setMinPrice]      = useState<number>(0);
    const [maxPrice,      setMaxPrice]      = useState<number>(10000);
    const [maxPriceCap,   setMaxPriceCap]   = useState<number>(10000);
    const [currentPage,   setCurrentPage]   = useState<number>(1);

    useEffect(() => {
        if (_isFetched) {
            setRawProducts(_cachedProducts);
            setAllBrands(_cachedBrands);
            setDiscounts(_cachedDiscounts);
            setReviews(_cachedReviews);
            setParentCategories(_cachedParentCats);
            const cap = _cachedProducts.length > 0
                ? Math.ceil(Math.max(..._cachedProducts.map((p) => Number(p.price))))
                : 10000;
            setMaxPriceCap(cap);
            setMaxPrice(cap);
            setMinPrice(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        fetchOnce().then(() => {
            setRawProducts(_cachedProducts);
            setAllBrands(_cachedBrands);
            setDiscounts(_cachedDiscounts);
            setReviews(_cachedReviews);
            setParentCategories(_cachedParentCats);
            if (_cachedProducts.length > 0) {
                const cap = Math.ceil(Math.max(..._cachedProducts.map((p) => Number(p.price))));
                setMaxPriceCap(cap);
                setMaxPrice(cap);
                setMinPrice(0);
            }
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const brandQuery = searchParams.get("brand");
        if (brandQuery) {
            setSelectedBrand(brandQuery);
        } else {
            setSelectedBrand("ALL BRANDS");
        }
    }, [searchParams]);

    useEffect(() => {
        setCurrentPage(1);
        setSortOrder("Newest Arrivals");
        setMaxPrice(maxPriceCap);
        setMinPrice(0);
    }, [rawParentSlug, rawSlug, maxPriceCap]);

    useEffect(() => { setCurrentPage(1); }, [selectedBrand, sortOrder, maxPrice, minPrice]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);


    const matchedParent = useMemo<ParentCategory | null>(() => {
        if (!rawParentSlug || rawParentSlug === "all") return null;
        const decodedParentSlug = decodeURIComponent(rawParentSlug);
        const parentNameFromSlug = decodedParentSlug.replace(/-/g, " ");
        const targetAlnum = alnumOnly(decodedParentSlug);
        return (
            parentCategories.find((p) => {

                if ((p as any).slug && (p as any).slug === decodedParentSlug) return true;

                if (String((p as any).id) === decodedParentSlug) return true;

                if (p.name.toLowerCase() === parentNameFromSlug.toLowerCase()) return true;
                if (normalizeToSlug(p.name) === decodedParentSlug.toLowerCase()) return true;

                if (alnumOnly(p.name) === targetAlnum) return true;
                return false;
            }) ?? null
        );
    }, [parentCategories, rawParentSlug]);

    const parentFilterUnresolved = Boolean(rawParentSlug) && rawParentSlug !== "all" && !matchedParent;

    const parentCategoryChildIds = useMemo<Set<number>>(() => {
        if (!matchedParent) return new Set();
        return new Set(matchedParent.categories.map((c) => c.id));
    }, [matchedParent]);

    const discountMap = useMemo<Map<number, number>>(() => {
        const map = new Map<number, number>();
        discounts?.forEach((d) => {
            if (d.products && Array.isArray(d.products)) {
                d.products.forEach((p) => {
                    if (p.discount_price !== undefined && p.discount_price !== null) {
                        map.set(Number(p.id), Number(p.discount_price));
                    }
                });
            }
        });
        return map;
    }, [discounts]);

    const reviewsMap = useMemo<Map<number, Review[]>>(() => {
        const map = new Map<number, Review[]>();
        reviews.forEach((r) => {
            const existing = map.get(r.product_id) ?? [];
            existing.push(r);
            map.set(r.product_id, existing);
        });
        return map;
    }, [reviews]);

    const allProducts = useMemo<Product[]>(
        () => rawProducts.map((p) => ({
            ...p,
            discount_price: discountMap.get(Number(p.id)) ?? null,
        })),
        [rawProducts, discountMap],
    );


    const categoryScopedProducts = useMemo<Product[]>(() => {
        if (parentFilterUnresolved) return [];

        if (rawSlug) {
            return allProducts.filter((p) => {
                const matchesChild = p.category?.slug === rawSlug || String(p.category?.id) === rawSlug;
                if (!matchesChild) return false;
                if (matchedParent) return parentCategoryChildIds.has(Number(p.category?.id));
                return true;
            });
        }

        if (matchedParent) {
            return allProducts.filter((p) => parentCategoryChildIds.has(Number(p.category?.id)));
        }

        return allProducts;
    }, [allProducts, rawSlug, matchedParent, parentCategoryChildIds, parentFilterUnresolved]);

    const filteredProducts = useMemo(() => {
        let result = [...categoryScopedProducts];

        if (selectedBrand && selectedBrand.trim().toUpperCase() !== "ALL BRANDS") {
            result = result.filter((p) =>
                p.brand?.name?.trim().toLowerCase() === selectedBrand.trim().toLowerCase()
            );
        }

        result = result.filter((p) => {
            const actualPrice = p.discount_price !== null ? Number(p.discount_price) : Number(p.price);
            return actualPrice >= minPrice && actualPrice <= maxPrice;
        });

        switch (sortOrder) {
            case "Price: High to Low":
                result.sort((a, b) => {
                    const priceA = a.discount_price !== null ? Number(a.discount_price) : Number(a.price);
                    const priceB = b.discount_price !== null ? Number(b.discount_price) : Number(b.price);
                    return priceB - priceA;
                });
                break;
            case "Price: Low to High":
                result.sort((a, b) => {
                    const priceA = a.discount_price !== null ? Number(a.discount_price) : Number(a.price);
                    const priceB = b.discount_price !== null ? Number(b.discount_price) : Number(b.price);
                    return priceA - priceB;
                });
                break;
            case "Newest Arrivals":
                result.sort((a, b) =>
                    new Date((b as any).created_at ?? b.id).getTime() -
                    new Date((a as any).created_at ?? a.id).getTime()
                );
                break;
        }

        return result;
    }, [categoryScopedProducts, selectedBrand, sortOrder, maxPrice, minPrice]);

    const totalPages        = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
    const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

    const relevantBrands = useMemo(() => {
        const brandNames = new Set(
            categoryScopedProducts.map((p) => p.brand?.name).filter(Boolean)
        );
        return allBrands.filter((b) => brandNames.has(b.name));
    }, [allBrands, categoryScopedProducts]);

    const brandCountsMap = useMemo(() => {
        const counts = new Map<string, number>();
        categoryScopedProducts.forEach((p) => {
            const bName = p.brand?.name?.trim();
            if (bName) {
                counts.set(bName, (counts.get(bName) || 0) + 1);
            }
        });
        return counts;
    }, [categoryScopedProducts]);

    // FIXED: Keeps original casing ("Dresses") from API instead of forcing uppercase transformations.
    const categoryName = useMemo(() => {
        // 1. Base Sentinel Check
        if (!rawSlug && (!rawParentSlug || rawParentSlug === "all")) return "ALL";

        if (rawSlug) {
            // 2. Look up inside subcategories tree inside Parent Categories to match exact casing ("Sports Set")
            for (const parent of parentCategories) {
                const matchedChild = parent.categories?.find(
                    (c) => c.slug === rawSlug || String(c.id) === rawSlug
                );
                if (matchedChild) return matchedChild.name;
            }

            // 3. Try to fetch original name from scoped product items mapping structures
            const scopedName = categoryScopedProducts[0]?.category?.name;
            if (scopedName) return scopedName;

            // 4. Fall back to search products list match
            const productFallbackName = allProducts.find(
                (p) => p.category?.slug === rawSlug || String(p.category?.id) === rawSlug
            )?.category?.name;
            if (productFallbackName) return productFallbackName;

            // 5. REFRESH FALLBACK: If page is refreshing and api data hasn't arrived yet, format slug cleanly
            const decodedSlug = decodeURIComponent(rawSlug);
            return decodedSlug
                .replace(/-/g, " ")
                .replace(/\band\b/gi, "&") // Restores ampersands if converted to words in slugs
                .replace(/\b\w/g, (char) => char.toUpperCase());
        }

        // 6. Parent Category Processing Layer
        if (matchedParent) return matchedParent.name;

        // If parentCategories array is empty during initial refresh render, decode and clean raw URL parameters
        if (rawParentSlug) {
            const decodedParent = decodeURIComponent(rawParentSlug);
            return decodedParent
                .replace(/-/g, " ")
                .replace(/\band\b/gi, "&")
                .replace(/\b\w/g, (char) => char.toUpperCase());
        }

        return "ALL";
    }, [allProducts, categoryScopedProducts, rawSlug, rawParentSlug, matchedParent, parentCategories]);

    const sidebarProps: SidebarProps & { brandCountsMap: Map<string, number> } = {
        sortOrder, setSortOrder,
        minPrice,  setMinPrice,
        maxPrice,  setMaxPrice,
        maxPriceCap,
        selectedBrand, setSelectedBrand,
        relevantBrands: allBrands,
        loading,
        brandCountsMap,
    };

    const handleClearFilters = () => {
        setSelectedBrand("ALL BRANDS");
        setMaxPrice(maxPriceCap);
        setMinPrice(0);
    };

    return (
        <div className="min-h-screen text-[#1a1a1a]">
            <CategoryBanner
                categoryName={categoryName}
                slug={rawSlug}
                parentCategoryName={matchedParent?.name ?? null}
                parentSlug={matchedParent?.slug ?? (rawParentSlug && rawParentSlug !== "all" ? rawParentSlug : null)}
                filteredCount={filteredProducts.length}
                brandsCount={relevantBrands.length}
                totalPages={totalPages}
                selectedBrand={selectedBrand}
                sortOrder={sortOrder}
                minPrice={minPrice}
                onClearBrand={() => setSelectedBrand("ALL BRANDS")}
                onClearSort={() => setSortOrder("Newest Arrivals")}
                onClearMinPrice={() => setMinPrice(0)}
                onOpenMobileFilter={() => setMobileFilterOpen(true)}
            />

            {mobileFilterOpen && (
                <CategoryMobileFilter
                    sidebarProps={sidebarProps}
                    onClose={() => setMobileFilterOpen(false)}
                />
            )}

            <div className="max-w-[1400px] mx-auto py-12">
                <div className="flex flex-col lg:flex-row gap-14">
                    <aside className="hidden lg:block w-56 flex-shrink-0">
                        <FilterSidebar {...sidebarProps} />
                    </aside>

                    <main className="flex-1 lg:px-0">
                        <CategoryProductGrid
                            loading={loading}
                            products={paginatedProducts}
                            reviewsMap={reviewsMap}
                            maxPriceCap={maxPriceCap}
                            onClearFilters={handleClearFilters}
                        />

                        {!loading && totalPages > 1 && (
                            <CategoryPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPrev={goPrev}
                                onNext={goNext}
                                onSetPage={setCurrentPage}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Categories;