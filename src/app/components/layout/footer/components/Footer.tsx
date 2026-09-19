"use client";

import {Mail, MapPin, Phone} from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-[#1f2937] text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold md:text-[20px] mb-4">Vendo</h3>
                        <p className="text-[#d1d5db] text-sm">Vendo is your trusted online shopping destination for
                            stylish and quality clothing. We specialize in offering a wide range of fashionable apparel
                            designed to fit every lifestyle. From casual everyday wear to modern trendy styles, Vendo
                            provides clothing that combines comfort, quality, and affordability.</p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-[#d1d5db]">
                            <li>
                                <a href="/about-us">About Us</a>
                            </li>
                            <li>
                                <a href="/contact-us">Contact Us</a>
                            </li>
                            <li>
                                <a href="/faq">FAQ</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4 md:text-[20px]">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-[#d1d5db]">
                            <li>
                                <a href="/returns">Returns</a>
                            </li>
                            <li>
                                <a href="/shipping">Shipping</a>
                            </li>
                            <li>
                                <a href="/support">Support</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4 md:text-[20px]">Contact Us</h3>
                        <div className="space-y-3 text-sm text-[#d1d5db]">

                            <p className="flex items-center gap-3">
                                <Phone size={18} className="text-gray-400"/>
                                <a
                                    href="tel:+88590206072"
                                    className="hover:text-white transition-colors cursor-pointer"
                                >
                                    +885 90 206 072
                                </a>
                            </p>

                            <p className="flex items-center gap-3">
                                <Mail size={18} className="text-gray-400"/>
                                <a
                                    href="mailto:seakeii6072@gmail.com"
                                    className="hover:text-white transition-colors cursor-pointer"
                                >
                                    seakeii6072@gmail.com
                                </a>
                            </p>

                            <p className="flex items-center gap-3">
                                <MapPin size={18} className="text-gray-400"/>
                                <span>St 2, Phnom Penh</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#374151] pt-8 text-center text-[#9ca3af] text-sm">
                    <p>&copy; {currentYear} Vendo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
