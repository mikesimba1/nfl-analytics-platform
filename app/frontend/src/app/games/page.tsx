"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Game {
  game_id: string;
  home_team: string;
  away_team: string;
  date: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upcoming Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link key={game.game_id} href={`/games/${game.game_id}`} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow block">
            <h2 className="text-xl font-semibold">{game.away_team} @ {game.home_team}</h2>
            <p className="text-gray-600">{new Date(game.date).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 