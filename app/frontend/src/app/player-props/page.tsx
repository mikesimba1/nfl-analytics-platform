"use client";

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
  const [sortConfig, setSortConfig] = useState<{ key: keyof PlayerProp; direction: string } | null>(null);

  useEffect(() => {
    async function fetchProps() {
      try {
        const response = await fetch('/api/player-props');
        if (!response.ok) {
          throw new Error('Failed to fetch player props');
        }
        let data = await response.json();
        if (!Array.isArray(data)) {
          // If the API returns a single object, wrap it in an array
          data = [data];
        }
        setProps(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchProps();
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
    prop.player.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof PlayerProp) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Player Props</h1>
      <input
        type="text"
        placeholder="Search by player..."
        className="mb-4 p-2 border rounded w-full"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b cursor-pointer" onClick={() => requestSort('player')}>Player</th>
            <th className="py-2 px-4 border-b cursor-pointer" onClick={() => requestSort('market')}>Market</th>
            <th className="py-2 px-4 border-b cursor-pointer" onClick={() => requestSort('line')}>Line</th>
            <th className="py-2 px-4 border-b">Odds</th>
          </tr>
        </thead>
        <tbody>
          {filteredProps.map((prop, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{prop.player}</td>
              <td className="py-2 px-4 border-b">{prop.market}</td>
              <td className="py-2 px-4 border-b">{prop.line}</td>
              <td className="py-2 px-4 border-b">{prop.odds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 