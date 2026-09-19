"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, RotateCcw } from "lucide-react";

interface Props {
  order: any;
  loading: boolean;
  isCancelling: boolean;
  isSubmittingReturn: boolean;
  paidAtLabel: string | null;
  paymentMethodLabel: string | null;
  onCancelOrder: () => void;
  onOpenReturnModal: () => void;
}

export default function OrderDetailHeader({
  order,
  loading,
  isCancelling,
  isSubmittingReturn,
  paidAtLabel,
  paymentMethodLabel,
  onCancelOrder,
  onOpenReturnModal,
}: Props) {
  const displayDate = React.useMemo(() => {
    if (!order?.created_at) return "";

    if (
      typeof order.created_at === "string" &&
      order.created_at.includes("-")
    ) {
      const parts = order.created_at.split("-");
      if (parts.length === 3 && parts[0].length === 2) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }
    return new Date(order.created_at).toLocaleDateString();
  }, [order?.created_at]);

  //--- Parse order.created_at into a real Date, handling the "DD-MM-YYYY" style ---||
  //--- strings the same way displayDate does, so we can measure elapsed time. ---//
  const orderDate = React.useMemo(() => {
    if (!order?.created_at) return null;

    if (
      typeof order.created_at === "string" &&
      order.created_at.includes("-")
    ) {
      const parts = order.created_at.split("-");
      if (parts.length === 3 && parts[0].length === 2) {
        const [dd, mm, yyyy] = parts;
        const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        return isNaN(parsed.getTime()) ? null : parsed;
      }
    }
    const parsed = new Date(order.created_at);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, [order?.created_at]);

  //--- "Multiple Return" is only offered within 7 days of the order date. ---//
  const isWithinReturnWindow = React.useMemo(() => {
    if (!orderDate) return true; //-- fail open if we can't determine the date --||
    const msInDay = 1000 * 60 * 60 * 24;
    const diffDays = (Date.now() - orderDate.getTime()) / msInDay;
    return diffDays <= 7;
  }, [orderDate]);

  return (
    <>
      <Link
        href={order?.isReturn ? "/account/returns" : "/account/order-history"}
        className="mb-8 flex items-center gap-2 text-[16px] font-black tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft size={24} />
        Back to {order?.isReturn ? "ReturnsHistory" : "OrdersHistory"}
      </Link>

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[40px] font-black text-[var(--header-text)]">
            {loading ? (
              <div className="h-10 w-64 bg-gray-100 animate-pulse rounded-xl" />
            ) : (
              `${order.isReturn ? "Return" : "Order"} #${order?.order_number ?? order?.order_id}`
            )}
          </h1>
          <div className="mt-3 text-sm font-bold text-gray-400">
            {loading ? (
              <div className="h-4 w-48 bg-gray-50 animate-pulse rounded mt-2" />
            ) : (
              <>
                {order.isReturn ? "Requested" : "Placed"} on{" "}
                {paidAtLabel ?? displayDate}
                {order?.time && ` at ${order.time}`}
                {paymentMethodLabel && (
                  <>
                    {" "}
                    •{" "}
                    <span className="font-black text-[var(--header-text)]">
                      {paymentMethodLabel}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!loading &&
            !order.isReturn &&
            order?.status?.toLowerCase() === "completed" &&
            !isSubmittingReturn &&
            isWithinReturnWindow && (
              <button
                onClick={onOpenReturnModal}
                className="card-theme text-[var(--header-text)] font-bold py-2.5 px-6 rounded-[20px] text-xs custom-main-color-border-hover w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <div className="custom-main-color-icon p-1 rounded-md">
                  <RotateCcw size={14} className="rotate-45" />
                </div>
                Multiple Return
              </button>
            )}

          {!loading &&
            !order.isReturn &&
            order?.status?.toLowerCase() === "pending" && (
              <button
                onClick={onCancelOrder}
                disabled={isCancelling}
                className="card-theme text-gray-400 font-bold py-2.5 px-6 rounded-[20px] text-xs custom-main-color-border-hover w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Processing...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </button>
            )}
        </div>
      </div>
    </>
  );
}
