"use client";

import React, { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface AOSWrapperProps {
    children: React.ReactNode;
    // Removing the generic object to allow typed deep-merging or plain definitions safely
    config?: Parameters<typeof AOS.init>[0];
}

const AOSWrapper: React.FC<AOSWrapperProps> = ({ children, config = {} }) => {
    // Keep a persistent reference to the timer to prevent asynchronous event leaks
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Safe global initialization
        AOS.init({
            duration: 1000,
            offset: 120,
            easing: "ease-in-out",
            once: true,
            mirror: false,
            // Native built-in mobile detection string or function expression
            disable: "mobile",
            ...config,
        });

        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }

            resizeTimeoutRef.current = setTimeout(() => {
                // If on mobile viewports, don't waste operational cycles calculating layouts
                if (window.innerWidth > 768) {
                    AOS.refreshHard();
                }
            }, 300);
        };

        window.addEventListener("resize", handleResize, { passive: true });

        return () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            window.removeEventListener("resize", handleResize);
        };
        // Keep dependencies clean. Re-run only if configuration reference changes.
    }, [config]);

    return <>{children}</>;
};

export default AOSWrapper;