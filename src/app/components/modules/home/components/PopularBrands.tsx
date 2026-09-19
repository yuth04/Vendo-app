'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Notfound from '@/src/app/components/assets/icons/main-icon/data-not-found.png';
import { useApiData } from '@/src/app/components/services/utils/customHook';
import { BrandCard } from './BrandCard';
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { Brand, Category } from "@/src/app/components/modules/products/core/models/productsModel";
import EmptyState from "@/src/app/components/helpers/components/EmptyState";
import NotFound from "@/src/app/components/helpers/components/NotFound";


const PopularBrands = () => {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<string | number>('All');
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: brandsRes, loading: isBrandsLoading } = useApiData(
        productClient.fetchBrandProduct, undefined, true,
    );
    const { data: catRes, loading: isCatLoading } = useApiData(
        productClient.fetchCategories, undefined, true,
    );

    const allBrands: Brand[] = useMemo(() => brandsRes?.brands ?? [], [brandsRes]);
    const allCategories: Category[] = useMemo(() => catRes?.category ?? [], [catRes]);

    // FIXED: Maps and generates all category data elements safely from your categories response payload
    const categories = useMemo(() => {
        return allCategories.map((cat) => ({
            id: cat.id,
            name: cat.name
        }));
    }, [allCategories]);

    const filteredBrands = useMemo(() => {
        if (activeTab === 'All') return allBrands;
        return allBrands.filter((brand) =>
            brand.products?.some((p) => p.category_id === activeTab),
        );
    }, [activeTab, allBrands]);

    const loading = !mounted || isBrandsLoading || isCatLoading;
    const isFiltered = activeTab !== 'All';

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -200 : 200,
                behavior: 'smooth',
            });
        }
    };

    const loopedBrands = useMemo(() => [...filteredBrands, ...filteredBrands], [filteredBrands]);

    return (
        <section className="max-w-7xl mx-auto py-2 sm:py-5 px-4 sm:px-0">
            <style>{`
                @keyframes marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-track {
                    animation: marquee 30s linear infinite;
                }
                .marquee-track.paused {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-14">
                <div className="flex items-center gap-3">
                    <h2 className="text-[24px] sm:text-[30px] md:text-[30px] lg:text-[36px] font-bold custom-main-color-text">
                        Popular Brands
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="flex-shrink-0 w-10 h-10 rounded-[20px] border-2 card-theme flex items-center justify-center custom-main-color-border-hover transition-all shadow-sm cursor-pointer"
                    >
                        <ChevronLeft size={35} strokeWidth={1.5} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-[300px] sm:max-w-md lg:max-w-xl"
                    >
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-200/50 rounded-[20px] h-10 w-20 flex-shrink-0" />
                            ))
                        ) : categories.length === 0 ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-400/20 rounded-[20px] h-10 w-20 flex-shrink-0 input-theme" />
                            ))
                        ) : (
                            <>
                                <button
                                    key="tab-all"
                                    onClick={() => setActiveTab('All')}
                                    className={`px-6 py-2 rounded-[20px] text-[14px] font-black whitespace-nowrap cursor-pointer border-2 card-theme ${
                                        activeTab === 'All' ? 'custom-main-color-bg text-white' : 'custom-main-color-border-hover'
                                    }`}
                                >
                                    All Brand
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id)}
                                        className={`px-6 py-2 rounded-[20px] text-[14px] font-black whitespace-nowrap cursor-pointer border-2 card-theme ${
                                            activeTab === cat.id ? 'custom-main-color-bg text-white' : 'custom-main-color-border-hover'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="flex-shrink-0 w-10 h-10 rounded-[20px] border-2 card-theme flex items-center justify-center custom-main-color-border-hover transition-all shadow-sm cursor-pointer"
                    >
                        <ChevronRight size={35} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Top Loading Skeletons */}
            {loading && (
                <div className="flex gap-4 overflow-hidden py-2">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[calc((100vw-3rem-2rem)/3)] sm:w-[150px] h-[130px] sm:h-[170px] p-4 sm:p-6 border-2 card-theme rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 sm:gap-5 shadow-sm">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full animate-pulse" />
                            <div className="h-4 w-12 sm:w-20 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && (
                <>
                    {/* Filtered View Layer (Tab Selected) */}
                    {isFiltered && (
                        filteredBrands.length > 0 ? (
                            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4">
                                {filteredBrands.map((brand, idx) => (
                                    <BrandCard key={`${brand.id}-${idx}`} brand={brand} idx={idx} />
                                ))}
                            </div>
                        ) : (
                            <NotFound
                                title="No Brand Found"
                                description="We couldn't find any results for this category. Try exploring other options."
                                imageSrc={Notfound}
                            />
                        )
                    )}

                    {/* Unfiltered View Layer (Marquee Sliders) */}
                    {!isFiltered && (
                        allBrands.length > 0 ? (
                            <div
                                className="overflow-hidden relative"
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                onTouchStart={() => setIsPaused(true)}
                                onTouchEnd={() => setIsPaused(false)}
                            >
                                <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-r from-[var(--header-bg)] to-transparent opacity-40" />
                                <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-l from-[var(--header-bg)] to-transparent opacity-40" />

                                <div className={`flex gap-4 w-max marquee-track ${isPaused ? 'paused' : ''}`}>
                                    {loopedBrands.map((brand, idx) => (
                                        <BrandCard key={`${brand.id}-${idx}`} brand={brand} idx={idx} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyState
                                title="No Brand Available"
                                description="The master brands catalog is currently empty. Try pulling down to fetch latest updates."
                                imageSrc={Notfound}
                                buttonText="Retry Connection"
                            />
                        )
                    )}
                </>
            )}
        </section>
    );
};

export default PopularBrands;