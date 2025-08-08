'use client';

import { useEffect, useState } from 'react';

interface PlayerProp {
  game: string;
  player: string;
  market: string;
  line: number;
  odds: string;
  source: string;
}

export default function PlayerPropsPage() {
  const [props, setProps] = useState<PlayerProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof PlayerProp; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    async function fetchPlayerProps() {
      try {
        const response = await fetch('/api/player-props');
        if (!response.ok) {
          throw new Error('Failed to fetch player props');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProps(data);
        } else {
          // If the API returns a single object, wrap it in an array
          setProps([data]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchPlayerProps();
  }, []);

  const sortedProps = [...props];
  if (sortConfig !== null) {
    sortedProps.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const filteredProps = sortedProps.filter(prop =>
    prop.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.market.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof PlayerProp) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  if (loading) return <div className="text-center p-8">Loading player props...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Player Props</h1>
      <input
        type="text"
        placeholder="Search by player, game, or market..."
        className="mb-4 p-2 border rounded w-full"
        onChange={e => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('game')}>Game</th>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('player')}>Player</th>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('market')}>Market</th>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('line')}>Line</th>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('odds')}>Odds</th>
              <th className="p-3 cursor-pointer" onClick={() => requestSort('source')}>Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredProps.map((prop, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="p-3">{prop.game}</td>
                <td className="p-3 font-medium">{prop.player}</td>
                <td className="p-3">{prop.market}</td>
                <td className="p-3">{prop.line}</td>
                <td className="p-3">{prop.odds}</td>
                <td className="p-3 text-sm text-gray-500">{prop.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 