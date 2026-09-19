"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowLeft, Loader2, QrCode, Banknote } from "lucide-react";
import { useCart } from "@/src/app/components/context/Cartcontext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import CheckoutStepper from "./CheckoutStepper";
import OrderSummary from "./OrderSummary";
import KhqrModal from "./KhqrModal";
import { ENDPOINTS } from "@/src/app/components/core/services/_index";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";
import { getShippingCharge } from "../../helpers/constants/shippingUtils";

interface PaymentMethod {
  id: string;
  label: string;
  apiValue: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash On Delivery",
    apiValue: "Cash on Delivery",
    icon: (
      <div className="w-10 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <Banknote size={18} strokeWidth={2.25} />
      </div>
    ),
  },
  {
    id: "khqr",
    label: "KHQR",
    apiValue: "KHQR",
    icon: (
      <div className="w-10 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <QrCode size={18} strokeWidth={2.25} />
      </div>
    ),
  },
  // {
  //   id: "card",
  //   label: "Credit / Debit Card",
  //   apiValue: "Credit / Debit Card",
  //   icon: (
  //     <div className="w-10 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
  //       <CreditCard size={18} strokeWidth={2.25} />
  //     </div>
  //   ),
  // },
];

const CHECKOUT_DATA_KEY = "checkout_data";

interface KhqrData {
  qr_string: string;
  md5: string;
  khqr_expires_at: string;
  amount: number;
  currency: string;
}

// function extractOrderId(body: any): string | null {
//   const id =
//     body?.order?.id ??
//     body?.order?.order_id ??
//     body?.order_id ??
//     body?.id ??
//     null;
//   return id != null ? String(id) : null;
// }
function extractOrderId(body: any): string | null {
  const id =
    body?.order?.order_id ??
    body?.order?.id ??
    body?.order_id ??
    body?.id ??
    null;
  return id != null ? String(id) : null;
}
function PaymentMethodCard({
  method,
  selected,
  onSelect,
  disabled,
}: {
  method: PaymentMethod;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`relative w-32 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition  ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
          : selected
            ? "custom-main-color-border-card bg-orange-50/40 cursor-pointer"
            : "border-gray-100 bg-gray-50 hover:border-gray-200 cursor-pointer"
      }`}
    >
      {method.icon}
      <span className="relative text-[14px] font-bold custom-main-color-text text-center leading-tight">
        {method.label}
      </span>
      {disabled && (
        <span className="text-[11px] text-red-500 font-semibold text-center leading-tight">
          Not available
        </span>
      )}
    </button>
  );
}

