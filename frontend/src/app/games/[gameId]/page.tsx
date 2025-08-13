 
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    (async () => {
      try {
        const res = await fetch('/api/nfl-data');
        const games = await res.json();
        const game = games.find((g: any) => String(g.game_id) === gameId);
        if (!game) throw new Error('Game not found');
        const predRes = await fetch('/api/predictions/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ home_team: game.home_team, away_team: game.away_team, week: game.week }) });
        const pred = await predRes.json();
        setData({ game, pred });
      } catch (e:any) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [gameId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;
  const { game, pred } = data;
  const p = pred?.prediction || {};

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{game.away_team} @ {game.home_team}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="font-semibold mb-2">Our Line vs Market</div>
          <div>Spread: {game.home_team} {p.predicted_spread ?? '-'} (Market {game.home_spread})</div>
          <div>Total: {p.predicted_total ?? '-'} (Market {game.total})</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="font-semibold mb-2">Win Probability</div>
          <div>Home win prob: {p.home_win_probability != null ? (p.home_win_probability*100).toFixed(1)+'%' : '-'}</div>
          <div>Confidence: {p.confidence_score != null ? p.confidence_score+'%' : '-'}</div>
          <div>CI: {p.prediction_interval ? `${p.prediction_interval[0]} to ${p.prediction_interval[1]}` : '-'}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="font-semibold mb-2">Key Factors</div>
          <ul className="list-disc pl-5 text-sm">
            {(p.key_factors || []).slice(0,5).map((k:string, i:number) => (<li key={i}>{k}</li>))}
          </ul>
        </div>
      </div>
    </div>
  );
}