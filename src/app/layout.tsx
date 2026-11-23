import type { Metadata, Viewport } from "next";
import { Charm, Playfair_Display } from "next/font/google";
import "./globals.css";

// Charm instead of Dancing Script: Dancing Script drops the hook-above
// (dấu hỏi) on letters like "ỉ", "ủ", so "Kỉ niệm" rendered as "Ki niệm".
const script = Charm({
  variable: "--font-charm",
  weight: ["400", "700"],
  subsets: ["latin", "vietnamese"],
});

const serif = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Happy Anniversary",
  description: "Một món quà nhỏ dành cho em ♡",
};

export const viewport: Viewport = {
  themeColor: "#6B0F1A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${script.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
