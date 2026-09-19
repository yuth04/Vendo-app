'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import googleIcon from "@/src/app/components/assets/icons/google.svg";
import passwords from "@/src/app/components/assets/images/auth/password.png";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
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

const Login = () => {
    const router = useRouter();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Safely removes previous instances so the responsive sizing layout can rebuild cleanly
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

    // Explicit render function
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
        window.onTurnstileLoad = () => {
            renderTurnstile();
        };


        if (window.turnstile) {
            renderTurnstile();
        }


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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turnstileToken || loading) return;

        setLoading(true);

        try {
            const result = await authService.login({
                email,
                password,
                "turnstileToken": turnstileToken,
                "cf-turnstile-response": turnstileToken,
                "cf_turnstile_response": turnstileToken,
                "captcha_token": turnstileToken,
                "captcha": turnstileToken
            } as any);

            if (!result) throw new Error('Login failed. Please check your credentials.');

            const responseData = result as any;
            const userData = responseData?.user || responseData?.data || responseData;
            const firstName = userData?.first_name || '';
            const lastName = userData?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'User';

            showNotification(
                (
                    <div className="flex flex-col text-left">
                        <span className="font-bold">Login Successful</span>
                        <span className="mt-0.5">Welcome back, {fullName}!</span>
                    </div>
                ) as any,
                'success'
            );

            setTimeout(() => {
                router.push('/');
                router.refresh();
            }, 1000);
        } catch (err: any) {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
                setTurnstileToken(null);
            }

            let errorMessage = 'Login failed. Please check your credentials.';
            if (err?.response?.status === 403) {
                errorMessage = 'Your account is inactive. Please contact the administrator.';
            } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            }

            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => authService.loginWithGoogle();
    const handleFacebookLogin = () => authService.loginWithFacebook();

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
                strategy="afterInteractive"
            />

            <div className="bg-[var(--header-bg)] flex flex-col px-4 py-2 lg:py-1 sm:px-20 lg:px-20">
                <div className="flex items-center justify-center p-0">
                    <div className="max-w-4xl w-full bg-white rounded-[32px] card-theme overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col md:grid md:grid-cols-2">

                        <div className="hidden md:flex custom-main-color-card items-center justify-center p-12">
                            <div className="relative w-full aspect-square max-w-[280px] transition-transform hover:scale-105 duration-500">
                                <Image src={passwords} alt="Secure Sign In" fill className="object-contain" priority />
                            </div>
                        </div>

                        <div className="w-full p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-[var(--header-bg)]">

                            <div className="mb-8 text-center md:text-left">
                                <div className="text-center lg:text-left">
                                    <h1 className="text-[24px] sm:text-[24px] md:text-[24px] text-center font-roboto font-bold text-[var(--header-text)]">
                                        Hello ! <br/>
                                        Welcome Back
                                    </h1>
                                </div>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-500 ml-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={loading}
                                        placeholder=""
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border input-theme rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] bg-white outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-500 ml-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            disabled={loading}
                                            placeholder=""
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border input-theme rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] bg-white outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01-1.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full flex justify-center md:justify-start items-center min-h-[72px] py-1">
                                    <div
                                        ref={turnstileRef}
                                        className="w-full max-w-[300px] sm:max-w-full min-w-[250px]"
                                    />
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500">
                                        <input
                                            type="checkbox"
                                            disabled={loading}
                                            className="w-4 h-4 rounded border-gray-300 text-[#FF2D55] focus:ring-[#FF2D55] cursor-pointer"
                                        />
                                        <span className="font-semibold">Remember Me</span>
                                    </label>
                                    <Link href="/forgot-password" className="text-sm font-semibold text-gray-500 custom-main-color-text-hover transition-colors cursor-pointer">
                                        Forgot Password
                                    </Link>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={!turnstileToken || loading}
                                        className="w-full py-3.5 custom-main-color-button text-white text-sm uppercase tracking-widest font-bold rounded-[20px] custom-main-color-button-hover active:scale-[0.97] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                    >
                                        {loading ? 'Verifying...' : turnstileToken ? 'Sign In' : 'Complete Verification'}
                                    </button>

                                    <div className="flex items-center my-4">
                                        <div className="flex-grow border-t border-gray-300/50"></div>
                                        <span className="flex-shrink mx-4 text-[12px] font-bold tracking-widest text-gray-400">
                                            Sign in with
                                        </span>
                                        <div className="flex-grow border-t border-gray-300/50"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={handleGoogleLogin}
                                            className="py-3 flex items-center justify-center border border-gray-200 rounded-[20px] hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Image src={googleIcon} alt="Google" width={22} height={22} className="object-contain" />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={handleFacebookLogin}
                                            className="py-3 flex items-center justify-center border border-gray-200 rounded-[20px] hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <svg className="w-[22px] h-[22px] text-[#1877F2] fill-current" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <p className="text-center text-[12px] text-gray-500 mt-6 font-medium">
                                    Don't have an account?{' '}
                                    <Link href="/register" className="custom-main-color-text font-bold hover:underline">
                                        Sign Up
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;