import json
import shutil
from pathlib import Path

# --- Configuration ---
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARCHIVE_DATA_DIR = BASE_DIR / "_archive" / "data_backup" / "production"
PRODUCTION_DATA_DIR = BASE_DIR / "data" / "production"

# List of essential files we expect to find and copy
ESSENTIAL_FILES = [
    "current_odds.json",
    "simplified_epa_data.csv",
    "team_dvoa_ratings.csv",
    "team-stats.json",
    "upcoming-games.json",
    "week1_2025_real_edge_analysis.json"
]

def main():
    """
    Refreshes all data sources for the production API.
    
    This script now copies the last known "good" data from the archive
    into the live production directory. This replaces the placeholder
    data with real, usable data.
    """
    print("🚀 Starting data pipeline refresh...")

    # Ensure the production directory exists
    PRODUCTION_DATA_DIR.mkdir(parents=True, exist_ok=True)

    # --- Data Restoration from Archive ---
    print(f"🔍 Searching for data in archive: {ARCHIVE_DATA_DIR}")

    if not ARCHIVE_DATA_DIR.exists():
        print("❌ CRITICAL: Archive data directory not found. Cannot populate data.")
        return

    copied_count = 0
    for filename in ESSENTIAL_FILES:
        source_path = ARCHIVE_DATA_DIR / filename
        destination_path = PRODUCTION_DATA_DIR / filename

        if source_path.exists():
            print(f"  -> Found '{filename}'. Copying to production...")
            shutil.copy(source_path, destination_path)
            copied_count += 1
        else:
            print(f"  ⚠️ WARNING: Essential file '{filename}' not found in archive.")

    if copied_count > 0:
        print(f"\n✅ Successfully copied {copied_count} data files to production.")
    else:
        print("\n❌ No data files were copied. The API will not have data.")

    print("\nData pipeline refresh complete.")

if __name__ == "__main__":
    main() 