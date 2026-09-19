'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { HiOutlineShoppingBag } from "react-icons/hi";
import { LuLockKeyhole, LuRepeat, LuLayoutGrid } from "react-icons/lu";
import { AiOutlineSetting } from "react-icons/ai";
import { GrLocation } from "react-icons/gr";
import {User} from "@/src/app/components/modules/auth/core/models/authModel";
import {authService} from "@/src/app/components/modules/auth/core/services/authService";

const AccountSidebar = () => {
    const [user, setUser] = useState<User | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        setUser(authService.getStoredUser());
        const onAuthUpdate = () => {
            setUser(authService.getStoredUser());
        };

        window.addEventListener('auth-updated', onAuthUpdate);
        return () => window.removeEventListener('auth-updated', onAuthUpdate);
    }, [])

    const ICON_CLASS = "w-5 h-5 transition-transform duration-300 group-hover:scale-110";

    const menuItems: { label: string; href: string; icon: React.ReactNode }[] = [
        {
            label: "Overview",
            href: "/account/overview",
            icon: <LuLayoutGrid className={ICON_CLASS} />
        },
        { label: "Order History",   href: "/account/order-history", icon: <HiOutlineShoppingBag className={ICON_CLASS} /> },
        { label: "Return orders",   href: "/account/returns",        icon: <LuRepeat className={ICON_CLASS} /> },
        { label: "Account Info",    href: "/account/account-info",   icon: <AiOutlineSetting className={ICON_CLASS} /> },
        { label: "Change Password", href: "/account/password",       icon: <LuLockKeyhole className={ICON_CLASS} /> },
        { label: "Address",         href: "/account/address",        icon: <GrLocation className={ICON_CLASS} /> },
    ];

    return (
        <div className="hidden lg:block sticky top-6 bg-white rounded-[32px] border border-gray-100 card-theme overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
            <div className="px-6 py-8 border-b border-gray-50 bg-[var(--header-bg)]">
                {user ? (
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-20 h-20 rounded-[50px] bg-gray-50 overflow-hidden ring-4 ring-white shadow-sm relative border border-gray-100">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={`${user.first_name} profile`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#FF5F6D] to-[#FFC371] flex items-center justify-center text-white font-black text-2xl">
                                    {user.first_name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                        </div>
                        <div className="w-full">
                            <p className="font-black text-[20px] custom-main-color-text leading-tight truncate">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="text-[12px] font-bold text-gray-400 mt-1">{user.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-gray-50 rounded-full animate-pulse mx-auto" />
                            <div className="h-3 w-40 bg-gray-50 rounded-full animate-pulse mx-auto" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[var(--header-bg)] space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-4 px-5 py-3.5 rounded-[22px] transition-all duration-300 font-black text-[14px] ${
                                isActive
                                    ? "custom-main-color-bg custom-main-color-text shadow-sm"
                                    : "text-gray-400 custom-main-color-bg-hover chover:text-[var(--header-text)]"
                            }`}
                        >
                            <span className={`${isActive ? "custom-main-color-icon" : "text-gray-300 custom-main-color-bg-hover"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#08CB00]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}

export default AccountSidebar;