"use client";

import React from "react";

interface TrackingStep {
    label: string;
    icon: React.ReactNode;
    active: boolean;
}

interface Props {
    order: any;
    loading: boolean;
    trackingSteps: TrackingStep[];
    isCancelled: boolean;
    getStatusStyles: (status: string) => string;
    liveStatus?: string | null;
}

export default function OrderTrackingCard({ order, loading, trackingSteps, isCancelled, getStatusStyles, liveStatus }: Props) {
    const effectiveStatus = liveStatus ?? order?.status ?? "";

    return (
        <div className="rounded-[30px] md:rounded-[40px] border border-gray-100 input-theme p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
            <div className="flex flex-row items-center justify-between mb-8 md:mb-16 gap-2">
                <h2 className="text-[16px] md:text-[18px] font-black text-[var(--header-text)] tracking-tight whitespace-nowrap">
                    {order?.isReturn ? "Return Process" : "Shipment Tracking"}
                </h2>
                <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-emerald-100 bg-emerald-50/50">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400" />
                    <span className="text-[9px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest whitespace-nowrap">
                        Live Update
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
                <div className="relative flex justify-between min-w-[450px] md:min-w-0 px-4 md:px-8">
                    <div className="absolute top-6 left-12 right-12 h-[2px] input-theme" />
                    {trackingSteps.map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-3 md:gap-4">
                            <div className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full transition-all duration-500 ${!loading && step.active ? "bg-gradient-to-br from-[#FF5F6D] to-[#FFC371] text-white shadow-[0_10px_20px_rgba(255,95,109,0.3)]" : "input-theme"}`}>
                                <div className="scale-90 md:scale-100">{step.icon}</div>
                            </div>
                            <span className={`text-[10px] md:text-[14px] font-black ${!loading && step.active ? "custom-main-color-text" : "text-[#D1D5DB]"}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 md:mt-20 rounded-[25px] md:rounded-[35px] border border-dashed border-gray-200 input-theme p-5 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${loading ? "bg-gray-200" : isCancelled ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                    <span className="text-[10px] md:text-[12px] font-black text-[var(--header-text)] uppercase tracking-[0.2em]">Current Status</span>
                </div>
                <span className={`w-full sm:w-auto rounded-2xl px-8 md:px-10 py-3 text-[11px] font-black shadow-sm uppercase tracking-widest text-center min-w-[120px] ${loading ? "bg-gray-50 text-gray-400" : getStatusStyles(effectiveStatus)}`}>
                    {loading ? "..." : order.isReturn ? `Return ${effectiveStatus}` : effectiveStatus}
                </span>
            </div>
        </div>
    );
}