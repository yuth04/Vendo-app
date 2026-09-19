"use client";

import React, { RefObject } from "react";
import {ImageIcon, X} from "lucide-react";

interface Props {
    preview: string | null;
    fileInputRef: RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCancel: () => void;
}

export default function ImageUploader({ preview, fileInputRef, onChange, onCancel }: Props) {
    return (
        <div className="relative group">
            <div
                onClick={() => !preview && fileInputRef.current?.click()}
                className={`h-28 w-full rounded-xl flex flex-col items-center justify-center overflow-hidden card-theme transition-colors ${!preview ? "cursor-pointer hover:border-[#E3DE61]" : ""}`}
            >
                {preview ? (
                    <img src={preview} className="h-full w-full object-cover" alt="Preview" />
                ) : (
                    <>
                        <ImageIcon size={20} className="text-gray-300 custom-main-color-text-hover mb-1" />
                        <span className="text-[10px] font-bold text-gray-400">Upload Images</span>
                    </>
                )}
            </div>
            {preview && (
                <button
                    onClick={(e) => { e.stopPropagation(); onCancel(); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
                >
                    <X size={12} />
                </button>
            )}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={onChange} />
        </div>
    );
}