import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "SuperWire — a marketplace for wire services",
    template: "%s · SuperWire",
  },
  description:
    "Publish content under explicit licenses and sell it for republication. Rate and follow reliable sources.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
