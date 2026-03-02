import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "9to5 AI Daily Digest",
  description: "High-signal AI news digest, curated daily from 130+ sources",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#0a0a0f] text-gray-100 min-h-screen`}>
        <nav className="border-b border-gray-800 bg-[#0d0d14]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-lg tracking-tight">9to5 AI</span>
              <span className="text-xs text-gray-500 hidden sm:inline">Daily Digest</span>
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition">Latest</Link>
              <Link href="/archive" className="text-gray-400 hover:text-white transition">Archive</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-800 mt-16 py-6 text-center text-xs text-gray-600">
          Powered by tech-news-digest · Data from 130+ sources · Updated daily at 6am AEDT
        </footer>
      </body>
    </html>
  );
}
