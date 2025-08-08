import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
              <div className="flex space-x-4">
                <Link href="/games" className="text-gray-600 hover:text-gray-800">
                  Games
                </Link>
                <Link href="/player-props" className="text-gray-600 hover:text-gray-800">
                  Player Props
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
} 