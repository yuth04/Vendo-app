"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/src/app/components/modules/products/core/models/productsModel";

interface Props {
    product: Product;
}

export default function ProductBreadcrumb({ product }: Props) {
    const categorySlug = product?.category?.slug ?? product?.category?.name?.toLowerCase() ?? '';

    return (
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-10 uppercase tracking-widest">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/categories/all" className="hover:text-gray-700 transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <Link href={`/categories/${categorySlug}`} className="hover:text-gray-700 transition-colors">
                {product.category?.name}
            </Link>
            <ChevronRight size={12} />
            <span className="line-clamp-1">{product.productName}</span>
        </nav>
    );
}