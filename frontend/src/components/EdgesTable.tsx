'use client';
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EdgeRow {
  game: string;
  edge: number;
  model_prob?: number;
  market_odds?: string;
  recommendation?: string;
}

const EdgesTable: React.FC = () => {
  const [rows, setRows] = useState<EdgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/edges")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.betting_opportunities || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading game edges…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Table>
      <thead>
        <tr>
          <th>Game</th>
          <th>Edge %</th>
          <th>Model Prob</th>
          <th>Market Odds</th>
          <th>Reco</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={idx}>
            <td>{r.game}</td>
            <td>{r.edge.toFixed(1)}%</td>
            <td>{r.model_prob ? (r.model_prob * 100).toFixed(1) + "%" : "-"}</td>
            <td>{r.market_odds || "-"}</td>
            <td>{r.recommendation}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default EdgesTable; 