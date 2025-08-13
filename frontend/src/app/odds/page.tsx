'use client';

import React, { useEffect, useMemo, useState } from 'react';

type OddsDelta = {
  delta_home_spread: number | null;
  delta_total_over: number | null;
};

export default function OddsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/odds');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message || 'Failed to load odds');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    if (!data?.data) return [];
    const deltas: Record<string, OddsDelta> = data?.deltas || {};
    return data.data.map((g: any) => {
      const key = g.id || `${g.home_team}__${g.away_team}`;
      const d = deltas[key] || {};
      return { key, ...g, _delta: d };
    });
  }, [data]);

  const downloadCsv = () => {
    if (!rows.length) return;
    const header = ['home_team','away_team','delta_home_spread','delta_total_over'];
    const lines = [header.join(',')];
    rows.forEach((r: any) => {
      lines.push([
        r.home_team,
        r.away_team,
        r._delta?.delta_home_spread ?? '',
        r._delta?.delta_total_over ?? ''
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'odds_deltas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6">Loading odds…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!rows.length) return <div className="p-6">No odds available.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Odds and Projections</h1>
        <button className="px-3 py-2 rounded bg-gray-800 text-white" onClick={downloadCsv}>Export CSV</button>
      </div>
      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Matchup</th>
              <th className="p-3">Δ Home Spread</th>
              <th className="p-3">Δ Total (Over)</th>
              <th className="p-3">Books</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.key} className="border-t">
                <td className="p-3">{r.away_team} @ {r.home_team}</td>
                <td className="p-3">{r._delta?.delta_home_spread ?? '-'}</td>
                <td className="p-3">{r._delta?.delta_total_over ?? '-'}</td>
                <td className="p-3 text-sm text-gray-600">{(r.bookmakers || []).map((b: any) => b.title).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


