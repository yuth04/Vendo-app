"use client";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { ENDPOINTS } from "@/src/app/components/core/services/_index";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";

interface KhqrData {
  qr_string: string;
  md5: string;
  khqr_expires_at: string;
  amount: number;
  currency: string;
}

interface KhqrModalProps {
  open: boolean;
  khqr: KhqrData;
  orderId: string | number | null;
  onSuccess: () => void;
  onClose: () => void;
  onRegenerateQr?: (newKhqrData: KhqrData) => void;
}

type PollStatus = "pending" | "paid" | "expired" | "error";

const DEFAULT_KHQR_TTL_SECONDS = 3 * 60; // 3-minute default Bakong window
const POLL_INTERVAL_MS = 6000; // 6 seconds interval to observe API limits

function resolveExpiryTimestamp(raw: string): number {
  if (!raw) return Date.now() + DEFAULT_KHQR_TTL_SECONDS * 1000;

  const match = raw.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (!match) return Date.now() + DEFAULT_KHQR_TTL_SECONDS * 1000;

  const [, dd, mm, yyyy, hh, min, sec, meridiem] = match;
  let hours = parseInt(hh, 10);
  if (meridiem.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === "AM" && hours === 12) hours = 0;

  const parsed = new Date(
    parseInt(yyyy, 10),
    parseInt(mm, 10) - 1,
    parseInt(dd, 10),
    hours,
    parseInt(min, 10),
    parseInt(sec, 10),
  ).getTime();

  return isNaN(parsed) ? Date.now() + DEFAULT_KHQR_TTL_SECONDS * 1000 : parsed;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function KhqrModal({
  open,
  khqr,
  orderId,
  onSuccess,
  onClose,
  onRegenerateQr,
}: KhqrModalProps) {
  const [status, setStatus] = useState<PollStatus>("pending");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);
  const initialWindowRef = useRef<number>(DEFAULT_KHQR_TTL_SECONDS * 1000);

  const clearAllTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleRegenerate = async () => {
    if (!orderId || isRegenerating) return;
    setIsRegenerating(true);
    setErrorMsg(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      const baseUrl = ENDPOINTS.checkout.substring(
        0,
        ENDPOINTS.checkout.lastIndexOf("/"),
      );
      const regenerateUrl = `${baseUrl}/payments/khqr/regenerate`;

      const res = await fetch(regenerateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: Number(orderId) }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(
          body?.message || body?.error || "Failed to regenerate QR code",
        );
      }

      const newKhqr = body?.khqr || body?.data?.khqr;

      if (newKhqr && onRegenerateQr) {
        onRegenerateQr(newKhqr);
        setStatus("pending");
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Regeneration failed:", err);
      setErrorMsg(err?.message || "Failed to regenerate QR code.");
    } finally {
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    if (!open || !orderId) return;

    setStatus("pending");
    setErrorMsg(null);

    const targetDeadline = resolveExpiryTimestamp(khqr.khqr_expires_at);
    const calculatedWindow = Math.max(targetDeadline - Date.now(), 60000);
    initialWindowRef.current = calculatedWindow;

    // 1. Countdown Timer
    const tick = () => {
      const diff = targetDeadline - Date.now();
      setTimeLeft(diff);
      if (diff <= 0) {
        clearAllTimers();
        setStatus((prev) => (prev === "paid" ? prev : "expired"));
      }
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);

    // 2. Status Polling
    const baseUrl = ENDPOINTS.checkout.substring(
      0,
      ENDPOINTS.checkout.lastIndexOf("/"),
    );
    const statusUrl = `${baseUrl}/payments/khqr/status?order_id=${orderId}`;

    const checkStatus = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        const token = authService.getToken();
        const res = await fetch(statusUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const body = await res.json();

        const currentStatus =
          body?.payment_status ??
          body?.status ??
          body?.data?.payment_status ??
          body?.data?.status;

        if (currentStatus === "paid") {
          clearAllTimers();
          setStatus("paid");
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else if (currentStatus === "expired") {
          clearAllTimers();
          setStatus("expired");
        }
      } catch (error) {
        console.error("Payment status poll failed:", error);
      } finally {
        inFlightRef.current = false;
      }
    };

    checkStatus();
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      clearAllTimers();
    };
  }, [open, orderId, khqr.qr_string, khqr.khqr_expires_at]);

  if (!open) return null;

  const progressPct = Math.max(
    0,
    Math.min(100, (timeLeft / initialWindowRef.current) * 100),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm bg-[var(--header-bg)] rounded-3xl shadow-2xl overflow-hidden">
        {status !== "paid" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}

        {/* Header band */}
        <div className="bg-gradient-to-r from-red-600 to-blue-700 px-6 pt-6 pb-8 text-center">
          <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">
            Scan with any banking app
          </p>
          <h2 className="text-white font-black text-2xl mt-1 tracking-tight">
            {khqr.currency} {khqr.amount.toFixed(2)}
          </h2>
        </div>

        <div className="px-6 pb-6 -mt-6 flex flex-col items-center">
          {status === "pending" && (
            <>
              {/* Gradient-framed QR card */}
              <div className="p-[3px] rounded-[26px] bg-gradient-to-br from-red-500 via-red-600 to-blue-700 shadow-lg">
                <div className="relative bg-white rounded-[23px] p-5">
                  <QRCodeSVG
                    value={khqr.qr_string}
                    size={210}
                    level="M"
                    fgColor="#111827"
                    bgColor="#ffffff"
                  />

                  {/* Corner scan brackets */}
                  <div className="pointer-events-none absolute inset-3">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-red-600 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-red-600 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-blue-700 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-blue-700 rounded-br-lg" />
                  </div>

                  {/* Animated scan line */}
                  <div className="pointer-events-none absolute left-5 right-5 top-5 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-khqr-scan" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-gray-600">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
                Waiting for payment...
              </div>

              {/* Countdown progress bar */}
              <div className="w-full mt-4">
                <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-1">
                  <span>Expires in</span>
                  <span className="font-mono font-bold text-red-600">
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-blue-600 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {status === "paid" && (
            <div className="flex flex-col items-center gap-3 py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2
                  size={36}
                  className="text-green-500 animate-bounce"
                />
              </div>
              <p className="font-bold text-[var(--header-text)] text-lg">
                Payment received!
              </p>
              <p className="text-sm text-gray-400">Redirecting...</p>
            </div>
          )}

          {status === "expired" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={36} className="text-red-500" />
              </div>
              <p className="font-bold text-[var(--header-text)]">
                QR Code Expired
              </p>
              <p className="text-sm text-gray-400 text-center">
                This QR code timed out. Click below to generate a new QR code
                for this order.
              </p>

              {errorMsg && (
                <div className="w-full text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-3 mt-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-semibold cursor-pointer hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="px-5 py-2 rounded-xl custom-main-color-button text-white text-sm font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isRegenerating && (
                    <RefreshCw size={14} className="animate-spin" />
                  )}
                  {isRegenerating ? "Regenerating..." : "Regenerate QR"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes khqr-scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(170px);
            opacity: 0;
          }
        }
        .animate-khqr-scan {
          animation: khqr-scan 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
