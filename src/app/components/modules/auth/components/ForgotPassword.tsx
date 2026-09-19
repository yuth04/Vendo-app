"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import passwords from "@/src/app/components/assets/images/auth/password.png";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
import {authService} from "@/src/app/components/modules/auth/core/services/authService";



const ForgotPassword = () => {
    const router = useRouter();
    const { showNotification } = useNotification();

    const [email, setEmail]     = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || loading) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(email.trim());
            showNotification('Reset code sent! Check your inbox.', 'success');
            router.push('/verification-forgort');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                'Failed to send reset email. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--header-bg)] flex flex-col py-3 lg:py-1 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-4 sm:p-6">
                <div className="max-w-4xl w-full mb-5 bg-white rounded-[32px] card-theme overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex md:grid md:grid-cols-2">

                    <div className="hidden md:flex custom-main-color-card items-center justify-center p-12">
                        <div className="relative w-full aspect-square max-w-[280px] transition-transform hover:scale-105 duration-500">
                            <Image
                                src={passwords}
                                alt="Forgot Password"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[var(--header-bg)]">
                        <div className="mb-8 text-center">
                            <h1 className="text-[24px] sm:text-[24px] md:text-[24px] font-roboto font-bold text-[var(--header-text)]">
                                Forgot Password
                            </h1>
                            <p className="text-[var(--text-muted)] text-[12px] mt-2">
                                Enter your email and we'll send you a reset code.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-500 ml-1">
                                    Email<span className="text-[#EB5757] ml-0.5">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    disabled={loading}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    className="w-full px-4 py-3 border input-theme rounded-[20px] focus:ring-4 focus:ring-[#FF2D55]/5 focus:border-[#FF2D55] bg-white outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 custom-main-color-button text-white text-sm uppercase tracking-widest font-bold rounded-[20px] custom-main-color-button-hover active:scale-[0.97] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>

                            <div className="text-center text-[12px] text-gray-500 font-medium">
                                Back to{' '}
                                <Link href="/login" className="ml-1 custom-main-color-text font-bold hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;