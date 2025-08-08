"""Odds Collector

Fetches NFL game odds (including player props if requested) from The Odds API
while respecting the free tier limit (500 calls/month). Responses are cached to
disk so subsequent invocations within the cache window do not hit the API.

Environment variables:
    ODDS_API_KEY  -- your TheOddsAPI key (free tier works)

Example
-------
>>> from datetime import date
>>> from data_pipeline.collectors.odds_collector import collect_game_odds
>>> collect_game_odds(date.today())
"""

from __future__ import annotations

import os
import json
import time
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Any, Dict

import requests

CACHE_DIR = Path("data/current")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

CACHE_WINDOW_HOURS = 24 * 7  # one week cache; we only need Week-1 lines once
API_ENDPOINT = "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds"


def _cache_path(for_date: date) -> Path:
    return CACHE_DIR / f"odds_{for_date.isoformat()}.json"


def _is_cache_fresh(path: Path) -> bool:
    if not path.exists():
        return False
    age = datetime.utcnow() - datetime.utcfromtimestamp(path.stat().st_mtime)
    return age < timedelta(hours=CACHE_WINDOW_HOURS)


def _fetch_odds_from_api(query_date: date) -> Dict[str, Any]:
    api_key = os.getenv("ODDS_API_KEY")
    if not api_key:
        raise EnvironmentError("ODDS_API_KEY environment variable not set.")

    params = {
        "apiKey": api_key,
        "regions": "us",
        "markets": "h2h,spreads,totals,player_pass_yds,player_rush_yds,player_rec_yds",  # props optional
        "oddsFormat": "american",
        "dateFormat": "iso",
        "date": query_date.isoformat(),
    }

    resp = requests.get(API_ENDPOINT, params=params, timeout=30)
    resp.raise_for_status()
    remaining = resp.headers.get("x-requests-remaining")
    print(f"✅ Odds API call successful. Requests remaining this month: {remaining}.")
    return resp.json()


def collect_game_odds(query_date: date, *, use_cache: bool = True) -> Dict[str, Any]:
    """Return odds JSON for the requested date, using cache if available."""
    path = _cache_path(query_date)

    if use_cache and _is_cache_fresh(path):
        with path.open("r") as f:
            print(f"💾 Loaded cached odds for {query_date}.")
            return json.load(f)

    print(f"🌐 Fetching odds for {query_date} from API…")
    data = _fetch_odds_from_api(query_date)
    with path.open("w") as f:
        json.dump(data, f)
    print(f"💾 Cached odds to {path.relative_to(Path.cwd())} (valid {CACHE_WINDOW_HOURS} h).")
    return data 