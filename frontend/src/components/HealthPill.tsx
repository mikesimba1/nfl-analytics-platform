'use client';

import { useEffect, useState } from 'react';

export default function HealthPill() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [ts, setTs] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then((h) => {
      setOk(Boolean(h?.ok));
      setTs(new Date().toLocaleTimeString());
    }).catch(() => setOk(null));
  }, []);
  const cls = ok == null ? 'bg-gray-400' : ok ? 'bg-green-600' : 'bg-red-600';
  return <span title={ts || ''} className={`text-white text-xs px-2 py-1 rounded ${cls}`}>{ok == null ? '—' : ok ? 'Healthy' : 'Degraded'}</span>;
}


