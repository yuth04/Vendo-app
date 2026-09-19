'use client';

import React, { useState } from 'react';
import { useNotification } from '@/src/app/components/helpers/components/CustomAlert';
import { changePasswordClient } from "@/src/app/components/modules/account/password/core/api/changePasswordClient";
import { changePasswordService } from "@/src/app/components/modules/account/password/core/services/changePasswordService";

const ChangePassword = () => {
    const { showNotification } = useNotification();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordMismatch = changePasswordService.checkPasswordMismatch(newPassword, newPasswordConfirmation);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== newPasswordConfirmation) {
            setError('New passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await changePasswordClient.changePassword(currentPassword, newPassword, newPasswordConfirmation);
            showNotification('Password changed successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');
        } catch (err: any) {
            const parsedError = changePasswordService.parseErrorMessage(err);
            setError(parsedError);
        } finally {
            setLoading(false);
        }
    };

    const EyeOpen = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    const EyeOff = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01-1.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
    );

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
            <h1 className="text-[24px] sm:text-[28px] font-bold custom-main-color-text">
                Change Password
            </h1>

            <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.02)] card-theme">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Current Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-400">
                            Old Password<span className="text-[#EB5757] ml-0.5">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                required
                                value={currentPassword}
                                onChange={(e) => { setCurrentPassword(e.target.value); if (error) setError(null); }}
                                placeholder=""
                                className="w-full border input-theme px-4 py-3 pr-12 rounded-[20px] bg-gray-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4613C]/10 focus:border-[#E4613C] text-sm text-gray-800 font-medium transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                {showCurrent ? <EyeOpen /> : <EyeOff />}
                            </button>
                        </div>
                    </div>

                    {/* New + Confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* New Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-400">
                                New Password<span className="text-[#EB5757] ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); if (error) setError(null); }}
                                    placeholder=""
                                    className="w-full border input-theme px-4 py-3 pr-12 rounded-[20px] bg-gray-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4613C]/10 focus:border-[#E4613C] text-sm text-gray-800 font-medium transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showNew ? <EyeOpen /> : <EyeOff />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-400">
                                Password Confirmation<span className="text-[#EB5757] ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={newPasswordConfirmation}
                                    onChange={(e) => { setNewPasswordConfirmation(e.target.value); if (error) setError(null); }}
                                    placeholder=""
                                    className={`w-full border px-4 py-3 pr-12 rounded-[20px] bg-gray-50/40 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm text-gray-800 font-medium ${
                                        passwordMismatch
                                            ? 'border-red-300 focus:ring-red-400/10 focus:border-red-400 bg-red-50/10'
                                            : 'input-theme focus:ring-[#E4613C]/10 focus:border-[#E4613C]'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showConfirm ? <EyeOpen /> : <EyeOff />}
                                </button>
                            </div>
                            {passwordMismatch && (
                                <p className="text-xs text-red-500 ml-1 mt-0.5 font-medium">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || passwordMismatch}
                            className="custom-main-color-button custom-main-color-button-hover text-white font-bold py-3 px-10 rounded-full transition-all text-sm tracking-wide shadow-sm/5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] disabled:active:scale-100"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;