import type { Metadata } from "next";

import NotificationProvider from "@/components/ui/NotificationProvider";

import "./globals.css";

export const metadata: Metadata = {
    title: "AllMarket",
    description: "Marketplace online",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-full flex flex-col">
                <NotificationProvider>{children}</NotificationProvider>
            </body>
        </html>
    );
}
