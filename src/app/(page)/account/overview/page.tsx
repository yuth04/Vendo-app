import React from 'react';
import Overview from "@/src/app/components/modules/account/Overview/Overview";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Overview',
};

const Page = () => {
    return (
        <div>
            <Overview/>
        </div>
    );
};

export default Page;