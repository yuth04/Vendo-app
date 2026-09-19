import type React from "react";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

import "@/src/app/components/assets/scss/_customScss.scss";
import "@/src/app/components/assets/tailwind.config.css";

import { NotificationProvider } from "@/src/app/components/helpers/components/CustomAlert";
import { ThemeProvider } from "@/src/app/components/context/ThemeContext";
import { WishlistProvider } from "@/src/app/components/context/Wishlistcontext";
import { AlertProvider } from "@/src/app/components/context/AlertContext";
import { CartProvider } from "@/src/app/components/context/Cartcontext";
import TokenWatcher from "@/src/app/components/helpers/components/TokenWatcher";
import AOSWrapper from "@/src/app/components/helpers/aos/AOSWrapper";
import { Providers } from "./provider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const BASE_URL = "https://vendo-ecommerce-two.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Vendo — Premier Fashion & Trendy Clothing in Phnom Penh",
    template: "%s | Vendo",
  },
  description:
    "Shop premium fashion, trendy clothing, and stylish accessories at Vendo. Discover modern styles with fast delivery in Phnom Penh.",
  keywords: [
    "Vendo",
    "Fashion Cambodia",
    "Clothing Phnom Penh",
    "Online Shopping Cambodia",
    "Trendy Fashion",
    "Fashion Store",
    "Men Clothing",
    "Women Clothing",
    "Streetwear Cambodia",
  ],
  authors: [{ name: "Vendo", url: BASE_URL }],
  creator: "Vendo",
  publisher: "Vendo",
  applicationName: "Vendo",
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Vendo",
    title: "Vendo — Premier Fashion & Trendy Clothing in Phnom Penh",
    description:
      "Shop premium fashion, trendy clothing, and stylish accessories at Vendo. Discover modern styles with fast delivery in Phnom Penh.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1480,
        height: 768,
        alt: "Vendo Fashion Store",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendo — Premier Fashion & Trendy Clothing in Phnom Penh",
    description:
      "Shop premium fashion, trendy clothing, and stylish accessories at Vendo.",
    images: [`${BASE_URL}/og-image.jpg`],
    creator: "@vendo",
    site: "@vendo",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="early-theme-injection"
          dangerouslySetInnerHTML={{
            __html: `
                        (function() {
                            try {
                                var savedTheme = localStorage.getItem('theme') || 'light';
                                document.documentElement.setAttribute('data-theme', savedTheme);
                                document.documentElement.style.colorScheme = savedTheme;
                            } catch (e) {}
                        })();
                    `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
                .theme-transitioning,
                .theme-transitioning body,
                .theme-transitioning body * {
                    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, fill 0.3s ease, stroke 0.3s ease !important;
                }
            `,
          }}
        />
      </head>
      <body
        className={`${roboto.variable} font-[family-name:var(--font-roboto)] antialiased`}
      >
        {" "}
        {/* ← changed */}
        <ThemeProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                <Suspense fallback={null}>
                  <AlertProvider>
                    <TokenWatcher />
                    <Providers>
                      <AOSWrapper>{children}</AOSWrapper>
                    </Providers>
                  </AlertProvider>
                </Suspense>
                <Analytics />
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
