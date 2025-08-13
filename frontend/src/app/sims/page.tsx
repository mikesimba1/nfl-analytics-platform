'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Game = { game_id: string; home_team: string; away_team: string };

export default function SimsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [sel, setSel] = useState<string>('');
  const [sim, setSim] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/nfl-data').then(r => r.json()).then((data) => {
      setGames(data.map((g: any) => ({ game_id: g.game_id, home_team: g.home_team, away_team: g.away_team })));
    }).catch(() => setGames([]));
  }, []);

  const runSim = async () => {
    if (!sel) return;
    const [home, away] = sel.split('|');
    setLoading(true);
    setError(null);
    setSim(null);
    try {
      const res = await fetch('/api/simulate/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ home_team: home, away_team: away, iterations: 30000 }) });
      const json = await res.json();
      setSim(json);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Game Simulations</h1>
      <div className="flex items-center gap-3">
        <select className="border rounded p-2" value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="">Select a matchup…</option>
          {games.map(g => (
            <option key={g.game_id} value={`${g.home_team}|${g.away_team}`}>{g.away_team} @ {g.home_team}</option>
          ))}
        </select>
        <button disabled={!sel || loading} onClick={runSim} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{loading ? 'Running…' : 'Run 30k Sim'}</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {sim && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded border bg-white">
            <div className="font-semibold mb-2">Probabilities</div>
            <div>Home win: {(sim.home_win_prob*100).toFixed(1)}%</div>
            <div>Home cover: {(sim.cover_prob_home*100).toFixed(1)}%</div>
            <div>Over {sim.market_total}: {(sim.over_prob*100).toFixed(1)}%</div>
          </div>
          <div className="p-4 rounded border bg-white">
            <div className="font-semibold mb-2">Margin quantiles</div>
            <pre className="text-sm">{JSON.stringify(sim.margin_quantiles, null, 2)}</pre>
          </div>
          <div className="p-4 rounded border bg-white">
            <div className="font-semibold mb-2">Total quantiles</div>
            <pre className="text-sm">{JSON.stringify(sim.total_quantiles, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}


