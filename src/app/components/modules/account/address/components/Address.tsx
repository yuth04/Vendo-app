"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Address as AddressModel, AddressPayload } from '@/src/app/components/modules/account/address/core/models/addressModel';
import { useAlert } from '@/src/app/components/context/AlertContext';
import { addressService } from "@/src/app/components/modules/account/address/core/services/addressService";
import AddressModal from '@/src/app/components/modules/account/address/components/AddressModal';
import {useAddressData} from "@/src/app/components/modules/account/address/core/hook/useAddressData";

type ModalMode = 'create' | 'edit';

const EMPTY_FORM: AddressPayload = {
    first_name: '',
    last_name: '',
    phone: '',
    address_line: '',
    city: '',
    province: '',
    postal_code: '',
    is_default: false,
};

const Address = () => {
    const { showToast, showConfirm } = useAlert();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode]     = useState<ModalMode>('create');
    const [editingId, setEditingId]     = useState<number | null>(null);
    const [form, setForm]               = useState<AddressPayload>(EMPTY_FORM);
    const [submitting, setSubmitting]   = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);

    const [menuOpenId, setMenuOpenId]   = useState<number | null>(null);
    const [deletingId, setDeletingId]   = useState<number | null>(null);

    //----- Fetch via Hook & addressService ----//
    const fetchFn = useCallback(() => addressService.getAddresses(), []);
    const {
        data: addresses = [],
        error: apiError,
        loading: loadingList,
        refetchData: refreshAddresses,
        setData: setAddresses
    } = useAddressData<AddressModel[]>(fetchFn, [], true);

    const [listError, setListError] = useState<string | null>(null);

    useEffect(() => {
        if (apiError) {
            setListError(apiError.message);
            showToast(apiError.message, 'error');
        } else {
            setListError(null);
        }
    }, [apiError, showToast]);

    //----- Modal helpers -----//
    const openCreate = () => {
        setForm(EMPTY_FORM);
        setModalMode('create');
        setEditingId(null);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEdit = (addr: AddressModel) => {
        setForm({
            first_name:   addr.first_name,
            last_name:    addr.last_name,
            phone:        addr.phone,
            address_line: addr.address_line,
            city:         addr.city,
            province:     addr.province,
            postal_code:  addr.postal_code,
            is_default:   addr.is_default,
        });
        setModalMode('edit');
        setEditingId(addr.id);
        setFormError(null);
        setMenuOpenId(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError(null);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any; type?: string } }
    ) => {
        const { name, value } = e.target;
        const isCheckbox = 'type' in e.target ? e.target.type === 'checkbox' : false;

        setForm((prev) => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    //------ Submit -----//
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        try {
            if (modalMode === 'create') {
                const res     = await addressService.createAddress(form);
                const created = res.data?.address as AddressModel;
                setAddresses((prev) => [...(prev || []), created]);
                showToast('Address added successfully.', 'success');
            } else if (editingId !== null) {
                const res     = await addressService.updateAddress(editingId, form);
                const updated = res.data?.address as AddressModel;
                setAddresses((prev) => (prev || []).map((a) => (a.id === editingId ? updated : a)));
                showToast('Address updated successfully.', 'success');
            }
            closeModal();
            refreshAddresses();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Something went wrong.';
            setFormError(msg);
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    //------ Delete ------//
    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm({
            title:        'Delete Address',
            message:      'Are you sure you want to delete this address? This action cannot be undone.',
            confirmLabel: 'Delete',
            cancelLabel:  'Cancel',
            variant:      'danger',
        });
        if (!confirmed) return;

        setDeletingId(id);
        setMenuOpenId(null);
        try {
            await addressService.deleteAddress(id);
            setAddresses((prev) => (prev || []).filter((a) => a.id !== id));
            showToast('Address deleted.', 'success');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to delete address.';
            setListError(msg);
            showToast(msg, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-6xl relative">
            <h1 className="text-[24px] sm:text-[28px] font-bold custom-main-color-text">
                Addresses
            </h1>

            {listError && (
                <p className="flex items-center gap-1.5 text-sm text-red-500 font-semibold mt-3">
                    <AlertCircle size={14} /> {listError}
                </p>
            )}

            {loadingList && (
                <div className="flex gap-4 py-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="w-72 h-36 animate-pulse bg-gray-100 rounded-3xl" />
                    ))}
                </div>
            )}

            {!loadingList && (
                <div className="flex flex-wrap items-start gap-4 py-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="relative w-full sm:max-w-sm custom-main-color-card rounded-[24px] p-6 sm:p-7 shadow-sm border border-transparent hover:border-gray-100 transition-all"
                        >
                            <div className="absolute top-6 right-6">
                                <button
                                    onClick={() => setMenuOpenId(menuOpenId === addr.id ? null : addr.id)}
                                    className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <MoreHorizontal className="text-gray-500" size={18} />
                                </button>

                                {menuOpenId === addr.id && (
                                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                                        <button
                                            onClick={() => openEdit(addr)}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            disabled={deletingId === addr.id}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 cursor-pointer border-t border-gray-50"
                                        >
                                            {deletingId === addr.id
                                                ? <Loader2 size={14} className="animate-spin" />
                                                : <Trash2 size={14} />}
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pr-10">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <h2 className="custom-main-color-text font-bold text-lg leading-tight">
                                        {addr.first_name} {addr.last_name}
                                    </h2>
                                    {addr.is_default && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full custom-main-color-bg text-gray-700">
                                            Default
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[var(--header-text)] text-sm font-semibold">
                                        {addr.phone}
                                    </p>
                                    <p className="text-[var(--header-text)] text-sm leading-relaxed">
                                        {addr.address_line}
                                    </p>
                                    <p className="text-[var(--header-text)] text-sm">
                                        {addr.city}, {addr.province}, {addr.postal_code}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="w-full flex">
                        <button
                            onClick={openCreate}
                            className="flex items-center justify-center gap-3 w-60 sm:w-auto custom-main-color-button custom-main-color-button-hover text-white font-bold py-3 px-6 rounded-[20px] shadow-sm cursor-pointer transition-colors"
                        >
                            <PlusCircle size={22} strokeWidth={2.5}/>
                            <span className="text-[14px] sm:text-[16px] ">Add New Address</span>
                        </button>
                    </div>
                </div>
            )}
            {/* Render extracted child component modal layout */}
            <AddressModal
                isOpen={isModalOpen}
                mode={modalMode}
                form={form}
                submitting={submitting}
                formError={formError}
                onClose={closeModal}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />

            {menuOpenId !== null && (
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)}/>
            )}
        </div>
    );
};

export default Address;