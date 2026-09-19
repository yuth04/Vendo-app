"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import passwords from "@/src/app/components/assets/images/auth/password.png";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
import googleIcon from "@/src/app/components/assets/icons/google.svg";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";

declare global {
    interface Window {
        turnstile: {
            render: (container: string | HTMLElement, options: object) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad: () => void;
    }
}

const Register = () => {
    const router = useRouter();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const cleanupTurnstile = useCallback(() => {
        if (widgetIdRef.current && window.turnstile) {
            try {
                window.turnstile.remove(widgetIdRef.current);
            } catch (error) {
                console.warn("Turnstile removal skipped:", error);
            }
            widgetIdRef.current = null;
        }
    }, []);

    const renderTurnstile = useCallback(() => {
        if (!turnstileRef.current || !window.turnstile) return;

        cleanupTurnstile();

        try {
            widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
                callback: (token: string) => setTurnstileToken(token),
                'expired-callback': () => setTurnstileToken(null),
                'error-callback': () => setTurnstileToken(null),
                theme: 'light',
                size: 'flexible',
            });
        } catch (error) {
            console.error("Turnstile rendering failed:", error);
        }
    }, [cleanupTurnstile]);

    useEffect(() => {
        window.onTurnstileLoad = () => { renderTurnstile(); };
        if (window.turnstile) { renderTurnstile(); }

        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderTurnstile();
            }, 300);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            cleanupTurnstile();
        };
    }, [renderTurnstile, cleanupTurnstile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!turnstileToken) { setError("Please complete the security check."); return; }
        if (formData.password !== formData.password_confirmation) { setError("Passwords do not match."); return; }
        setLoading(true);
        try {
            await authService.register({ ...formData, turnstileToken } as any);
            showNotification('Account created! Check your email for the verification code.', 'success');
            router.push('/verification-email');
        } catch (err: any) {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
                setTurnstileToken(null);
            }
            const data = err?.response?.data;
            if (data?.errors) {
                const messages = Object.values(data.errors as Record<string, string[]>).flat().join(' ');
                setError(messages);
            } else {
                setError(data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => { authService.loginWithGoogle(); };
    const handleFacebookLogin = () => { authService.loginWithFacebook(); };

    const passwordMismatch =
        formData.password_confirmation.length > 0 &&
        formData.password !== formData.password_confirmation;

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
                strategy="afterInteractive"
            />

            <div className="bg-[var(--header-bg)] flex flex-col px-4 py-2 lg:py-1 sm:px-20 lg:px-20">
                <div className="w-full max-w-4xl mx-auto rounded-[32px] card-theme overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col md:grid md:grid-cols-2">

                    <div className="hidden md:flex custom-main-color-card items-center justify-center p-12">
                        <div className="relative w-full aspect-square max-w-[280px]">
                            <Image src={passwords} alt="Register" fill className="object-contain" priority />
                        </div>
                    </div>

                    <div className="w-full p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[var(--header-bg)]">
                        <div className="mb-8 text-center">
                            <h1 className="text-[24px] font-roboto font-bold text-[var(--header-text)]">Create Account</h1>
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-500">
                                        First Name
                                    </label>
                                    <input
                                        name="first_name" type="text" required
                                        value={formData.first_name} onChange={handleChange}
                                        className="w-full px-4 py-3 input-theme border border-gray-200 rounded-[20px] outline-none focus:border-[#FF2D55] focus:ring-4 focus:ring-[#FF2D55]/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-500">
                                        Last Name
                                    </label>
                                    <input
                                        name="last_name" type="text" required
                                        value={formData.last_name} onChange={handleChange}
                                        className="w-full px-4 py-3 input-theme border border-gray-200 rounded-[20px] outline-none focus:border-[#FF2D55] focus:ring-4 focus:ring-[#FF2D55]/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-500">
                                    Email
                                </label>
                                <input
                                    name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="w-full px-4 py-3 border input-theme rounded-[20px] outline-none focus:border-[#FF2D55] focus:ring-4 focus:ring-[#FF2D55]/5 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-500">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password} onChange={handleChange}
                                        className="w-full px-4 py-3 pr-12 border input-theme rounded-[20px] outline-none focus:border-[#FF2D55] focus:ring-4 focus:ring-[#FF2D55]/5 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                                        }
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-500">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        name="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={formData.password_confirmation} onChange={handleChange}
                                        className={`w-full px-4 py-3 pr-12 border rounded-[20px] outline-none transition-all ${
                                            passwordMismatch
                                                ? 'border-red-400 focus:border-red-400 bg-red-50/30'
                                                : 'input-theme focus:border-[#FF2D55] focus:ring-4 focus:ring-[#FF2D55]/5'
                                        }`}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirm
                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                                        }
                                    </button>
                                </div>
                                {passwordMismatch && (
                                    <p className="text-xs text-red-500 ml-1 mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <div className="w-full flex justify-center md:justify-start items-center min-h-[70px] py-1">
                                <div
                                    ref={turnstileRef}
                                    className="w-full max-w-[300px] sm:max-w-full min-w-[250px]"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || passwordMismatch || !turnstileToken}
                                    className="w-full py-3.5 custom-main-color-button text-white text-sm uppercase tracking-widest font-bold rounded-[20px] custom-main-color-button-hover active:scale-[0.97] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : turnstileToken ? 'Create Account' : 'Complete Verification'}
                                </button>
                            </div>

                            <div className="flex items-center my-6">
                                <div className="flex-grow border-t border-gray-300/50"></div>
                                <span className="flex-shrink mx-4 text-[12px] font-bold tracking-widest text-gray-400">Sign in with</span>
                                <div className="flex-grow border-t border-gray-300/50"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleSignUp}
                                    className="py-3 flex items-center justify-center border border-gray-200 rounded-[20px] hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer"
                                >
                                    <Image src={googleIcon} alt="Google" width={22} height={22} className="object-contain"/>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFacebookLogin}
                                    className="py-3 flex items-center justify-center border border-gray-200 rounded-[20px] hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer"
                                >
                                    <svg className="w-[22px] h-[22px] text-[#1877F2] fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </button>
                            </div>

                            <p className="text-center text-[12px] text-gray-500 mt-6 font-medium">
                                Already have an account?{' '}
                                <Link href="/login" className="custom-main-color-text font-bold hover:underline">Sign In</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;