'use client';

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    changeTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>("light");

    // Fix: Ensure the React state explicitly catches up to the DOM setting right away on initial load
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
            document.documentElement.style.colorScheme = savedTheme;
        }
    }, []);

    const changeTheme = () => {
        // 1. Temporarily append a utility class to enable smooth transition animations
        document.documentElement.classList.add("theme-transitioning");

        const newTheme: Theme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        document.documentElement.style.colorScheme = newTheme;

        // 2. Remove the utility class once the 0.3s transition window is complete
        setTimeout(() => {
            document.documentElement.classList.remove("theme-transitioning");
        }, 350);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used inside ThemeProvider");
    return context;
};