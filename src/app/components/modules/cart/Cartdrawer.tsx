"use client"

import Image from "next/image"
import { X } from "lucide-react"
import emptycart from "@/src/app/components/assets/images/empty-cart.gif"
import { useCart } from "@/src/app/components/context/Cartcontext"
import { useAlert } from "@/src/app/components/context/AlertContext"
import CartRow from "@/src/app/components/modules/cart/CartRow"
import { useRouter } from "next/navigation"
import {authService} from "@/src/app/components/modules/auth/core/services/authService";


interface CartProps {
    cartOpen:    boolean
    setCartOpen: (open: boolean) => void
}

const CHECKOUT_REDIRECT_KEY = "checkout_redirect"

export default function CartDrawer({ cartOpen, setCartOpen }: CartProps) {
    const { items, totalItems, clearCart } = useCart()
    const { showToast } = useAlert()
    const router = useRouter()


    const discountedTotal = items.reduce((acc, item) => {
        const product = item.product
        const unitPrice = Number(product?.price ?? 0)
        const discountPrice = product?.discount_price != null ? Number(product.discount_price) : null


        const priceToUse = (discountPrice !== null && !isNaN(discountPrice) && discountPrice > 0 && discountPrice < unitPrice)
            ? discountPrice
            : unitPrice

        return acc + (priceToUse * item.quantity)
    }, 0)

    const handleClearCart = () => {
        clearCart()
        showToast("Cart cleared", "info")
    }

    const handleCheckout = () => {
        const token = authService.getToken()

        if (!token) {
            localStorage.setItem(CHECKOUT_REDIRECT_KEY, "/checkout/checkout")
            setCartOpen(false)
            router.push("/login")
            return
        }

        setCartOpen(false)
        router.push("/checkout/checkout")
    }

    if (!cartOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-[998]"
                onClick={() => setCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[var(--header-bg)] z-[999] flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl text-[var(--header-text)] font-bold">Shopping Cart</h2>
                    </div>
                    <button onClick={() => setCartOpen(false)} aria-label="Close cart">
                        <X className="custom-main-color-icon cursor-pointer" size={24} />
                    </button>
                </div>

                <div className="h-[1px] input-theme w-full" />

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center -mt-10">
                            <Image src={emptycart} alt="Empty cart" width={180} height={180} />
                            <p className="mt-6 text-muted lg:text-[16px]">
                                Your cart is empty! Start shopping now!
                            </p>
                        </div>
                    )}

                    {items.length > 0 && (
                        <ul className="flex flex-col gap-4">
                            {items.map((item) => (
                                <CartRow key={item.id} item={item} />
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <>
                        <div className="h-[1px] input-theme w-full" />

                        <div className="px-6 py-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">
                                    Subtotal (
                                    <span className="custom-main-color-text">
                                        {totalItems}
                                    </span>{" "}
                                    <span className="custom-main-color-text">
                                        {totalItems === 1 ? "item" : "items"}
                                    </span>
                                    )
                                </span>

                                {/* DISPLAY THE DISCOUNTED TOTAL HERE */}
                                <span className="font-bold text-[var(--header-text)]">
                                    ${discountedTotal.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full custom-main-color-button custom-main-color-button-hover text-white font-semibold py-3 rounded-[20px] transition cursor-pointer"
                            >
                                Proceed to checkout
                            </button>

                            <button
                                onClick={handleClearCart}
                                className="w-full text-sm text-gray-400 custom-main-color-text-hover transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                Clear cart
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}