"use client";

interface Props {
    price: number;
    discountPrice: number | null;
}

export default function PriceDisplay({ price, discountPrice }: Props) {
    const hasDiscount = discountPrice != null;
    const original    = Number(price);
    const discounted  = discountPrice ?? original;

    return (
        <div className="flex items-center gap-2 pb-2">
            {hasDiscount ? (
                <>
                    <span className="text-[18px] font-black">
                        ${discounted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-400 line-through">
                        ${original.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </>
            ) : (
                <span className="text-[18px] font-black">
                    ${original.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )}
        </div>
    );
}