"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useWishlist } from '@/src/app/components/context/Wishlistcontext';
import { useCart } from "@/src/app/components/context/Cartcontext";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import {
    DiscountCategory,
    Product, ProductVariant
} from "@/src/app/components/modules/products/core/models/productsModel";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import CompatibleProducts from "@/src/app/components/modules/product-details/components/CompatibleProducts";
import ProductDetailsSkeleton from "./propertydetails/ProductDetailsSkeleton";
import ProductBreadcrumb from "./ProductBreadcrumb";
import ProductImageGallery from "./ProductImageGallery";
import ProductPurchaseInfo from "./ProductPurchaseInfo";
import ProductTabs from "./ProductTabs";
import {reviewService} from "@/src/app/components/modules/product-details/core/services/reviewService";

type CartStatus = 'idle' | 'loading' | 'success' | 'error';

// ── Merge helper for review replies: appends any new replies coming in via
// Pusher that aren't already present in the review's replies array (matched
// by reply.id), preserving original order and avoiding duplicates. ──//
function mergeReplies(existing: any[] = [], incoming: any[] = []) {
    const existingIds = new Set(existing.map((r) => r?.id));
    const newOnes = incoming.filter((r) => r?.id != null && !existingIds.has(r.id));
    if (newOnes.length === 0) return existing;
    return [...existing, ...newOnes];
}

const ProductDetails: React.FC = () => {
    const params = useParams();
    const id     = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const { isWishlisted, toggleWishlist } = useWishlist();
    const { addToCart }                    = useCart();

    const [mounted, setMounted]               = useState(false);
    const [product, setProduct]               = useState<Product | null>(null);
    const [loading, setLoading]               = useState(true);
    const [quantity, setQuantity]             = useState(1);
    const [activeTab, setActiveTab]           = useState('Details');
    const [selectedSize, setSelectedSize]     = useState('');
    const [selectedColor, setSelectedColor]   = useState('');
    const [variantImages, setVariantImages]   = useState<ProductVariant[]>([]);
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
    const [compatible, setCompatible]         = useState<Product[]>([]);
    const [discounts, setDiscounts]           = useState<DiscountCategory[]>([]);
    const [cartStatus, setCartStatus]         = useState<CartStatus>('idle');
    const [cartError, setCartError]           = useState<string | null>(null);
    const [reviews, setReviews]               = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewError, setReviewError]       = useState<string | null>(null);

    //--- Live review replies from Pusher: parent review id -> new reply objects ---//
    const [liveReplies, setLiveReplies] = useState<Record<number, any[]>>({});

    // Track historical parameters to detect if the user changed the color explicitly
    const previousColorRef = useRef<string>('');

    // Persistent Echo connection, created once per product view.
    const echoRef = useRef<Echo<any> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!id) return;

        // Reset everything tied to the previous product BEFORE fetching the new one
        setLoading(true);
        setProduct(null);
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
        setActiveTab('Details');
        setVariantImages([]);
        setActiveImageUrl(null);
        setCompatible([]);
        setDiscounts([]);
        setCartStatus('idle');
        setCartError(null);
        setReviews([]);
        setLiveReplies({});
        previousColorRef.current = '';

        Promise.all([
            productClient.fetchProductById(id),
            productClient.fetchDiscounts(),
            productClient.fetchProductImages()
        ] as [any, any, any])
            .then(([productRes, discountRes, imagesRes]) => {
                const prod = productRes?.data?.product ?? null;
                setProduct(prod);

                const body = discountRes?.data as any;
                setDiscounts(body?.discount ?? []);

                const imageData = imagesRes?.data as any;
                const allImages: ProductVariant[] = imageData?.product_variant ?? [];

                const matchedImages = allImages.filter((v) => v.product_id === prod?.id);
                setVariantImages(matchedImages);

                if (prod?.variants?.length) {
                    const variantWithImages = prod.variants.find((v: ProductVariant) => {
                        const imgs = reviewService.getCurrentVariantImages(v, matchedImages);
                        return imgs && imgs.length > 0;
                    });

                    if (variantWithImages) {
                        setSelectedSize(variantWithImages.size);
                        setSelectedColor(variantWithImages.color);
                        previousColorRef.current = variantWithImages.color;
                    } else {
                        setSelectedSize(prod.variants[0].size);
                        setSelectedColor(prod.variants[0].color);
                        previousColorRef.current = prod.variants[0].color;
                    }
                }
            })
            .catch(() => {
                setProduct(null);
                setDiscounts([]);
                setVariantImages([]);
            })
            .finally(() => setLoading(false));
    }, [id]);

    // ── Fetches the full review list (including replies.user with name and
    // image, since that relation IS eager-loaded on this GET endpoint).
    // Used both for the initial load and to silently "fill in" whatever a
    // live 'review.changed' event points to, since that broadcast payload
    // is intentionally minimal (no user/name/image). ──//
    const refetchReviews = useCallback((showLoading: boolean) => {
        if (!product?.id) return;
        if (showLoading) setReviewsLoading(true);
        if (showLoading) setReviewError(null);
        reviewClient.fetchReviewsByProduct(product.id)
            .then((res) => {
                const raw = res?.data;
                if (Array.isArray(raw)) setReviews(raw);
            })
            .catch(() => { if (showLoading) { setReviewError('Failed to load reviews.'); setReviews([]); } })
            .finally(() => { if (showLoading) setReviewsLoading(false); });
    }, [product?.id]);

    useEffect(() => {
        if (!product) return;
        refetchReviews(true);
    }, [product, refetchReviews]);

    // ── Pusher: single connection + single per-product channel subscription,
    // matching the backend's `new Channel('reviews.' . $this->review->product_id)`.──//
    useEffect(() => {
        if (!product?.id) return;

        (window as any).Pusher = Pusher;

        const echo = new Echo({
            broadcaster: "pusher",
            key:      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
            cluster:  process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
            forceTLS: true,
        });
        echoRef.current = echo;

        echo
            .channel(`reviews.${product.id}`)
            .listen('.review.changed', (e: { action: string; review: any }) => {
                const changedReview = e?.review;
                if (!changedReview?.id) return;

                // Handle Real-Time Live Delete Payload
                if (e.action === 'delete') {
                    if (changedReview.parent_id != null) {
                        // 1. It's a sub-reply deletion: instantly filter it from local state hooks
                        setLiveReplies((prev) => {
                            const existingForReview = prev[changedReview.parent_id] ?? [];
                            return {
                                ...prev,
                                [changedReview.parent_id]: existingForReview.filter((r) => r?.id !== changedReview.id)
                            };
                        });
                        setReviews((prev) =>
                            prev.map((r) => {
                                if (r.id === changedReview.parent_id) {
                                    return {
                                        ...r,
                                        replies: (r.replies ?? []).filter((reply) => reply.id !== changedReview.id)
                                    };
                                }
                                return r;
                            })
                        );
                    } else {
                        // 2. It's a root product review deletion: purge the review and clean up memory
                        setReviews((prev) => prev.filter((r) => r.id !== changedReview.id));
                        setLiveReplies((prev) => {
                            const updated = { ...prev };
                            delete updated[changedReview.id];
                            return updated;
                        });
                    }
                } else {
                    // Handle regular creation or editing notifications
                    if (changedReview.parent_id != null) {
                        setLiveReplies((prev) => {
                            const existingForReview = prev[changedReview.parent_id] ?? [];
                            const alreadyHave = existingForReview.some((r) => r?.id === changedReview.id);
                            if (alreadyHave) return prev;
                            return { ...prev, [changedReview.parent_id]: [...existingForReview, changedReview] };
                        });
                    }
                }

                refetchReviews(false);
            });

        return () => {
            echo.leaveChannel(`reviews.${product.id}`);
            echo.disconnect();
            echoRef.current = null;
        };
    }, [product?.id, refetchReviews]);

    // ── Reviews merged with any live replies received via Pusher, so
    // ReviewItem shows new admin replies immediately without a refresh. ──//
    const reviewsWithLiveReplies = useMemo(() => {
        if (Object.keys(liveReplies).length === 0) return reviews;
        return reviews.map((r: any) => {
            const incoming = liveReplies[r.id];
            if (!incoming) return r;
            return { ...r, replies: mergeReplies(r.replies ?? [], incoming) };
        });
    }, [reviews, liveReplies]);

    useEffect(() => {
        if (!product) return;
        productClient.fetchProduct()
            .then((res) => {
                const all: Product[] = res?.data?.product ?? [];
                setCompatible(
                    all.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 8),
                );
            })
            .catch(() => setCompatible([]));
    }, [product]);

    const selectedVariant = useMemo(
        () => reviewService.findSelectedVariant(product, selectedSize, selectedColor),
        [product, selectedSize, selectedColor],
    );

    // FIX 3 & 4: Smart color change listener redirect
    // Runs ONLY when a user switches color or moves from Blue S back to Black.
    // If the size combo has no images, it auto-switches sizes.
    // If the user manually changes the size, this block safely steps out of the way!
    useEffect(() => {
        if (!product || !selectedColor || !variantImages.length) return;

        // Check if the color actually changed compared to our reference history tracking
        const colorHasChanged = previousColorRef.current !== selectedColor;

        if (colorHasChanged) {
            // Update historical reference immediately
            previousColorRef.current = selectedColor;

            const currentImages = selectedVariant
                ? reviewService.getCurrentVariantImages(selectedVariant, variantImages)
                : [];

            // If the targeted target has no images, correct the size within that specific color group
            if (!currentImages || currentImages.length === 0) {
                const autoVariantNextWithImages = product.variants.find((v: ProductVariant) => {
                    if (v.color !== selectedColor) return false;
                    const imgs = reviewService.getCurrentVariantImages(v, variantImages);
                    return imgs && imgs.length > 0;
                });

                if (autoVariantNextWithImages) {
                    setSelectedSize(autoVariantNextWithImages.size);
                }
            }
        }
    }, [selectedColor, selectedSize, selectedVariant, product, variantImages]);

    const cartBtnDisabled = !selectedVariant || (selectedVariant.stock ?? 0) === 0 || cartStatus === 'loading';

    const handleAddToCart = useCallback(() => {
        if (!product || !selectedVariant) return;
        setCartStatus('loading');
        setCartError(null);
        try {
            addToCart(product, selectedVariant, quantity);
            setCartStatus('success');
        } catch {
            setCartError('Could not add to cart. Please try again.');
            setCartStatus('error');
        }
        setTimeout(() => { setCartStatus('idle'); setCartError(null); }, 2000);
    }, [product, selectedVariant, quantity, addToCart]);

    const discountMap = useMemo<Map<number, number>>(() => {
        return reviewService.buildDiscountMap(discounts);
    }, [discounts]);

    const compatibleWithDiscount = useMemo<Product[]>(
        () => reviewService.mapCompatibleWithDiscounts(compatible, discountMap),
        [compatible, discountMap],
    );

    const { hasDiscount, originalPrice, discountedPrice, discountPct } = useMemo(() => {
        return reviewService.calculatePricing(product, discountMap);
    }, [product, discountMap]);

    const currentVariantImages = useMemo(() => {
        return reviewService.getCurrentVariantImages(selectedVariant, variantImages);
    }, [selectedVariant, variantImages]);

    const allImages = useMemo(
        () => reviewService.getAllImages(variantImages),
        [variantImages],
    );

    // FIX 1: Strict isolation. If variant has no images, returns empty array.
    // It will never catch or copy images from random alternative variants/colors.
    const thumbnails = useMemo(() => {
        if (!currentVariantImages || currentVariantImages.length === 0) {
            return [];
        }
        return reviewService.getThumbnails(currentVariantImages, allImages);
    }, [currentVariantImages, allImages]);

    useEffect(() => {
        if (thumbnails && thumbnails.length > 0) {
            const imageStillExists = thumbnails.some((img) => img.image === activeImageUrl);
            if (!imageStillExists) {
                setActiveImageUrl(thumbnails[0].image);
            }
        } else {
            setActiveImageUrl(null);
        }
    }, [thumbnails, activeImageUrl]);

    const uniqueSizes  = useMemo(() => reviewService.getUniqueSizes(product), [product]);
    const uniqueColors = useMemo(() => reviewService.getUniqueColors(product), [product]);

    const wishlisted = product ? isWishlisted(product.id) : false;

    if (!mounted || loading || !product) {
        return <ProductDetailsSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-10 min-h-screen">

            <ProductBreadcrumb product={product} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start mb-20">
                <ProductImageGallery
                    product={product}
                    thumbnails={thumbnails}
                    activeImageUrl={activeImageUrl}
                    hasDiscount={hasDiscount}
                    discountPct={discountPct}
                    onThumbnailClick={setActiveImageUrl}
                />
                <ProductPurchaseInfo
                    product={product}
                    reviews={reviewsWithLiveReplies}
                    selectedVariant={selectedVariant}
                    uniqueSizes={uniqueSizes}
                    uniqueColors={uniqueColors}
                    selectedSize={selectedSize}
                    selectedColor={selectedColor}
                    quantity={quantity}
                    hasDiscount={hasDiscount}
                    discountedPrice={discountedPrice}
                    originalPrice={originalPrice}
                    wishlisted={wishlisted}
                    cartStatus={cartStatus}
                    cartError={cartError}
                    cartBtnDisabled={cartBtnDisabled}
                    onSelectSize={setSelectedSize}
                    onSelectColor={setSelectedColor}
                    onQuantityChange={setQuantity}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={() => product && toggleWishlist(product.id)}
                />
            </div>

            <ProductTabs
                product={product}
                variantImages={variantImages}
                reviews={reviewsWithLiveReplies}
                setReviews={setReviews}
                reviewsLoading={reviewsLoading}
                reviewError={reviewError}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <CompatibleProducts products={compatibleWithDiscount} />
        </div>
    );
};

export default ProductDetails;