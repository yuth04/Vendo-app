"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Review, ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import ReviewsHeader from "./propertydetails/ReviewsHeader";
import ReviewCreateForm from "./ReviewCreateForm";
import ReviewItem from "./ReviewItem";

interface Props {
    productId: number;
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    reviewsLoading: boolean;
    reviewError: string | null;
    currentUser?: ReviewUser | null;
}

export default function ReviewsTab({
                                       productId,
                                       reviews,
                                       setReviews,
                                       reviewsLoading,
                                       currentUser: currentUserProp,
                                   }: Props) {
    const { showToast, showConfirm } = useAlert();

    const [currentUser, setCurrentUser]         = useState<ReviewUser | null>(currentUserProp ?? null);
    const [submitLoading, setSubmitLoading]     = useState(false);
    const [updateLoading, setUpdateLoading]     = useState(false);
    const [formError, setFormError]             = useState<string | null>(null);
    const [formSuccess, setFormSuccess]         = useState(false);

    useEffect(() => {
        if (currentUserProp) { setCurrentUser(currentUserProp); return; }
        reviewClient.fetchCurrentUser()
            .then((res: any) => {
                const user = res?.data?.user ?? res?.data ?? null;
                if (user) setCurrentUser(user);
            })
            .catch(() => {});
    }, [currentUserProp]);

    const safeReviews = Array.isArray(reviews) ? reviews : [];

    const hasReviewed = useMemo(() => {
        if (!currentUser) return false;
        return safeReviews.some(
            (r) => r.user_id === currentUser.id || r.user?.id === currentUser.id
        );
    }, [safeReviews, currentUser]);

    const withUser = useCallback(
        (review: Review, fallback?: ReviewUser | null): Review => ({
            ...review,
            user: review.user ?? fallback ?? currentUser ?? undefined,
            user_id: review.user_id ?? currentUser?.id ?? 0,
        }),
        [currentUser]
    );

    const handleCreate = async (rating: number, comment: string, image: File | null) => {
        if (!comment.trim()) return;
        setSubmitLoading(true);
        setFormError(null);
        setFormSuccess(false);
        try {
            const res = await (reviewClient as any).createReview(productId, rating, comment.trim(), image || undefined);
            if (res?.data) {
                setReviews((prev) => [withUser(res.data), ...(Array.isArray(prev) ? prev : [])]);
                setFormSuccess(true);
                showToast("Review submitted successfully!", "success");
                setTimeout(() => setFormSuccess(false), 3000);
            }
        } catch {
            setFormError("Failed to submit review. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdate = async (reviewId: number, rating: number, comment: string, image: File | null) => {
        if (!comment.trim()) return;
        setUpdateLoading(true);
        try {
            const res = await (reviewClient as any).updateReview(reviewId, rating, comment.trim(), image || undefined);
            if (res?.data) {
                setReviews((prev) =>
                    (Array.isArray(prev) ? prev : []).map((r) =>
                        r.id !== reviewId
                            ? r
                            : {
                                ...r,
                                ...withUser(res.data!, r.user)
                            }
                    )
                );
                showToast("Review updated successfully!", "success");
            }
        } catch {
            showToast("Failed to update review. Please try again.", "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        const confirmed = await showConfirm({
            title:        "Delete Review",
            message:      "Are you sure you want to delete this review? This action cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel:  "Cancel",
            variant:      "danger",
        });
        if (!confirmed) return;
        try {
            await reviewClient.deleteReview(reviewId);
            setReviews((prev) => (Array.isArray(prev) ? prev : []).filter((r) => r.id !== reviewId));
            showToast("Review deleted successfully.", "info");
        } catch {
            showToast("Failed to delete review. Please try again.", "error");
        }
    };

    return (
        <div>
            <ReviewsHeader reviews={safeReviews} />

            {currentUser && !hasReviewed && (
                <ReviewCreateForm
                    onSubmit={handleCreate}
                    submitLoading={submitLoading}
                    formError={formError}
                    formSuccess={formSuccess}
                />
            )}

            {!reviewsLoading && safeReviews.map((review) => (
                <ReviewItem
                    key={review.id}
                    review={review}
                    currentUser={currentUser}
                    updateLoading={updateLoading}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}