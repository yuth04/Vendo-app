"use client";

import React, { useRef, useState } from "react";
import {ImageIcon, Send, Star, X} from "lucide-react";
import { ReviewUser } from "@/src/app/components/modules/product-details/core/models/reviewModel";

const MAIN      = "#FACC15";
const MAIN_DARK = "#FACC15";

interface Props {
    currentUser: ReviewUser | null;
    submitLoading: boolean;
    formError: string | null;
    onSubmit: (rating: number, comment: string, image: File | null) => Promise<void>;
    onCancel: () => void;
}

export default function ReviewCreateForm({ currentUser, submitLoading, formError, onSubmit, onCancel }: Props) {
    const fileInputRef                              = useRef<HTMLInputElement>(null);
    const [newRating, setNewRating]                 = useState(5);
    const [newComment, setNewComment]               = useState("");
    const [newImage, setNewImage]                   = useState<File | null>(null);
    const [imagePreview, setImagePreview]           = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const cancelImage = () => {
        setNewImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        await onSubmit(newRating, newComment, newImage);
        setNewComment("");
        setNewRating(5);
        setNewImage(null);
        setImagePreview(null);
    };

    return (
        <div className="p-5 rounded-2xl border border-[#E3DE61]/30 bg-[#E3DE61]/5 space-y-4">
            <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Your Rating</p>

            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setNewRating(star)} className="transition-transform hover:scale-110 cursor-pointer">
                        <Star size={26} fill={star <= newRating ? MAIN : "none"} stroke={star <= newRating ? MAIN_DARK : "#D1D5DB"} />
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-2">Comment</p>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 input-theme px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:border-[#E3DE61] transition-colors"
                    />
                </div>

                <div className="w-full sm:w-32">
                    <p className="text-[12px] font-black tracking-widest text-gray-400 mb-2">Photo</p>
                    <div className="relative group">
                        <div
                            onClick={() => !imagePreview && fileInputRef.current?.click()}
                            className={`h-24 w-full rounded-xl border-2 border-dashed input-theme flex flex-col items-center justify-center overflow-hidden bg-white transition-colors ${!imagePreview ? "cursor-pointer hover:border-[#E3DE61]" : ""}`}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                            ) : (
                                <>
                                    <ImageIcon size={20} className="text-gray-300 custom-main-color-text-hover mb-1" />
                                    <span className="text-[10px] font-bold text-gray-400">Upload Images</span>
                                </>
                            )}
                        </div>
                        {imagePreview && (
                            <button
                                onClick={(e) => { e.stopPropagation(); cancelImage(); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                </div>
            </div>

            {formError && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs font-semibold">
                    {formError}
                </p>
            )}

            <div className="flex gap-2">
                <button
                    disabled={submitLoading || !newComment.trim()}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-2 rounded-[20px] font-black text-xs custom-main-color-bg disabled:opacity-40 cursor-pointer"
                >
                    <Send size={12} /> {submitLoading ? "Submitting…" : "Submit Review"}
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-[20px] font-black text-xs card-theme cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}