"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Review, ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import { reviewClient } from "@/src/app/components/modules/product-details/core/api/reviewClient";
import ReviewSummaryBar from "./ReviewSummaryBar";
import ReviewCreateForm from "./ReviewCreateForm";
import ReviewItem from "./ReviewItem";


interface Props {
    productId: number;
    reviews: Review[];
    currentUser: ReviewUser | null;
    onReviewCreated: (productId: number, review: Review) => void;
    onReviewUpdated: (productId: number, review: Review) => void;
    onReviewDeleted: (productId: number, reviewId: number) => void;
}

export default function ProductReviewPanel({
                                               productId,
                                               reviews,
                                               currentUser,
                                               onReviewCreated,
                                               onReviewUpdated,
                                               onReviewDeleted,
                                           }: Props) {
    const { showToast, showConfirm } = useAlert();

    const [panelOpen,     setPanelOpen]     = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [formError,     setFormError]     = useState<string | null>(null);
    const [formSuccess,   setFormSuccess]   = useState(false);

    const isOwner = useCallback(
        (r: Review) =>
            !!currentUser &&
            (Number(r.user_id) === Number(currentUser.id) ||
                Number(r.user?.id) === Number(currentUser.id)),
        [currentUser]
    );

    const myReview = useMemo(() => reviews.find(isOwner) ?? null, [reviews, isOwner]);

    const handleCreate = async (rating: number, comment: string, image: File | null) => {
        if (!comment.trim() || !currentUser) return;
        setSubmitLoading(true);
        setFormError(null);
        try {
            const res  = await (reviewClient as any).createReview(productId, rating, comment.trim(), image || undefined);
            const data = res?.data;
            const created: Review = {
                ...(data ?? {}),
                id:          data?.id          ?? 0,
                user_id:     data?.user_id     ?? Number(currentUser.id),
                product_id:  data?.product_id  ?? productId,
                rating:      data?.rating      ?? rating,
                comment:     data?.comment     ?? comment.trim(),
                is_approved: data?.is_approved ?? false,
                image:       data?.image       ?? null,
                user:        data?.user        ?? currentUser,
            };
            onReviewCreated(productId, created);
            setFormSuccess(true);
            setPanelOpen(false);
            showToast("Review submitted successfully!", "success");
            setTimeout(() => setFormSuccess(false), 3000);
        } catch {
            setFormError("Failed to submit review. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdate = async (originalReview: Review, rating: number, comment: string, image: File | null) => {
        if (!comment.trim() || !currentUser) return;
        setUpdateLoading(true);
        try {
            const res          = await (reviewClient as any).updateReview(originalReview.id, rating, comment.trim(), image || undefined);
            const updatedFromDb = res?.data;
            const updated: Review = {
                ...originalReview,
                ...updatedFromDb,
                image: updatedFromDb?.image || originalReview.image,
            };
            onReviewUpdated(productId, updated);
            showToast("Review updated successfully!", "success");
        } catch {
            showToast("Failed to update review.", "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        const confirmed = await showConfirm({
            title:        "Delete Review",
            message:      "Are you sure you want to delete this review?",
            confirmLabel: "Delete",
            variant:      "danger",
        });
        if (!confirmed) return;
        try {
            await reviewClient.deleteReview(reviewId);
            onReviewDeleted(productId, reviewId);
            showToast("Review deleted.", "info");
        } catch {
            showToast("Failed to delete review.", "error");
        }
    };

    return (
        <div className="mt-5 space-y-4">
            <ReviewSummaryBar
                reviews={reviews}
                currentUser={currentUser}
                myReview={myReview}
                panelOpen={panelOpen}
                formSuccess={formSuccess}
                onTogglePanel={() => setPanelOpen((p) => !p)}
            />

            {panelOpen && !myReview && currentUser && (
                <ReviewCreateForm
                    currentUser={currentUser}
                    submitLoading={submitLoading}
                    formError={formError}
                    onSubmit={handleCreate}
                    onCancel={() => { setPanelOpen(false); setFormError(null); }}
                />
            )}

            {reviews.length > 0 && (
                <div className="space-y-3 pt-1">
                    {reviews.map((review) => (
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
            )}
        </div>
    );
}