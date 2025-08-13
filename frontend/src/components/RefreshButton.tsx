'use client';

import { useState } from 'react';

export default function RefreshButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="px-2 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
      disabled={busy}
      onClick={async () => {
        try { setBusy(true); await fetch('/api/refresh/odds', { method: 'POST' }); } finally { setBusy(false); }
      }}
    >{busy ? 'Refreshing…' : 'Refresh Odds'}</button>
  );
}


