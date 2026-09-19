"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
    Menu,
    X,
    Search,
    Home,
    Contact,
    Tag,
    Camera,
    Upload,
    ScanSearch, ImageUp
} from "lucide-react"
import Image from "next/image"
import AccountDropdown from "@/src/app/components/modules/account/AccountDropdown"
import favorite from "@/src/app/components/assets/icons/favorite.svg"
import cart from "@/src/app/components/assets/icons/Vector .svg"
import bell from "@/src/app/components/assets/icons/bell.svg"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import MobileNav from "@/src/app/components/layout/header/MobileNav"
import CategoryDropdown from "@/src/app/components/modules/categories/components/CategoryDropdown"
import DarkMode from "@/src/app/components/helpers/dark-mode/DarkMode"
import { CartBadge, WishlistBadge } from "@/src/app/components/context/Navbadges"
import CartDrawer from "@/src/app/components/modules/cart/Cartdrawer"
import NotificationDrawer from "@/src/app/components/modules/notifications/components/NotificationDrawer"
import { useApiData } from "@/src/app/components/services/utils/customHook"
import { productClient } from "@/src/app/components/modules/products/core/api/productsClient"
import SuggestionsDropdown from "@/src/app/components/layout/header/search/components/SuggestionsDropdown"
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert"
import { searchService } from "@/src/app/components/layout/header/search/core/services/searchService"
import { notificationService } from "@/src/app/components/modules/notifications/core/services/notificationService"

const SEARCH_MAX_LENGTH = 30
const MAX_SUGGESTIONS   = 6
const MAX_HISTORY       = 5
const HISTORY_KEY       = "vendo_search_history"

interface SuggestionItem {
    productName: string
    image: string
}

