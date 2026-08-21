import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { InfinityEffectsManager } from "@/components/effects/InfinityEffectsManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ironmanFont = Bebas_Neue({
  weight: "400",
  variable: "--font-ironman",
  subsets: ["latin"],
});

import { Anton, Bebas_Neue } from "next/font/google";

const captainFont = Anton({
  weight: "400",
  variable: "--font-captain",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prasetyo Bintang - Portfolio",
  description: "Portfolio of Prasetyo Bintang, Developer & Data Analyst",
  icons: {
    icon: "/Logo%20Prasetyo.svg",
    shortcut: "/Logo%20Prasetyo.svg",
    apple: "/Logo%20Prasetyo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ironmanFont.variable} ${captainFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
        <InfinityEffectsManager />
        <SmoothScroll>
          <main id="main-content">
            {children}
          </main>
        </SmoothScroll>
      </body>
    </html>
  );
}
