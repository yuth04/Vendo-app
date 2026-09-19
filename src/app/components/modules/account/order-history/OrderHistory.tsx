"use client";

import React, { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { orderService } from "@/src/app/components/core/services/orders";
import Link from "next/link";
import { BsBox } from "react-icons/bs";
import OrderPagination from "@/src/app/components/modules/account/order-history/OrderPagination";

const DEFAULT_STATE = { orders: [] };
const ITEMS_PER_PAGE = 6;

const OrderHistory = () => {
  const { data, loading } = useApiData(
    orderService.fetchOrders,
    DEFAULT_STATE as any,
    true,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ordersList = useMemo(() => data?.orders || [], [data]);
  const totalPages = Math.ceil(ordersList.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return ordersList.slice(start, start + ITEMS_PER_PAGE);
  }, [ordersList, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fixed missing page handlers
  const goPrev = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const goNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const formatOrderDateTime = (createdAt: string, time: string) => {
    if (!createdAt) return "";
    let displayDate = createdAt;

    if (typeof createdAt === "string" && createdAt.includes("-")) {
      const parts = createdAt.split("-");
      if (parts.length === 3 && parts[0].length === 2) {
        displayDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }

    return time ? `${displayDate} at ${time}` : displayDate;
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-500 border-emerald-100";
      case "CANCELLED":
        return "bg-red-50 text-red-500 border-red-100";
      case "PENDING":
        return "bg-orange-50 text-orange-500 border-orange-100";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-blue-50 text-blue-500 border-blue-100";
      case "SHIPPING":
        return "bg-violet-50 text-violet-500 border-violet-100";
      case "DELIVERED":
        return "bg-cyan-50 text-cyan-500 border-cyan-100";
      case "RETURN REQUESTED":
        return "bg-amber-50 text-amber-500 border-amber-100";
      default:
        return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="mb-10 text-[32px] font-black custom-main-color-text ">
        Order History
      </h1>

      <div className="overflow-x-auto input-theme rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[var(--header-text)] text-[14px] font-black  border-b border-gray-50">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Payment</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6">
                    <div className="h-4 w-28 bg-gray-100 rounded"></div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-4 w-16 bg-gray-100 rounded"></div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="h-6 w-20 bg-gray-100 rounded-lg mx-auto"></div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="h-6 w-20 bg-gray-100 rounded-lg mx-auto"></div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-4 w-12 bg-gray-100 rounded"></div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="h-8 w-8 bg-gray-100 rounded-xl ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order: any) => (
                <tr
                  key={order.order_id}
                  className="group transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--header-text)] text-[14px]">
                        {order.order_number}
                      </span>
                      <span className="text-[12px] text-[var(--header-text)] mt-1 font-bold uppercase tracking-tighter">
                        {formatOrderDateTime(order.created_at, order.time) ||
                          "Awaiting Sync"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[14px] font-bold text-[var(--header-text)]">
                      {order.items?.length || 0} Product
                      {order.items?.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-[20px] text-[10px] font-black border uppercase tracking-wider ${getStatusStyles(order.status)}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-[20px] text-[10px] font-black border uppercase tracking-wider ${
                        order.payment?.status?.toLowerCase() === "paid" ||
                        order.payment?.status?.toLowerCase() === "success"
                          ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                          : "bg-red-50 text-red-500 border-red-100"
                      }`}
                    >
                      {order.payment?.status || "unpaid"}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-black text-[var(--header-text)]">
                      $
                      {order.total_price?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <Link href={`/account/orders/${order.order_id}`}>
                      <button className="group rounded-xl border card-theme p-2 text-gray-400 custom-main-color-border-hover hover:text-[#E86B32] custom-main-color-text-hover hover:shadow-sm transition-all active:scale-90 cursor-pointer bg-white">
                        <Eye
                          size={18}
                          className="transition-transform group-hover:scale-110"
                        />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-20 text-gray-300 font-bold text-[14px]"
                >
                  <BsBox
                    className="inline-block mr-2 text-gray-400"
                    size={18}
                  />
                  No history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <OrderPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={goPrev}
          onNext={goNext}
          onSetPage={handlePageChange}
        />
      )}
    </div>
  );
};

export default OrderHistory;
