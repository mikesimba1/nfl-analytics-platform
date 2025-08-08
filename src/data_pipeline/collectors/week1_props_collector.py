"""Week-1 Player Props Collector

Fetches passing, rushing, receiving yards and anytime TD markets for all NFL
Week-1 2025 games from DraftKings public endpoints (no API key).  Writes a
single consolidated JSON file to `data/current/week1_player_props.json` so that
no further web calls are needed until Week 2.

This collector hits only four URLs, well within any informal rate limits.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List

import requests

OUTPUT_PATH = Path("data/current/week1_player_props.json")
OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

# DraftKings event-group ID for NFL (8867 stays stable). Category keys for props.
CATEGORIES = [
    "player-passing-yards",
    "player-rushing-yards",
    "player-receiving-yards",
    "player-anytime-touchdown",
]

BASE_URL = (
    "https://sportsbook.draftkings.com/sites/US-SB/api/v3/eventgroups/8867"
    "?category={cat}&format=json"
)

HEADERS = {
    "User-Agent": "nfl-analytics-platform/1.0 (+https://example.com)"
}


def fetch_category(cat: str) -> Dict:
    url = BASE_URL.format(cat=cat)
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    print(f"✅ Fetched {cat} props from DraftKings (size {len(resp.content)//1024} KB)")
    return resp.json()


def collect_week1_props() -> List[Dict]:
    """Fetch all four categories and save consolidated list of props."""
    if OUTPUT_PATH.exists():
        print(f"💾 Using cached Week-1 props at {OUTPUT_PATH.relative_to(Path.cwd())}")
        with OUTPUT_PATH.open() as f:
            return json.load(f)

    all_props: List[Dict] = []
    for cat in CATEGORIES:
        data = fetch_category(cat)
        # Navigate JSON: eventGroup > offerCategories > offers > outcomes
        for event in data.get("events", []):
            game_label = event.get("name")  # e.g., "Lions @ Bears"
            game_id = event.get("eventId")
            for offer_cat in event.get("offerCategories", []):
                for subcat in offer_cat.get("offerSubcategoryDescriptors", []):
                    if subcat.get("name") != cat.replace("player-", "").replace("-", " ").title():
                        continue
                    for offer in subcat.get("offerSubcategory", {}).get("offers", []):
                        for outcome in offer:
                            player_name = outcome.get("participant")
                            line = outcome.get("line")
                            odds = outcome.get("oddsAmerican")
                            all_props.append({
                                "game_label": game_label,
                                "game_id": game_id,
                                "category": cat,
                                "player": player_name,
                                "line": line,
                                "odds": odds,
                            })
    # Save
    with OUTPUT_PATH.open("w") as f:
        json.dump({"fetched": datetime.utcnow().isoformat(), "props": all_props}, f)
    print(f"💾 Saved {len(all_props)} props → {OUTPUT_PATH.relative_to(Path.cwd())}")
    return all_props 