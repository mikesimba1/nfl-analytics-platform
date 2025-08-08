 
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface GameDetails {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: {
        name: string;
        price: number;
      }[];
    }[];
  }[];
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
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchGameDetails();
  }, [gameId]);

  if (loading) {
    return <div className="text-center p-8">Loading game details...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!game) {
    return <div className="text-center p-8">Game not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-2">{game.away_team} @ {game.home_team}</h1>
      <p className="text-gray-600 mb-8">{new Date(game.commence_time).toLocaleString()}</p>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Betting Odds</h2>
        <div className="space-y-4">
          {game.bookmakers && game.bookmakers.map((bookie) => (
            <div key={bookie.key}>
              <h3 className="text-xl font-semibold text-gray-700">{bookie.title}</h3>
              {bookie.markets.map((market) => (
                <div key={market.key} className="ml-4 mt-2">
                  <h4 className="font-medium">{market.key === 'h2h' ? 'Moneyline' : market.key}</h4>
                  <div className="flex space-x-4">
                    {market.outcomes.map((outcome) => (
                      <div key={outcome.name} className="flex-1 bg-gray-100 p-2 rounded">
                        <p>{outcome.name}</p>
                        <p className="font-bold text-lg">{outcome.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 