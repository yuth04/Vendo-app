"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Percent, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/src/app/components/context/Cartcontext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { orderService } from "@/src/app/components/core/services/orders";
import { ApplyCouponResponse } from "@/src/app/components/core/services/orders/model";

interface OrderSummaryProps {
  subtotal?: number;
  tax: number;
  shippingCharge: number;
  discount: number;
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  muted?: boolean;
}) {
  if (bold) {
    return (
      <div className="flex items-center justify-between mt-1 pt-4 border-t border-dashed border-gray-200">
        <span className="text-sm font-bold tracking-wide text-[var(--header-text)]">
          {label}
        </span>
        <span className="text-base font-black custom-main-color-text">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-xs font-medium ${muted ? "text-[var(--header-text)]" : "text-[var(--header-text)]"}`}
      >
        {label}
      </span>
      <span
        className={`text-xs font-semibold ${highlight ? "text-emerald-500" : "text-[var(--header-text)]"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderSummary({
  tax,
  shippingCharge,
  discount,
}: OrderSummaryProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { items } = useCart();
  const { showToast } = useAlert();

  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponData, setCouponData] = useState<ApplyCouponResponse | null>(
    null,
  );

  // Hydrate local storage safely after mounting on the client
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCoupon = localStorage.getItem("vendo_applied_coupon");
      if (savedCoupon) {
        setCouponData(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error("Failed to parse persisted coupon token reference", e);
    }
  }, []);

  // Auto cleanup if cart items are fully cleared
  useEffect(() => {
    if (isMounted && items.length === 0 && couponData) {
      localStorage.removeItem("vendo_applied_coupon");
      setCouponData(null);
    }
  }, [items, isMounted, couponData]);

  const discountedSubtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const product = item.product;
      const unitPrice = Number(product?.price ?? 0);
      const discountPrice =
        product?.discount_price != null ? Number(product.discount_price) : null;

      const priceToUse =
        discountPrice !== null &&
        !isNaN(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < unitPrice
          ? discountPrice
          : unitPrice;

      return acc + priceToUse * item.quantity;
    }, 0);
  }, [items]);

  const safeSubtotal = discountedSubtotal;
  const activeDiscount = couponData ? couponData.discount : discount;
  const safeTotal = couponData
    ? couponData.total_price
    : Math.max(0, safeSubtotal + tax + shippingCharge - activeDiscount);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponError(null);
    setCouponLoading(true);
    try {
      const payload = {
        code,
        items: items.map((item) => ({
          product_variant_id: Number(item.product_variant_id),
          quantity: Number(item.quantity),
        })),
      };

      const res = await orderService.applyCoupon(payload);
      const responseShell = res && "data" in res ? (res.data as any) : res;
      const data: ApplyCouponResponse = responseShell?.data ?? responseShell;

      if (!data || typeof data.discount !== "number") {
        throw new Error(
          "Invalid API response scheme. Missing 'discount' field.",
        );
      }

      setCouponData(data);
      localStorage.setItem("vendo_applied_coupon", JSON.stringify(data));

      setIsCouponOpen(false);
      showToast(
        `You saved $${data.discount.toFixed(2)}`,
        "success",
        "Offer Applied!",
      );
    } catch (err: any) {
      // Always show a consistent, friendly message to the user
      const userMessage = "Invalid or inactive coupon code.";

      setCouponError(userMessage);
      showToast(userMessage, "error", "Invalid Code");
      setCouponData(null);
      localStorage.removeItem("vendo_applied_coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponInput("");
    localStorage.removeItem("vendo_applied_coupon");
    showToast("Coupon removed successfully.", "success", "Removed");
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-3 w-full animate-pulse">
        <div className="w-full h-12 bg-gray-50 rounded-2xl border border-gray-100" />
        <div className="rounded-2xl border border-gray-100 h-48 bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in duration-200">
      {/* Coupon Segment */}
      <div>
        {!couponData ? (
          <button
            onClick={() => setIsCouponOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-dashed border-gray-200 bg-blue-50/60 hover:bg-blue-50/80 transition-all group cursor-pointer shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl custom-main-color-bg flex items-center justify-center shrink-0">
                <Percent
                  size={13}
                  className="custom-main-color-text"
                  strokeWidth={2.5}
                />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold custom-main-color-text leading-tight">
                  Apply Coupon Code
                </p>
                <p className="text-[12px] text-[var(--header-text)] mt-0.5">
                  Save more with a promo code
                </p>
              </div>
            </div>
            <ChevronRight
              size={24}
              className="custom-main-color-icon opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        ) : (
          <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-solid border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                <Percent size={13} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-700 leading-tight">
                  Code ({couponData.coupon}) Applied!
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  Saved an extra ${couponData.discount.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-1 hover:bg-emerald-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={14} className="text-emerald-600" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Coupon Modal */}
        {isCouponOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="card-theme w-full max-w-[420px] rounded-[32px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
              <button
                onClick={() => {
                  setIsCouponOpen(false);
                  setCouponError(null);
                }}
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer group"
                aria-label="Close"
              >
                <X
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600"
                  strokeWidth={2.5}
                />
              </button>

              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <h2 className="custom-main-color-text font-extrabold text-2xl tracking-tight">
                    Coupon Code
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Enter your code to unlock special discounts.
                  </p>
                </div>

                <div className="py-5 flex flex-col gap-4">
                  {couponError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 -mt-2">
                      <X
                        size={13}
                        className="text-red-500 mt-0.5 shrink-0"
                        strokeWidth={2.5}
                      />
                      <div>
                        <p className="text-xs font-black text-red-500">
                          Invalid Code
                        </p>
                        <p className="text-[11px] text-red-400 mt-0.5">
                          {couponError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-stretch gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError(null);
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                        className="w-full h-11 border input-theme rounded-xl px-4 outline-none text-sm text-gray-700 uppercase tracking-widest font-semibold"
                        placeholder="ENTER CODE"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="h-11 px-5 custom-main-color-button custom-main-color-button-hover text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                </div>
                <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                  One coupon per transaction
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Card */}
      <div className="rounded-2xl border input-theme overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100/80">
          <div className="w-7 h-7 rounded-lg custom-main-color-bg flex items-center justify-center">
            <ShoppingBag
              size={13}
              className="custom-main-color-text"
              strokeWidth={2.5}
            />
          </div>
          <h3 className="text-sm font-bold text-[var(--header-text)] tracking-wide">
            Order Summary
          </h3>
          <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <SummaryRow
            label="Subtotal"
            value={`$${(couponData ? couponData.subtotal : safeSubtotal).toFixed(2)}`}
          />
          <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} muted />
          <SummaryRow
            label="Shipping"
            value={
              (couponData ? couponData.shipping : shippingCharge) === 0
                ? "Free"
                : `$${(couponData ? couponData.shipping : shippingCharge).toFixed(2)}`
            }
            highlight={
              (couponData ? couponData.shipping : shippingCharge) === 0
            }
          />

          {couponData && couponData.discount > 0 && (
            <SummaryRow
              label="Savings"
              value={`- $${couponData.discount.toFixed(2)}`}
              highlight
            />
          )}

          {!couponData && discount > 0 && (
            <SummaryRow
              label="Discount"
              value={`- $${discount.toFixed(2)}`}
              highlight
            />
          )}

          <SummaryRow label="Total" value={`$${safeTotal.toFixed(2)}`} bold />
        </div>

        <div className="px-5 py-2.5">
          <p className="text-[10px] text-gray-500 text-center">
            Taxes and shipping calculated at checkout
          </p>
        </div>
      </div>
    </div>
  );
}
