"use client";

import React, { useRef, useState } from "react";
import {ImageIcon, X} from "lucide-react";
import StarPicker from "./propertydetails/StarPicker";

interface Props {
    initialRating: number;
    initialComment: string;
    initialImgPreview: string | null;
    updateLoading: boolean;
    onSave: (rating: number, comment: string, image: File | null) => Promise<void>;
    onCancel: () => void;
}

export default function ReviewEditForm({
                                           initialRating,
                                           initialComment,
                                           initialImgPreview,
                                           updateLoading,
                                           onSave,
                                           onCancel,
                                       }: Props) {
    const editFileInputRef                      = useRef<HTMLInputElement>(null);
    const [editRating, setEditRating]           = useState(initialRating);
    const [editComment, setEditComment]         = useState(initialComment);
    const [editImage, setEditImage]             = useState<File | null>(null);
    const [editImgPreview, setEditImgPreview]   = useState<string | null>(initialImgPreview);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditImage(file);
        setEditImgPreview(URL.createObjectURL(file));
    };

    const cancelImage = () => {
        setEditImage(null);
        setEditImgPreview(null);
        if (editFileInputRef.current) editFileInputRef.current.value = "";
    };

    return (
        <div className="mt-2 space-y-3">
            <StarPicker rating={editRating} size={20} onSelect={setEditRating} />

            <div className="flex flex-col md:flex-row gap-3">
                <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    className="flex-1 rounded-xl border border-[#E3DE61]/50 input-theme px-3 py-2 text-sm focus:outline-none"
                />
                <div className="relative group w-20 h-20 shrink-0">
                    <div
                        onClick={() => !editImgPreview && editFileInputRef.current?.click()}
                        className="h-full w-full rounded-xl border border-gray-100 overflow-hidden card-theme flex items-center justify-center cursor-pointer"
                    >
                        {editImgPreview ? (
                            <img src={editImgPreview} className="h-full w-full object-cover" alt="Edit preview" />
                        ) : (
                            <ImageIcon size={16} className="text-gray-300 custom-main-color-text-hover" />
                        )}
                    </div>
                    {editImgPreview && (
                        <button
                            onClick={(e) => { e.stopPropagation(); cancelImage(); }}
                            className="absolute -top-1.5 -right-1.5 bg-red-400 text-white p-0.5 rounded-full shadow hover:bg-red-600 transition-colors cursor-pointer"
                        >
                            <X size={12} />
                        </button>
                    )}
                    <input type="file" ref={editFileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    disabled={updateLoading}
                    onClick={() => onSave(editRating, editComment, editImage)}
                    className="px-4 py-1.5 rounded-[20px] font-black text-xs custom-main-color-bg cursor-pointer disabled:opacity-50"
                >
                    Save Review
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-1.5 rounded-[20px] font-black text-xs card-theme cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}