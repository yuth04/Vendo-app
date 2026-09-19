"use client"

import { Check } from "lucide-react"

export type CheckoutStep = "cart" | "checkout" | "payment"

const STEPS: { key: CheckoutStep; label: string }[] = [
    { key: "cart",     label: "Cart"     },
    { key: "checkout", label: "Checkout" },
    { key: "payment",  label: "Payment"  },
]

const STEP_ORDER: CheckoutStep[] = ["cart", "checkout", "payment"]

export default function CheckoutStepper({ current }: { current: CheckoutStep }) {
    const currentIdx = STEP_ORDER.indexOf(current)

    return (
        <div className="flex items-center justify-center w-full py-10 px-4">
            <div className="flex items-center w-full max-w-2xl">
                {STEPS.map((step, idx) => {
                    const isDone   = idx < currentIdx
                    const isActive = idx === currentIdx
                    const isLast   = idx === STEPS.length - 1

                    return (
                        <div key={step.key} className={`flex items-center ${!isLast ? "flex-1" : ""}`}>

                            {/* Node Container */}
                            <div className="relative flex flex-col items-center">
                                {/* Circle */}
                                <div className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10
                                    ${isDone   ? "bg-[#5BB367]" : ""}
                                    ${isActive ? "bg-white border-[3px] sm:border-[4px] border-[#5BB367]" : ""}
                                    ${!isDone && !isActive ? "bg-[#DBE0EB]" : ""}
                                `}>
                                    {isDone && (
                                        <div className="bg-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                                            <Check size={14} strokeWidth={3} className="text-[#5BB367] sm:hidden" />
                                            <Check size={20} strokeWidth={3} className="text-[#5BB367] hidden sm:block" />
                                        </div>
                                    )}
                                </div>

                                {/* Label */}
                                <div className="absolute top-10 sm:top-12 whitespace-nowrap">
                                    <span className={`text-[11px] sm:text-[15px] font-medium tracking-tight ${
                                        isActive ? "text-[#5BB367]" : "text-gray-400"
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>

                            {/* Thin Connector Line */}
                            {!isLast && (
                                <div className="flex-1 h-[2px] bg-[#EEF0F5] mx-1 sm:mx-[-2px]">
                                    <div
                                        className="h-full bg-[#5BB367] transition-all duration-500"
                                        style={{ width: isDone ? "100%" : "0%" }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}