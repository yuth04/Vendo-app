"use client";

import React from "react";
import {CheckCircle2, ChevronRight, Loader2, Minus, Plus, RotateCcw, X} from "lucide-react";

const RETURN_REASONS = [
    "Damaged or defective item",
    "Wrong item received",
    "Item not as described",
    "Wrong size or fit",
    "Color differs from expectations",
    "Quality not as expected",
    "Changed my mind",
];

const getItemImage = (item: any, isReturn: boolean) => isReturn ? item.product?.image : item.variant?.product?.image;
const getItemName  = (item: any, isReturn: boolean) => isReturn ? item.product?.name  : item.variant?.product?.name;

interface ReturnForm {
    selectedItemId: number | null;
    quantity: number;
    reason: string;
    note: string;
}

interface Props {
    order: any;
    returnForm: ReturnForm;
    isSubmittingReturn: boolean;
    onClose: () => void;
    onSelectItem: (itemId: number) => void;
    onQtyChange: (delta: number, maxQty: number) => void;
    onFormChange: (field: keyof ReturnForm, value: any) => void;
    onConfirm: () => void;
}

export default function ReturnModal({
                                        order,
                                        returnForm,
                                        isSubmittingReturn,
                                        onClose,
                                        onSelectItem,
                                        onQtyChange,
                                        onFormChange,
                                        onConfirm,
                                    }: Props) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full sm:max-w-[560px] card-theme rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-8 pt-10 pb-4 text-center relative shrink-0">
                    <button onClick={onClose} className="absolute right-6 top-6 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                    <div className="mx-auto w-16 h-16 rounded-full border border-gray-100 flex items-center justify-center mb-4 bg-white shadow-sm">
                        <RotateCcw className="text-gray-400" size={28} />
                    </div>
                    <h2 className="text-[24px] font-black text-[var(--header-text)]">Initiate Return</h2>
                    <p className="text-sm text-gray-400 mt-2 px-4">Select items and provide a reason for the return.</p>
                </div>

                <div className="px-6 pb-4 space-y-4 overflow-y-auto no-scrollbar">
                    <div className="space-y-3">
                        {order?.items?.map((item: any) => {
                            const isSelected = returnForm.selectedItemId === item.id;
                            const maxQty     = item.quantity ?? 1;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectItem(item.id)}
                                    className={`flex items-center gap-4 rounded-[22px] border-2 p-4 cursor-pointer transition-all duration-200 ${isSelected ? "border-[#2DD4BF] card-theme shadow-sm" : "border-gray-100 bg-gray-50/50"}`}
                                >
                                    <div className={`h-6 w-6 shrink-0 rounded-lg flex items-center justify-center border-2 ${isSelected ? "bg-[#2DD4BF] border-[#2DD4BF]" : "border-gray-300 bg-white"}`}>
                                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                    <div className="h-14 w-14 shrink-0 rounded-[14px] overflow-hidden bg-white border border-gray-100">
                                        <img src={getItemImage(item, false)} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[var(--header-text)] text-[15px] truncate">{getItemName(item, false)}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Qty: {maxQty}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onQtyChange(-1, maxQty)}
                                                className="h-8 w-8 rounded-full border border-gray-200 card-theme font-bold hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
                                            >
                                                <Minus size={14} className="text-[var(--header-text)]"/>
                                            </button>

                                            <span
                                                className="w-4 text-center font-black text-[var(--header-text)]">{returnForm.quantity}</span>

                                            <button
                                                onClick={() => onQtyChange(1, maxQty)}
                                                className="h-8 w-8 rounded-full border border-gray-200 card-theme font-bold hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
                                            >
                                                <Plus size={14} className="text-[var(--header-text)]"/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <select
                            value={returnForm.reason}
                            onChange={(e) => onFormChange("reason", e.target.value)}
                            className="w-full appearance-none px-6 py-4 rounded-[22px] input-theme text-gray-800 font-bold text-[15px] outline-none cursor-pointer"
                        >
                            {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>

                    <textarea
                        value={returnForm.note}
                        onChange={(e) => onFormChange("note", e.target.value)}
                        placeholder="Describe the issue (optional)..."
                        rows={3}
                        className="w-full px-6 py-4 rounded-[22px] input-theme text-gray-800 text-sm font-bold outline-none resize-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 md:gap-8 border-t border-gray-50 p-6 md:p-8 shrink-0">
                    <button onClick={onClose}
                            className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmittingReturn || !returnForm.selectedItemId}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-4 md:px-10 py-3 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmittingReturn && <Loader2 size={16} className="animate-spin"/>}
                        Confirm Return
                    </button>
                </div>
            </div>
        </div>
    );
}