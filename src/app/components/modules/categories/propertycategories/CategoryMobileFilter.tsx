"use client";

import React from "react";
import { X } from "lucide-react";
import FilterSidebar, { SidebarProps } from "@/src/app/components/modules/categories/components/FilterSidebar";

interface Props {
    sidebarProps: SidebarProps;
    onClose: () => void;
}

export default function CategoryMobileFilter({ sidebarProps, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--header-bg)] p-8 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[20px] font-black text-[var(--header-text)]">Filters</h2>
                    <button onClick={onClose} className="p-1 rounded-lg custom-main-color-icon hover:bg-gray-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <FilterSidebar {...sidebarProps} />
            </div>
        </div>
    );
}