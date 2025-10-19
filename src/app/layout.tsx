import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import UserMenu from "@/components/UserMenu";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Car Purchase Platform",
  description: "Customer ↔ Dealership MVP with hardcoded data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 13l2-5h14l2 5M5 13h14M7 13v4m10-4v4M4 17h16" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block font-semibold">AutoMatch</span>
                <span className="block text-xs text-gray-500">Smart Car Financing</span>
              </span>
            </Link>
            <UserMenu />
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
