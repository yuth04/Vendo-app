"use client";

import Image from "next/image";
import {Product, ProductVariant} from "@/src/app/components/modules/products/core/models/productsModel";


interface Props {
    product: Product;
    variantImages: ProductVariant[];
}

export default function DetailsTab({ product, variantImages }: Props) {
    return (
        <div>
            <h3 className="text-lg font-black mb-3">Product Description</h3>
            <p className="text-gray-500 leading-relaxed text-sm max-w-3xl">{product.description}</p>

            {product.variants?.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-black mb-4 text-sm uppercase tracking-widest">Available Variants</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {product.variants.map((v) => {
                            const variantData = variantImages.find((vi) => vi.id === v.id);
                            const thumb = variantData?.images?.find((i) => i.is_primary) ?? variantData?.images?.[0];
                            return (
                                <div
                                    key={v.id}
                                    className="border border-gray-100 rounded-2xl p-3 text-sm input-theme flex gap-3 items-center shadow-sm"
                                >
                                    {thumb && (
                                        <Image
                                            src={thumb.image}
                                            alt={v.color}
                                            width={40}
                                            height={40}
                                            className="object-contain rounded-xl shrink-0"
                                            sizes="40px"
                                        />
                                    )}
                                    <div>
                                        <p className="font-black text-xs py-2">{v.size} / {v.color}</p>
                                        <p className="text-[12px]">Stock: {v.stock}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}