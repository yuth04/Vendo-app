"use client";

import React from 'react';
import {Phone, Mail, MapPin} from 'lucide-react';
import Link from 'next/link';

const ContactUs = () => {
    return (
        <div className="max-w-7xl mx-auto sm:py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-10 text-[14px] font-black tracking-[0.2em] text-[var(--header-text)] uppercase ">
                <Link href="/" className="text-[var(--header-text)] cursor-pointer transition-colors">Home</Link>
                <span className="text-[var(--header-text)]">/</span>
                <p className="hover:text-black/70 transition-colors">Contact</p>
            </nav>


            <div className="flex flex-col-reverse lg:flex-row gap-8">

                <div
                    className="w-full lg:w-1/3 card-theme p-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-50">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-10 h-10 custom-main-color-bg rounded-full flex items-center justify-center">
                                <Phone className="text-white w-5 h-5"/>
                            </div>
                            <h3 className="font-bold text-lg">Call</h3>
                        </div>
                        <div className="space-y-3 text-sm font-medium">
                            <p>We are available 24/7, 7 days a week.</p>
                            <p><span className="custom-main-color-text">Phone:</span> +885 90206072</p>
                        </div>
                    </div>

                    <hr className="border-gray-200 mb-8"/>

                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-10 h-10 custom-main-color-bg rounded-full flex items-center justify-center">
                                <Mail className="text-white w-5 h-5"/>
                            </div>
                            <h3 className="font-bold text-lg">Email</h3>
                        </div>
                        <div className="space-y-3 text-sm font-medium">
                            <p>Fill out our form and we will contact you within 24 hours.</p>
                            <p><span className="custom-main-color-text">Emails:</span> seakeii6072@gmail.com</p>
                        </div>
                    </div>

                    <hr className="border-gray-200 mb-8"/>

                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-10 h-10 custom-main-color-bg rounded-full flex items-center justify-center">
                                <MapPin className="text-white w-5 h-5"/>
                            </div>
                            <h3 className="font-bold text-lg">Location</h3>
                        </div>
                        <div className="space-y-3 text-sm font-medium">
                            <p>We are available 24/7, 7 days a week.</p>
                            <p><span className="custom-main-color-text">Location:</span> St 2, Phnom Penh</p>
                        </div>
                    </div>

                </div>

                <div
                    className="w-full lg:w-2/3 card-theme p-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-50">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Your Name *"
                                className="w-full input-theme border-none rounded-[20px] px-4 py-3 text-sm focus:ring-1 focus:ring-[#DB4444] outline-none transition-all"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Your Email *"
                                className="w-full input-theme border-none rounded-[20px] px-4 py-3 text-sm focus:ring-1 focus:ring-[#DB4444] outline-none transition-all"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Your Phone *"
                                className="w-full input-theme border-none rounded-[20px] px-4 py-3 text-sm focus:ring-1 focus:ring-[#DB4444] outline-none transition-all"
                                required
                            />
                        </div>

                        <textarea
                            rows={8}
                            placeholder="Your Message"
                            className="w-full input-theme border-none rounded-[20px] px-4 py-3 text-sm focus:ring-1 focus:ring-[#DB4444] outline-none transition-all resize-none"
                        ></textarea>

                        <div className="flex justify-center md:justify-end w-full">
                            <button
                                type="submit"
                                className="custom-main-color-button custom-main-color-button-hover text-white px-10 py-3 rounded-[20px] font-medium hover:bg-[#c13e3e] active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ContactUs;