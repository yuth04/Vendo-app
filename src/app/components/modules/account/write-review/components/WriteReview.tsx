"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { orderService } from "@/src/app/components/core/services/orders";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import { Review, ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import WriteReviewPageEmpty from "@/src/app/components/modules/account/write-review/propretyreview/WriteReviewPageEmpty";
import WriteReviewPageSkeleton from "@/src/app/components/modules/account/write-review/propretyreview/WriteReviewPageSkeleton";
import OrderItemCard from "@/src/app/components/modules/account/write-review/propretyreview/OrderItemCard";


const EMPTY_REVIEWS: Review[] = [];

const WriteReviewPage = () => {
    const searchParams = useSearchParams();
    const orderId      = searchParams.get("orderId");

    const fetchOrders  = useCallback(() => orderService.fetchOrders(), []);
    const fetchReviews = useCallback(() => reviewClient.fetchAllReviews(), []);

    const { data, loading: isOrderLoading }              = useApiData(fetchOrders, null, true);
    const { data: reviewsRes, loading: isReviewLoading } = useApiData<Review[]>(fetchReviews, EMPTY_REVIEWS, true);

    const [currentUser, setCurrentUser] = useState<ReviewUser | null>(null);
    const [reviewsMap,  setReviewsMap]  = useState<Map<number, Review[]>>(new Map());

    useEffect(() => {
        reviewClient.fetchCurrentUser()
            .then((res: any) => {
                const user = res?.data?.user ?? res?.data ?? null;
                if (user) setCurrentUser(user);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const list = Array.isArray(reviewsRes) ? reviewsRes : [];
        const map  = new Map<number, Review[]>();
        list.forEach((r) => {
            const pId = Number(r.product_id);
            map.set(pId, [...(map.get(pId) ?? []), r]);
        });
        setReviewsMap(map);
    }, [reviewsRes]);

    const handleReviewCreated = useCallback((productId: number, review: Review) => {
        setReviewsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, [review, ...(next.get(productId) ?? [])]);
            return next;
        });
    }, []);

    const handleReviewUpdated = useCallback((productId: number, review: Review) => {
        setReviewsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, (next.get(productId) ?? []).map((r) => r.id === review.id ? review : r));
            return next;
        });
    }, []);

    const handleReviewDeleted = useCallback((productId: number, reviewId: number) => {
        setReviewsMap((prev) => {
            const next = new Map(prev);
            next.set(productId, (next.get(productId) ?? []).filter((r) => r.id !== reviewId));
            return next;
        });
    }, []);

    const order = useMemo(() => {
        if (!data?.orders || !orderId) return null;
        return data.orders.find((o: any) => o.order_id.toString() === orderId);
    }, [data, orderId]);

    const loading = isOrderLoading || isReviewLoading;

    if (loading) return <WriteReviewPageSkeleton />;
    if (!order)  return <WriteReviewPageEmpty />;

    return (
        <div className="min-h-screen p-4 md:py-8 max-w-4xl mx-auto">
            <Link
                href={`/account/orders/${orderId}`}
                className="mb-8 flex items-center gap-2 text-[14px] font-black tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors"
            >
                <ChevronLeft size={16} /> Back to Order #{order.order_number}
            </Link>

            <div className="space-y-8 card-theme p-6 rounded-[40px] border border-gray-100 shadow-sm bg-[var(--header-bg)]">
                <h3 className="text-[30px] font-black px-2 text-[var(--header-text)]">Review Products</h3>
                <div className="space-y-8">
                    {order.items?.map((item: any) => (
                        <OrderItemCard
                            key={item.id}
                            item={item}
                            reviewsMap={reviewsMap}
                            currentUser={currentUser}
                            onReviewCreated={handleReviewCreated}
                            onReviewUpdated={handleReviewUpdated}
                            onReviewDeleted={handleReviewDeleted}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WriteReviewPage;