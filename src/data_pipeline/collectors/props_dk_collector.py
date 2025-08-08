"""DraftKings Prop Archive Collector (stub)

Long-term we will scrape DraftKings archives via Wayback Machine or download a
public CSV dump and normalise to our schema. For now, this collector simply
loads an existing local file if present so the rest of the pipeline can be
developed incrementally.
"""

from pathlib import Path
import json
from typing import Dict, List
import pandas as pd


DATA_DIR = Path("data/raw/props_archive")
DATA_DIR.mkdir(parents=True, exist_ok=True)


CSV_ARCHIVE_PATH = DATA_DIR / "dk_nfl_props_2018_2024.csv"  # placeholder path


def load_historical_props(season: int) -> List[Dict]:
    """Return list of prop dicts for the requested season if available."""
    file_path = DATA_DIR / f"draftkings_props_{season}.json"
    if not file_path.exists():
        print(f"⚠️  No historical prop file for {season} found at {file_path}.")
        return []
    with file_path.open() as f:
        print(f"✅ Loaded historical props for {season} from {file_path}.")
        return json.load(f)


def csv_to_season_json(csv_path: Path = CSV_ARCHIVE_PATH):
    """Convert a single large CSV dump into season-segmented JSON files.

    Expected CSV columns (common in public dumps):
        season (int) - 2018-2024
        week (int)
        player (str)
        team (str)
        stat_type (str) - e.g., pass_yds, rush_yds
        line (float)
        over_odds (int)  - American odds
        under_odds (int)
        outcome (float)  - actual yards
    """
    if not csv_path.exists():
        print(f"⚠️  CSV archive {csv_path} not found. Skipping conversion.")
        return

    df = pd.read_csv(csv_path)
    if "season" not in df.columns:
        raise ValueError("CSV missing required 'season' column")

    for season, season_df in df.groupby("season"):
        out_path = DATA_DIR / f"draftkings_props_{season}.json"
        season_df.to_json(out_path, orient="records")
        print(f"💾 Wrote {len(season_df)} props → {out_path.relative_to(Path.cwd())}") 