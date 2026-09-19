"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  order: any;
  loading: boolean;
  isCancelled: boolean;
  onPayNow?: () => void;
}

export default function OrderSummaryCard({
  order,
  loading,
  isCancelled,
  onPayNow,
}: Props) {
  const router = useRouter();

  const handlePayNow = () => {
    // Run parent-provided handler if exists
    // if (onPayNow) {
    //   onPayNow();
    // }

    // Redirect to the payment checkout page with order_id query param
    if (order?.id) {
      router.push(`/checkout/payment?order_id=${order.id}`);
    } else {
      router.push("/checkout/payment");
    }
  };

  return (
    <div className="rounded-[40px] border border-gray-100 input-theme p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
      <h3 className="mb-10 font-black text-[16px] sm:text-[18px] text-[var(--header-text)]">
        {order?.isReturn ? "Return Summary" : "Order Summary"}
      </h3>
      <div className="space-y-6">
        <div className="flex justify-between text-[14px] font-bold text-[var(--header-text)]">
          <span>{order?.isReturn ? "Refund" : "Items"} Subtotal</span>
          <span className="font-black text-[var(--header-text)]">
            {loading
              ? "..."
              : `$${order?.isReturn ? (order?.original_price ?? 0) : (order?.original_price ?? order?.total_price ?? 0)}`}
          </span>
        </div>

        <div className="flex justify-between text-[14px] font-bold text-[var(--header-text)]">
          <span>Shipping Fee</span>
          <span>{loading ? "..." : `$${order?.shipping_fee ?? 0}`}</span>
        </div>

        {/* Product Discount Display Row */}
        {!loading && order?.product_discount > 0 && (
          <div className="flex justify-between text-[14px] font-bold">
            <span className="text-[var(--header-text)]">Discount</span>
            <span className="font-black text-emerald-400">
              -${parseFloat(order.product_discount).toFixed(2)}
            </span>
          </div>
        )}

        {/* Coupon Discount Display Row */}
        {!loading && order?.coupon_discount > 0 && (
          <div className="flex justify-between text-[14px] font-bold">
            <span className="text-[var(--header-text)]">Savings</span>
            <span className="font-black text-emerald-400">
              -${parseFloat(order.coupon_discount).toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
          <span className="text-sm font-black text-[var(--header-text)]">
            {order?.isReturn ? "Refund Total :" : "Grand Total :"}
          </span>
          <span className="text-[20px] font-black text-[var(--header-text)] leading-none">
            {loading ? "..." : `$${order?.total_price ?? 0}`}
          </span>
        </div>

        {!loading && !order?.isReturn && (
          <div className="mt-10 space-y-4">
            <div
              className={`rounded-[20px] py-3 text-center text-[12px] font-black border uppercase ${order?.payment?.status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-400 border-red-100"}`}
            >
              Payment: {order?.payment?.status ?? "Pending"}
            </div>
            {order?.payment?.status !== "paid" && !isCancelled && (
              <button
                onClick={handlePayNow}
                className="w-full flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover py-3 text-sm font-black text-white transition-all active:scale-[0.98] cursor-pointer"
              >
                Pay Now <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}

        {!loading && order?.isReturn && (
          <div className="mt-6">
            <div
              className={`rounded-[20px] py-3 text-center text-[12px] font-black border uppercase ${order?.payment?.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-500 border-orange-100"}`}
            >
              Payment: {order?.payment?.payment_status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
