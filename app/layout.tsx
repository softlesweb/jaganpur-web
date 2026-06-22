import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const noto = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "जगनपुर छात्र पोर्टल",
  description: "जगनपुर के होनहार छात्रों के लिए — Digital ID, परीक्षा ट्रैकर",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${geist.variable} ${noto.variable}`}>
      <body className="min-h-screen bg-stone-50 antialiased">{children}</body>
    </html>
  );
}