export default function PaymentView() {
  const router = useRouter();
  const { totalPrice, clearCart, items } = useCart();
  const { showToast } = useAlert();

  const [isMounted, setIsMounted] = useState(false);
  const [selected, setSelected] = useState<string>("cod");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ── KHQR popup state ──
  const [khqrData, setKhqrData] = useState<KhqrData | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // ── Read province from localStorage to compute the same charge as CheckoutView ──
  const [shippingCharge, setShippingCharge] = useState(2);
  const [isPhnomPenh, setIsPhnomPenh] = useState(true);
  const tax = 0;
  const discount = 0;

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(CHECKOUT_DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setShippingCharge(getShippingCharge(parsed?.province));
        const formattedProvince = parsed?.province?.toLowerCase().trim() || "";
        const isPP = formattedProvince === "phnom penh";

        setIsPhnomPenh(isPP);
        if (!isPP) {
          setSelected("khqr");
        }
      }
    } catch {
      setShippingCharge(getShippingCharge(undefined));
    }
  }, []);

  const finalizeOrderSuccess = (
    orderId: string | null,
    message: string = "Order placed successfully! 🎉",
  ) => {
    localStorage.removeItem(CHECKOUT_DATA_KEY);
    clearCart();
    showToast(message, "success");
    router.push(
      orderId ? `/account/orders/${orderId}` : "/account/order-history",
    );
  };

  const handleConfirm = async () => {
    if (!selected) return;

    if (items.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    const raw = localStorage.getItem(CHECKOUT_DATA_KEY);
    if (!raw) {
      showToast(
        "Shipping address not found. Please go back and select one.",
        "error",
      );
      router.push("/checkout/checkout");
      return;
    }

    let checkoutData: {
      address_id: number;
      contact: string;
      province?: string;
    };
    try {
      checkoutData = JSON.parse(raw);
    } catch {
      showToast("Invalid checkout data. Please try again.", "error");
      router.push("/checkout/checkout");
      return;
    }
    if (selected === "cod" && !isPhnomPenh) {
      showToast("COD is only available in Phnom Penh.", "error");
      return;
    }
    const paymentMethod = PAYMENT_METHODS.find((m) => m.id === selected);
    if (!paymentMethod) return;

    const payloadWithoutItems = {
      address_id: checkoutData.address_id,
      payment_method: paymentMethod.apiValue,
      contact: checkoutData.contact,
      ...(note.trim() && { note: note.trim() }),
    };

    const payloadWithItems = {
      ...payloadWithoutItems,
      items: items.map((item) => ({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
      })),
    };

    const token = authService.getToken();

    setLoading(true);
    try {
      const res1 = await fetch(ENDPOINTS.checkout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payloadWithItems),
      });
      const body1 = await res1.json();

      if (res1.ok) {
        const orderId = extractOrderId(body1);
        if (paymentMethod.id === "khqr" && body1?.khqr) {
          // Hold off on redirect/clear-cart — wait for QR payment confirmation
          setPendingOrderId(orderId);
          setKhqrData(body1.khqr);
          setLoading(false);
          return;
        }
        finalizeOrderSuccess(orderId);
        return;
      }

      const res2 = await fetch(ENDPOINTS.checkout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payloadWithoutItems),
      });
      const body2 = await res2.json();

      if (res2.ok) {
        const orderId = extractOrderId(body2);
        if (paymentMethod.id === "khqr" && body2?.khqr) {
          setPendingOrderId(orderId);
          setKhqrData(body2.khqr);
          setLoading(false);
          return;
        }
        finalizeOrderSuccess(orderId);
        return;
      }

      const errorMsg =
        body2?.message ??
        body2?.error ??
        body1?.message ??
        body1?.error ??
        `Server error ${res2.status}`;

      showToast(
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
        "error",
      );
    } catch {
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 custom-main-color-border-hover card-theme rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={30} className="text-[var(--header-text)]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--header-text)]">
              Payment Information
            </h1>
            <p className="text-sm custom-main-color-text font-medium">
              Choose your payment method
            </p>
          </div>
        </div>

        <CheckoutStepper current="payment" />

        <div className="flex flex-col lg:flex-row gap-6 mt-2">
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-[var(--header-bg)] rounded-2xl border input-theme p-6 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
              <h2 className="font-bold text-[var(--header-text)] mb-5">
                Select Payment Method
              </h2>
              <div className="flex flex-wrap gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const isCodDisabled = method.id === "cod" && !isPhnomPenh;

                  return (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      selected={selected === method.id}
                      disabled={isCodDisabled}
                      onSelect={() => {
                        if (!isCodDisabled) setSelected(method.id);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="bg-[var(--header-bg)] rounded-2xl border input-theme p-6 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
              <h2 className="font-bold text-[var(--header-text)] mb-3">
                Order Note{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (optional)
                </span>
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Please leave at the security guard."
                rows={3}
                className="w-full border input-theme rounded-xl px-4 py-3 outline-none focus:border-[#E3DE61] text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/checkout/checkout")}
                className="px-4 sm:px-6 sm:py-3 py-2.5 rounded-[20px] card-theme text-[var(--header-text)] text-[12px] sm:text-[14px] font-semibold transition cursor-pointer shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
              >
                Back to Checkout
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  !isMounted || !selected || loading || items.length === 0
                }
                className="px-4 sm:px-6 sm:py-3 py-2.5 rounded-[20px] custom-main-color-button text-[12px] sm:text-[14px] custom-main-color-button-hover text-white font-semibold cursor-pointer flex items-center gap-2 shadow-[0_4px_32px_rgba(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[360px] flex-shrink-0">
            <OrderSummary
              subtotal={totalPrice}
              tax={tax}
              shippingCharge={shippingCharge}
              discount={discount}
            />
          </div>
        </div>
      </div>

      {khqrData && (
        <KhqrModal
          open={!!khqrData}
          khqr={khqrData}
          orderId={pendingOrderId}
          onSuccess={() => {
            setKhqrData(null);
            finalizeOrderSuccess(
              pendingOrderId,
              "Payment successful! Your order has been placed 🎉",
            );
          }}
          onClose={() => {
            setKhqrData(null);
            setPendingOrderId(null);
          }}
        />
      )}
    </div>
  );
}
