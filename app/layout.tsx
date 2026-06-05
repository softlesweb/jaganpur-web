import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "जगनपुर ग्राम | Jaganpur Village",
  description: "जगनपुर ग्राम की सूचनाएं, संपर्क और गैलरी",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={geist.variable}>
      <body className="min-h-screen bg-stone-50 font-sans antialiased">{children}</body>
    </html>
  );
}
