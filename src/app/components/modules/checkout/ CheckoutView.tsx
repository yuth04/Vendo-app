"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  MapPin,
  ArrowLeft,
  PlusCircle,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCart } from "@/src/app/components/context/Cartcontext";
import {
  Address,
  AddressPayload,
} from "@/src/app/components/modules/account/address/core/models/addressModel";
import { useAlert } from "@/src/app/components/context/AlertContext";
import CheckoutStepper from "./CheckoutStepper";
import OrderSummary from "./OrderSummary";
import { PROVINCES } from "@/src/app/components/constant/address/address";
import { addressClient } from "@/src/app/components/modules/account/address/core/api/addressClient";
import { getShippingCharge } from "../../helpers/constants/shippingUtils";

const CHECKOUT_DATA_KEY = "checkout_data";

function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  deleting,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onSelect}
        className={`w-full text-left rounded-xl border-2 p-5 card-theme transition cursor-pointer ${
          selected
            ? "custom-main-color-card custom-main-border"
            : "border-gray-100 bg-gray-50 hover:border-gray-200"
        }`}
      >
        <div className="flex items-start gap-3 pr-8">
          <MapPin
            size={16}
            className={`mt-0.5 flex-shrink-0 ${selected ? "custom-main-color-icon" : "text-gray-400"}`}
          />
          <div className="text-sm text-gray-600 leading-relaxed mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[14px] text-[var(--header-text)]">
                {address.first_name} {address.last_name}
              </p>
              {address.is_default && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full custom-main-color-bg text-gray-700">
                  Default
                </span>
              )}
            </div>
            <p className="text-[var(--header-text)]">{address.phone}</p>
            <p className="text-[var(--header-text)]">
              {address.address_line}, {address.city}, {address.province},{" "}
              {address.postal_code}
            </p>
          </div>
        </div>
      </button>

      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="border border-gray-300 rounded-lg p-1 hover:opacity-80 cursor-pointer card-theme"
        >
          <MoreHorizontal
            size={16}
            className="text-gray-500 custom-main-color-text-hover"
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                disabled={deleting}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const EMPTY_FORM: AddressPayload = {
  first_name: "",
  last_name: "",
  phone: "",
  address_line: "",
  city: "",
  province: "",
  postal_code: "",
  is_default: false,
};

