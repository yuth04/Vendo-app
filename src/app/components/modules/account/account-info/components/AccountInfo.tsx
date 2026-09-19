'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Paperclip, Crop, User as UserIcon, Mail, AlertCircle, X, Check } from 'lucide-react';
import { useNotification } from '@/src/app/components/helpers/components/CustomAlert';
import { CropModal } from './CropModal';
import { User } from "@/src/app/components/modules/account/account-info/core/models/accountInfoModel";
import { accountInfoauthClient } from "@/src/app/components/modules/account/account-info/core/api/accountInfoClient";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";
import { accountInfoService } from "@/src/app/components/modules/account/account-info/core/services/accountInfoService";

const MAX_SIZE_MB    = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const AccountInfo = () => {
    const { showNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user,         setUser]         = useState<User | null>(null);
    const [firstName,    setFirstName]    = useState('');
    const [lastName,     setLastName]     = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nameLoading,  setNameLoading]  = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error,        setError]        = useState<string | null>(null);

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop,   setImageToCrop]   = useState<string | null>(null);

    const isNameChanged = useMemo(() => {
        return accountInfoService.checkIsNameChanged(firstName, lastName, user);
    }, [firstName, lastName, user]);

    useEffect(() => {
        const sync = () => {
            const stored = authService.getStoredUser();
            if (stored) {
                setUser(stored);
                setFirstName(stored.first_name ?? '');
                setLastName(stored.last_name ?? '');
                setPreviewImage(stored.image ?? null);
            }
        };
        sync();
        window.addEventListener('auth-updated', sync);
        return () => window.removeEventListener('auth-updated', sync);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (accountInfoService.isSizeExceeded(file.size, MAX_SIZE_BYTES)) {
            const dynamicMb = accountInfoService.formatFileSizeMb(file.size);
            showNotification(
                `Image must be smaller than ${MAX_SIZE_MB}MB. Your file is ${dynamicMb}MB.`,
                'error',
            );
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageToCrop(reader.result as string);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropApply = (blob: Blob) => {
        const croppedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        setSelectedFile(croppedFile);
        setPreviewImage(URL.createObjectURL(croppedFile));
        setCropModalOpen(false);
    };

    const handleCropCancel = () => {
        setCropModalOpen(false);
        if (!selectedFile && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCancelImage = () => {
        setSelectedFile(null);
        setPreviewImage(user?.image ?? null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError('First name and last name are required.');
            return;
        }

        setNameLoading(true);
        try {
            const updatedUser = await accountInfoauthClient.updateName(firstName.trim(), lastName.trim());
            if (updatedUser) {
                setUser(updatedUser);
                setFirstName(updatedUser.first_name ?? '');
                setLastName(updatedUser.last_name ?? '');
            }
            showNotification('Name updated successfully!', 'success');
        } catch (err: any) {
            const parsedError = accountInfoService.parseNameError(err);
            setError(parsedError);
        } finally {
            setNameLoading(false);
        }
    };

    const handleUploadImage = async () => {
        if (!selectedFile) {
            showNotification('Please select an image first.', 'error');
            return;
        }

        setImageLoading(true);
        setError(null);
        try {
            const updatedUser = await accountInfoauthClient.uploadImage(selectedFile);
            if (updatedUser) {
                setUser(updatedUser);
                setPreviewImage(updatedUser.image ?? previewImage);
            }
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            showNotification('Profile image updated!', 'success');
        } catch (err: any) {
            console.error('[AccountInfo] uploadImage error:', err);
            const msg = err?.response?.data?.message ?? 'Failed to upload image.';
            showNotification(msg, 'error');
            setError(msg);
        } finally {
            setImageLoading(false);
        }
    };

    const userInitial = useMemo(() => accountInfoService.getUserInitial(user), [user]);

    return (
        <>
            {cropModalOpen && imageToCrop && (
                <CropModal
                    imageSrc={imageToCrop}
                    onApply={handleCropApply}
                    onCancel={handleCropCancel}
                />
            )}

            <div className="max-w-4xl mx-auto font-sans">
                {/* Section Header */}
                <div className="mb-8">
                    <h1 className="text-[24px] sm:text-[28px] font-black custom-main-color-text tracking-tight">
                        Account Information
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage your profile details and identity settings.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-700 font-bold">Error Occurred</p>
                            <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Interactive Avatar Upload Panel */}
                    <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.03)] card-theme flex flex-col items-center">
                        <span className="text-[16px] font-extrabold text-gray-400 mb-4 block w-full text-center">
                            Profile Picture
                        </span>

                        <div className="relative mb-5 group">
                            <div className="w-28 h-28 rounded-full bg-[#f3f4f6] p-1.5 shadow-inner border border-gray-100 flex items-center justify-center overflow-hidden relative">
                                {previewImage ? (
                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                        <Image
                                            src={previewImage}
                                            alt="Profile preview"
                                            fill
                                            className="object-cover"
                                            unoptimized={previewImage.startsWith('blob:')}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#009cb9] to-[#007a91] flex items-center justify-center text-white font-black text-2xl uppercase">
                                        {userInitial}
                                    </div>
                                )}
                            </div>

                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={() => setCropModalOpen(true)}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-lg border border-gray-100 transition-transform active:scale-90 cursor-pointer"
                                    title="Crop Image"
                                >
                                    <Crop className="w-4 h-4 custom-main-color-icon" />
                                </button>
                            )}
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-xs font-semibold text-gray-500">Max size: {MAX_SIZE_MB}MB</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, or WEBP formatting</p>
                        </div>

                        {/* Hidden input triggering */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* Layout actions dynamically rendered based on state */}
                        {!selectedFile ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 px-4 card-theme text-[var(--header-text)] text-xs font-extrabold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Paperclip size={14} className="custom-main-color-icon" />
                                Browse Image
                            </button>
                        ) : (
                            <div className="w-full flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleUploadImage}
                                    disabled={imageLoading}
                                    className="w-full py-3 px-4 custom-main-color-button custom-main-color-button-hover text-white text-[14px] font-extrabold  rounded-full transition-all flex items-center justify-center gap-1.5  disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {imageLoading ? 'Uploading...' : 'Save Image'}
                                </button>
                                {!imageLoading && (
                                    <button
                                        type="button"
                                        onClick={handleCancelImage}
                                        className="w-full py-3 px-4 bg-[#fde2e4] hover:bg-[#fcd2d5] text-[#eb5757] text-[14px] font-extrabold  rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Name & Account Detail Inputs */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 p-6 sm:p-8 rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.03)] card-theme">
                        <span className="text-[16px] font-extrabold text-gray-400 mb-6 block">
                            Personal Information
                        </span>

                        <form className="space-y-6" onSubmit={handleSaveName}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {/* First Name input */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-gray-500">
                                        First Name <span className="text-[#EB5757]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={e => { setFirstName(e.target.value); if (error) setError(null); }}
                                            className="w-full border input-theme pl-11 pr-4 py-3 rounded-[20px] bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009cb9]/20 focus:border-[#009cb9] text-sm text-gray-800 font-medium transition-all"
                                            placeholder="Enter first name"
                                        />
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Last Name input */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-gray-500">
                                        Last Name <span className="text-[#EB5757]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={e => { setLastName(e.target.value); if (error) setError(null); }}
                                            className="w-full border input-theme pl-11 pr-4 py-3 rounded-[20px] bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009cb9]/20 focus:border-[#009cb9] text-sm text-gray-800 font-medium transition-all"
                                            placeholder="Enter last name"
                                        />
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Email Display input (Disabled) */}
                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <label className="text-xs font-extrabold text-gray-400">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email ?? ''}
                                            className="w-full border border-gray-200/80 px-4 pl-11 py-3 rounded-[20px] bg-gray-100/70 text-gray-400 text-sm font-medium cursor-not-allowed outline-none select-none"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-0.5 ml-1">
                                        Email identity changes require administrative verification setup.
                                    </p>
                                </div>
                            </div>

                            {/* Save Button Wrapper */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={nameLoading || !isNameChanged}
                                    className="py-3 px-8 custom-main-color-button custom-main-color-border-hover text-white text-[14px] font-extrabold rounded-full transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {nameLoading ? 'Saving...' : (
                                        <>
                                            Save Name
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountInfo;