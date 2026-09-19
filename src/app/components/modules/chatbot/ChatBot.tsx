"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Smile, Paperclip } from 'lucide-react';
import Image from "next/image";
import chatbot from "@/src/app/components/assets/images/robot-icon-chat-bot.png"

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Draggable position states (offsets from default bottom-right anchoring)
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Refs to track drag vectors and click validity
    const dragStart = useRef({ x: 0, y: 0 });
    const initialClickPos = useRef({ x: 0, y: 0 });

    // Hydrate state from localStorage safely after mounting on the client
    useEffect(() => {
        const savedState = localStorage.getItem('vendo_chatbot_open');
        if (savedState !== null) {
            const parsedState = JSON.parse(savedState);
            setIsOpen(parsedState);

            // Manage background scroll configuration on initial page hydration
            if (parsedState && window.innerWidth < 640) {
                document.body.style.overflow = 'hidden';
            }
        }
        setIsInitialized(true);

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Keep localStorage synchronized whenever the user toggles the bot window
    const handleToggleOpen = (state: boolean) => {
        setIsOpen(state);
        localStorage.setItem('vendo_chatbot_open', JSON.stringify(state));

        // Prevent background body scrolling when the full-screen chat window is open on mobile views
        if (state && window.innerWidth < 640) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    // --- Pointer Drag Event Handlers ---
    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        setIsDragging(false);
        // Track where the drag started relative to the button's current offset position
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        // Track absolute initial coordinates to calculate movement delta on pointer up
        initialClickPos.current = { x: e.clientX, y: e.clientY };

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

        // Check if movement is significant enough to be considered a drag
        const moveDeltaX = Math.abs(e.clientX - initialClickPos.current.x);
        const moveDeltaY = Math.abs(e.clientY - initialClickPos.current.y);

        if (moveDeltaX > 4 || moveDeltaY > 4) {
            setIsDragging(true);
        }

        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;

        // Boundaries: Prevent the button from being dragged entirely out of the viewport
        const minX = -window.innerWidth + 80;
        const maxX = 20;
        const minY = -window.innerHeight + 80;
        const maxY = 20;

        setPosition({
            x: Math.max(minX, Math.min(maxX, newX)),
            y: Math.max(minY, Math.min(maxY, newY))
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);

        // If the user just tapped without dragging across a large area, toggle open
        if (!isDragging) {
            handleToggleOpen(true);
        }
        setIsDragging(false);
    };

    const quickReplies: string[] = [
        "What can this assistant do?",
        "Tell me about your offerings",
        "I have an issue"
    ];

    if (!isInitialized) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans antialiased">
            {/* --- Chat Window --- */}
            {isOpen && (
                /*
                  Updates below convert the window into a clean fixed modal layout across mobile screens
                  while maintaining your exact sizing and round border variables on desktop viewports.
                */
                <div className="fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:w-[400px] h-0 min-h-full sm:min-h-0 sm:h-[600px] bg-white rounded-none sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100/80 animate-in fade-in slide-in-from-bottom-4 duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-100 mt-0.5">
                                <Image
                                    src={chatbot}
                                    alt="Bot Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="font-bold text-gray-800 text-base">Vendo Bot</span>
                        </div>
                        <button
                            onClick={() => handleToggleOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-50 cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Body / Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/40">

                        {/* Incoming Message Container */}
                        <div className="flex items-start gap-3 max-w-[85%] self-start">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-100 mt-0.5">
                                <Image
                                    src={chatbot}
                                    alt="Bot Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 items-start">
                                <div className="bg-white border border-gray-100 text-gray-700 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm font-medium shadow-sm">
                                    Welcome to Platinum Services!
                                </div>

                                <div className="bg-white border border-gray-100 text-gray-700 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm font-medium shadow-sm relative group">
                                    <span>How can I help you today?</span>
                                    <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap inline-block align-bottom font-semibold">4:12 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Push suggestions to the bottom */}
                        <div className="mt-auto flex flex-col items-end gap-2.5 pt-4">
                            {quickReplies.map((reply, index) => (
                                <button
                                    key={index}
                                    className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-bold tracking-wide shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] self-end max-w-[90%] text-right cursor-pointer"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Input Footer */}
                    <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">

                        {/* Attachment Button */}
                        <button
                            type="button"
                            className="w-11 h-11 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                            onClick={() => alert("Upload action triggered")}
                        >
                            <Paperclip size={18} className="rotate-45 text-slate-400" />
                        </button>

                        {/* Interactive Input Container */}
                        <div className="flex-1 relative flex items-center bg-gray-50 rounded-full border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
                            <input
                                type="text"
                                placeholder="Write your message..."
                                className="w-full bg-transparent text-gray-700 placeholder-gray-400 text-sm pl-5 pr-12 py-3.5 focus:outline-none font-medium"
                            />
                            <button
                                type="button"
                                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <Smile size={20} strokeWidth={1.8} />
                            </button>
                        </div>

                        {/* Send Button */}
                        <button className="w-11 h-11 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md shadow-teal-500/10 transition-colors shrink-0 cursor-pointer">
                            <Send size={18} className="translate-x-[1px]" />
                        </button>
                    </div>

                </div>
            )}

            {/* --- Launcher Floating Action Button --- */}
            {!isOpen && (
                <button
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        touchAction: 'none' // Disables native scrolling so dragging functions correctly on touchscreens
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 bg-teal-500 text-white rounded-full flex items-center justify-center fixed bottom-6 right-6 z-50 select-none transition-shadow duration-200 ${
                        isDragging
                            ? 'cursor-grabbing scale-105 shadow-[0_16px_32px_rgba(20,184,166,0.4)]'
                            : 'cursor-grab shadow-[0_12px_24px_rgba(20,184,166,0.3)] hover:shadow-[0_16px_32px_rgba(20,184,166,0.45)] hover:scale-105'
                    }`}
                >
                    <MessageCircle size={26} className="pointer-events-none" />
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white pointer-events-none shadow-sm">
                        1
                    </span>
                </button>
            )}
        </div>
    );
};

export default ChatBot;