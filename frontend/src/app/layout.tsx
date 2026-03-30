import type { Metadata } from "next";
import { Noto_Serif, Inter, Playfair_Display, EB_Garamond, Lora } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import SideNavWrapper from "@/components/SideNavWrapper";

const notoSerif = Noto_Serif({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-noto-serif",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
});

const garamond = EB_Garamond({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-garamond",
});

const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-lora",
});

export const metadata: Metadata = {
    title: "The Heritage AI",
    description: "Your AI Storyteller",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const fontVars = [
        notoSerif.variable,
        inter.variable,
        playfair.variable,
        garamond.variable,
        lora.variable,
    ].join(" ");

    return (
        <html lang="en" className={fontVars}>
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..300,0..1&display=swap"
                />
            </head>
            <body className="bg-background text-on-surface font-serif selection:bg-secondary/20 selection:text-secondary">
                <ThemeProvider>
                    <SideNavWrapper />
                    <PageTransition>
                        {children}
                    </PageTransition>
                </ThemeProvider>
            </body>
        </html>
    );
}
