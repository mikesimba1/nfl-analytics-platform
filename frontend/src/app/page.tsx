'use client';

import SlateTable from '@/components/SlateTable';
import { useEffect, useState } from 'react';

function StatusStrip() {
  const [status, setStatus] = useState<any>(null);
  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => setStatus(null));
  }, []);
  if (!status) return null;
  const s = status.data_summary || {};
  return (
    <div className="mb-3 text-sm text-gray-600">Games: {s.games_count ?? '-'} • Edges: {s.edges_count ?? '-'} • Props: {s.props_count ?? '-'} • Updated: {new Date().toLocaleTimeString()}</div>
  );
}

function RefreshControls() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        try { setBusy(true); await fetch('/api/predictions/refresh', { method: 'POST' }); } finally { setBusy(false); }
      }}
      className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
      {busy ? 'Refreshing…' : 'Refresh Data'}
    </button>
  );
}

export default function HomePage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">NFL Game Predictions</h1>
        <RefreshControls />
      </div>
      <StatusStrip />
      <SlateTable />
    </main>
  );
}