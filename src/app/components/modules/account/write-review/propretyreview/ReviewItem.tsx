"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Pencil, Star, Trash2, MessageCircle, Calendar } from "lucide-react";
import { Review, ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";
import ReviewEditForm from "./ReviewEditForm";

const MAIN      = "#FACC15";
const MAIN_DARK = "#FACC15";

interface Props {
    review: Review;
    currentUser: ReviewUser | null;
    updateLoading: boolean;
    onUpdate: (review: Review, rating: number, comment: string, image: File | null) => Promise<void>;
    onDelete: (reviewId: number) => void;
}

const initials = (r: Review) => r.user?.first_name?.[0]?.toUpperCase() ?? "?";

export default function ReviewItem({ review, currentUser, updateLoading, onUpdate, onDelete }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);

    const isOwner = !!currentUser &&
        (Number(review.user_id) === Number(currentUser.id) ||
            Number(review.user?.id) === Number(currentUser.id));

    return (
        <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 input-theme mb-3 transition-all">

            <div className="shrink-0">
                {review.user?.image ? (
                    <Image
                        src={review.user.image}
                        alt="User"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full custom-main-color-bg flex items-center justify-center font-black text-sm">
                        {initials(review)}
                    </div>
                )}
            </div>

            {/* Main Review Content Body */}
            <div className="flex-1 min-w-0">

                <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-[16px] text-[var(--header-text)]">
                                {review.user
                                    ? `${review.user.first_name ?? ""} ${review.user.last_name ?? ""}`.trim() || "Anonymous"
                                    : "Anonymous"}
                            </span>

                            <span className="inline-flex items-center gap-2 text-[14px] text-gray-400 font-medium ml-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{review.created_at ?? ""}</span>
                            </span>

                            <span className="text-[12px] text-gray-400 font-medium opacity-80">
                                ( {review.created_at_human ?? ""} )
                            </span>
                        </div>
                    </div>

                    {isOwner && editingId !== review.id && (
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => setEditingId(review.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#E3DE61]/20 transition-colors cursor-pointer"
                            >
                                <Pencil size={13}/>
                            </button>
                            <button
                                onClick={() => onDelete(review.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                <Trash2 size={13}/>
                            </button>
                        </div>
                    )}
                </div>

                {editingId === review.id ? (
                    <ReviewEditForm
                        review={review}
                        updateLoading={updateLoading}
                        onSave={async (r, rating, comment, image) => {
                            await onUpdate(r, rating, comment, image);
                            setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                    />
                ) : (
                    <>
                        <div className="flex gap-0.5 my-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={13}
                                    fill={s <= review.rating ? MAIN : "none"}
                                    stroke={s <= review.rating ? MAIN_DARK : "#D1D5DB"}
                                />
                            ))}
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed">{review.comment}</p>

                        {review.image && (
                            <div className="mt-3 h-28 w-28 rounded-xl overflow-hidden border border-gray-100">
                                <img src={review.image} className="h-full w-full object-cover" alt="Review" />
                            </div>
                        )}

                        {review.replies && review.replies.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-400 mb-2">
                                    <MessageCircle size={14}/> Admin Replies
                                </div>
                                {review.replies.map((reply) => (
                                    <div key={reply.id}
                                         className="flex items-start gap-2 pl-2 md:pl-3 flex-1 input-theme rounded-2xl rounded-tl-none px-4 py-2.5">
                                        {reply.user?.image ? (
                                            <Image
                                                src={reply.user.image}
                                                alt={reply.user?.first_name ?? "Admin"}
                                                width={28} height={28}
                                                className="w-7 h-7 rounded-full object-cover shrink-0 mt-3"
                                            />
                                        ) : (
                                            <div
                                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                                                {reply.user?.first_name?.[0]?.toUpperCase() ?? "A"}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 px-3 py-2">
                                            <div
                                                className="flex flex-wrap items-center gap-x-2 text-[14px] font-black text-[var(--header-text)]">
                                                <span>{reply.user?.first_name} {reply.user?.last_name}</span>
                                                <span
                                                    className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    {reply.user?.role || 'admin'}
                                                </span>
                                                <span className="text-[12px]  text-gray-400 font-medium ml-1">
                                                    {reply.created_at || ''}
                                                </span>
                                                <span className="text-[10px]  text-gray-400 font-medium ml-1">
                                                    ( {reply.created_at_human || ''} )
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-gray-400 py-2 leading-relaxed break-words">
                                                {reply.comment}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/*/!* Pending Badge *!/*/}
                {/*{!review.is_approved && (*/}
                {/*    <span*/}
                {/*        className="inline-block mt-3 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">*/}
                {/*        Pending approval*/}
                {/*    </span>*/}
                {/*)}*/}
            </div>
        </div>
    );
}