"use client";

import React, { useRef, useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import StarPicker from "./propertydetails/StarPicker";
import ImageUploader from "./propertydetails/ImageUploader";

interface Props {
    onSubmit: (rating: number, comment: string, image: File | null) => Promise<void>;
    submitLoading: boolean;
    formError: string | null;
    formSuccess: boolean;
}

export default function ReviewCreateForm({ onSubmit, submitLoading, formError, formSuccess }: Props) {
    const fileInputRef              = useRef<HTMLInputElement | null>(null);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [newImage, setNewImage]   = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const cancelImage = () => {
        setNewImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            if ("value" in fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSubmit = async () => {
        await onSubmit(newRating, newComment, newImage);
        setNewComment("");
        setNewRating(5);
        setNewImage(null);
        setImagePreview(null);
    };

    return (
        <div className="mb-8 p-6 rounded-2xl border border-[#E3DE61]/30 bg-[#E3DE61]/5">
            <h4 className="font-black text-sm tracking-widest mb-4 uppercase">Write a Review</h4>

            {formSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">
                    <CheckCircle size={16} /> Review submitted successfully!
                </div>
            )}
            {formError && (
                <div className="text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm font-semibold">
                    {formError}
                </div>
            )}

            <div className="mb-4">
                <p className="text-xs font-black tracking-widest text-gray-400 mb-2">Your Rating</p>
                <StarPicker rating={newRating} size={24} onSelect={setNewRating} />
            </div>

            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <p className="text-xs font-black tracking-widest text-gray-400 mb-2">Comment</p>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience with this products..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 input-theme px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:border-[#E3DE61] transition-colors"
                    />
                </div>
                <div className="w-full md:w-32">
                    <p className="text-xs font-black tracking-widest text-gray-400 mb-2">Photo</p>
                    <ImageUploader
                        preview={imagePreview}
                        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                        onChange={handleImageChange}
                        onCancel={cancelImage}
                    />
                </div>
            </div>

            <button
                disabled={submitLoading || !newComment.trim()}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm custom-main-color-bg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
            >
                <Send size={14} /> Submit Review
            </button>
        </div>
    );
}