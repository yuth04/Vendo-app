"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Ban, ChevronLeft, ChevronRight } from "lucide-react"
import SideProducts from "./SidePromotions"
import { useApiData } from "@/src/app/components/services/utils/customHook"
import { homeClient } from "@/src/app/components/modules/home/core/api/homeClient"
import { Carousel } from "@/src/app/components/modules/home/core/models/homeModel"

const DEFAULT_CAROUSEL = { carousels: [] as Carousel[] }
const INTERVAL = 5000

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [progress, setProgress]         = useState(0)
    const [animating, setAnimating]       = useState(false)

    const fetchCarousels = useCallback(() => homeClient.fetchCarousels(), [])
    const { data, loading, error } = useApiData(fetchCarousels, DEFAULT_CAROUSEL, true)

    const slides: Carousel[] = (data?.carousels ?? [])
        .filter((c) => c.status)
        .slice(0, 4)

    const currentSlideRef = useRef(currentSlide)
    useEffect(() => { currentSlideRef.current = currentSlide }, [currentSlide])

    useEffect(() => {
        if (slides.length === 0) return
        setProgress(0)
        const progressTimer = setInterval(() => {
            setProgress((p) => Math.min(p + (100 / (INTERVAL / 100)), 100))
        }, 100)
        const slideTimer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
            setProgress(0)
        }, INTERVAL)
        return () => { clearInterval(progressTimer); clearInterval(slideTimer) }
    }, [slides.length])

    useEffect(() => {
        if (slides.length > 0 && currentSlide >= slides.length) setCurrentSlide(0)
    }, [slides.length, currentSlide])

    const goTo = (idx: number) => {
        if (animating || idx === currentSlide) return
        setAnimating(true)
        setCurrentSlide(idx)
        setProgress(0)
        setTimeout(() => setAnimating(false), 600)
    }
    const nextSlide = () => goTo((currentSlide + 1) % slides.length)
    const prevSlide = () => goTo((currentSlide - 1 + slides.length) % slides.length)

    return (
        <section className="py-0 sm:py-6 lg:py-8 overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 sm:gap-4">

                    {/* ══ CAROUSEL ══ */}
                    <div className="animate-fadeInLeft relative rounded-2xl sm:rounded-[30px] overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:h-[420px] bg-[var(--header-bg)] border border-[var(--border-color)] shadow-[0_4px_32px_rgba(0,0,0,0.08)] group">

                        {/* ── Error ── */}
                        {error && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--header-bg)]">
                                {/* Added flex and items-center to ensure the entire stack alignment stays perfectly centered */}
                                <div className="flex flex-col items-center text-center">

                                    {/* Centered relative wrapper layout */}
                                    <div className="relative flex items-center justify-center w-20 h-20">
                                        <div
                                            className="absolute inset-0 rounded-full bg-red-500/10 animate-ping [animation-duration:1s]"/>
                                        <div
                                            className="absolute w-16 h-16 rounded-full bg-red-500/5 border border-red-500/10"/>
                                        <div
                                            className="relative z-10 w-8 h-8 rounded-full border-2 border-red-500 bg-[var(--header-bg)] flex items-center justify-center">
                                            <span className="text-red-500 font-black text-base animate-pulse leading-none select-none">!</span>
                                        </div>
                                    </div>

                                    <p className="text-[12px] sm:text-[14px] font-black tracking-widest text-[var(--header-text)]/30 mt-2">
                                        Failed to load.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Slides ── */}
                        {!loading && slides.map((slide, idx) => (
                            <div
                                key={slide.id}
                                className={`absolute inset-0 transition-all duration-600 ease-in-out ${
                                    idx === currentSlide
                                        ? "opacity-100 scale-100 z-10"
                                        : "opacity-0 scale-[1.03] z-0"
                                }`}
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover object-center"
                                    priority={idx === 0}
                                    sizes="(max-width: 1000px) 100vw, 80vw"
                                />

                                {/* Gradient overlays */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"/>

                                {/* ── Text overlay ── */}
                                {(slide.title || slide.description) && idx === currentSlide && (
                                    <div className="absolute bottom-12 sm:bottom-20 left-4 sm:left-8 lg:left-10 max-w-[58%] sm:max-w-sm lg:max-w-md z-20">

                                        {/* Eyebrow tag — always visible, smaller on mobile */}
                                        <div className="inline-flex items-center gap-1 sm:gap-1.5 custom-main-color-bg rounded-full px-2 sm:px-3 py-0.5 sm:py-1 mb-1.5 sm:mb-3 animate-heroFadeUp">
                                            <div className="w-1 h-1 rounded-full bg-[#111]"/>
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#111]">
                                                Featured
                                            </span>
                                        </div>

                                        {/* Title — always visible */}
                                        {slide.title && (
                                            <h2 className="font-black text-white text-[13px] sm:text-2xl lg:text-[28px] leading-tight tracking-tight mb-1 sm:mb-2 line-clamp-2 animate-heroFadeUp [animation-delay:150ms]">
                                                {slide.title}
                                            </h2>
                                        )}

                                        {/* Description — always visible, smaller on mobile */}
                                        {slide.description && (
                                            <p className="text-white/60 text-[10px] sm:text-xs font-medium leading-relaxed line-clamp-2 animate-heroFadeUp [animation-delay:300ms]">
                                                {slide.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* ── Controls ── */}
                        {slides.length > 1 && (
                            <>
                                {/* Progress bar — top */}
                                <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/10 z-30">
                                    <div
                                        className="h-full custom-main-color-bg"
                                        style={{width: `${progress}%`, transition: "width 0.1s linear"}}
                                    />
                                </div>

                                {/* Slide counter chip — top left */}
                                <div className="absolute top-4 left-5 sm:left-6 z-30 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                                    <span className="custom-main-color-text font-black text-[11px] tabular-nums leading-none">
                                        {String(currentSlide + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-white/20 font-bold text-[10px]">/</span>
                                    <span className="text-white/40 font-bold text-[10px] tabular-nums">
                                        {String(slides.length).padStart(2, "0")}
                                    </span>
                                </div>

                                {/* Prev */}
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30
                                   w-9 h-9 sm:w-12 sm:h-12 rounded-3xl bg-white/10
                                   border border-white/10 custom-main-color-border-hover
                                   flex items-center justify-center backdrop-blur-sm transition-all duration-300 active:scale-90
                                   opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                                   [&:hover_svg]:text-[#FFFFFF]"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft className="w-8 h-8 text-[#8ABEB9] transition-colors duration-200 cursor-pointer"/>
                                </button>

                                {/* Next */}
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30
                                   w-9 h-9 sm:w-12 sm:h-12 rounded-3xl bg-white/10
                                   border border-white/10 custom-main-color-border-hover
                                   flex items-center justify-center backdrop-blur-sm transition-all duration-300 active:scale-90
                                   opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                                   [&:hover_svg]:text-[#FFFFFF]"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight className="w-8 h-8 text-[#8ABEB9] transition-colors duration-200 cursor-pointer"/>
                                </button>

                                {/* Dot strip — bottom center */}
                                <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/25 backdrop-blur-sm rounded-full px-3 py-2">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => goTo(idx)}
                                            className={`rounded-full transition-all duration-300 cursor-pointer ${
                                                idx === currentSlide
                                                    ? "bg-[#8ABEB9] w-6 sm:w-7 h-[6px]"
                                                    : "bg-white/30 hover:bg-white/60 w-[8px] h-[8px]"
                                            }`}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Thumbnail strip — bottom right */}
                                <div className="absolute bottom-5 right-4 sm:right-5 z-30 hidden sm:flex items-center gap-2">
                                    {slides.map((slide, idx) => (
                                        <button
                                            key={slide.id}
                                            onClick={() => goTo(idx)}
                                            className={`relative w-12 h-8 sm:w-14 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                                                idx === currentSlide
                                                    ? "ring-2 ring-[#8ABEB9] ring-offset-1 ring-offset-transparent scale-105 opacity-100 cursor-pointer"
                                                    : "opacity-40 hover:opacity-70 scale-100 cursor-pointer"
                                            }`}
                                        >
                                            <Image
                                                src={slide.image}
                                                alt={slide.title}
                                                fill
                                                className="object-cover object-center"
                                                priority={idx === currentSlide || idx === 0}
                                                loading={idx === currentSlide || idx === 0 ? "eager" : "lazy"}
                                                sizes="(max-width: 1024px) 100vw, 80vw"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── Empty state ── */}
                        {!loading && slides.length === 0 && !error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-2xl custom-main-color-card border border-[#E3DE61]/20 flex items-center justify-center">
                                    <span className="text-[#E3DE61]/50 font-black text-xl">
                                        <Ban size={24} className="custom-main-color-icon"/>
                                    </span>
                                </div>
                                <p className="text-[11px] font-black tracking-[0.2em] text-[var(--header-text)]/25">
                                    No banners available
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── SIDE PRODUCTS ── */}
                    <div className="animate-fadeInRight lg:flex lg:items-stretch">
                        <SideProducts/>
                    </div>

                </div>
            </div>
        </section>
    )
}