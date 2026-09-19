import React from 'react';
import type { Metadata } from 'next';
import Promotions from "@/src/app/components/modules/promotions/components/Promotions";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
        return {
            title: "Promotions",
        };
    }

    const cleanTitle = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: `${cleanTitle} Details`,
        description: `View details, terms, and items available for our ${cleanTitle} promotion event.`,
    };
}

const Page = async ({ params }: PageProps) => {
    const resolvedParams = await params;

    return (
        <div className="max-w-7xl mx-auto px-4">
            <Promotions initialSlug={resolvedParams?.slug} />
        </div>
    );
};

export default Page;