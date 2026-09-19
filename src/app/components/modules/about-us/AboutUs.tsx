"use client";

import React from 'react';
import { ShoppingBag, Zap, ShieldCheck, Globe } from 'lucide-react';
import Link from "next/link";

interface FeatureCardProps {
    icon: React.ReactElement;
    title: string;
    desc: string;
}

const AboutUs = () => {
    return (
        <div className="min-h-screen mt-[-14rem] bg-white">
            {/* Hero Section Banner */}
            <div
                className="relative h-[350px] md:h-[500px] rounded-[10px] flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop')`
                }}
            >
                <div className="text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        About Us
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm md:text-base font-bold opacity-90 tracking-wide uppercase">
                        <Link href="/">
                            <span className="hover:text-teal-400 cursor-pointer transition-colors">Home</span>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="custom-main-color-text text-teal-400">About Us</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Text Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-6 border-l-4 border-teal-500 pl-4 uppercase tracking-tight">
                                About Vendo E-commerce
                            </h2>
                            <h3 className="text-xl font-black text-gray-800 mb-3">Our Story</h3>
                            <p className="text-gray-500 leading-relaxed text-base font-medium">
                                Welcome to <span className="font-black text-gray-900">Vendo</span>, a modern online platform dedicated to providing stylish, high-quality clothing for men and women.
                                Our goal is to make fashion simple, accessible, and enjoyable for everyone by offering a seamless online shopping experience.
                            </p>
                            <p className="text-gray-500 leading-relaxed text-base font-medium mt-3">
                                Vendo was created with a vision to simplify the way people shop for clothes online. We understand that customers want both style and convenience,
                                so we built a platform that combines trendy fashion with fast and easy navigation. From casual wear to fashionable outfits, Vendo brings everything together in one place.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[24px] border-l-4 border-teal-500 shadow-sm">
                            <h3 className="text-xl font-black text-gray-800 mb-2">Our Mission</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                Our mission is to provide customers with a smooth and reliable shopping experience while delivering fashionable clothing at affordable prices.
                                We focus on quality, speed, and customer satisfaction in every step of the journey.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-gray-800 mb-3">Our Vision for the Future</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                We aim to become a trusted online clothing store where customers can always find the latest trends and enjoy a fast,
                                secure, and user-friendly shopping experience.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Key Features Icons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FeatureCard
                            icon={<ShoppingBag className="text-teal-500" />}
                            title="Curated Fashion"
                            desc="Hand-picked styles from the best local and international brands."
                        />
                        <FeatureCard
                            icon={<Zap className="text-amber-500" />}
                            title="Fast Delivery"
                            desc="We ensure your orders reach your doorstep in record time."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-emerald-500" />}
                            title="Secure Payments"
                            desc="Your data and transactions are protected by industry-leading security."
                        />
                        <FeatureCard
                            icon={<Globe className="text-indigo-500" />}
                            title="Global Trends"
                            desc="Bringing the latest global fashion trends directly to the local market."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Feature Cards with Neo-Minimalist 40px highly rounded corners
const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => (
    <div className="p-8 border border-slate-100 rounded-[40px] shadow-sm hover:shadow-md transition-all bg-white flex flex-col items-center text-center group hover:-translate-y-1 duration-300">
        <div className="mb-5 p-4 bg-slate-50 rounded-[24px] group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(icon, { size: 28 } as React.SVGAttributes<SVGElement>)}
        </div>
        <h4 className="font-black text-lg mb-2 text-gray-900 tracking-tight">{title}</h4>
        <p className="text-sm text-gray-400 font-bold leading-relaxed">{desc}</p>
    </div>
);

export default AboutUs;