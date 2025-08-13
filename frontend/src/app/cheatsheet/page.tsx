'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function CheatSheetPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlyHigh, setOnlyHigh] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/cheatsheet');
        setData(await res.json());
      } catch (e: any) {
        setError(e?.message || 'Failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const games = useMemo(() => {
    const arr = data?.games || [];
    return arr.filter((g: any) => (onlyHigh ? g.confidence_tier === 'HIGH' : true));
  }, [data, onlyHigh]);

  const props = useMemo(() => data?.props || [], [data]);

  const exportCsv = () => {
    const header = ['type','game','best_bet','ev_per_dollar','confidence_tier','stake_pct'];
    const rows: string[] = [header.join(',')];
    games.forEach((g: any) => rows.push(['game', g.game, g.best_bet, g.ev_per_dollar, g.confidence_tier, g.stake_pct].join(',')));
    props.forEach((p: any) => rows.push(['prop', p.game, `${p.player} ${p.market} ${p.line}`, Math.max(p.ev_over_per_dollar, p.ev_under_per_dollar), p.confidence_tier, p.stake_pct].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cheatsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cheat Sheets</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={onlyHigh} onChange={(e) => setOnlyHigh(e.target.checked)} /> High-confidence only</label>
          <button className="px-3 py-2 rounded bg-gray-800 text-white" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded border overflow-hidden">
          <div className="p-3 font-semibold bg-gray-100">Top Game Edges</div>
          <table className="min-w-full">
            <thead><tr><th className="p-3 text-left">Game</th><th className="p-3 text-left">Best Bet</th><th className="p-3 text-left">EV $/1</th><th className="p-3 text-left">Confidence</th><th className="p-3 text-left">Stake</th></tr></thead>
            <tbody>
              {games.map((g: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{g.game}</td>
                  <td className="p-3">{g.best_bet}</td>
                  <td className="p-3">${g.ev_per_dollar?.toFixed?.(2) ?? g.ev_per_dollar}</td>
                  <td className="p-3">{g.confidence_tier}</td>
                  <td className="p-3">{(g.stake_pct*100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded border overflow-hidden">
          <div className="p-3 font-semibold bg-gray-100">Top Props</div>
          <table className="min-w-full">
            <thead><tr><th className="p-3 text-left">Game</th><th className="p-3 text-left">Player</th><th className="p-3 text-left">Market/Line</th><th className="p-3 text-left">EV $/1</th><th className="p-3 text-left">Confidence</th><th className="p-3 text-left">Stake</th></tr></thead>
            <tbody>
              {props.map((p: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{p.game}</td>
                  <td className="p-3">{p.player}</td>
                  <td className="p-3">{p.market} {p.line}</td>
                  <td className="p-3">${Math.max(p.ev_over_per_dollar, p.ev_under_per_dollar).toFixed(2)}</td>
                  <td className="p-3">{p.confidence_tier}</td>
                  <td className="p-3">{(p.stake_pct*100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


