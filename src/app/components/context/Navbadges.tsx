"use client"

import { useEffect, useState } from "react"
import { useCart }     from "@/src/app/components/context/Cartcontext"
import { useWishlist } from "@/src/app/components/context/Wishlistcontext"

const BADGE_CLASS =
    "absolute -top-2 -right-2 min-w-[16px] h-[16px] px-[3px] " +
    "bg-red-500 text-white text-[9px] font-bold " +
    "rounded-full flex items-center justify-center leading-none shadow-sm"


//------ Cart badge ------//
export function CartBadge() {
    const { totalItems } = useCart()
    const [show, setShow] = useState(false)

    useEffect(() => { setShow(true) }, [])

    if (!show || totalItems === 0) return null

    return (
        <span className={BADGE_CLASS}>
            {totalItems > 99 ? "99+" : totalItems}
        </span>
    )
}

//------ Wishlist badge ------//
export function WishlistBadge() {
    const { count } = useWishlist()
    const [show, setShow] = useState(false)

    useEffect(() => { setShow(true) }, [])

    if (!show || count === 0) return null

    return (
        <span className={BADGE_CLASS}>
            {count > 99 ? "99+" : count}
        </span>
    )
}