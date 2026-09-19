"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useApiData } from "@/src/app/components/services/utils/customHook"
import { Ban, Copy } from "lucide-react"
import { DiscountListResponse, DiscountCategory} from "@/src/app/components/modules/products/core/models/productsModel";
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient";
import { echo } from "@/src/app/lib/echo"

const AUTOPLAY_INTERVAL = 3000

export default function SidePromotions() {
    const [mounted, setMounted] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const [copied, setCopied] = useState(false)
    const [promos, setPromos] = useState<DiscountCategory[]>([])

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fetchDiscounts = useCallback(() => productClient.fetchDiscounts(), [])

    const { data: apiResponse, loading, error } =
        useApiData<DiscountListResponse>(
            fetchDiscounts,
            { message: "", discount: [] } as DiscountListResponse,
            true
        )

    // Sync initial API response into local state
    useEffect(() => {
        if (apiResponse?.discount) {
            setPromos(apiResponse.discount)
        }
    }, [apiResponse])

    // Real-Time WebSocket Sync (Laravel Echo)
    useEffect(() => {
        if (!echo) return

        const channel = echo.channel("discounts")

        channel.listen(".discount.created", (event: { discount: DiscountCategory }) => {
            const { discount } = event
            if (!discount || !discount.is_active) return

            setPromos((prev) => {
                if (prev.some((item) => item.id === discount.id)) return prev
                return [discount, ...prev]
            })
        })

        channel.listen(
            ".discount.updated",
            (event: { action: string; discount: DiscountCategory | null; discountId: number | null }) => {
                const { discount, discountId } = event

                setPromos((prev) => {
                    // No discount payload sent → remove by id (e.g. deactivation with id only)
                    if (!discount) {
                        if (discountId == null) return prev
                        return prev.filter((item) => item.id !== discountId)
                    }

                    // Discount payload present but explicitly inactive → remove
                    if (discount.is_active === false) {
                        return prev.filter((item) => item.id !== discount.id)
                    }

                    // Active discount → upsert
                    const exists = prev.some((item) => item.id === discount.id)
                    if (exists) {
                        return prev.map((item) => (item.id === discount.id ? discount : item))
                    }
                    return [discount, ...prev]
                })
            }
        )

        channel.listen(".discount.deleted", (event: { discountId: number }) => {
            const { discountId } = event
            setPromos((prev) => prev.filter((item) => item.id !== discountId))
        })

        return () => {
            echo?.leaveChannel("discounts")
        }
    }, [])

    const total = promos.length

    // Reset active index and copied state if total list changes or active slide changes
    useEffect(() => {
        if (total > 0 && activeIndex >= total) {
            setActiveIndex(0)
        }
        setCopied(false)
    }, [total, activeIndex])

    // Autoplay Carousel
    useEffect(() => {
        if (!total || paused || !mounted || loading || error) return

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % total)
        }, AUTOPLAY_INTERVAL)

        return () => clearInterval(interval)
    }, [total, paused, mounted, loading, error])

    // Loading Skeleton State
    if (!mounted || loading) {
        return (
            <div className="hidden lg:block w-[320px] h-[420px] relative rounded-[32px] card-theme border border-white/10 overflow-hidden animate-pulse bg-[var(--header-bg)] shadow-[0_4px_32px_rgba(0,0,0,0.08)]" />
        )
    }

    // Empty State
    if (promos.length === 0 && !error) {
        return (
            <div className="hidden lg:block w-[320px] h-[420px] relative rounded-[32px] card-theme border border-white/10 overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
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
        )
    }

    // Error State
    if (error) {
        return (
            <div className="hidden lg:block w-[320px] h-[420px] relative rounded-[32px] card-theme border border-white/10 overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping [animation-duration:1s]" />
                        <div className="absolute w-16 h-16 rounded-full bg-red-500/5 border border-red-500/10" />
                        <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
                            <span className="text-red-500 font-black text-base animate-pulse leading-none">!</span>
                        </div>
                    </div>
                    <p className="text-[12px] sm:text-[14px] font-black tracking-widest text-[var(--header-text)]/30 mt-2">
                        Failed to load promos.
                    </p>
                </div>
            </div>
        )
    }

    const currentPromo = promos[activeIndex]
    const couponCode = currentPromo?.coupon?.code || null

    return (
        <div
            className="hidden lg:block w-[320px] h-[420px] relative group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-white/10 bg-black">
                {currentPromo?.banner_image && (
                    <Link
                        href={`/promotions/${currentPromo.slug || ""}`}
                        className="absolute inset-0 z-0 block overflow-hidden"
                    >
                        <Image
                            src={currentPromo.banner_image}
                            alt={currentPromo.name || "Promo"}
                            fill
                            className="transition-transform duration-1000 group-hover:scale-110 object-cover"
                            priority
                        />
                    </Link>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />

                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end pointer-events-none">
                    {/* INDICATOR DOTS */}
                    <div className="absolute top-8 left-8 flex gap-1.5 pointer-events-auto items-center">
                        {promos.map((_, i) => (
                            <div
                                key={i}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setActiveIndex(i)
                                }}
                                className={`rounded-full transition-all duration-300 cursor-pointer ${
                                    i === activeIndex
                                        ? "w-8 h-1.5 bg-white"
                                        : "w-4 h-1 bg-white/30 hover:bg-white/50"
                                }`}
                            />
                        ))}
                    </div>

                    {/* TEXT CONTENT */}
                    <div className="space-y-2 mb-8">
                        <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-md tracking-tight">
                            {currentPromo?.name}
                        </h2>
                        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed font-medium">
                            {currentPromo?.description}
                        </p>
                    </div>

                    {/* COUPON CODE */}
                    <div className="space-y-3 mb-6">
                        {couponCode && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleCopy(couponCode)
                                }}
                                className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-2 rounded-[20px] border border-white/10 transition-colors pointer-events-auto group/coupon"
                            >
                                <span className="text-white text-sm font-semibold">Coupon Code:</span>
                                <span className="text-white font-mono text-sm font-bold tracking-wider cursor-pointer">
                                    {couponCode}
                                </span>
                                <Copy size={12} className="text-white/50 cursor-pointer" />
                                {copied && (
                                    <span className="text-[10px] text-emerald-400 absolute -top-5 right-0 animate-pulse">
                                        Copied!
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    <Link
                        href="/promotions"
                        className="inline-flex items-center justify-center custom-main-color-button custom-main-color-button-hover text-black text-[12px] font-black uppercase tracking-widest px-8 py-3 rounded-full w-fit pointer-events-auto"
                    >
                        Shop Now
                    </Link>
                </div>

                {/* COUNTER */}
                <div className="absolute top-6 lg:top-5 right-6 lg:right-8 z-20 pointer-events-none flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <span className="text-white/40 font-mono text-[10px] font-bold">
                        {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </div>
    )
}