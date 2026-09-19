import React from 'react';
import AboutUs from "@/src/app/components/modules/about-us/AboutUs";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'About Us',
};
const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-12">
            <AboutUs/>
        </div>
    );
};

export default Page;