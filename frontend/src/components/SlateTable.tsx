'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface SlateItem {
  game_id: string;
  home: string;
  away: string;
  our_spread: number | null;
  market_spread: number | null;
  edge_pct: number | null;
  ev_per_dollar: number | null;
  confidence_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  stake_pct: number;
  total: number | null;
}

interface SlateResponse {
  last_updated: string;
  items: SlateItem[];
}

function fmtSpread(team: string, val: number | null | undefined) {
  if (val == null) return '-';
  return `${team} ${val > 0 ? `+${val}` : val}`;
}

function toDollars(ev: number | null | undefined) {
  if (ev == null) return '-';
  return `$${ev.toFixed(2)}`;
}

const SlateTable: React.FC = () => {
  const [data, setData] = useState<SlateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyHigh, setOnlyHigh] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/slate');
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message || 'Failed to load slate');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = useMemo(() => {
    if (!data?.items) return [] as SlateItem[];
    return data.items.filter(i => (onlyHigh ? i.confidence_tier === 'HIGH' : true));
  }, [data, onlyHigh]);

  if (loading) return <div className="text-center p-8">Loading slate…</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!items.length) return <div className="text-center p-8">No games found.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Last updated: {new Date(data!.last_updated).toLocaleString()}</div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={onlyHigh} onChange={(e) => setOnlyHigh(e.target.checked)} />
          High-confidence only
        </label>
      </div>
      <div className="overflow-x-auto bg-white rounded border">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Game</th>
              <th className="p-3">Our Line</th>
              <th className="p-3">Market</th>
              <th className="p-3">Edge</th>
              <th className="p-3">EV $/1</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Stake</th>
            </tr>
          </thead>
          <tbody>
            {items.map((g) => (
              <tr key={g.game_id} className="border-t">
                <td className="p-3">{g.away} @ {g.home}</td>
                <td className="p-3">{fmtSpread(g.home, g.our_spread)}</td>
                <td className="p-3">{fmtSpread(g.home, g.market_spread)}</td>
                <td className="p-3">{g.edge_pct != null ? `${g.edge_pct.toFixed(1)}%` : '-'}</td>
                <td className="p-3">{toDollars(g.ev_per_dollar)}</td>
                <td className="p-3">
                  <span className={
                    g.confidence_tier === 'HIGH'
                      ? 'px-2 py-1 rounded text-white bg-green-600 text-xs'
                      : g.confidence_tier === 'MEDIUM'
                        ? 'px-2 py-1 rounded text-white bg-yellow-600 text-xs'
                        : 'px-2 py-1 rounded text-white bg-gray-500 text-xs'
                  }>
                    {g.confidence_tier}
                  </span>
                </td>
                <td className="p-3">{(g.stake_pct * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlateTable;