export default function CheckoutView() {
  const router = useRouter();
  const { totalPrice } = useCart();
  const { showToast, showConfirm } = useAlert();

  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number>(-1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const tax = 0;
  const discount = 0;

  // ── Derive shipping charge from the selected address province ──
  const selectedAddress = addresses.find((a) => a.id === selectedId);
  const shippingCharge = getShippingCharge(selectedAddress?.province);
  const [editingIsCurrentlyDefault, setEditingIsCurrentlyDefault] =
    useState(false);
  const fetchAddresses = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await addressClient.getAddresses();
      setAddresses(data);
      const def = data.find((a) => a.is_default) ?? data[0];
      if (def) setSelectedId(def.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to load addresses.";
      setListError(msg);
      showToast(msg, "error");
    } finally {
      setLoadingList(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalMode("create");
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
    setEditingIsCurrentlyDefault(false);
  };

  const openEdit = (addr: Address) => {
    setForm({
      first_name: addr.first_name,
      last_name: addr.last_name,
      phone: addr.phone,
      address_line: addr.address_line,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setEditingIsCurrentlyDefault(addr.is_default);
    setModalMode("edit");
    setEditingId(addr.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsProvinceOpen(false);
    setFormError(null);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: any } },
  ) => {
    const { name, value } = e.target;
    const type = (e as any).target.type;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (modalMode === "create") {
        await addressClient.createAddress(form);
        showToast("Address added successfully.", "success");
      } else if (editingId !== null) {
        await addressClient.updateAddress(editingId, form);
        showToast("Address updated successfully.", "success");
      }
      await fetchAddresses();
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Something went wrong.";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({
      title: "Delete Address",
      message:
        "Are you sure you want to delete this address? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await addressClient.deleteAddress(id);
      setAddresses((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (selectedId === id) {
          const def = next.find((a) => a.is_default) ?? next[0];
          setSelectedId(def?.id ?? -1);
        }
        return next;
      });
      showToast("Address deleted.", "success");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to delete address.";
      showToast(msg, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-4">
      <div>
        <div className="flex items-center gap-3 mb-2 ">
          <button
            onClick={() => router.back()}
            className="p-2 custom-main-color-border-hover card-theme rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={30} className="text-[var(--header-text)]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--header-text)]">
              Provide Your Shipping Information
            </h1>
            <p className="text-sm custom-main-color-text font-medium">
              Check Your Information Before You Continue
            </p>
          </div>
        </div>

        <CheckoutStepper current="checkout" />

        <div className="flex flex-col lg:flex-row gap-6 mt-2">
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              {(["delivery"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${
                    mode === m
                      ? "custom-main-color-button text-white"
                      : "input-theme text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {m === "delivery" ? "Delivery" : ""}
                </button>
              ))}
            </div>

            <div className="bg-[var(--header-bg)] rounded-2xl border input-theme p-6 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[var(--header-text)]">
                  Shipping Address
                </h2>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white custom-main-color-button custom-main-color-button-hover px-3 py-1.5 rounded-full transition cursor-pointer"
                >
                  <PlusCircle size={14} /> Add New
                </button>
              </div>

              {listError && (
                <p className="flex items-center gap-1.5 text-sm text-red-500 font-semibold mb-3">
                  <AlertCircle size={14} /> {listError}
                </p>
              )}

              {loadingList && (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse bg-gray-100 rounded-xl"
                    />
                  ))}
                </div>
              )}

              {!loadingList && addresses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                  <MapPin size={32} className="opacity-30" />
                  <p className="text-sm font-medium">
                    No addresses yet. Add one to continue.
                  </p>
                </div>
              )}

              {!loadingList && addresses.length > 0 && (
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedId === addr.id}
                      onSelect={() => setSelectedId(addr.id)}
                      onEdit={() => openEdit(addr)}
                      onDelete={() => handleDelete(addr.id)}
                      deleting={deletingId === addr.id}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/checkout/cart-list")}
                className="px-4 sm:px-6 sm:py-3 py-2.5 rounded-[20px] card-theme text-[var(--header-text)] text-[12px] sm:text-[14px] font-semibold transition cursor-pointer shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
              >
                Back to Cart
              </button>
              <button
                onClick={() => {
                  if (selectedId === -1) return;
                  const addr = addresses.find((a) => a.id === selectedId);
                  // ── store province so PaymentView can compute the same shipping charge ──
                  localStorage.setItem(
                    CHECKOUT_DATA_KEY,
                    JSON.stringify({
                      address_id: selectedId,
                      contact: addr?.phone ?? "",
                      province: addr?.province ?? "",
                    }),
                  );
                  router.push("/checkout/payment");
                }}
                disabled={selectedId === -1}
                className="px-4 sm:px-6 sm:py-3 py-2.5 rounded-[20px] custom-main-color-button text-[12px] sm:text-[14px] custom-main-color-button-hover text-white font-semibold cursor-pointer flex items-center gap-2 shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
              >
                Save and Pay
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-[var(--header-bg)] w-full sm:max-w-xl rounded-t-[20px] sm:rounded-[24px] shadow-xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3 sm:px-6 border-b border-gray-100 shrink-0">
              <h2 className="text-[18px] sm:text-[20px] font-bold">
                {modalMode === "create" ? "Add New Address" : "Edit Address"}
              </h2>
              <button
                onClick={closeModal}
                className="custom-main-color-icon cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-5 sm:p-6 space-y-3 sm:space-y-4"
            >
              {formError && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                  <AlertCircle size={12} /> {formError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-2 flex items-center gap-1 text-[10px] border-r pr-2 h-2/3 my-auto border-gray-200">
                      <span>🇰🇭</span>
                      <span className="text-gray-500">+855</span>
                    </div>
                    <input
                      required
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="w-full border input-theme rounded-[8px] pl-20 pr-3 py-2 outline-none text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    Zip Code
                  </label>
                  <input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs"
                  />
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
                      <span
                        className={
                          !form.province ? "text-gray-400" : "text-black"
                        }
                      >
                        {form.province || "Select province"}
                      </span>
                      <div className="absolute right-2">
                        <MoreHorizontal
                          size={14}
                          className="rotate-90 text-gray-400"
                        />
                      </div>
                    </div>

                    {isProvinceOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsProvinceOpen(false)}
                        />
                        <ul className="absolute left-1/2 -translate-x-1/2 mt-1 w-full max-h-48 overflow-y-auto bg-[#333] text-white rounded-xl shadow-2xl z-20 py-1 border border-white/10">
                          {PROVINCES.map((p) => (
                            <li
                              key={p}
                              onClick={() => {
                                handleChange({
                                  target: { name: "province", value: p },
                                });
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
                <label className="text-xs font-semibold text-gray-500">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="address_line"
                  value={form.address_line}
                  onChange={handleChange}
                  className="w-full border input-theme rounded-[8px] px-3 py-2 outline-none text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer w-fit py-1">
                <input
                  type="checkbox"
                  name="is_default"
                  // checked={form.is_default ?? false}
                  checked={
                    editingIsCurrentlyDefault
                      ? true
                      : (form.is_default ?? false)
                  }
                  disabled={editingIsCurrentlyDefault}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 accent-[#B7E5CD] cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-600">
                  Set as default address
                </span>
              </label>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 custom-main-color-button custom-main-color-button-hover text-white font-bold py-2 px-6 rounded-[8px] text-xs disabled:opacity-60 w-full sm:w-auto cursor-pointer"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  {modalMode === "create" ? "Add Address" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 text-gray-600 font-bold py-2 px-6 rounded-[8px] text-xs hover:bg-gray-200 transition-colors w-full sm:w-auto text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
