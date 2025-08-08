"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface Game {
  id: string;
  date: string;
  home_team: string;
  away_team: string;
  home_spread: number;
  away_spread: number;
  home_moneyline: number;
  away_moneyline: number;
  total: number;
}

const Dashboard = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/nfl-data');
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data = await res.json();
        const formattedGames = data.map((game: any) => ({
          id: game.game_id,
          date: game.date,
          home_team: game.home_team,
          away_team: game.away_team,
          home_spread: game.home_spread,
          away_spread: game.away_spread,
          home_moneyline: game.home_moneyline,
          away_moneyline: game.away_moneyline,
          total: game.total,
        }));
        setGames(formattedGames);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <div className="text-center p-8">Loading game data...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!games.length) return <div className="text-center p-8">No games found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">NFL Game Predictions</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Matchup</TableHead>
              <TableHead className="text-right">Spread</TableHead>
              <TableHead className="text-right">Moneyline</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div>{game.away_team} @ {game.home_team}</div>
                </TableCell>
                <TableCell className="text-right">{game.home_team} {game.home_spread > 0 ? `+${game.home_spread}` : game.home_spread}</TableCell>
                <TableCell className="text-right">{game.home_team} {game.home_moneyline}</TableCell>
                <TableCell className="text-right">{game.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard; 