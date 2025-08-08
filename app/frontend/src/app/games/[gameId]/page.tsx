"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface GameDetails {
  game_id: string;
  home_team_name: string;
  away_team_name: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  week: number;
  season: number;
  away_moneyline: number;
  home_moneyline: number;
  away_spread: number;
  away_spread_odds: number;
  home_spread: number;
  home_spread_odds: number;
  total: number;
  over_odds: number;
  under_odds: number;
  predictions: {
    home_win: {
      prediction: number;
      probability: number;
      confidence: number;
    };
    spread_cover: {
      prediction: number;
      probability: number;
      confidence: number;
    };
  };
}

export default function DeepDivePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    async function fetchGameDetails() {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchGameDetails();
  }, [gameId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>No game details available.</div>;

  return (
    <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">{game.away_team_name} @ {game.home_team_name}</h1>
        <p className="text-xl text-gray-600 mb-4">{new Date(game.date).toLocaleString()}</p>
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Betting Odds</h2>
                <div className="space-y-2">
                    <p><strong>Moneyline:</strong> {game.home_team_name}: {game.home_moneyline}, {game.away_team_name}: {game.away_moneyline}</p>
                    <p><strong>Spread:</strong> {game.home_team_name}: {game.home_spread} ({game.home_spread_odds}), {game.away_team_name}: {game.away_spread} ({game.away_spread_odds})</p>
                    <p><strong>Total:</strong> Over {game.total} ({game.over_odds}), Under {game.total} ({game.under_odds})</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Model Predictions</h2>
                <div className="space-y-2">
                    <p><strong>Home Win:</strong> {game.predictions.home_win.prediction === 1 ? 'Yes' : 'No'} (Confidence: {game.predictions.home_win.confidence.toFixed(2)})</p>
                    <p><strong>Spread Cover:</strong> {game.predictions.spread_cover.prediction === 1 ? 'Yes' : 'No'} (Confidence: {game.predictions.spread_cover.confidence.toFixed(2)})</p>
                </div>
            </div>
        </div>
    </div>
  );
} 