export default function Header() {
    const pathname     = usePathname()
    const router       = useRouter()
    const searchParams = useSearchParams()
    const { showNotification } = useNotification()

    const [scrolled,         setScrolled]         = useState(false)
    const [menuOpen,         setMenuOpen]         = useState(false)
    const [searchOpen,       setSearchOpen]       = useState(false)
    const [cartOpen,         setCartOpen]         = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [unreadCount,      setUnreadCount]      = useState(0)

    const [desktopQuery, setDesktopQuery] = useState(() => searchParams.get('search') ?? '')
    const [mobileQuery,  setMobileQuery]  = useState(() => searchParams.get('search') ?? '')

    const [desktopSugOpen, setDesktopSugOpen] = useState(false)
    const [mobileSugOpen,  setMobileSugOpen]  = useState(false)

    const [history, setHistory] = useState<string[]>([])

    const [imageModalOpen,   setImageModalOpen]   = useState(false)
    const [isDragActive,     setIsDragActive]     = useState(false)
    const [isImageUploading, setIsImageUploading] = useState(false)

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

    const mobileInputRef = useRef<HTMLInputElement>(null)
    const desktopFormRef = useRef<HTMLDivElement>(null)
    const fileInputRef   = useRef<HTMLInputElement>(null)

    const fetchProducts = useCallback(() => productClient.fetchProduct(), [])
    const { data: productRes } = useApiData(fetchProducts, undefined, true)

    const allProducts = useMemo<SuggestionItem[]>(
        () => (productRes?.product ?? []).map((p: { productName: string; image: string | null }) => ({
            productName: p.productName,
            image: p.image ?? ""
        })).filter((p: SuggestionItem) => p.productName),
        [productRes],
    )

    useEffect(() => {
        const currentSearch = searchParams.get('search') ?? ''
        const isImageSearch = searchParams.get('imageSearch') === 'true'

        setDesktopQuery(currentSearch)
        setMobileQuery(currentSearch)

        if (isImageSearch) {
            const storedPreview = searchService.getStoredImagePreviewUrl()
            if (storedPreview) setImagePreviewUrl(storedPreview)
        } else {
            setImagePreviewUrl(null)
        }
    }, [searchParams])

    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY)
        if (stored) {
            try { setHistory(JSON.parse(stored)) } catch { setHistory([]) }
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        if (searchOpen) setTimeout(() => mobileInputRef.current?.focus(), 50)
    }, [searchOpen])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (desktopFormRef.current && !desktopFormRef.current.contains(e.target as Node)) {
                setDesktopSugOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Fetch unread notification count for the bell badge, independent of the drawer being open
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getNotifications()
            if (response.error) {
                console.error("Failed to fetch unread notification count:", response.error.message)
                return
            }

            let items: { is_read: boolean }[] = []
            if (response.data && Array.isArray(response.data.data)) {
                items = response.data.data
            } else if (response.data && Array.isArray((response.data as any).orders)) {
                items = (response.data as any).orders
            }

            setUnreadCount(items.filter((n) => !n.is_read).length)
        } catch (err) {
            console.error("Error executing fetch unread notification count:", err)
        }
    }, [])

     // 2. REPLACE your old useEffects with this unified listener & interval controller
    useEffect(() => {
        fetchUnreadCount();

        const fastIntervalId = setInterval(() => {
            if (!notificationOpen) {
                fetchUnreadCount();
            }
        }, 4000);

        return () => clearInterval(fastIntervalId);
    }, [fetchUnreadCount, notificationOpen]);

    // Re-sync the badge count whenever the drawer is closed, in case items were read/cleared inside it
    useEffect(() => {
        if (!notificationOpen) fetchUnreadCount()
    }, [notificationOpen, fetchUnreadCount])



    const saveSearchToHistory = useCallback((term: string) => {
        const cleanTerm = term.trim()
        if (!cleanTerm) return
        setHistory(prev => {
            const filtered = prev.filter(item => item.toLowerCase() !== cleanTerm.toLowerCase())
            const updated  = [cleanTerm, ...filtered].slice(0, MAX_HISTORY)
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    const handleDeleteHistoryItem = useCallback((term: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item !== term)
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
            return updated
        })
    }, [])

    const handleClearAllHistory = useCallback(() => {
        setHistory([])
        localStorage.removeItem(HISTORY_KEY)
    }, [])

    const getSuggestions = useCallback((query: string): SuggestionItem[] => {
        const cleanQuery = query.trim().toLowerCase()
        if (!cleanQuery) return []

        const queryChars = cleanQuery.replace(/\s+/g, '').split('')
        if (queryChars.length === 0) return []

        const queryFreq = queryChars.reduce<Record<string, number>>((acc, char) => {
            acc[char] = (acc[char] ?? 0) + 1
            return acc
        }, {})

        return allProducts
            .filter((item) => {
                const nameLower = item.productName.toLowerCase()
                const nameFreq  = nameLower.split('').reduce<Record<string, number>>((acc, char) => {
                    acc[char] = (acc[char] ?? 0) + 1
                    return acc
                }, {})
                return Object.entries(queryFreq).every(
                    ([char, count]) => (nameFreq[char] ?? 0) >= count
                )
            })
            .slice(0, MAX_SUGGESTIONS)
    }, [allProducts])

    const desktopSuggestions = useMemo(() => getSuggestions(desktopQuery), [desktopQuery, getSuggestions])
    const mobileSuggestions  = useMemo(() => getSuggestions(mobileQuery),  [mobileQuery,  getSuggestions])

    const goSearch = (query: string) => {
        const q = query.trim()
        if (q) saveSearchToHistory(q)

        searchService.clearImageResults()
        setImagePreviewUrl(null)

        router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    }

    const handleDesktopSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setDesktopSugOpen(false)
        goSearch(desktopQuery)
    }

    const handleMobileSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setMobileSugOpen(false)
        goSearch(mobileQuery)
        setSearchOpen(false)
    }

    const handleDesktopSuggestionSelect = (name: string) => {
        setDesktopQuery(name)
        setDesktopSugOpen(false)
        goSearch(name)
    }

    const handleMobileSuggestionSelect = (name: string) => {
        setMobileQuery(name)
        setMobileSugOpen(false)
        goSearch(name)
        setSearchOpen(false)
    }

    const handleClearSearch = () => {
        setDesktopQuery("")
        setMobileQuery("")
        setDesktopSugOpen(false)
        setImagePreviewUrl(null)
        searchService.clearImageResults()
        router.push('/products')
    }

    const handleMobileInputClear = () => {
        setMobileQuery("")
        setMobileSugOpen(false)
        setSearchOpen(false)
        setImagePreviewUrl(null)
        searchService.clearImageResults()
        router.push('/products')
    }

    const processImageFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            showNotification?.("Please upload a valid image file.", "error")
            return
        }

        setIsImageUploading(true)
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64Url = reader.result as string
                setImagePreviewUrl(base64Url)
                searchService.storeImagePreviewUrl(base64Url)

                try {
                    await searchService.searchByImage(file)
                    setImageModalOpen(false)
                    setSearchOpen(false)

                    window.location.href = "/products?imageSearch=true"
                } catch (error) {
                    console.error("Image search failed:", error)
                    showNotification?.("Image recognition search failed. Try again.", "error")
                    setImagePreviewUrl(null)
                    searchService.clearImageResults()
                } finally {
                    setIsImageUploading(false)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                }
            }
            reader.readAsDataURL(file)
        } catch (e) {
            console.error("Reader processing crash fallback:", e)
            setIsImageUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processImageFile(file)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true)
        } else if (e.type === "dragleave") {
            setIsDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImageFile(e.dataTransfer.files[0])
        }
    }

    return (
        <>
            <header className="sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-[120px]">
                    <div className={`transition-all duration-300 ${scrolled ? "translate-y-0" : "translate-y-6"}`}>
                        <div className={`rounded-[20px] px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 
                            ${scrolled ? "shadow-md" : "shadow-xl"} 
                            bg-[var(--header-bg)] border border-[var(--border-color)]`}>
                            <nav className="flex items-center justify-between gap-4 sm:gap-6 lg:gap-8">

                                <div className="flex lg:hidden items-center">
                                    <button onClick={() => setMenuOpen(true)}>
                                        <Menu className="text-[var(--header-text)]" size={24} />
                                    </button>
                                </div>

                                <Link href="/" className="text-2xl font-[900] italic uppercase tracking-tighter text-[var(--header-text)] lg:mr-auto">
                                    VENDO
                                </Link>

                                <div className="hidden lg:flex items-center gap-8">
                                    <Link href="/" className={`md:text-[20px] font-bold transition-colors ${pathname === "/" ? "custom-main-color-text" : "text-[var(--nav-link)] custom-main-color-text-hover"}`}>
                                        Home
                                    </Link>
                                    <CategoryDropdown pathname={pathname} />
                                    <Link href="/promotions" className={`md:text-[20px] font-bold transition-colors ${pathname === "/promotions" ? "custom-main-color-text" : "text-[var(--nav-link)] custom-main-color-text-hover"}`}>
                                        Promotions
                                    </Link>
                                    <Link href="/contact-us" className={`md:text-[20px] font-bold transition-colors ${pathname === "/contact-us" ? "custom-main-color-text" : "text-[var(--nav-link)] custom-main-color-text-hover"}`}>
                                        Contact Us
                                    </Link>
                                </div>

                                <form onSubmit={handleDesktopSubmit} className="hidden lg:flex flex-1 max-w-md">
                                    <div className="relative w-full" ref={desktopFormRef}>
                                        {!imagePreviewUrl && (
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        )}

                                        {imagePreviewUrl && (
                                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center card-theme p-1 pr-3 rounded-full ">
                                                <div className="relative w-7 h-7 rounded-full overflow-hidden mr-2 border border-gray-400/40">
                                                    <Image
                                                        src={imagePreviewUrl}
                                                        alt="Lens Preview"
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Image</span>
                                                <button
                                                    type="button"
                                                    onClick={handleClearSearch}
                                                    className="ml-1.5 text-gray-400 hover:text-red-400"
                                                >
                                                    <X className="cursor-pointer" size={14} />
                                                </button>
                                            </div>
                                        )}

                                        <input
                                            type="text"
                                            value={desktopQuery}
                                            onChange={(e) => {
                                                setDesktopQuery(e.target.value)
                                                setDesktopSugOpen(true)
                                            }}
                                            onFocus={() => setDesktopSugOpen(true)}
                                            placeholder={imagePreviewUrl ? "Add to your search" : "Search..."}
                                            maxLength={SEARCH_MAX_LENGTH}
                                            autoComplete="off"
                                            className={`w-full py-2.5 ms-1 border border-[var(--border-color)] text-[var(--header-text)] rounded-[24px] focus:outline-none bg-transparent ${
                                                imagePreviewUrl ? "pl-28 pr-24" : "pl-11 pr-24"
                                            }`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setImageModalOpen(true)}
                                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                                title="Search by image"
                                            >
                                                <Camera size={20} />
                                            </button>
                                            <span className={`text-[9px] font-mono font-bold ${desktopQuery.length === SEARCH_MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                                                {desktopQuery.length}/{SEARCH_MAX_LENGTH}
                                            </span>
                                            {desktopQuery && (
                                                <button type="button" onClick={handleClearSearch} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <SuggestionsDropdown
                                            suggestions={desktopSuggestions}
                                            history={history}
                                            query={desktopQuery}
                                            onSelect={handleDesktopSuggestionSelect}
                                            onDeleteHistory={handleDeleteHistoryItem}
                                            onClearAllHistory={handleClearAllHistory}
                                            visible={desktopSugOpen}
                                        />
                                    </div>
                                </form>

                                <div className="hidden lg:flex items-center gap-6">
                                    <button onClick={() => setNotificationOpen(true)} className="relative cursor-pointer">
                                        <Image src={bell} alt="bell" className="mt-1 cursor-pointer icon-theme" width={24}
                                               height={24}/>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <Link href="/wishlist" className="relative inline-flex">
                                        <Image src={favorite} alt="favorite" className="mt-1 icon-theme cursor-pointer"
                                               width={24} height={24}/>
                                        <WishlistBadge/>
                                    </Link>
                                    <AccountDropdown/>
                                    <button onClick={() => setCartOpen(true)} className="relative cursor-pointer">
                                        <Image src={cart} alt="cart" className="cursor-pointer icon-theme" width={24}
                                               height={24}/>
                                        <CartBadge/>
                                    </button>
                                    <DarkMode/>
                                </div>

                                <div className="flex lg:hidden items-center gap-3 text-[var(--header-text)]">
                                    <button onClick={() => setNotificationOpen(true)} className="relative cursor-pointer">
                                        <Image src={bell} alt="bell" className="icon-theme" width={22} height={22}/>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    <DarkMode/>
                                    <button onClick={() => setSearchOpen(true)}>
                                        <Search size={24}/>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>

                <div className={`fixed top-0 left-0 h-full w-64 bg-[var(--header-bg)] z-[60] transition-transform duration-300 card-theme ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="p-6 flex flex-col gap-6">
                        <button className="self-end" onClick={() => setMenuOpen(false)}><X className="custom-main-color-icon" size={24} /></button>
                        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium"><Home size={20} /><span>Home</span></Link>
                        <Link href="/promotions" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium"><Tag size={20} /><span>Promotions</span></Link>
                        <Link href="/contact-us" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium"><Contact size={20} /><span>Contact Us</span></Link>
                    </div>
                </div>

                {searchOpen && (
                    <>
                        <div className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
                        <div className="fixed top-0 left-0 right-0 z-[999] animate-in slide-in-from-top-2 fade-in duration-200 bg-[var(--header-bg)] shadow-xl">
                            <div className="h-[3px] w-full custom-main-color-bg" />
                            <div className="flex items-center justify-between px-5 py-4">
                                <span className="text-[24px] font-black italic uppercase tracking-tighter">VENDO</span>
                                <button onClick={() => setSearchOpen(false)} className="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center custom-main-color-icon cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="px-5 pb-4">
                                <form onSubmit={handleMobileSubmit}>
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-2xl px-4 py-3.5 input-theme border border-[var(--border-color)] relative">
                                        {!imagePreviewUrl && (
                                            <Search size={20} className="text-[var(--header-text)] flex-shrink-0" />
                                        )}

                                        {imagePreviewUrl && (
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center card-theme p-1 pr-2.5 rounded-full border border-[var(--border-color)] max-w-[100px] sm:max-w-none">
                                                <div className="relative w-6 h-6 rounded-full overflow-hidden mr-1.5 flex-shrink-0">
                                                    <Image
                                                        src={imagePreviewUrl}
                                                        alt="Lens Mobile Preview"
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap hidden xs:inline mr-1">Images</span>
                                                <button type="button" onClick={handleMobileInputClear} className="text-gray-400 hover:text-red-400 flex-shrink-0">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}

                                        <input
                                            ref={mobileInputRef}
                                            type="text"
                                            value={mobileQuery}
                                            onChange={(e) => {
                                                setMobileQuery(e.target.value)
                                                setMobileSugOpen(true)
                                            }}
                                            onFocus={() => setMobileSugOpen(true)}
                                            placeholder={imagePreviewUrl ? "Add to search" : "Search products..."}
                                            maxLength={SEARCH_MAX_LENGTH}
                                            autoComplete="off"
                                            className={`flex-1 bg-transparent text-[16px] font-semibold text-[var(--header-text)] outline-none min-w-[60px] ${
                                                imagePreviewUrl ? "pl-20 xs:pl-24 sm:pl-24" : ""
                                            }`}
                                        />
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                                            <button
                                                type="button"
                                                onClick={() => setImageModalOpen(true)}
                                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                                title="Search by image"
                                            >
                                                <Camera size={18} />
                                            </button>
                                            <span className={`text-[11px] font-mono font-bold ${mobileQuery.length === SEARCH_MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                                                {mobileQuery.length}/{SEARCH_MAX_LENGTH}
                                            </span>
                                            {mobileQuery && (
                                                <button type="button" onClick={handleMobileInputClear} className="w-6 h-6 rounded-full input-theme flex items-center justify-center cursor-pointer">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                                {mobileSugOpen && (
                                    <SuggestionsDropdown
                                        suggestions={mobileSuggestions}
                                        history={history}
                                        query={mobileQuery}
                                        onSelect={handleMobileSuggestionSelect}
                                        onDeleteHistory={handleDeleteHistoryItem}
                                        onClearAllHistory={handleClearAllHistory}
                                        visible={mobileSugOpen}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}

                {imageModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                        <div
                            className="relative w-full max-w-[640px] bg-[#222222] text-[#e3e3e3] rounded-[28px] p-6 shadow-2xl font-sans border border-[#3c4043]/30">
                            <div className="flex items-center justify-between gap-3 mb-6 w-full">

                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 custom-main-color-card rounded-full flex items-center justify-center text-[#8ab4f8] shrink-0">
                                        <ScanSearch size={20}/>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm xs:text-base sm:text-[18px] font-bold text-white leading-snug break-words">
                                            Search any image with Vendo Lens
                                        </h3>
                                        <p className="text-[11px] sm:text-[13px] text-gray-400 font-medium mt-0.5">Visual
                                            search</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setImageModalOpen(false)
                                        if (isImageUploading) handleClearSearch()
                                    }}
                                    className="p-2.5 rounded-full bg-[#2d2f31] hover:bg-[#3c4043] text-gray-400 hover:text-white transition-all duration-200 cursor-pointer border border-[#3c4043]/50 shrink-0 active:scale-90"
                                >
                                    <X size={16} className="xs:w-[18px] xs:h-[18px]"/>
                                </button>
                            </div>
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`relative flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-10 transition-all min-h-[280px] overflow-hidden
                                ${isDragActive ? "border-[#8ab4f8] bg-[#303134]/40" : "border-gray-700 bg-[#1e1f20]/50 hover:border-gray-500"} 
                                ${isImageUploading ? "border-[#8ab4f8]" : ""}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {isImageUploading && imagePreviewUrl ? (

                                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/40 z-10 p-6">
                                        <div
                                            className="relative p-[2px] rounded-2xl overflow-hidden shadow-2xl mb-5 group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#8ab4f8] via-transparent to-[#8ab4f8] animate-spin [animation-duration:3s]"/>
                                            <div className="relative w-40 h-40 bg-[#222222] rounded-[14px] overflow-hidden">
                                                <Image
                                                    src={imagePreviewUrl}
                                                    alt="Analyzing preview"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#8ab4f8] to-transparent animate-pulse shadow-[0_0_8px_#8ab4f8] top-1/2 -translate-y-1/2"/>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-2 bg-[#222222]/95 px-4 py-2 rounded-full border border-gray-700/60 shadow-lg animate-pulse">
                                            <ScanSearch size={18} className="animate-bounce text-[#8ab4f8]"/>
                                            <span className="text-[14px] font-medium text-gray-200">Analyzing visual elements...</span>
                                        </div>
                                    </div>
                                ) : isImageUploading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <ScanSearch size={36} className="animate-bounce text-[#8ab4f8]"/>
                                        <span className="text-[14px] text-gray-300">Analyzing visual elements...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center w-full max-w-[320px]">
                                        <div
                                            className="w-14 h-14 mb-4 flex items-center justify-center custom-main-color-card rounded-2xl border border-gray-700 text-[#8ab4f8]">
                                            <ImageUp size={26} className="text-[#8ab4f8]"/>
                                        </div>

                                        <h4 className="text-[16px] font-medium text-white mb-1">
                                            Drop your image here
                                        </h4>
                                        <p className="text-[14px] text-gray-400 mb-5">
                                            PNG, JPG, WEBP up to 10 MB
                                        </p>

                                        <div className="relative flex py-2 items-center w-full mb-5">
                                            <div className="flex-grow border-t border-gray-700/60"></div>
                                            <span className="flex-shrink mx-4 text-gray-500 text-[13px]">or</span>
                                            <div className="flex-grow border-t border-gray-700/60"></div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-[#2d2f31] text-white text-[14px] font-medium rounded-xl border border-gray-600 transition-colors cursor-pointer"
                                        >
                                            <Upload size={16}/>
                                            Browse files
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                <MobileNav setCartOpen={setCartOpen}/>
                <CartDrawer cartOpen={cartOpen} setCartOpen={setCartOpen}/>
                <NotificationDrawer cartOpen={notificationOpen} setCartOpen={setNotificationOpen}/>
            </header>
        </>
    )
}