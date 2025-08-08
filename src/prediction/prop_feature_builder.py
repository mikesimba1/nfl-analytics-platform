"""Prop Feature Builder

For MVP we start with an ultra-simple feature set so we can train a baseline
model quickly:
    • book_line – the sportsbook line (float)
    • category_one_hot – three binary flags: passing, rushing, receiving
    • week – game week (int, 1-18)
    • year – season (int)

Later we’ll add usage, matchup, weather, etc.  This keeps the pipeline moving
without blocking on heavy data joins.

The builder converts season JSONs (created by `props_dk_collector`) into one
Pandas DataFrame ready for LightGBM training.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import List

import pandas as pd

PROPS_DIR = Path("data/raw/props_archive")

CATEGORIES = {
    "player-passing-yards": "pass",
    "player-rushing-yards": "rush",
    "player-receiving-yards": "recv",
}


def _load_season(season: int) -> pd.DataFrame:
    path = PROPS_DIR / f"draftkings_props_{season}.json"
    if not path.exists():
        print(f"⚠️  Season file {path} missing; skipping.")
        return pd.DataFrame()
    df = pd.read_json(path)
    df["season"] = season
    return df


def load_all(seasons: List[int]) -> pd.DataFrame:
    frames = [_load_season(s) for s in seasons]
    df = pd.concat(frames, ignore_index=True)
    if df.empty:
        raise ValueError("No prop data loaded – ensure JSON files exist in props_archive.")
    # Basic clean-ups
    df = df[df["category"].isin(CATEGORIES.keys())].copy()
    df["over_hit"] = (df["outcome"] > df["line"]).astype(int)
    df["cat_pass"] = (df["category"] == "player-passing-yards").astype(int)
    df["cat_rush"] = (df["category"] == "player-rushing-yards").astype(int)
    df["cat_recv"] = (df["category"] == "player-receiving-yards").astype(int)
    df["week"] = df["week"].fillna(0).astype(int)
    return df[[
        "line",
        "cat_pass",
        "cat_rush",
        "cat_recv",
        "week",
        "season",
        "over_hit",
    ]] 