"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import Notfound from "@/src/app/components/assets/icons/main-icon/data-not-found.png";
import Image from "next/image";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { homeClient } from "@/src/app/components/modules/home/core/api/homeClient";
import { SubCategory, ParentCategory } from "@/src/app/components/modules/home/core/models/homeModel";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";


const CategoriesNav = () => {
    const [canScrollLeft,  setCanScrollLeft]  = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- Fetch flat categories ---//
    const { data: catRes, loading: isCatLoading } = useApiData(
        productClient.fetchCategories,
        undefined,
        true,
    );

    // --- Fetch parent categories to build slug map ---//
    const { data: parentRes, loading: isParentLoading } = useApiData(
        homeClient.fetchParentCategories,
        undefined,
        true,
    );

    const allCategories: SubCategory[] = useMemo(
        () => catRes?.category ?? [],
        [catRes],
    );

    // Build a map: childCategoryId → parentSlug
    const parentSlugMap = useMemo<Map<number, string>>(() => {
        const map = new Map<number, string>();

        let parentData: ParentCategory[] = [];
        if (Array.isArray(parentRes)) {
            parentData = parentRes as unknown as ParentCategory[];
        } else if (parentRes && Array.isArray((parentRes as any).data)) {
            parentData = (parentRes as any).data as ParentCategory[];
        } else if ((parentRes as any)?.data && Array.isArray(((parentRes as any).data as any).data)) {
            parentData = ((parentRes as any).data as any).data as ParentCategory[];
        }

        parentData.forEach((parent) => {
            const parentSlug = parent.name.toLowerCase().replace(/\s+/g, "-");
            parent.categories.forEach((child) => {
                map.set(child.id, parentSlug);
            });
        });

        return map;
    }, [parentRes]);

    const isLoading = isCatLoading || isParentLoading;

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [allCategories]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const itemWidth = scrollRef.current.clientWidth / 3;
        scrollRef.current.scrollBy({ left: direction === 'left' ? -itemWidth : itemWidth, behavior: 'smooth' });
    };

    return (
        <section className="py-2 sm:py-5 max-w-7xl mx-auto px-4 sm:px-0">

            {/* Header + scroll buttons — always visible */}
            <div className="flex items-center justify-between mb-8 sm:mb-10">
                <div className="flex items-center gap-3">
                    <h2 className="text-[24px] sm:text-[30px] md:text-[30px] lg:text-[36px] font-bold custom-main-color-text">Categories</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => scroll('left')}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all card-theme shadow-sm cursor-pointer${canScrollLeft ? "" : " custom-main-color-border-hover"}`}
                    >
                        <ChevronLeft size={35} strokeWidth={1.5}/>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={`w-10 h-10 sm:w-12 sm:h-12  rounded-full border-2 flex items-center justify-center transition-all card-theme shadow-sm cursor-pointer${canScrollRight ? "" : " custom-main-color-border-hover"}`}
                    >
                        <ChevronRight size={35} strokeWidth={1.5}/>
                    </button>
                </div>
            </div>

            {/* Loading skeletons */}
            {isLoading && (
                <div className="flex gap-4 sm:gap-8 overflow-x-hidden pb-6">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-5 w-[calc((100%-2rem)/3)] sm:w-36 md:w-48">
                            <div className="animate-pulse bg-gray-200 w-full aspect-square rounded-[24px] sm:rounded-[32px]"/>
                            <div className="animate-pulse bg-gray-200 h-4 w-16 sm:w-24 rounded-full"/>
                        </div>
                    ))}
                </div>
            )}

            {/* Category list */}
            {!isLoading && allCategories.length > 0 && (
                <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-8 overflow-x-auto pb-6 no-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {allCategories.map((item, index) => {
                        const parentSlug = parentSlugMap.get(item.id) ?? "all";
                        return (
                            <Link
                                key={item.id}
                                href={`/categories/${parentSlug}/${item.slug}`}
                                className="group flex-shrink-0 flex flex-col items-center gap-3 sm:gap-5 w-[calc((100%-2rem)/3)] sm:w-36 md:w-48 focus:outline-none mt-4"
                            >
                                <div className="relative w-full aspect-square rounded-[24px] sm:rounded-[32px] border card-theme shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex items-center justify-center p-3 sm:p-6 group-hover:shadow-lg group-hover:-translate-y-1">
                                    {item.image ? (
                                        <div className="relative w-full h-full">
                                            <NextImage
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                priority={index < 4}
                                                className="object-contain transition-transform duration-300 group-hover:scale-110"
                                                sizes="(max-width: 768px) 33vw, 192px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-gray-200 font-bold text-xl sm:text-3xl uppercase">{item.name.charAt(0)}</div>
                                    )}
                                </div>

                                <span className="text-[12px] sm:text-[14px] md:text-[18px] font-extrabold text-[#2D3E50] custom-main-color-text transition-colors duration-200 text-center line-clamp-1 sm:line-clamp-none">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty categories state */}
            {!isLoading && allCategories.length === 0 && (
                <EmptyState
                    title="No categories found"
                    description="We couldn't find any results for this category. Try exploring other options."
                    imageSrc={Notfound}
                />
            )}
        </section>
    );
};

export default CategoriesNav;