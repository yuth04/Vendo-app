"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react"
import { useCart, type CartItem } from "@/src/app/components/context/Cartcontext"
import { useAlert } from "@/src/app/components/context/AlertContext"
import CheckoutStepper from "./CheckoutStepper"
import OrderSummary from "./OrderSummary"
import React, { useState, useEffect } from "react"


function CartItemRow({ item }: { item: CartItem }) {
    const { updateQuantity, removeFromCart } = useCart()
    const { showToast } = useAlert()

    // 1. Extract variables safely from the item
    const product     = item.product
    const variant     = item.variant
    const productName = product?.productName ?? `Product #${item.product_id}`
    const maxQty      = variant?.stock ?? 99

    // 2. Safe Price Conversion (Prevents .toFixed crashes)
    const unitPrice     = Number(product?.price ?? 0)
    const discountPrice = product?.discount_price != null ? Number(product.discount_price) : null
    const hasDiscount   = discountPrice !== null && !isNaN(discountPrice) && discountPrice > 0 && discountPrice < unitPrice

    // 3. Image Logic
    const imgSrc =
        variant?.images?.find((i) => i.is_primary)?.image ??
        variant?.images?.[0]?.image ??
        product?.image ??
        null

    const handleDecrease = () => {
        if (item.quantity <= 1) {
            removeFromCart(item.id)
            showToast(`"${productName}" removed from cart`, "success")
        } else {
            updateQuantity(item.id, item.quantity - 1)
        }
    }

    const handleIncrease = () => {
        if (item.quantity < maxQty) {
            updateQuantity(item.id, item.quantity + 1)
        } else {
            showToast("Maximum stock reached", "warning")
        }
    }

    const handleRemove = () => {
        removeFromCart(item.id)
        showToast(`"${productName}" removed from cart`, "success")
    }

    return (
        <div className="flex items-center gap-4 py-5 border-b border-gray-100 last:border-0">
            {/* Thumbnail */}
            <div className="w-20 h-26 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={productName}
                        width={80}
                        height={100}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={28} className="text-gray-300" />
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--header-text)] truncate">{productName}</p>

                {/* Fixed Variant Badges Logic */}
                {(variant?.color || variant?.size) && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {variant.color && (
                            <span className="text-[12px] w-12 h-7  bg-gray-100 input-theme text-gray-500 rounded-[20px] flex items-center justify-center">
                                {variant.color}
                            </span>
                        )}
                        {variant.size && (
                            <span className="text-[12px] w-7 h-7 bg-gray-100 input-theme text-gray-500 rounded-[30px] flex items-center justify-center">
                                {variant.size}
                            </span>
                        )}
                    </div>
                )}

                {/* Safe Price Rendering */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {hasDiscount ? (
                        <>
                            <span className="text-xs font-medium text-gray-400 line-through">
                                ${unitPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold custom-main-color-text">
                                ${discountPrice!.toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-bold text-[var(--header-text)]">
                            ${unitPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={handleDecrease}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-[var(--header-text)]">
                        {item.quantity}
                    </span>
                    <button
                        onClick={handleIncrease}
                        disabled={item.quantity >= maxQty}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Plus size={12} />
                    </button>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition cursor-pointer flex-shrink-0"
            >
                <Trash2 size={15} />
                <span>Remove</span>
            </button>
        </div>
    )
}

// --- Main View Component ---
export default function CartListView() {
    const router = useRouter()
    const { items, totalItems, totalPrice } = useCart()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const shippingCharge = 2
    const tax            = 0
    const discount       = 0


    const displayItems      = isMounted ? items      : []
    const displayTotalItems = isMounted ? totalItems : 0
    const displayTotalPrice = isMounted ? Number(totalPrice || 0) : 0

    return (
        <div className="min-h-screen py-4 sm:py-4">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 border custom-main-color-border-hover card-theme rounded-full transition-colors cursor-pointer hover:bg-gray-50"
                    >
                        <ArrowLeft size={30} className="text-[var(--header-text)]"/>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--header-text)]">Your Shopping Cart</h1>
                        <p className="text-sm custom-main-color-text font-medium">
                            ({displayTotalItems}) Product{displayTotalItems !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <CheckoutStepper current="cart"/>

                <div className="flex flex-col lg:flex-row gap-6 mt-2">
                    {/* Left – items list */}
                    <div className="flex-1 card-theme rounded-2xl border border-gray-100 shadow-sm px-6 py-2">
                        {displayItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <ShoppingBag size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400">Your cart is empty</p>
                            </div>
                        ) : (
                            displayItems.map((item) => <CartItemRow key={item.id} item={item} />)
                        )}

                        {displayItems.length > 0 && (
                            <div className="flex justify-end py-5">
                                <button
                                    onClick={() => router.push("/checkout/checkout")}
                                    className="px-4 sm:px-6 sm:py-3 py-2.5 rounded-[20px] custom-main-color-button text-[12px] sm:text-[14px] custom-main-color-button-hover text-white font-semibold cursor-pointer flex items-center gap-2"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right – summary card */}
                    <div className="w-full lg:w-[360px] flex-shrink-0">
                        <OrderSummary
                            subtotal={displayTotalPrice}
                            tax={tax}
                            shippingCharge={shippingCharge}
                            discount={discount}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}