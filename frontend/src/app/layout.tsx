import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import dynamic from "next/dynamic";
const HealthPill = dynamic(() => import("@/components/HealthPill"), { ssr: false });
const RefreshButton = dynamic(() => import("@/components/RefreshButton"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFL Analytics Platform",
  description: "Advanced NFL analytics and betting insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold text-gray-800">
                NFL Analytics
              </Link>
              <div className="flex space-x-4 items-center">
                <Link href="/" className="text-gray-600 hover:text-gray-800">Slate</Link>
                <Link href="/odds" className="text-gray-600 hover:text-gray-800">Odds</Link>
                <Link href="/sims" className="text-gray-600 hover:text-gray-800">Sims</Link>
                <Link href="/matchups" className="text-gray-600 hover:text-gray-800">Matchups</Link>
                <Link href="/cheatsheet" className="text-gray-600 hover:text-gray-800">Cheat Sheet</Link>
                <Link href="/performance" className="text-gray-600 hover:text-gray-800">Performance</Link>
                <HealthPill />
                <RefreshButton />
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
} 

// client-only widgets moved to dynamic imports above