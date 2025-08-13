'use client';

import React, { useEffect, useState } from 'react';

export default function PerformancePage() {
  const [weekly, setWeekly] = useState<any>(null);
  const [backtest, setBacktest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [w, b] = await Promise.all([
          fetch('/api/performance/weekly').then(r => r.json()),
          fetch('/api/predictions/backtest?season=2024').then(r => r.json()),
        ]);
        setWeekly(w);
        setBacktest(b);
      } catch (e: any) {
        setError(e?.message || 'Failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Performance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded border overflow-hidden">
          <div className="p-3 font-semibold bg-gray-100">Weekly Summary</div>
          <pre className="p-3 text-sm">{JSON.stringify(weekly, null, 2)}</pre>
        </div>
        <div className="bg-white rounded border overflow-hidden">
          <div className="p-3 font-semibold bg-gray-100">Backtest (2024)</div>
          <pre className="p-3 text-sm">{JSON.stringify(backtest, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}


