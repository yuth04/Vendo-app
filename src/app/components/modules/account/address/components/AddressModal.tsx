"use client"

import React, { useState } from 'react';
import { X, AlertCircle, MoreHorizontal } from 'lucide-react';
import { AddressPayload } from '@/src/app/components/modules/account/address/core/models/addressModel';
import { PROVINCES } from "@/src/app/components/constant/address/address";

type ModalMode = 'create' | 'edit';

interface AddressModalProps {
    isOpen: boolean;
    mode: ModalMode;
    form: AddressPayload;
    submitting: boolean;
    formError: string | null;
    onClose: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any; type?: string } }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
                                                       isOpen,
                                                       mode,
                                                       form,
                                                       submitting,
                                                       formError,
                                                       onClose,
                                                       onChange,
                                                       onSubmit
                                                   }) => {
    const [isProvinceOpen, setIsProvinceOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
            <div className="bg-[var(--header-bg)] w-full sm:max-w-xl rounded-t-[20px] sm:rounded-[24px] shadow-xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">

                <div className="flex items-center justify-between px-5 py-3 sm:px-6 border-b border-gray-100 shrink-0">
                    <h2 className="text-[18px] sm:text-[20px] font-bold">
                        {mode === 'create' ? 'Add New Address' : 'Edit Address'}
                    </h2>
                    <button onClick={onClose} className="custom-main-color-icon cursor-pointer">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-3 sm:space-y-4">
                    {formError && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                            <AlertCircle size={12} /> {formError}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">First Name <span className="text-red-500">*</span></label>
                            <input required name="first_name" value={form.first_name} onChange={onChange}
                                   className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">Last Name <span className="text-red-500">*</span></label>
                            <input required name="last_name" value={form.last_name} onChange={onChange}
                                   className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">Phone <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-2 flex items-center gap-1 text-[10px] border-r pr-2 h-2/3 my-auto border-gray-200">
                                    <span>🇰🇭</span>
                                    <span className="text-gray-500">+855</span>
                                </div>
                                <input required name="phone" value={form.phone} onChange={onChange}
                                       placeholder="Phone number"
                                       className="w-full border input-theme rounded-[8px] pl-20 pr-3 py-2 outline-none text-xs" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">Zip Code</label>
                            <input name="postal_code" value={form.postal_code} onChange={onChange}
                                   className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">City <span className="text-red-500">*</span></label>
                            <input required name="city" value={form.city} onChange={onChange}
                                   className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs" />
                        </div>
                        <div className="space-y-1 mt-1">
                            <label className="text-xs font-semibold text-gray-500 block">
                                Province <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div
                                    onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                                    className="w-full border border-gray-200 input-theme rounded-[8px] px-3 py-4 outline-none text-xs bg-white cursor-pointer flex items-center relative h-[34px] sm:h-[32px]"
                                >
                                    <span className={!form.province ? "text-gray-400" : "text-black"}>
                                        {form.province || "Select province"}
                                    </span>
                                    <div className="absolute right-2">
                                        <MoreHorizontal size={14} className="rotate-90 text-gray-400"/>
                                    </div>
                                </div>

                                {isProvinceOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProvinceOpen(false)}/>
                                        <ul className="absolute left-1/2 -translate-x-1/2 mt-1 w-full max-h-48 overflow-y-auto bg-[#333] text-white rounded-xl shadow-2xl z-20 py-1 border border-white/10">
                                            {PROVINCES.map((p) => (
                                                <li
                                                    key={p}
                                                    onClick={() => {
                                                        onChange({ target: { name: 'province', value: p, type: 'text' } });
                                                        setIsProvinceOpen(false);
                                                    }}
                                                    className="px-4 py-2.5 text-xs hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none transition-colors"
                                                >
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Street Address <span className="text-red-500">*</span></label>
                        <input required name="address_line" value={form.address_line} onChange={onChange}
                               className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs"/>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer w-fit py-1">
                        <input type="checkbox" name="is_default" checked={form.is_default ?? false}
                               onChange={onChange} className="w-3.5 h-3.5 accent-[#B7E5CD] cursor-pointer"/>
                        <span className="text-xs font-semibold text-gray-600">Set as default address</span>
                    </label>

                    <div className="flex items-center gap-2 pt-2">
                        <button type="submit" disabled={submitting}
                                className="flex items-center justify-center gap-2 custom-main-color-button custom-main-color-button-hover text-white font-bold py-2 px-6 rounded-[8px] text-xs disabled:opacity-60 w-full sm:w-auto cursor-pointer">
                            {mode === 'create' ? 'Add Address' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={onClose}
                                className="bg-gray-100 text-gray-600 font-bold py-2 px-6 rounded-[8px] text-xs hover:bg-gray-200 transition-colors w-full sm:w-auto text-center cursor-pointer">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;