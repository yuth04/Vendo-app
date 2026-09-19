"use client";

import React from "react";
import {AlertCircle, MapPin, Phone} from "lucide-react";

interface Props {
    order: any;
    loading: boolean;
}

export default function OrderDeliveryCard({ order, loading }: Props) {
    return (
        <div className="rounded-[40px] border border-gray-100 input-theme p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-8">
                <MapPin size={20} className="custom-main-color-icon" />
                <h3 className="font-black text-[var(--header-text)] text-[16px] tracking-widest">Delivery To</h3>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                    <div className="h-3 w-48 bg-gray-50 rounded" />
                </div>
            ) : order?.address ? (
                <div className="space-y-3">
                    <p className="text-base font-black text-[var(--header-text)]">
                        {order.address.first_name} {order.address.last_name}
                    </p>
                    <p className="text-[14px] font-bold text-[var(--header-text)] leading-relaxed">
                        {order.address.address_line}<br/>
                        {order.address.city}, {order.address.province}
                        {/*{order.address.postal_code && ` ${order.address.postal_code}`}*/}
                    </p>
                    <div className="pt-4">
                        <div className="flex items-center gap-2 text-[16px] font-black text-[var(--header-text)]">
                            {/* Rounded wrapper matching your icon styling system */}
                            <div className="">
                                <Phone size={18} className="custom-main-color-text"/>
                            </div>
                            <p>Contact Phone</p>
                        </div>
                        <p className="text-sm font-black text-[var(--header-text)] py-4">{order.address.phone}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                    <AlertCircle size={14}/><span>No address provided</span>
                </div>
            )}
        </div>
    );
}