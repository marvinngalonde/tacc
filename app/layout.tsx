import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/components/providers";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: "TACC PMS",
    description: "Manage your projects with precision",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <ToastProvider />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
