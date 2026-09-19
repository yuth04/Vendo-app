import React from "react";
import type { Metadata } from "next";
import Categories from "@/src/app/components/modules/categories/components/Categories";

interface Props {
    params: Promise<{
        parentSlug: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const parentSlug = resolvedParams?.parentSlug;
    const slug = resolvedParams?.slug;

    if (!parentSlug || !slug) {
        return { title: "Category Items" };
    }

    const cleanParent = parentSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const cleanSub = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: `${cleanSub} — ${cleanParent}`,
        description: `Shop premium ${cleanSub} from our curated ${cleanParent} clothing range.`,
    };
}

export default async function CategorySlugPage({ params }: Props) {
    const resolvedParams = await params;

    return (
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-6">
            <Categories
                initialParentSlug={resolvedParams?.parentSlug}
                initialSlug={resolvedParams?.slug}
            />
        </div>
    );
}