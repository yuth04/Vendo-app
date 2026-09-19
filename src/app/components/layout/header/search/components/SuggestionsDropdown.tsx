"use client";

import React from "react";
import { Clock, X, ShoppingBag, Search } from "lucide-react";
import HighlightedText from "./highlight";

interface SuggestionItem {
    productName: string;
    image: string;
}

interface SuggestionsDropdownProps {
    suggestions: SuggestionItem[];
    history: string[];
    query: string;
    onSelect: (name: string) => void;
    onDeleteHistory: (term: string) => void;
    onClearAllHistory: () => void;
    visible: boolean;
}

export default function SuggestionsDropdown({
                                                suggestions,
                                                history,
                                                query,
                                                onSelect,
                                                onDeleteHistory,
                                                onClearAllHistory,
                                                visible
                                            }: SuggestionsDropdownProps) {
    if (!visible) return null;

    const hasTyped        = query.trim().length > 0;
    const showHistory     = !hasTyped && history.length > 0;
    const showSuggestions = hasTyped && suggestions.length > 0;
    const showNotFound    = hasTyped && suggestions.length === 0;

    if (!showHistory && !showSuggestions && !showNotFound) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 z-[200] rounded-[20px] overflow-hidden
                        border border-[var(--border-color)] bg-[var(--header-bg)] shadow-xl max-h-80 overflow-y-auto">

            {/* ── SEARCH HISTORY SECTION ── */}
            {showHistory && (
                <div className="flex flex-col">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                        <div className="flex items-center gap-2 text-gray-500 font-bold text-[14px]">
                            <Clock size={14} />
                            <span>Search History</span>
                        </div>
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); onClearAllHistory(); }}
                            className="text-red-600 hover:text-red-700 font-black text-[12px] cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>
                    <ul className="divide-y divide-[var(--border-color)] pb-2">
                        {history.map((term, i) => (
                            <li key={i} className="flex items-center justify-between px-4 py-2 hover:bg-[var(--border-color)] transition-colors group">
                                <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); onSelect(term); }}
                                    className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                                >
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="text-[14px] font-black text-[var(--header-text)] truncate">{term}</span>
                                </button>
                                <button
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteHistory(term); }}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── PRODUCT SUGGESTIONS SECTION ── */}
            {showSuggestions && (
                <ul className="divide-y divide-[var(--border-color)]">
                    {suggestions.map((item, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); onSelect(item.productName); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left
                                           hover:bg-[var(--border-color)] transition-colors group"
                            >
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-[var(--border-color)] flex items-center justify-center relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.productName} className="h-full w-full object-contain" />
                                    ) : (
                                        <ShoppingBag size={14} className="text-gray-300" />
                                    )}
                                </div>
                                <span className="text-[14px] font-semibold text-[var(--header-text)] truncate flex-1">
                                    <HighlightedText text={item.productName} query={query} />
                                </span>
                                <Search size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0 ml-auto" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* ── NOT FOUND FALLBACK STATE ── */}
            {showNotFound && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-gray-500/10 border border-[var(--border-color)] flex items-center justify-center text-gray-400">
                        <Search size={20} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[14px] font-black text-[var(--header-text)]">
                            No products found
                        </p>
                        <p className="text-[11px] font-medium text-gray-400 max-w-[200px] mt-0.5 leading-tight">
                            We couldn't find matches for "{query}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}