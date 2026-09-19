"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Star, Undo2, Truck } from "lucide-react";
import { BsBox } from "react-icons/bs";
import { Review } from "@/src/app/components/modules/product-details/core/models/reviewModel";

const getItemImage    = (item: any, isReturn: boolean) => isReturn ? item.product?.image  : item.variant?.product?.image;
const getItemName     = (item: any, isReturn: boolean) => isReturn ? item.product?.name   : item.variant?.product?.name;
const getItemSize     = (item: any, isReturn: boolean) => isReturn ? item.product?.size   : item.variant?.size;
const getItemColor    = (item: any, isReturn: boolean) => isReturn ? item.product?.color  : item.variant?.color;

// Handlers updated to gracefully handle both Standard Orders and Return Manifest structures
const getItemPrice = (item: any, isReturn: boolean) => {
    if (isReturn) {
        return item.product?.price ?? item.variant?.price ?? null;
    }
    return item.variant?.price ?? null;
};

const getItemDiscountPrice = (item: any, isReturn: boolean) => {
    if (isReturn) {
        return item.product?.discount_price ?? item.variant?.discount_price ?? null;
    }
    return (
        item.discount_price ??
        item.variant?.discount_price ??
        item.variant?.product?.discount_price ??
        null
    );
};

const getItemSubtotal = (item: any, isReturn: boolean) => {
    if (isReturn) {
        const price = parseFloat(getItemDiscountPrice(item, isReturn) ?? getItemPrice(item, isReturn) ?? "0");
        return (price * (item.quantity ?? 1)).toFixed(2);
    }
    return item.subtotal;
};

const getItemProductId = (item: any, isReturn: boolean) =>
    isReturn ? (item.product?.product_id ?? item.product?.id) : item.variant?.product?.id;

interface Props {
    order: any;
    loading: boolean;
    reviewsMap: Map<number, Review[]>;
    orderId: string;
}

export default function OrderManifestCard({ order, loading, reviewsMap, orderId }: Props) {
    return (
        <div className="rounded-[40px] border border-gray-100 input-theme p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <h3 className="flex items-center gap-2 font-black text-[var(--header-text)] tracking-[0.15em] text-[16px]">
                        {order?.isReturn ? (
                            <><Undo2 size={18} className="custom-main-color-icon" /> Return Manifest</>
                        ) : (
                            <><BsBox size={18} className="custom-main-color-icon" /> Order Manifest</>
                        )}
                    </h3>
                </div>

                {/* Shipment Tracking Information Block */}
                {!loading && order?.tracking_number && (
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-[20px] px-4 py-2 self-start sm:self-auto">
                        <Truck size={16} className="text-gray-400 shrink-0" />
                        <div className="text-[12px] font-bold text-gray-500">
                            <span>{order?.carrier_name ?? "Tracking"}: </span>
                            <span className="font-black text-[var(--header-text)]">{order.tracking_number}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {loading ? (
                    [...Array(2)].map((_, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between animate-pulse pb-8 border-b border-gray-50 last:border-0 gap-4">
                            <div className="flex items-center gap-4 sm:gap-8">
                                <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-[20px] sm:rounded-[30px] bg-gray-100 shrink-0" />
                                <div className="space-y-3">
                                    <div className="h-5 w-32 sm:h-6 sm:w-48 bg-gray-100 rounded" />
                                    <div className="h-3 w-24 sm:h-4 sm:w-32 bg-gray-50 rounded" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    order?.items?.map((item: any) => {
                        const isReturn       = order.isReturn;
                        const productId      = getItemProductId(item, isReturn);
                        const imgSrc         = getItemImage(item, isReturn);
                        const name           = getItemName(item, isReturn);
                        const size           = getItemSize(item, isReturn);
                        const color          = getItemColor(item, isReturn);
                        const unitPrice      = getItemPrice(item, isReturn);
                        const discountPrice  = getItemDiscountPrice(item, isReturn);
                        const hasDiscount    = discountPrice != null && parseFloat(discountPrice) > 0 && parseFloat(discountPrice) < parseFloat(unitPrice ?? "0");
                        const itemKey        = isReturn ? (item.return_item_id ?? item.id) : item.id;
                        const productReviews = reviewsMap.get(productId) ?? [];
                        const avgRating      = productReviews.length > 0
                            ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
                            : 0;

                        return (
                            <div key={itemKey} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-8 last:border-0 last:pb-0 gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                                    <div className="h-20 w-20 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-[20px] sm:rounded-[30px] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner mx-auto sm:mx-0">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={name} className="h-full w-full object-contain transition-transform hover:scale-110 duration-500" />
                                        ) : (
                                            <ShoppingBag className="text-gray-200" size={24} />
                                        )}
                                    </div>

                                    <div className="space-y-1 sm:space-y-2 text-center sm:text-left w-full">
                                        <h4 className="text-lg sm:text-[22px] font-black text-[var(--header-text)] tracking-tight leading-tight">{name}</h4>

                                        <div className="flex items-center justify-center sm:justify-start gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < Math.round(avgRating) ? "#FACC15" : "none"}
                                                    stroke={i < Math.round(avgRating) ? "#FACC15" : "#D1D5DB"}
                                                />
                                            ))}
                                            <span className="text-[12px] text-gray-400 font-bold ml-1">({productReviews.length})</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-wrap sm:flex-row items-center sm:items-start gap-x-3 gap-y-2 text-[12px] sm:text-[13px] font-bold text-gray-400 pt-1">
                                            <span>Qty: {item.quantity}</span>

                                            {(size || color) && (
                                                <div className="w-full sm:w-auto">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-3 py-1 text-[10px] font-black text-[#0D9488] border border-[#CCFBF1] uppercase">
                                                        {[size, color].filter(Boolean).join(" • ")}
                                                    </span>
                                                </div>
                                            )}

                                            {/* ── Price block (Now supported on standard orders & return manifests) ── */}
                                            {unitPrice && (
                                                hasDiscount ? (
                                                    <>
                                                        <span className="hidden sm:block h-1 w-1 mt-2 rounded-full bg-gray-300 shrink-0" />
                                                        <span>
                                                            Original price{" "}
                                                            <span className="line-through ml-0.5 text-[14px] text-gray-500">${parseFloat(unitPrice).toFixed(2)}</span>
                                                        </span>
                                                        <span className="hidden sm:block h-1 w-1 mt-2 rounded-full bg-gray-300 shrink-0" />
                                                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap py-2">
                                                            <span>Discount price</span>
                                                            <span className="text-xl sm:text-2xl font-black text-[var(--header-text)]">
                                                                ${parseFloat(discountPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="hidden sm:block h-1 w-1 mt-2 rounded-full bg-gray-300 shrink-0" />
                                                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap py-2">
                                                            <span>Original price</span>
                                                            <span className="text-xl sm:text-2xl font-black text-[var(--header-text)]">
                                                                ${parseFloat(unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    </>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!loading && !order.isReturn && order?.status?.toLowerCase() === "completed" && (
                <div className="flex justify-center py-6">
                    <Link href={`/account/orders/write-review?orderId=${orderId}`}>
                        <button className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                            Write a Review
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}