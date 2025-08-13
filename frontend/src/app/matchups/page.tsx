'use client';

import React, { useEffect, useState } from 'react';

export default function MatchupsPage() {
  const [team, setTeam] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMatchup = async () => {
    if (!team) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/matchups?team=${encodeURIComponent(team)}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Matchups</h1>
      <div className="flex items-center gap-3">
        <input className="border rounded p-2 w-40" placeholder="Team (e.g., PHI)" value={team} onChange={(e) => setTeam(e.target.value.toUpperCase())} />
        <button onClick={fetchMatchup} disabled={!team || loading} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{loading ? 'Loading…' : 'Load'}</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded border bg-white">
            <div className="font-semibold mb-2">EPA</div>
            <pre className="text-sm">{JSON.stringify(data.epa, null, 2)}</pre>
          </div>
          <div className="p-4 rounded border bg-white">
            <div className="font-semibold mb-2">DVOA</div>
            <pre className="text-sm">{JSON.stringify(data.dvoa, null, 2)}</pre>
          </div>
          <div className="p-4 rounded border bg-white">
            <div className="font-semibold mb-2">Recent form (last 4)</div>
            <pre className="text-sm">{JSON.stringify(data.recent_form, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}


