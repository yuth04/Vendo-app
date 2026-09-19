"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
    ShoppingBag,
    CheckCircle,
    RotateCcw,
    Eye,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { orderService } from "@/src/app/components/core/services/orders";
import {BsBox} from "react-icons/bs";
import {User} from "@/src/app/components/modules/auth/core/models/authModel";
import {authService} from "@/src/app/components/modules/auth/core/services/authService";

const DEFAULT_STATE = { orders: [] };
const DEFAULT_RETURNS_STATE: any[] = [];
const RECENT_ITEMS_COUNT = 2;

const Overview = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
        const onAuthUpdate = () => setUser(authService.getStoredUser());
        window.addEventListener('auth-updated', onAuthUpdate);
        return () => window.removeEventListener('auth-updated', onAuthUpdate);
    }, []);

    const { data: ordersData, loading: loadingOrders } = useApiData(
        orderService.fetchOrders,
        DEFAULT_STATE as any,
        true
    );

    const { data: returnsData, loading: loadingReturns } = useApiData(
        orderService.fetchReturnOrders,
        DEFAULT_RETURNS_STATE as any,
        true
    );

    const ordersList = useMemo(() => ordersData?.orders || [], [ordersData]);
    const returnsList = useMemo(() => (Array.isArray(returnsData) ? returnsData : []), [returnsData]);

    const recentOrders = useMemo(() => {
        return ordersList.slice(0, RECENT_ITEMS_COUNT);
    }, [ordersList]);


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

    const stats = useMemo(() => {
        const total = ordersList.length;

        const completed = ordersList.filter((o: any) => {
            const s = o.status?.toLowerCase();
            return s === 'completed' || s === 'success' || s === 'delivered';
        }).length;

        const cancelled = ordersList.filter((o: any) => {
            const s = o.status?.toLowerCase();
            return s === 'cancelled' || s === 'cancel' || s === 'rejected';
        }).length;

        // --- Catch Completed and Refunded Returns ---
        const returnOrderIds = new Set();

        returnsList.forEach((r: any) => {
            const s = r.status?.toLowerCase();
            //-- Specifically catching when status is Completed or Refunded--//
            if (s === 'completed' || s === 'refunded') {
                returnOrderIds.add((r.order_id || r.id || r.return_id).toString());
            }
        });

        const totalReturned = returnOrderIds.size;

        return [
            { label: 'Total Orders', value: loadingOrders ? '...' : total, icon: <ShoppingBag className="custom-main-color-icon" size={24} />, bg: 'custom-main-color-card' },
            { label: 'Completed', value: loadingOrders ? '...' : completed, icon: <CheckCircle className="text-emerald-500" size={24} />, bg: 'bg-[#ECF4E8]' },
            { label: 'Returned', value: (loadingReturns || loadingOrders) ? '...' : totalReturned, icon: <RotateCcw className="text-amber-500" size={24} />, bg: 'bg-amber-50' },
            { label: 'Cancelled', value: loadingOrders ? '...' : cancelled, icon: <X className="text-red-500" size={24} />, bg: 'bg-red-50' },
        ];
    }, [ordersList, returnsList, loadingOrders, loadingReturns]);

    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'pending') return "bg-orange-100 text-orange-600";
        if (s === 'confirmed' || s === 'processing') return "bg-blue-100 text-blue-600";
        if (s === 'shipped' || s === 'shipping') return "bg-purple-100 text-purple-600";
        if (s === 'delivered') return "bg-cyan-100 text-cyan-600";
        if (s === 'completed' || s === 'success') return "bg-emerald-100 text-emerald-600";
        if (s === 'cancelled' || s === 'cancel') return "bg-red-100 text-red-600";
        if (s === 'requested' || s === 'return requested') return "bg-amber-100 text-amber-600";
        if (s === 'approved') return "bg-blue-100 text-blue-600";
        if (s === 'refunded' || s === 'returned') return "bg-emerald-100 text-emerald-600";
        return "bg-gray-100 text-gray-500";
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-[32px] font-bold custom-main-color-text">Overview</h1>
                <p className="text-[var(--header-text)] text-lg font-semibold">
                    Welcome Back,{" "}
                    {user ? (
                        <span className="custom-main-color-text">
                      {user.first_name} {user.last_name}
                    </span>
                    ) : (
                        <span className="text-gray-500">...</span>
                    )}{" "}
                    !
                </p>
            </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-100/70 p-6 rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] card-theme flex flex-col items-center text-center group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.04)]"
                            >
                                <div
                                    className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mb-3.5 shadow-sm/5 transition-transform duration-300 group-hover:scale-105`}>
                                    {stat.icon}
                                </div>
                                <span className="text-3xl font-black text-[var(--header-text)] tracking-tight mb-1 select-none">
                            {stat.value}
                        </span>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--header-text)] select-none">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="card-theme rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-[var(--header-text)]">Recent Orders</h2>
                    <Link
                        href="/account/order-history"
                        className="custom-main-color-card custom-main-color-text px-6 py-2 rounded-full text-sm font-bold hover:opacity-80 transition-colors"
                    >
                        View All History
                    </Link>
                </div>

                <div className="overflow-x-auto input-theme rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="text-[var(--header-text)] text-[14px] font-black border-b border-gray-50">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Products</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Payment</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loadingOrders ? (
                            [...Array(2)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-6">
                                        <div className="h-4 w-24 bg-gray-100 rounded"></div>
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
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order: any) => (
                                <tr key={order.order_id || order.id}
                                    className="group transition-colors hover:bg-gray-50/50">
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span
                                                className="font-bold text-[var(--header-text)] text-[14px]">{order.order_number}</span>
                                            <span
                                                className="text-[12px] text-[var(--header-text)] mt-1 font-bold uppercase tracking-tighter">
                                                    {formatOrderDateTime(order.created_at, order.time) || 'Processing...'}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-[14px] font-bold text-[var(--header-text)]">
                                            {order.items?.length || 0} Product{order.items?.length !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                            <span
                                                className={`inline-block px-4 py-1.5 rounded-[20px] text-[10px] font-black uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                    <span
                                        className={`inline-block px-4 py-1.5 rounded-[20px] text-[10px] font-black uppercase tracking-wider ${
                                            order.payment?.status?.toLowerCase() === 'paid' || order.payment?.status?.toLowerCase() === 'success'
                                                ? 'bg-emerald-50 text-emerald-500'
                                                : 'bg-red-50 text-red-400'
                                        }`}>
                                        {order.payment?.status || 'unpaid'}
                                    </span>
                                    </td>
                                    <td className="px-6 py-6">
                                            <span className="text-sm font-black text-[var(--header-text)]">
                                                ${Number(order.total_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <Link href={`/account/orders/${order.order_id || order.id}`}>
                                            <button
                                                className="group rounded-xl border border-gray-100 p-2 text-gray-400 custom-main-color-border-hover hover:text-[#E86B32] custom-main-color-text-hover hover:shadow-sm transition-all active:scale-90 cursor-pointer">
                                                <Eye size={18} className="transition-transform group-hover:scale-110"/>
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
            </div>
        </div>
    );
};

export default Overview;