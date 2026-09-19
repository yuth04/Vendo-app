"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import arrowLeft from "@/src/app/components/assets/icons/arrowLeft.svg";
import passwords from "@/src/app/components/assets/images/auth/password.png";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";

const ResetPassword = () => {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = authService.getPendingResetEmail();
    const token = authService.getResetToken();
    if (!email || !token) {
      showNotification(
        "Please complete the reset process from the beginning.",
        "error",
      );
      router.replace("/forgot-password");
    }
  }, []);
  const validate = (): string | null => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== passwordConfirmation) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(password, passwordConfirmation);
      showNotification(
        "Password reset successfully! Please sign in.",
        "success",
      );
      router.replace("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--header-bg)] flex flex-col py-3 lg:py-1 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full bg-white rounded-[32px] card-theme overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex md:grid md:grid-cols-2">
          <div className="hidden md:flex custom-main-color-card items-center justify-center p-12">
            <div className="relative w-full aspect-square max-w-[280px] transition-transform hover:scale-105 duration-500">
              <Image
                src={passwords}
                alt="Reset Password"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[var(--header-bg)]">
            <div className="mb-8 text-center">
              <div className="relative">
                <Link
                  href="/forgot-password"
                  className="absolute left-0 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full transition-colors icon-theme"
                >
                  <Image src={arrowLeft} alt="Back" />
                </Link>
                <h1 className="text-[24px] sm:text-[24px] md:text-[24px] font-roboto font-bold text-[var(--header-text)]">
                  Reset Password
                </h1>
              </div>
              <p className="text-[var(--text-muted)] text-[12px] mt-2">
                Choose a strong new password.
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-500 ml-1">
                  New Password<span className="text-[#EB5757] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 pr-11 input-theme border border-gray-200 rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] bg-white outline-none transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-500 ml-1">
                  Confirm Password
                  <span className="text-[#EB5757] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    disabled={loading}
                    value={passwordConfirmation}
                    onChange={(e) => {
                      setPasswordConfirmation(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 pr-11 input-theme border border-gray-200 rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] bg-white outline-none transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 custom-main-color-button text-white text-sm uppercase tracking-widest font-bold rounded-[20px] custom-main-color-button-hover active:scale-[0.97] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
