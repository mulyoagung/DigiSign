import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Digital Signature App",
    description: "Sign PDF documents digitally with QR codes",
};

import Provider from "@/components/SessionProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
