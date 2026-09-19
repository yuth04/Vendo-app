"use client";

import React from "react";

interface HighlightProps {
    text: string;
    query: string;
}

export default function HighlightedText({ text, query }: HighlightProps) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return <>{text}</>;

    const queryFreq = cleanQuery
        .replace(/\s+/g, '')
        .toLowerCase()
        .split('')
        .reduce<Record<string, number>>((acc, char) => {
            acc[char] = (acc[char] ?? 0) + 1;
            return acc;
        }, {});

    const usedCount: Record<string, number> = {};

    return (
        <>
            {text.split('').map((char, i) => {
                const lower = char.toLowerCase();
                const allowed = queryFreq[lower] ?? 0;
                const used = usedCount[lower] ?? 0;

                if (allowed > 0 && used < allowed) {
                    usedCount[lower] = used + 1;
                    return (
                        <span key={i} className="custom-main-color-text font-black">{char}</span>
                    );
                }
                return <React.Fragment key={i}>{char}</React.Fragment>;
            })}
        </>
    );
}