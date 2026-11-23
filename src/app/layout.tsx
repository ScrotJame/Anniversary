import type { Metadata, Viewport } from "next";
import { Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

const script = Dancing_Script({
  variable: "--font-dancing",
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
