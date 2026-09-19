"use client";

import React, { useRef } from "react";
import { Banknote, CreditCard, Loader2, Upload, X } from "lucide-react";

interface PaymentData {
  transactionId: string;
  imageFile: File | null;
  imagePreview: string;
}

interface Props {
  order: any;
  paymentMethod: string;
  paymentData: PaymentData;
  isSubmitting: boolean;
  isReadyToSubmit: boolean;
  onClose: () => void;
  onMethodChange: (method: string) => void;
  onPaymentDataChange: (data: Partial<PaymentData>) => void;
  onConfirm: () => void;
}

export default function PayModal({
  order,
  paymentMethod,
  paymentData,
  isSubmitting,
  isReadyToSubmit,
  onClose,
  onMethodChange,
  onPaymentDataChange,
  onConfirm,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      onPaymentDataChange({
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="my-auto w-full max-w-[420px] input-theme rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 pb-2 flex items-center justify-between">
          <h2 className="text-[20px] font-black text-[var(--header-text)]">
            Make Payment
          </h2>
          <button
            onClick={onClose}
            className="custom-main-color-icon cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 text-center">
          <span className="text-xs font-bold text-gray-400">Total Amount</span>
          <div className="text-[42px] font-black custom-main-color-text leading-tight mt-1">
            ${order?.total_price}
          </div>
        </div>

        <div className="px-6 pb-4">
          <span className="text-[14px] font-black text-gray-400 mb-3">
            Select Method
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => onMethodChange("khqr")}
              className={`relative cursor-pointer rounded-xl input-theme p-3 transition-all flex items-center gap-2 ${paymentMethod === "khqr" ? "custom-main-border bg-cyan-50/30" : "border-gray-100"}`}
            >
              <div
                className={`h-8 w-8 rounded-full border flex items-center justify-center input-theme ${paymentMethod === "khqr" ? "custom-main-border custom-main-color-icon" : "border-gray-100 text-gray-400"}`}
              >
                <CreditCard size={16} />
              </div>
              <span
                className={`text-xs font-black px-2 ${paymentMethod === "khqr" ? "custom-main-color-text" : "text-gray-400"}`}
              >
                KHQR Pay
              </span>
            </div>
            <div
              onClick={() => onMethodChange("cod")}
              className={`relative cursor-pointer rounded-xl input-theme p-3 transition-all flex items-center gap-2 ${paymentMethod === "cod" ? "custom-main-border bg-cyan-50/30" : "border-gray-100"}`}
            >
              <div
                className={`h-8 w-8 rounded-full border flex items-center justify-center input-theme ${paymentMethod === "cod" ? "border-[#38BDF8] text-[#0D9488]" : "border-gray-100 text-gray-400"}`}
              >
                <Banknote size={16} />
              </div>
              <span
                className={`text-xs font-black ${paymentMethod === "cod" ? "text-[#0D9488]" : "text-gray-400"}`}
              >
                Cash on Delivery
              </span>
            </div>
          </div>
        </div>

        {paymentMethod === "khqr" ? (
          <div className="px-6 pb-6 space-y-4">
            <div className="rounded-[24px] input-theme p-5 flex flex-col items-center">
              <span className="text-xs font-black text-[var(--header-text)] mb-3">
                Scan to Pay
              </span>
              <div className="w-32 h-32 bg-white border border-gray-100 rounded-[15px] flex items-center justify-center text-center overflow-hidden mb-3">
                <p className="text-[8px] font-black text-gray-300 leading-tight uppercase tracking-widest">
                  KHQR CODE
                </p>
              </div>
              <span className="text-[10px] font-bold text-gray-400">
                Scan with banking app
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-black text-gray-300 mb-1.5">
                  Upload Slip *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[18px] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group ${paymentData.imageFile ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200 hover:border-[#B7E5CD]"}`}
                >
                  {paymentData.imagePreview ? (
                    <img
                      src={paymentData.imagePreview}
                      className="h-10 w-10 object-cover rounded mb-1"
                      alt="preview"
                    />
                  ) : (
                    <Upload
                      className="text-gray-300 mb-1 group-hover:text-[#B7E5CD]"
                      size={20}
                    />
                  )}
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-[#B7E5CD]">
                    {paymentData.imageFile
                      ? paymentData.imageFile.name
                      : "Click to upload"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-black text-gray-300 mb-1.5">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) =>
                    onPaymentDataChange({ transactionId: e.target.value })
                  }
                  placeholder="Reference number"
                  className="w-full h-11 px-4 rounded-[20px] border input-theme focus:outline-none focus:border-[#38BDF8] text-xs font-bold text-[#1E293B]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6 pt-2">
            <div className="rounded-[24px] border input-theme p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                <Banknote size={24} />
              </div>
              <h4 className="text-sm font-black custom-main-color-text mb-2">
                Cash on Delivery
              </h4>
              <p className="text-[12px] font-bold text-emerald-700/70 leading-relaxed">
                You will pay{" "}
                <span className="font-black">${order?.total_price}</span> in
                cash upon delivery.
              </p>
            </div>
          </div>
        )}

        <div className="p-6 pt-0 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="input-theme text-gray-600 font-bold py-3 px-6 rounded-[20px] text-xs hover:bg-gray-200 transition-colors w-full sm:w-auto text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting || !isReadyToSubmit}
            className={`px-7 py-3 rounded-[20px] custom-main-color-button custom-main-color-button-hover text-white font-black text-[12px] flex items-center gap-2 cursor-pointer ${!isReadyToSubmit || isSubmitting ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {paymentMethod === "khqr" ? "Submit" : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
