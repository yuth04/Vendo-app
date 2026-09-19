import React from 'react';
import Address from "@/src/app/components/modules/account/address/components/Address";
import {Metadata} from "next";


export const metadata: Metadata = {
    title: 'Address',
};

const Page = () => {
    return (
        <div>
            <Address/>
        </div>
    );
};

export default Page;