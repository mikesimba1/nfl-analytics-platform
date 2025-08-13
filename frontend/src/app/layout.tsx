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

function HealthPill() {
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [ts, setTs] = React.useState<string | null>(null);
  React.useEffect(() => {
    fetch('/api/health').then(r => r.json()).then((h) => {
      setOk(Boolean(h?.ok));
      setTs(new Date().toLocaleTimeString());
    }).catch(() => setOk(null));
  }, []);
  const cls = ok == null ? 'bg-gray-400' : ok ? 'bg-green-600' : 'bg-red-600';
  return <span title={ts || ''} className={`text-white text-xs px-2 py-1 rounded ${cls}`}>{ok == null ? '—' : ok ? 'Healthy' : 'Degraded'}</span>;
}

function RefreshButton() {
  const [busy, setBusy] = React.useState(false);
  return (
    <button
      className="px-2 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
      disabled={busy}
      onClick={async () => {
        try { setBusy(true); await fetch('/api/refresh/odds', { method: 'POST' }); } finally { setBusy(false); }
      }}
    >{busy ? 'Refreshing…' : 'Refresh Odds'}</button>
  );
}