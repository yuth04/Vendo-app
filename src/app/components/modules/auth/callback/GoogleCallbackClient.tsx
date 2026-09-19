"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification } from '@/src/app/components/helpers/components/CustomAlert';
import { ENDPOINTS } from "@/src/app/components/modules/auth/core/api/endpoints";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";

const GoogleIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const SpinnerArc = () => (
    <svg
        className="absolute top-0 left-0 animate-spin"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        style={{ animationDuration: '1.2s' }}
    >
        <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="4" />
        <path
            d="M40 4 A36 36 0 0 1 76 40"
            stroke="#E53935"
            strokeWidth="4"
            strokeLinecap="round"
        />
    </svg>
);

const GoogleCallbackHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showNotification } = useNotification();
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState('Redirecting you now...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const token = searchParams.get('token');
                if (!token) throw new Error('No token received');

                localStorage.setItem('auth_token', token);
                setStatusText('Fetching your profile...');

                const response = await fetch(ENDPOINTS.profile, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Profile fetch failed');

                const json = await response.json();
                const userData = json?.data ?? json?.user ?? json;

                if (!userData?.email) throw new Error('Invalid user data');

                await authService.handleGoogleCallback(userData, token);

                showNotification('Signed in with Google successfully!', 'success');
                setStatusText('Welcome! Redirecting...');
                setTimeout(() => router.replace('/'), 800);

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Google sign-in failed');
                showNotification(err.message || 'Google sign-in failed', 'error');
                setTimeout(() => router.replace('/login'), 2000);
            }
        };

        handleCallback();
    }, [searchParams, router, showNotification]);

    return (
        <div className="flex flex-col items-center gap-5">
            {error ? (
                <p className="text-red-500 font-medium text-center px-6">{error}</p>
            ) : (
                <>
                    {/* Spinner + Google logo */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <SpinnerArc />
                        <div className="w-[52px] h-[52px] rounded-full bg-gray-100 flex items-center justify-center">
                            <GoogleIcon />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="flex flex-col items-center gap-1.5">
                        <p className="text-[18px] font-bold text-gray-900">Welcome back!</p>
                        <p className="text-sm text-gray-400">{statusText}</p>
                    </div>
                </>
            )}
        </div>
    );
};

const GoogleCallbackPage = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 min-h-[85vh] flex items-center justify-center">
            <Suspense fallback={""}>
                <GoogleCallbackHandler />
            </Suspense>
        </div>
    );
};

export default GoogleCallbackPage;