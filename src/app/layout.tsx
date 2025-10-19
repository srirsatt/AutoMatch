import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Car Purchase Platform",
  description: "Customer ↔ Dealership MVP with hardcoded data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b p-4 flex gap-6">
          <Link href="/" className="font-medium">Home</Link>
          <Link href="/customer/onboarding">Customer</Link>
          <Link href="/dealer/dashboard">Dealership</Link>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
