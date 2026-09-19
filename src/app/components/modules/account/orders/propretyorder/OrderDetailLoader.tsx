"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function OrderDetailLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin custom-main-color-text" />
            </div>
        </div>
    );
}