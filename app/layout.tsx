import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Digital Signature App",
    description: "Sign PDF documents digitally with QR codes",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
