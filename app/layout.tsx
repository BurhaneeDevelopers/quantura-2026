import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Quantura - Complete Business Management Suite",
  description: "Complete business management suite for Indian businesses. Inventory, billing, GST compliant, multi-niche support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">

        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" richColors />

      </body>
    </html>
  );
}
