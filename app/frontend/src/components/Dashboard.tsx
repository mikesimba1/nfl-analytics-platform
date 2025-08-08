"use client";

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-6">NFL Analytics Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/games" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <h2 className="text-2xl font-semibold">Upcoming Games</h2>
            <p className="text-gray-600 mt-2">Browse all upcoming games and betting odds.</p>
        </Link>
        <Link href="/player-props" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <h2 className="text-2xl font-semibold">Player Props</h2>
            <p className="text-gray-600 mt-2">Analyze player prop bets and find value.</p>
        </Link>
      </div>
    </div>
  );
} 