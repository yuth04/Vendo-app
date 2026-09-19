"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import passwords from "@/src/app/components/assets/images/auth/password.png";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
import {authService} from "@/src/app/components/modules/auth/core/services/authService";


const RESEND_COOLDOWN = 60;

const VerificationEmail = () => {
    const router = useRouter();
    const { showNotification } = useNotification();
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);


    useEffect(() => {
        const pending = authService.getPendingEmail();
        if (!pending) {
            showNotification('Please register first.', 'error');
            router.replace('/register');
            return;
        }
        setEmail(pending);
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }, []);

    //----- Countdown for Resend button ----//
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    //----- Input handlers ----//
    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;
        const updated = [...code];
        updated[index] = value;
        setCode(updated);
        if (error) setError(null);
        if (value && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
            const updated = [...code];
            updated[index - 1] = '';
            setCode(updated);
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const updated = Array(6).fill('');
        pasted.split('').forEach((char, i) => { updated[i] = char; });
        setCode(updated);
        inputsRef.current[Math.min(pasted.length - 1, 5)]?.focus();
    };

    //--- Submit verify ------//
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        const verification_code = code.join('');
        if (verification_code.length < 6) {
            setError('Please enter all 6 digits.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await authService.verifyEmail(email, verification_code);
            showNotification('Email verified! Welcome 🎉', 'success');
            router.replace('/');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Invalid or expired code. Please try again.';
            setError(msg);
            setCode(Array(6).fill(''));
            setTimeout(() => inputsRef.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    };

    //--- Resend -----//
    const handleResend = async () => {
        if (cooldown > 0 || resendLoading || !email) return;
        setResendLoading(true);
        setError(null);
        try {
            await authService.resendVerification(email);
            showNotification('Code resent! Check your inbox.', 'success');
            setCooldown(RESEND_COOLDOWN);
            setCode(Array(6).fill(''));
            setTimeout(() => inputsRef.current[0]?.focus(), 50);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to resend. Please try again.';
            showNotification(msg, 'error');
        } finally {
            setResendLoading(false);
        }
    };

    const isComplete = code.every((d) => d !== '');

    return (
        <div className="bg-[var(--header-bg)] flex flex-col py-3 lg:py-1 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-4 sm:p-6">
                <div className="max-w-4xl w-full mb-5 bg-white rounded-[32px] card-theme overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex md:grid md:grid-cols-2">

                    <div className="hidden md:flex custom-main-color-card items-center justify-center p-12">
                        <div className="relative w-full aspect-square max-w-[280px] transition-transform hover:scale-105 duration-500">
                            <Image src={passwords} alt="Verify Email" fill className="object-contain" priority />
                        </div>
                    </div>

                    <div className="w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[var(--header-bg)]">

                        <div className="mb-8 text-center">
                            <h1 className="text-[24px] sm:text-[24px] md:text-[24px] font-roboto font-bold text-[var(--header-text)]">
                                Verify Your Email
                            </h1>
                            <p className="text-[var(--text-muted)] text-[12px] mt-2">
                                We sent a 6-digit code to
                            </p>
                            {email && (
                                <p className="font-semibold text-sm custom-main-color-text mt-1 break-all">
                                    {email}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="flex justify-between gap-2 sm:gap-3">
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        disabled={loading}
                                        value={code[index]}
                                        ref={(el) => { inputsRef.current[index] = el; }}
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className={`w-full h-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                                            ${code[index]
                                            ? 'border-[#FF2D55] bg-[#FF2D55]/5 custom-main-color-text'
                                            : 'input-theme text-gray-700'
                                        } focus:border-[#FF2D55] focus:ring-4 focus:ring-[#FF2D55]/10`}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isComplete}
                                className="w-full py-3.5 custom-main-color-button text-white text-sm uppercase tracking-widest font-bold rounded-[20px] custom-main-color-button-hover active:scale-[0.97] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <div className="text-center">
                                <p className="text-[12px] text-[var(--text-muted)]">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={cooldown > 0 || resendLoading || loading}
                                        className={`font-semibold border-none transition-colors ${
                                            cooldown > 0 || resendLoading || loading
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'custom-main-color-text hover:underline cursor-pointer'
                                        }`}
                                    >
                                        {resendLoading ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationEmail;