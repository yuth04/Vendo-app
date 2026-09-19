"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function WriteReviewPageEmpty() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <AlertCircle size={48} className="text-gray-200 mb-4" />
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-400">Order Not Found</h2>
        </div>
    );
}