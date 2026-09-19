'use client';

import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { orderService } from "@/src/app/components/core/services/orders";
import Link from "next/link";
import { BsBox } from "react-icons/bs";
import ReturnPagination from "@/src/app/components/modules/account/returns/ReturnPagination";

const DEFAULT_STATE: any[] = [];
const ITEMS_PER_PAGE = 6;

const Retures = () => {
    const { data, loading } = useApiData(
        orderService.fetchReturnOrders,
        DEFAULT_STATE as any,
        true
    );

    const [currentPage, setCurrentPage] = useState(1);

    const ordersList = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const totalPages = Math.ceil(ordersList.length / ITEMS_PER_PAGE);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return ordersList.slice(start, start + ITEMS_PER_PAGE);
    }, [ordersList, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Fixed missing navigation handlers
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

    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'pending' || s === 'requested') return "bg-orange-100 text-orange-600";
        if (s === 'confirmed' || s === 'approved') return "bg-blue-100 text-blue-600";
        if (s === 'delivered' || s === 'completed') return "bg-emerald-100 text-emerald-600";
        if (s === 'cancelled' || s === 'rejected') return "bg-red-100 text-red-600";
        return "bg-gray-100 text-gray-500";
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <h1 className="mb-10 text-[32px] font-black custom-main-color-text ">
                Return orders History
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
                                <td className="px-6 py-6"><div className="h-4 w-28 bg-gray-100 rounded"></div></td>
                                <td className="px-6 py-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                <td className="px-6 py-6 text-center"><div className="h-6 w-20 bg-gray-100 rounded-lg mx-auto"></div></td>
                                <td className="px-6 py-6 text-center"><div className="h-6 w-20 bg-gray-100 rounded-lg mx-auto"></div></td>
                                <td className="px-6 py-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                <td className="px-6 py-6 text-right"><div className="h-8 w-8 bg-gray-100 rounded-xl ml-auto"></div></td>
                            </tr>
                        ))
                    ) : paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order: any) => (
                            <tr key={order.return_id} className="group transition-colors hover:bg-gray-50/50">
                                <td className="px-6 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[var(--header-text)] text-[14px]">{order.order_number}</span>
                                        <span className="text-[12px] text-[var(--header-text)] mt-1 font-bold uppercase tracking-tighter">
                                            {order.created_at || 'Awaiting Sync'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[14px] font-bold text-[var(--header-text)]">
                                        {order.items?.length || 0} Product{order.items?.length !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className={`inline-block px-4 py-1.5 rounded-[20px] text-[10px] font-black uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className={`inline-block px-4 py-1.5 rounded-[20px] text-[10px] font-black uppercase tracking-wider ${
                                        order.payment?.payment_status?.toLowerCase() === 'paid' || order.payment?.status?.toLowerCase() === 'paid'
                                            ? 'bg-emerald-50 text-emerald-500'
                                            : 'bg-red-50 text-red-400'
                                    }`}>
                                        {order.payment?.payment_status || order.payment?.status || 'unpaid'}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-sm font-black text-[var(--header-text)]">
                                        ${Number(order.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <Link href={`/account/orders/${order.order_id}`}>
                                        <button className="group rounded-xl border card-theme p-2 text-gray-400 custom-main-color-border-hover hover:text-[#E86B32] custom-main-color-text-hover hover:shadow-sm transition-all active:scale-90 cursor-pointer bg-white">
                                            <Eye size={18} className="transition-transform group-hover:scale-110" />
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center py-20 text-gray-300 font-bold text-[14px]">
                                <BsBox className="inline-block mr-2 text-gray-400" size={18}/>
                                No history found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI */}
            {!loading && totalPages > 1 && (
                <ReturnPagination
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

export default Retures;