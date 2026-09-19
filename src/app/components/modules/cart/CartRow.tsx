"use client"

import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/src/app/components/context/Cartcontext"
import type { CartItem } from "@/src/app/components/context/Cartcontext"
import { useAlert } from "@/src/app/components/context/AlertContext"

export default function CartRow({ item }: { item: CartItem }) {
    const { updateQuantity, removeFromCart } = useCart()
    const { showToast } = useAlert()

    const product     = item.product
    const variant     = item.variant
    const productName = product?.productName ?? `Product #${item.product_id}`
    const maxQty      = variant?.stock ?? 99

    const unitPrice     = Number(product?.price ?? 0)
    const discountPrice = product?.discount_price != null ? Number(product.discount_price) : null
    const hasDiscount   = discountPrice !== null && !isNaN(discountPrice) && discountPrice > 0 && discountPrice < unitPrice

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
        }
    }

    const handleRemove = () => {
        removeFromCart(item.id)
        showToast(`"${productName}" removed from cart`, "success")
    }

    return (
        <li className="flex gap-4 items-start  border-b border-gray-300/50 pb-4 last:border-0">
            {/* Thumbnail */}
            <div className="w-26 h-28 rounded-[20px] overflow-hidden input-theme flex-shrink-0">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={productName}
                        width={64}
                        height={64}
                        className="object-contain object-center w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-[18px] font-semibold text-[var(--header-text)] truncate">
                    {productName}
                </p>

                {/* Variant badges */}
                {(variant?.color || variant?.size) && (
                    <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                        {variant.color && (
                            <span className="text-[12px] h-7 px-3 bg-gray-100 input-theme text-gray-500 rounded-full flex items-center justify-center font-medium">
                            {variant.color}
                        </span>
                        )}
                        {variant.size && (
                            <span className="text-[12px] h-7 min-w-[28px] px-2 bg-gray-100 input-theme text-gray-500 rounded-full flex items-center justify-center font-medium whitespace-nowrap">
                            {variant.size}
                        </span>
                        )}
                    </div>
                )}

                {/* Price Display */}
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

                {/* Quantity stepper */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={handleDecrease}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <Minus size={12} />
                    </button>

                    <span className="w-6 text-center text-sm font-semibold text-[var(--header-text)]">
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

            <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-red-500 transition mt-0.5 flex-shrink-0 cursor-pointer"
            >
                <Trash2 size={16} />
            </button>
        </li>
    )
}