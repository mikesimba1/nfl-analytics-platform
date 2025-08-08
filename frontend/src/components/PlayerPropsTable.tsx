'use client';
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PropRow {
  player: string;
  category: string;
  line: number;
  odds: number;
  edge_pct: number;
  recommendation: string;
}

const PlayerPropsTable: React.FC = () => {
  const [rows, setRows] = useState<PropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/player-props")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.player_props || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading player props…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Stat</th>
          <th>Line</th>
          <th>Odds</th>
          <th>Edge %</th>
          <th>Reco</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={idx}>
            <td>{r.player}</td>
            <td>{r.category.replace("player-", "").replace("-yards", " yds")}</td>
            <td>{r.line}</td>
            <td>{r.odds}</td>
            <td>{r.edge_pct.toFixed(1)}%</td>
            <td>{r.recommendation}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default PlayerPropsTable; 