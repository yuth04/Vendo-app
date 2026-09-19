"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ParentCategory } from "@/src/app/components/modules/home/core/models/homeModel";
import { homeClient } from "@/src/app/components/modules/home/core/api/homeClient";


const CategoryDropdown = ({ pathname }: { pathname: string }) => {
    const [isOpen, setIsOpen]                     = useState(false);
    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const [activeParentId, setActiveParentId]     = useState<number | null>(null);
    const [isLoading, setIsLoading]               = useState(false);
    const [dropdownTop, setDropdownTop]           = useState(0);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);

    // ── Load parent categories once ──
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setIsLoading(true);
                const response = await homeClient.fetchParentCategories();

                let finalData: ParentCategory[] = [];

                if (Array.isArray(response)) {
                    finalData = response as unknown as ParentCategory[];
                }
                else if (response && Array.isArray(response.data)) {
                    finalData = response.data as unknown as ParentCategory[];
                }
                else if (response?.data && Array.isArray((response.data as any).data)) {
                    finalData = (response.data as any).data as ParentCategory[];
                }

                if (finalData.length > 0) {
                    setParentCategories(finalData);
                    setActiveParentId(finalData[0].id);
                }

            } catch (error) {
                console.error("API Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, []);

    //--- Close dropdown on route change ----//
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    //----- Measure real navbar bottom for correct dropdown position ----//
    useEffect(() => {
        const updatePosition = () => {
            if (triggerRef.current) {
                let el: HTMLElement | null = triggerRef.current;
                while (el && !["NAV", "HEADER"].includes(el.tagName)) {
                    el = el.parentElement;
                }
                const rect = (el ?? triggerRef.current).getBoundingClientRect();
                setDropdownTop(rect.bottom);
            }
        };
        updatePosition();
        window.addEventListener("resize", updatePosition);
        return () => window.removeEventListener("resize", updatePosition);
    }, [isOpen]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    };

    const handleLinkClick = () => setIsOpen(false);

    const activeParent  = parentCategories.find((p) => p.id === activeParentId) ?? null;
    const subCategories = activeParent?.categories || [];

    const activeParentSlug = activeParent?.name?.toLowerCase().replace(/\s+/g, "-") ?? "all";

    const isActive = pathname.startsWith("/categories") || isOpen;

    return (
        <>
            {/* Trigger */}
            <div
                ref={triggerRef}
                className="flex items-center h-full relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Link
                    href="/categories/all"
                    onClick={handleLinkClick}
                    className={`md:text-[20px] font-bold transition-colors py-2 ${
                        isActive
                            ? "custom-main-color-text"
                            : "text-[var(--nav-link)] md:text-[20px] custom-main-color-text-hover font-bold"
                    }`}
                >
                    Categories
                </Link>
            </div>

            {/* Dropdown — anchored to measured navbar bottom */}
            {isOpen && (
                <div
                    className="fixed left-0 w-full z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ top: dropdownTop }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="bg-[#F4F9FB] shadow-xl rounded-xl overflow-hidden min-h-[400px]">

                        {/* Header Bar — parent category tabs */}
                        <div className="custom-main-color-bg px-10 py-5 flex items-center gap-x-12 text-white text-[18px] font-black">
                            {isLoading ? (
                                <>
                                    <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
                                    <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
                                    <div className="h-5 w-24 bg-white/20 rounded animate-pulse" />
                                </>
                            ) : parentCategories.length === 0 ? (
                                <span className="opacity-70">No parent categories</span>
                            ) : (
                                parentCategories.map((parent) => (
                                    <button
                                        key={parent.id}
                                        onMouseEnter={() => setActiveParentId(parent.id)}
                                        className={`relative transition-all cursor-pointer ${
                                            activeParentId === parent.id ? "opacity-100" : "opacity-80 hover:opacity-100"
                                        }`}
                                    >
                                        {parent.name}
                                        {activeParentId === parent.id && (
                                            <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#F4F9FB]" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Sub-categories grid */}
                        <div className="p-12 flex flex-wrap justify-center gap-10 min-h-[400px] overflow-y-auto input-theme">
                            {isLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center w-36 animate-pulse">
                                        <div className="w-28 h-28 bg-gray-200/60 rounded-[30px] shadow-inner" />
                                        <div className="mt-4 h-3 w-20 bg-gray-200/80 rounded-full" />
                                    </div>
                                ))
                            ) : subCategories.length > 0 ? (
                                subCategories.map((sub) => (
                                    <Link
                                        key={sub.id}
                                        href={`/categories/${activeParentSlug}/${sub.slug}`}
                                        onClick={handleLinkClick}
                                        className="flex flex-col items-center group w-36 transition-all duration-300"
                                    >
                                        <div className="relative w-28 h-28 input-theme rounded-[30px] flex items-center justify-center p-5 transition-all duration-500 ease-out hover:shadow-[#F8F3CE] group-hover:-translate-y-2 group-active:scale-95">
                                            {sub.image && sub.image.trim() !== "" ? (
                                                <img
                                                    src={sub.image}
                                                    alt={sub.name}
                                                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="text-[#F5A7A7]/30 font-black text-4xl select-none">
                                                    {sub.name?.charAt(0) || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <span className="mt-4 text-[11px] font-black custom-main-color-text uppercase tracking-[0.15em] text-center transition-colors duration-300 group-hover:text-[#e08e8e]">
                                            {sub.name}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center py-32 opacity-50">
                                    <div className="w-16 h-16 mb-4 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">!</div>
                                    <p className="text-gray-400 font-bold text-[12px] sm:text-[18px]">No categories found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategoryDropdown;