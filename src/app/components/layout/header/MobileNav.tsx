"use client"

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home, LayoutGrid, Heart, User, X, ChevronRight,
    LogIn, UserPlus, HelpCircle, Phone,
} from 'lucide-react';
import Image from "next/image";
import cartIcon from "@/src/app/components/assets/icons/Vector .svg";
import { User as UserType } from "@/src/app/components/modules/auth/core/models/authModel";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
import { HiOutlineShoppingBag } from "react-icons/hi";
import {LuLayoutGrid, LuLockKeyhole, LuRepeat} from "react-icons/lu";
import { AiOutlineSetting } from "react-icons/ai";
import { GrLocation } from "react-icons/gr";
import { TbLogout } from "react-icons/tb";
import {CartBadge, WishlistBadge} from "@/src/app/components/context/Navbadges";
import {authService} from "@/src/app/components/modules/auth/core/services/authService";
import {ParentCategory} from "@/src/app/components/modules/home/core/models/homeModel";
import {homeClient} from "@/src/app/components/modules/home/core/api/homeClient";



interface MobileNavProps {
    setCartOpen: (open: boolean) => void;
}

const ICON_CLASS = "w-5 h-5 custom-main-color-icon";

const menuItems: { label: string; href: string; icon: React.ReactNode }[] = [
    {label: "Overview", href: "/account/overview", icon: <LuLayoutGrid className={ICON_CLASS} />},
    { label: "Order History",   href: "/account/order-history", icon: <HiOutlineShoppingBag className={ICON_CLASS} /> },
    { label: "Return orders",   href: "/account/returns",        icon: <LuRepeat             className={ICON_CLASS} /> },
    { label: "Account Info",    href: "/account/account-info",   icon: <AiOutlineSetting     className={ICON_CLASS} /> },
    { label: "Change Password", href: "/account/password",       icon: <LuLockKeyhole        className={ICON_CLASS} /> },
    { label: "Address",         href: "/account/address",        icon: <GrLocation           className={ICON_CLASS} /> },
];

const MobileNav: React.FC<MobileNavProps> = ({ setCartOpen }) => {
    const pathname = usePathname();
    const router   = useRouter();
    const { showNotification } = useNotification();

    const [catOpen,     setCatOpen]     = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [user,        setUser]        = useState<UserType | null>(null);

    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const [activeParentId,   setActiveParentId]   = useState<number | null>(null);
    const [isLoading,        setIsLoading]        = useState(false);

    useEffect(() => {
        const sync = () => setUser(authService.getStoredUser());
        sync();
        window.addEventListener('auth-updated', sync);
        return () => window.removeEventListener('auth-updated', sync);
    }, []);

    useEffect(() => {
        setCatOpen(false);
        setAccountOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = (catOpen || accountOpen) ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [catOpen, accountOpen]);

    useEffect(() => {
        if (!catOpen || parentCategories.length > 0) return;
        const load = async () => {
            try {
                setIsLoading(true);
                const response = await homeClient.fetchParentCategories();
                let finalData: ParentCategory[] = [];
                if (Array.isArray(response))
                    finalData = response as unknown as ParentCategory[];
                else if (response && Array.isArray(response.data))
                    finalData = response.data as unknown as ParentCategory[];
                else if (response?.data && Array.isArray((response.data as any).data))
                    finalData = (response.data as any).data as ParentCategory[];
                if (finalData.length > 0) {
                    setParentCategories(finalData);
                    setActiveParentId(finalData[0].id);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [catOpen]);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        showNotification("Logged out successfully", "success");
        setAccountOpen(false);
        setTimeout(() => { router.push("/"); router.refresh(); }, 800);
    };

    const activeParent  = parentCategories.find((p) => p.id === activeParentId) ?? null;
    const subCategories = activeParent?.categories || [];

    const getActiveStyles = (path: string) =>
        pathname === path ? "custom-main-color-text scale-105" : "text-gray-400";

    const isCatActive     = pathname.startsWith("/categories");
    const isAccountActive = pathname === "/login" || pathname === "/register" || pathname.startsWith("/account");

    return (
        <>
            {/* ── Bottom Nav Bar ── */}
            <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md">
                <div className="bg-[var(--header-bg)] backdrop-blur-md border border-gray-100 h-16 rounded-[20px] px-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-between relative">

                    <Link href="/" className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 relative ${getActiveStyles("/")}`}>
                        <Home size={22} strokeWidth={pathname === "/" ? 2.5 : 2} />
                        <span className="text-[10px] font-bold mt-0.5">Home</span>
                        {pathname === "/" && <div className="absolute -bottom-1 w-1 h-1 custom-main-color-bg rounded-full shadow-[0_0_8px_#E3DE61]" />}
                    </Link>

                    <button
                        onClick={() => setCatOpen(true)}
                        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 relative ${isCatActive || catOpen ? "custom-main-color-text scale-105" : "text-gray-400"}`}
                    >
                        <LayoutGrid size={22} strokeWidth={isCatActive ? 2.5 : 2} />
                        <span className="text-[10px] font-bold mt-0.5">Categories</span>
                        {isCatActive && <div className="absolute -bottom-1 w-1 h-1 custom-main-color-bg rounded-full shadow-[0_0_8px_#E3DE61]" />}
                    </button>


                    <div className="flex-1 flex justify-center -translate-y-7">
                        <button
                            onClick={() => setCartOpen(true)}
                            className="group relative w-15 h-15 custom-main-color-bg rounded-full flex items-center justify-center  border-[5px] border-white active:scale-90 transition-all duration-200"
                        >
                            <div className="relative w-6 h-6">
                                <Image src={cartIcon} alt="cart" fill className="icon-theme" />
                            </div>
                            <CartBadge />
                        </button>
                    </div>

                    <Link href="/wishlist" className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 relative ${getActiveStyles("/wishlist")}`}>
                        <div className="relative">
                            <Heart size={22} strokeWidth={pathname === "/wishlist" ? 2.5 : 2} />
                            <WishlistBadge />
                        </div>
                        <span className="text-[10px] font-bold mt-0.5">Wishlist</span>
                        {pathname === "/wishlist" && <div className="absolute -bottom-1 w-1 h-1 custom-main-color-bg rounded-full shadow-[0_0_8px_#E3DE61]" />}
                    </Link>

                    <button
                        onClick={() => setAccountOpen(true)}
                        className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 relative ${isAccountActive || accountOpen ? "custom-main-color-text scale-105" : "text-gray-400"}`}
                    >
                        <User size={22} strokeWidth={isAccountActive ? 2.5 : 2} />
                        <span className="text-[10px] font-bold mt-0.5">Account</span>
                        {isAccountActive && <div className="absolute -bottom-1 w-1 h-1 custom-main-color-bg rounded-full shadow-[0_0_8px_#E3DE61]" />}
                    </button>
                </div>
            </div>

            {/*--- Categories Offcanvas ---*/}
            <div
                onClick={() => setCatOpen(false)}
                className={`lg:hidden fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${catOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />
            <div
                className={`lg:hidden fixed bottom-0 left-0 right-0 z-[201] bg-[var(--header-bg)] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${catOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
                style={{ maxHeight: "82vh" }}
            >
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 rounded-full custom-main-color-bg" />
                        <h2 className="text-[18px] font-black uppercase tracking-widest text-[var(--header-text)]">Categories</h2>
                    </div>
                    <button onClick={() => setCatOpen(false)} className="w-9 h-9 rounded-full input-theme flex items-center justify-center active:scale-90 transition-transform">
                        <X size={18} className="custom-main-color-icon" />
                    </button>
                </div>
                <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100">
                    {isLoading
                        ? [...Array(4)].map((_, i) => <div key={i} className="h-8 w-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />)
                        : parentCategories.map((parent) => (
                            <button key={parent.id} onClick={() => setActiveParentId(parent.id)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] card-theme font-black uppercase tracking-wider transition-all duration-200 ${activeParentId === parent.id ? "custom-main-color-text text-[#111]" : "bg-gray-100 text-gray-500 active:scale-95"}`}>
                                {parent.name}
                            </button>
                        ))
                    }
                </div>
                <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "52vh" }}>
                    {isLoading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-gray-100 animate-pulse" />)}</div>
                    ) : subCategories.length > 0 ? (
                        <div className="space-y-2">
                            {subCategories.map((sub) => (
                                <Link key={sub.id} href={`/categories/${sub.slug}`} onClick={() => setCatOpen(false)}
                                      className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--header-bg)] card-theme active:bg-[#E3DE61]/20 transition-colors duration-150 group">
                                    <div className="w-12 h-12 rounded-xl bg-white card-theme shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {sub.image && sub.image.trim() !== "" ? (
                                            <img src={sub.image} alt={sub.name} className="w-9 h-9 object-contain" />
                                        ) : (
                                            <span className="text-lg font-black text-[#E3DE61]">{sub.name?.charAt(0) || "?"}</span>
                                        )}
                                    </div>
                                    <span className="flex-1 text-[14px] font-bold text-[var(--header-text)] group-active:text-[#111]">{sub.name}</span>
                                    <ChevronRight size={16} className="text-gray-300 group-active:text-[#E3DE61] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                            <LayoutGrid size={32} className="text-gray-400 mb-3" />
                            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No categories</p>
                        </div>
                    )}
                </div>
                <div className="pb-6" />
            </div>

            {/*---- Account Offcanvas ----*/}
            <div
                onClick={() => setAccountOpen(false)}
                className={`lg:hidden fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${accountOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />
            <div
                className={`lg:hidden fixed bottom-0 left-0 right-0 z-[201] bg-[var(--header-bg)] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${accountOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
            >
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 rounded-full custom-main-color-bg" />
                        <h2 className="text-[18px] font-black uppercase tracking-widest text-[var(--header-text)]">Account</h2>
                    </div>
                    <button onClick={() => setAccountOpen(false)} className="w-9 h-9 rounded-full input-theme flex items-center justify-center active:scale-90 transition-transform">
                        <X size={18} className="custom-main-color-icon" />
                    </button>
                </div>

                {!user ? (
                    <div className="px-5 pt-8 pb-4 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full custom-main-color-card flex items-center justify-center mb-5">
                            <User size={36} className="text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[20px] font-black text-[var(--header-text)] mb-1">Welcome to VENDO</h3>
                        <p className="text-[12px] text-gray-400 max-w-[240px] leading-relaxed mb-7">
                            Sign in to track orders, manage your wishlist, and more.
                        </p>
                        <Link href="/register" onClick={() => setAccountOpen(false)}
                              className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-[var(--header-text)] rounded-2xl font-black text-[15px] py-4 mb-3 active:scale-[0.97] transition-all duration-150">
                            <UserPlus size={18} /> Create Account
                        </Link>
                        <div className="flex items-center w-full gap-4 mb-3">
                            <div className="h-[1px] flex-1 bg-gray-200" />
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Or</span>
                            <div className="h-[1px] flex-1 bg-gray-200" />
                        </div>
                        <Link href="/login" onClick={() => setAccountOpen(false)}
                              className="w-full flex items-center justify-center gap-2 custom-main-color-bg text-white rounded-2xl font-black text-[15px] py-4 active:scale-[0.97] transition-all duration-150 shadow-lg">
                            <LogIn size={18} /> Sign In
                        </Link>
                        <div className="w-full mt-6 border-t border-gray-100 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 text-left px-1">Support</p>
                            <Link href="/help" onClick={() => setAccountOpen(false)}
                                  className="flex items-center gap-3 px-1 py-3 rounded-xl text-[14px] font-semibold text-[var(--header-text)] active:bg-gray-100 transition-colors">
                                <HelpCircle size={18} className="text-gray-400" /> Help Center
                            </Link>
                            <Link href="/contact-us" onClick={() => setAccountOpen(false)}
                                  className="flex items-center gap-3 px-1 py-3 rounded-xl text-[14px] font-semibold text-[var(--header-text)] active:bg-gray-100 transition-colors">
                                <Phone size={18} className="text-gray-400" /> Contact Us
                            </Link>
                        </div>
                        <div className="pb-4" />
                    </div>
                ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: "78vh" }}>
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                {user.image ? (
                                    <Image src={user.image} alt={`${user.first_name} profile`} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full custom-main-color-bg flex items-center justify-center text-white font-bold text-lg">
                                        {user.first_name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold custom-main-color-text leading-tight">{user.first_name} {user.last_name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <div className="py-2">
                            {menuItems.map((item) => (
                                <Link key={item.href} href={item.href} onClick={() => setAccountOpen(false)}
                                      className="flex items-center gap-3 px-5 py-4 custom-main-color-text-hover transition-colors custom-main-color-bg-hover font-medium text-[var(--header-text)]">
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                            <button onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-red-500 custom-main-color-text-hover transition-colors custom-main-color-bg-hover font-medium cursor-pointer text-[var(--header-text)]">
                                <TbLogout className={"w-5 h-5 text-red-500"} />
                                Log Out
                            </button>
                        </div>
                        <div className="pb-8" />
                    </div>
                )}
            </div>
        </>
    );
};

export default MobileNav;