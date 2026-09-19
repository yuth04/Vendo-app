'use client';

import React, { useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

const getCroppedImg = (
    imageSrc: string,
    pixelCrop: PixelCrop,
    rotation = 0,
): Promise<Blob> =>
    new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('No 2d context'));

            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            if (rotation !== 0) {
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);
            }

            ctx.drawImage(
                image,
                pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
                0, 0, pixelCrop.width, pixelCrop.height,
            );

            canvas.toBlob(blob => {
                if (!blob || blob.size === 0)
                    return reject(new Error('Canvas produced an empty blob'));
                resolve(blob);
            }, 'image/jpeg', 0.92);
        };
        image.onerror = () => reject(new Error('Image failed to load'));
        image.crossOrigin = 'anonymous';
        image.src = imageSrc;
    });


interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    displayValue: string;
    onChange: (v: number) => void;
    onDecrement: () => void;
    onIncrement: () => void;
    decrementDisabled?: boolean;
    incrementDisabled?: boolean;
    decrementIcon: React.ReactNode;
    incrementIcon: React.ReactNode;
    fillFromCenter?: boolean;
}

const ControlSlider: React.FC<SliderProps> = ({
                                                  label, value, min, max, step, displayValue,
                                                  onChange, onDecrement, onIncrement,
                                                  decrementDisabled, incrementDisabled,
                                                  decrementIcon, incrementIcon,
                                                  fillFromCenter = false,
                                              }) => {
    const pct = ((value - min) / (max - min)) * 100;
    const midPct = ((0 - min) / (max - min)) * 100;
    const fillLeft = fillFromCenter ? Math.min(pct, midPct) : 0;
    const fillWidth = fillFromCenter ? Math.abs(pct - midPct) : pct;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--header-text)] ">{label}</span>
                <span className="text-xs font-mono text-[var(--header-text)]">{displayValue}</span>
            </div>
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={onDecrement}
                    disabled={decrementDisabled}
                    className="w-7 h-7 flex items-center justify-center rounded-[20px] card-theme disabled:opacity-30 cursor-pointer"
                >
                    {decrementIcon}
                </button>
                <div className="relative flex-1 h-2 rounded-full card-theme">
                    <div
                        className="absolute top-0 h-full rounded-full bg-[#B7E5CD]"
                        style={{
                            left: `${fillLeft}%`,
                            width: `${fillWidth}%`,
                            transition: 'width 0.05s, left 0.05s',
                        }}
                    />
                    <input
                        type="range"
                        min={min} max={max} step={step}
                        value={value}
                        onChange={e => onChange(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <button
                    type="button"
                    onClick={onIncrement}
                    disabled={incrementDisabled}
                    className="w-7 h-7 flex items-center justify-center rounded-[20px] card-theme disabled:opacity-30 cursor-pointer"
                >
                    {incrementIcon}
                </button>
            </div>
        </div>
    );
};


interface CropModalProps {
    imageSrc: string;
    onApply: (blob: Blob) => void;
    onCancel: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({ imageSrc, onApply, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
    const [applying, setApplying] = useState(false);
    const [cropError, setCropError] = useState<string | null>(null);

    const onCropComplete = useCallback((_: unknown, pixels: PixelCrop) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleApply = async () => {
        if (!croppedAreaPixels) return;
        setApplying(true);
        setCropError(null);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            onApply(blob);
        } catch (err) {
            setCropError('Failed to process image.');
            setApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md">
            <div
                className="w-full max-w-[460px] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-[var(--header-bg)] card-theme border border-white/10"
            >
                {/* Header - Fixed height */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[20px] flex items-center justify-center custom-main-color-card">
                            <Crop className="w-4 h-4 custom-main-color-icon" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm leading-tight">Crop Photo</p>
                            <p className="text-xs text-[var(--header-text)] pt-1">Drag · Pinch · Rotate</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-[20px] transition-colors cursor-pointer input-theme">
                        <X className="w-4 h-4 custom-main-color-icon" />
                    </button>
                </div>

                {/* Crop Canvas - Scalable based on screen height */}
                <div className="relative w-full aspect-square min-h-[200px] max-h-[40vh] bg-black/40">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{
                            cropAreaStyle: {
                                border: '2.5px solid #B7E5CD',
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                            },
                        }}
                    />
                </div>

                {/* Controls Area - Scrollable if the inspector takes too much space */}
                <div className="px-5 py-5 space-y-5 overflow-y-auto flex-1 min-h-0 border-t border-white/5">
                    <ControlSlider
                        label="Zoom"
                        value={zoom}
                        min={1} max={3} step={0.01}
                        displayValue={`${zoom.toFixed(2)}×`}
                        onChange={setZoom}
                        onDecrement={() => setZoom(z => Math.max(1, z - 0.1))}
                        onIncrement={() => setZoom(z => Math.min(3, z + 0.1))}
                        decrementDisabled={zoom <= 1}
                        incrementDisabled={zoom >= 3}
                        decrementIcon={<ZoomOut className="w-3.5 h-3.5 custom-main-color-icon" />}
                        incrementIcon={<ZoomIn className="w-3.5 h-3.5 custom-main-color-icon" />}
                    />

                    <ControlSlider
                        label="Rotation"
                        value={rotation}
                        min={-180} max={180} step={1}
                        displayValue={`${rotation}°`}
                        onChange={setRotation}
                        onDecrement={() => setRotation(r => Math.max(-180, r - 5))}
                        onIncrement={() => setRotation(r => Math.min(180, r + 5))}
                        decrementDisabled={rotation <= -180}
                        incrementDisabled={rotation >= 180}
                        decrementIcon={<span className="text-sm font-bold custom-main-color-icon">−</span>}
                        incrementIcon={<span className="text-sm font-bold custom-main-color-icon">+</span>}
                        fillFromCenter
                    />

                    {cropError && <p className="text-xs text-red-400 text-center">{cropError}</p>}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); }}
                            className="w-11 h-11 flex items-center justify-center rounded-[30px] card-theme border cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4 custom-main-color-icon" />
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 h-11 rounded-[20px] font-medium text-sm input-theme border border-white/10 text-white/50 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={applying || !croppedAreaPixels}
                            className="flex-[1.5] h-11 rounded-[20px] font-semibold text-sm text-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center custom-main-color-button custom-main-color-button-hover cursor-pointer"
                        >
                            {applying ? 'Applying...' : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};