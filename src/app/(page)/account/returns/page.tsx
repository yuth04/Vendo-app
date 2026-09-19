import React from 'react';
import Returns from "@/src/app/components/modules/account/returns/Returns";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Order Returns',
};

const Page = () => {
    return (
        <div>
            <Returns/>
        </div>
    );
};

export default Page;