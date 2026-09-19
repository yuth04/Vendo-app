import React from 'react';
import ContactUs from "@/src/app/components/modules/contact-us/ContactUs";
import {Metadata} from "next";


export const metadata: Metadata = {
    title: 'Contact Us',
};

const Page = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
           <ContactUs/>
        </div>
    );
};

export default Page;