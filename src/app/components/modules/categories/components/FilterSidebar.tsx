"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Brand } from "@/src/app/components/modules/products/core/models/productsModel";

export type SortOrder =
    | "Newest Arrivals"
    | "Price: High to Low"
    | "Price: Low to High"
    | "Top Rated";

export interface SidebarProps {
    sortOrder: SortOrder;
    setSortOrder: (v: SortOrder) => void;
    minPrice: number;
    setMinPrice: (v: number) => void;
    maxPrice: number;
    setMaxPrice: (v: number) => void;
    maxPriceCap: number;
    selectedBrand: string;
    setSelectedBrand: (v: string) => void;
    relevantBrands: Brand[];
    loading: boolean;
    brandCountsMap?: Map<string, number>;
}

const SORT_OPTIONS: SortOrder[] = [
    "Newest Arrivals",
    "Price: High to Low",
    "Price: Low to High",
    "Top Rated",
];

const FilterSidebar = ({
                           sortOrder,
                           setSortOrder,
                           minPrice,
                           setMinPrice,
                           maxPrice,
                           setMaxPrice,
                           maxPriceCap,
                           selectedBrand,
                           setSelectedBrand,
                           relevantBrands,
                           loading,
                           brandCountsMap,
                       }: SidebarProps) => {
    const [open, setOpen] = useState({ sort: true, price: true, brands: true });

    // State to track if the user is actively scrolling the brands list
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const toggle = (key: keyof typeof open) =>
        setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

    const normalizedSelectedBrand = selectedBrand.trim().toUpperCase();

    // Handle scroll visibility timer
    const handleScroll = () => {
        setIsScrolling(true);

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Hide the scrollbar line 1000ms (1 second) after scrolling stops
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 1000);
    };

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, []);

    return (
        <div className="space-y-6">

            {/* Sort By */}
            <section>
                <button
                    onClick={() => toggle("sort")}
                    className="w-full flex justify-between items-center mb-3 pb-3 border-b border-gray-100 cursor-pointer"
                >
                    <h3 className="font-black text-[16px] tracking-widest uppercase text-[var(--header-text)]">
                        Sort By
                    </h3>
                    <ChevronDown
                        size={20}
                        strokeWidth={3}
                        className={`text-gray-400 transition-transform duration-300 ${open.sort ? "rotate-0" : "rotate-180"}`}
                    />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out ${open.sort ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                        <div className="space-y-3 pb-1">
                            {SORT_OPTIONS.map((label) => {
                                const isActive = sortOrder === label;
                                return (
                                    <label key={label} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative w-4 h-4 flex-shrink-0">
                                            <input
                                                type="radio"
                                                name="sort"
                                                checked={isActive}
                                                onChange={() => setSortOrder(label)}
                                                className="appearance-none w-4 h-4 rounded-full border-2 border-gray-200 checked:border-[#8ABEB9] transition-all"
                                            />
                                            <div
                                                className={`absolute top-2.5 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all ${
                                                    isActive ? "custom-main-color-bg" : "bg-transparent"
                                                }`}
                                            />
                                        </div>
                                        <span
                                            className={`text-[12px] font-semibold transition-colors ${
                                                isActive ? "custom-main-color-text" : "text-gray-400 group-hover:text-gray-700"
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Price Range */}
            <section>
                <button
                    onClick={() => toggle("price")}
                    className="w-full flex justify-between items-center mb-3 pb-3 border-b border-gray-100 cursor-pointer"
                >
                    <h3 className="font-black text-[16px] tracking-widest uppercase text-[var(--header-text)]">
                        Price Range
                    </h3>
                    <ChevronDown
                        size={20}
                        strokeWidth={3}
                        className={`text-gray-400 transition-transform duration-300 ${open.price ? "rotate-0" : "rotate-180"}`}
                    />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out ${open.price ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                        <div className="pb-1">
                            <div className="flex gap-3 mb-5">
                                <div className="bg-gray-50 rounded-xl py-3 px-4 flex-1 text-center border input-theme">
                                    <span className="text-[9px] font-black text-gray-400 block mb-0.5 tracking-widest">MIN</span>
                                    <span className="text-xs font-black">${minPrice}</span>
                                </div>
                                <div className="custom-main-color-card rounded-xl py-3 px-4 flex-1 text-center border custom-main-border">
                                    <span className="text-[9px] font-black text-gray-400 block mb-0.5 tracking-widest">MAX</span>
                                    <span className="text-xs font-black text-[var(--header-text)]">${maxPrice}</span>
                                </div>
                            </div>

                            <div className="relative w-full h-6 flex items-center mt-4">
                                <div className="absolute w-full h-1.5 bg-gray-200 rounded-full input-theme" />
                                <div
                                    className="absolute h-1.5 custom-main-color-bg rounded-full"
                                    style={{
                                        left: `${(minPrice / maxPriceCap) * 100}%`,
                                        right: `${100 - (maxPrice / maxPriceCap) * 100}%`,
                                    }}
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={maxPriceCap}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))}
                                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer z-30 accent-[#8ABEB9] [&::-webkit-slider-thumb]:pointer-events-auto"
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={maxPriceCap}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))}
                                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer z-40 accent-[#8ABEB9] [&::-webkit-slider-thumb]:pointer-events-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brands */}
            <section>
                <button
                    onClick={() => toggle("brands")}
                    className="w-full flex justify-between items-center mb-3 pb-3 border-b border-gray-100 cursor-pointer"
                >
                    <h3 className="font-black text-[16px] tracking-widest uppercase text-[var(--header-text)]">
                        Brands
                    </h3>
                    <ChevronDown
                        size={20}
                        strokeWidth={3}
                        className={`text-gray-400 transition-transform duration-300 ${open.brands ? "rotate-0" : "rotate-180"}`}
                    />
                </button>

                <div className={`grid transition-all duration-300 ease-in-out ${open.brands ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                        <div
                            onScroll={handleScroll}
                            className={`max-h-[245px] overflow-y-auto pr-1 flex flex-col gap-1 pb-1 transition-all duration-300
                                        [&::-webkit-scrollbar]:w-1.5
                                        [&::-webkit-scrollbar-track]:rounded-full
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        ${isScrolling ? [
                                "[&::-webkit-scrollbar-track]:bg-gray-100/50",
                                "[&::-webkit-scrollbar-thumb]:bg-gray-400/60"
                            ].join(" ") : [
                                "[&::-webkit-scrollbar-track]:bg-transparent",
                                "[&::-webkit-scrollbar-thumb]:bg-transparent"
                            ].join(" ")}
                                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-500/80`}
                        >

                            <button
                                onClick={() => setSelectedBrand("ALL BRANDS")}
                                className={`w-full text-left px-4 py-2.5 rounded-[20px] text-[12px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0 ${
                                    normalizedSelectedBrand === "ALL BRANDS"
                                        ? "custom-main-color-button text-gray-900"
                                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                ALL BRANDS
                            </button>

                            {loading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-gray-100 h-9 rounded-xl flex-shrink-0" />
                                ))
                                : relevantBrands.map((brand) => {
                                    const isCurrentActive = normalizedSelectedBrand === brand.name.trim().toUpperCase();
                                    const productCount = brandCountsMap ? (brandCountsMap.get(brand.name.trim()) || 0) : 0;

                                    return (
                                        <button
                                            key={brand.id}
                                            onClick={() => setSelectedBrand(brand.name)}
                                            className={`w-full flex justify-between items-center px-4 py-2.5 rounded-[20px] text-[12px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0 ${
                                                isCurrentActive
                                                    ? "custom-main-color-button text-gray-900"
                                                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span>{brand.name}</span>

                                            <span className={`text-[11px] font-black ${
                                                isCurrentActive ? "text-gray-900/60" : "text-gray-400/70"
                                            }`}>
                                                {productCount}
                                            </span>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default FilterSidebar;