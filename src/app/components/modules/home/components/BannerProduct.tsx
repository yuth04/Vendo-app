"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { Ban, Copy } from "lucide-react";
import { DiscountListResponse } from "@/src/app/components/modules/products/core/models/productsModel";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";

const AUTOPLAY_INTERVAL = 3000;

export default function BannerProduct() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchDiscounts = useCallback(() => productClient.fetchDiscounts(), []);

  const {
    data: apiResponse,
    loading,
    error,
  } = useApiData<DiscountListResponse>(
    fetchDiscounts,
    { message: "", discount: [] } as DiscountListResponse,
    true,
  );

  const data = apiResponse?.discount ?? [];
  const total = data.length;

  // Fix 1: Reset activeIndex safely if data changes or updates
  useEffect(() => {
    if (total > 0 && activeIndex >= total) {
      setActiveIndex(0);
    }
  }, [total, activeIndex]);

  /* ---------------- AUTO PLAY ---------------- */
  // Fix 2: Don't run intervals during loading, error states, or when there's only 1 item
  useEffect(() => {
    if (!total || total <= 1 || paused || !mounted || loading || error) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [total, paused, mounted, loading, error]);

  // Fix 3: Initial Hydration & Loading Guard State (Prevents blank components on page refresh)
  if (!mounted || loading) {
    return (
      <section className="mb-6 lg:px-0">
        <div className="container mx-auto max-w-7xl">
          <div className="w-full h-[200px] md:h-[400px] lg:h-[420px] relative rounded-[24px] lg:rounded-[40px] border border-white/10 overflow-hidden animate-pulse bg-[var(--header-bg)] shadow-[0_4px_32px_rgba(0,0,0,0.08)]" />
        </div>
      </section>
    );
  }

  // Fix 4: Corrected Error Handling block aligning seamlessly with your grid layout structures
  if (error) {
    return (
      <section className="mb-6 lg:px-0">
        <div className="container mx-auto max-w-7xl">
          <div className="w-full h-[200px] md:h-[400px] lg:h-[420px] relative rounded-[24px] lg:rounded-[40px] card-theme border border-white/10 overflow-hidden bg-[var(--header-bg)]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping [animation-duration:1s]" />
                <div className="absolute w-16 h-16 rounded-full bg-red-500/5 border border-red-500/10" />
                <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-red-500 font-black text-base animate-pulse leading-none">
                    !
                  </span>
                </div>
              </div>
              <p className="text-[12px] sm:text-[14px] font-black tracking-widest text-[var(--header-text)]/30 mt-2">
                Network error. Please try again.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fix 5: Dynamic Empty State block to keep structural spacing when zero discount listings are loaded
  if (data.length === 0) {
    return (
      <section className="mb-6 lg:px-0">
        <div className="container mx-auto max-w-7xl">
          <div className="w-full h-[200px] md:h-[400px] lg:h-[420px] relative rounded-[24px] lg:rounded-[40px] card-theme border border-white/10 overflow-hidden bg-[var(--header-bg)]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl custom-main-color-card border border-[#E3DE61]/20 flex items-center justify-center">
                <span className="text-[#E3DE61]/50 font-black text-xl">
                  <Ban size={24} className="custom-main-color-icon" />
                </span>
              </div>
              <p className="text-[11px] font-black tracking-[0.2em] text-[var(--header-text)]/25 uppercase">
                No banners available
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentPromo = data[activeIndex];
  const couponCode = currentPromo?.coupon?.code || null;

  return (
    <section className="mb-6 lg:px-0">
      <div className="container mx-auto max-w-7xl">
        <div
          className="w-full h-[200px] md:h-[400px] lg:h-[420px] relative group"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative w-full h-full rounded-[24px] lg:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-black">
            {/* BACKGROUND IMAGE LINK */}
            {currentPromo.banner_image && (
              <Link
                href={`/promotions/${currentPromo.slug || ""}`}
                className="absolute inset-0 z-0 block w-full h-full overflow-hidden"
              >
                <Image
                  src={currentPromo.banner_image}
                  alt={currentPromo.name || "Promo"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
              </Link>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />

            <div className="absolute inset-0 z-20 p-6 lg:p-8 flex flex-col justify-end pointer-events-none">
              {/* PAGINATION DOTS */}
              <div className="absolute top-6 lg:top-8 left-6 lg:left-8 flex gap-1.5 pointer-events-auto items-center">
                {data.map((_, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveIndex(i);
                    }}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeIndex
                        ? "w-6 h-1.5 lg:w-8 bg-white"
                        : "w-4 h-1 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
              {/* TEXT CONTENT */}
              <div className="space-y-1 lg:space-y-2 mb-4 lg:mb-8">
                <h2 className="text-white text-lg lg:text-2xl font-bold leading-tight drop-shadow-md tracking-tight">
                  {currentPromo.name}
                </h2>
                <p className="text-white/70 text-[11px] lg:text-sm line-clamp-2 leading-relaxed font-medium max-w-[90%]">
                  {currentPromo.description}
                </p>
                {/* COUPON CODE */}
                {couponCode && (
                  <div className="pt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopy(couponCode);
                      }}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-2 rounded-[20px] border border-white/10 transition-colors pointer-events-auto group/coupon"
                    >
                      <span className="text-white text-sm font-semibold">
                        Coupon Code:
                      </span>
                      <span className="text-white font-mono text-[10px] lg:text-sm font-bold tracking-wider cursor-pointer">
                        {couponCode}
                      </span>
                      <Copy
                        size={12}
                        className="text-white/50 cursor-pointer"
                      />
                      {copied && (
                        <span className="text-[10px] text-emerald-400 absolute -top-5 right-0 animate-pulse">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* ACTION BUTTON */}
              <Link
                href={`/promotions`}
                className="pointer-events-auto inline-flex items-center justify-center custom-main-color-button custom-main-color-button-hover text-black text-[10px] lg:text-[12px] font-black uppercase tracking-widest px-6 lg:px-8 py-2.5 lg:py-3 rounded-full w-fit transition-all active:scale-95"
              >
                Shop Now
              </Link>
            </div>

            {/* COUNTER */}
            <div className="absolute top-6 lg:top-8 right-6 lg:right-8 z-20 pointer-events-none  flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="custom-main-color-text font-mono text-[9px] lg:text-[14px] font-bold">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
