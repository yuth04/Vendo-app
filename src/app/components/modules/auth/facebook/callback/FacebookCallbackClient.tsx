'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/src/app/components/modules/auth/core/services/authService';
import { useNotification } from '@/src/app/components/helpers/components/CustomAlert';

type StepStatus = 'pending' | 'loading' | 'done' | 'error';

const STEPS = [
    'Connecting to Facebook',
    'Verifying your account',
    'Setting up your session',
    'Redirecting you home',
];

function FacebookCallbackHandler() {
    const router       = useRouter();
    const params       = useSearchParams();
    const { showNotification } = useNotification();

    const [currentStep, setCurrentStep]   = useState(0);
    const [stepStatus,  setStepStatus]    = useState<StepStatus>('loading');
    const [errorMsg,    setErrorMsg]      = useState<string | null>(null);

    useEffect(() => {
        const token    = params.get('token');
        const userRaw  = params.get('user');
        const error    = params.get('error');

        if (error || !token || !userRaw) {
            setStepStatus('error');
            setErrorMsg(error || 'Facebook login failed. Please try again.');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        const run = async () => {
            try {
                let userData: any;
                try {
                    userData = JSON.parse(decodeURIComponent(userRaw));
                } catch {
                    userData = {};
                }

                // Step 0 → 1
                setCurrentStep(1);
                await authService.handleFacebookCallback(userData, token);

                // Step 1 → 2
                setCurrentStep(2);
                await new Promise(r => setTimeout(r, 400));

                // Step 2 → 3
                setCurrentStep(3);
                setStepStatus('done');
                await new Promise(r => setTimeout(r, 400));

                const firstName = userData?.first_name || userData?.name?.split(' ')[0] || 'User';
                const lastName  = userData?.last_name  || userData?.name?.split(' ').slice(1).join(' ') || '';
                const fullName  = `${firstName} ${lastName}`.trim();

                showNotification(
                    (
                        <div className="flex flex-col text-left">
                            <span className="font-bold">Login Successful</span>
                            <span className="mt-0.5">Welcome, {fullName}!</span>
                        </div>
                    ) as any,
                    'success'
                );

                router.push('/');
                router.refresh();
            } catch (err: any) {
                setStepStatus('error');
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Facebook login failed. Please try again.';
                setErrorMsg(msg);
                showNotification(msg, 'error');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        run();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-[var(--header-bg)] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] card-theme shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-10 w-full max-w-sm text-center">

                {/* Facebook icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </div>
                </div>

                {stepStatus === 'error' ? (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Login Failed</h2>
                        <p className="text-sm text-gray-500">{errorMsg}</p>
                        <p className="text-xs text-gray-400 mt-3">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Signing you in</h2>
                        <p className="text-sm text-gray-400 mb-8">via Facebook</p>

                        <div className="space-y-3 text-left">
                            {STEPS.map((label, i) => {
                                const isDone    = i < currentStep || stepStatus === 'done';
                                const isActive  = i === currentStep && stepStatus === 'loading';

                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            isDone   ? 'bg-green-500' :
                                                isActive ? 'bg-[#1877F2]' :
                                                    'bg-gray-200'
                                        }`}>
                                            {isDone ? (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : isActive ? (
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            ) : null}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors duration-300 ${
                                            isDone   ? 'text-green-600' :
                                                isActive ? 'text-gray-800' :
                                                    'text-gray-300'
                                        }`}>
                                            {label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function FacebookCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--header-bg)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <FacebookCallbackHandler />
        </Suspense>
    );
}