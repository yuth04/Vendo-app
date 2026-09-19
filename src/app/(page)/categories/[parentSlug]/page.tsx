import React from "react";
import type { Metadata } from "next";
import Categories from "@/src/app/components/modules/categories/components/Categories";


interface Props {
    params: Promise<{ parentSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const parentSlug = resolvedParams?.parentSlug;

    if (!parentSlug) {
        return { title: "Categories" };
    }

    const cleanTitle = parentSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: cleanTitle,
        description: `Explore the finest selection of ${cleanTitle} collection items at Vendo.`,
    };
}

export default async function CategoryParentPage({ params }: Props) {
    const resolvedParams = await params;

    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-6">
            <Categories initialParentSlug={resolvedParams?.parentSlug} />
        </div>
    );
}