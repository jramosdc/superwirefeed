import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NavBar } from "@/components/nav-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperWire — a marketplace for user-created wire services",
  description:
    "Publish and sell content for republication with clear legal rights, fast payments, and source ratings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
            SuperWire — content marketplace for reliable sources
          </footer>
        </Providers>
      </body>
    </html>
  );
}
