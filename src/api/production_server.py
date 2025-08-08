#!/usr/bin/env python3
"""
NFL Analytics Platform - Production Server
Single, clean server replacing all scattered Node.js servers
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import pandas as pd
import os
import subprocess
import threading
from datetime import datetime

# --- App Initialization ---
app = FastAPI(
    title="NFL Analytics Platform API",
    description="Provides real-time and historical NFL data, predictions, and betting edges.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Allow all origins for local development. For production, this should be restricted.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Directory Configuration ---
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "production"

# --- Utility Functions ---
def load_json_data(filename: str):
    """Safely loads and returns JSON data from the production directory."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        print(f"ERROR: Data file not found at {file_path}")
        raise HTTPException(status_code=404, detail=f"Data file not found: {filename}")
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"ERROR: JSON decoding failed for {filename}")
        raise HTTPException(status_code=500, detail=f"Error decoding JSON from {filename}")
    except Exception as e:
        print(f"ERROR: An unexpected error occurred loading {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

def load_csv_data(filename: str):
    """Safely loads and returns CSV data from the production directory."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        print(f"ERROR: Data file not found at {file_path}")
        raise HTTPException(status_code=404, detail=f"Data file not found: {filename}")
    try:
        return pd.read_csv(file_path).to_dict(orient='records')
    except Exception as e:
        print(f"ERROR: An unexpected error occurred loading {filename}: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


def _file_info(path: Path):
    info = {
        "exists": path.exists(),
    }
    if path.exists():
        try:
            stat = path.stat()
            info.update({
                "size_bytes": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
        except Exception:
            pass
    return info

def _safe_json_load(path: Path):
    try:
        with path.open("r") as f:
            return json.load(f)
    except Exception:
        return None

# --- API Endpoints ---
@app.get("/")
def read_root():
    """A simple root endpoint to confirm the API is running."""
    return {"status": "ok", "message": "NFL Analytics API is running."}


@app.get("/api/health")
def health():
    required = [
        "upcoming-games.json",
        "current_odds.json",
        "week1_2025_real_edge_analysis.json",
        "week1_player_props.json",
        "simplified_epa_data.csv",
        "team_dvoa_ratings.csv",
    ]
    files = {name: _file_info(DATA_DIR / name) for name in required}
    ok = all(v.get("exists") for v in files.values())
    return {
        "ok": ok,
        "version": app.version,
        "files": files,
    }


@app.get("/api/version")
def version():
    commit = None
    try:
        git_dir = BASE_DIR / ".git"
        head_path = git_dir / "HEAD"
        if head_path.exists():
            head = head_path.read_text().strip()
            if head.startswith("ref:"):
                ref = head.split(" ", 1)[1]
                ref_path = git_dir / ref
                if ref_path.exists():
                    commit = ref_path.read_text().strip()[:12]
            else:
                commit = head[:12]
    except Exception:
        pass
    return {"version": app.version, "commit": commit}


@app.get("/api/status")
def status():
    edges = _safe_json_load(DATA_DIR / "week1_2025_real_edge_analysis.json") or {}
    games = _safe_json_load(DATA_DIR / "upcoming-games.json") or []
    props = _safe_json_load(DATA_DIR / "week1_player_props.json") or []
    return {
        "data_summary": {
            "games_count": len(games),
            "edges_count": len(edges.get("betting_opportunities", [])) if isinstance(edges, dict) else 0,
            "props_count": len(props) if isinstance(props, list) else (len(props.get("items", [])) if isinstance(props, dict) else 0),
        },
        "files": {
            "upcoming-games.json": _file_info(DATA_DIR / "upcoming-games.json"),
            "current_odds.json": _file_info(DATA_DIR / "current_odds.json"),
            "week1_2025_real_edge_analysis.json": _file_info(DATA_DIR / "week1_2025_real_edge_analysis.json"),
            "week1_player_props.json": _file_info(DATA_DIR / "week1_player_props.json"),
        },
    }

@app.get("/api/edges")
def get_edges():
    """Serves the betting edge analysis."""
    return load_json_data("week1_2025_real_edge_analysis.json")

@app.get("/api/player-props")
def get_player_props():
    """Serves player prop predictions."""
    # Assuming player props are in a dedicated file. If not, this will need adjustment.
    # For now, pointing to a placeholder name.
    # Let's use the edges file as a placeholder to avoid a 404.
    try:
        return load_json_data("week1_player_props.json")
    except HTTPException as e:
        if e.status_code == 404:
            # If the specific player props file doesn't exist, return an empty list.
            return []
        raise e


@app.get("/api/nfl/games/{year}")
def get_nfl_games(year: int, week: int):
    """Serves upcoming games for a given year and week."""
    games = load_json_data("upcoming-games.json")
    # This is a simple filter. A more robust implementation might be needed.
    return [game for game in games if game.get('week') == week and game.get('season') == year]

@app.get("/api/odds/current")
def get_current_odds():
    """Serves current betting odds."""
    return load_json_data("current_odds.json")

@app.get("/api/odds/status")
def get_odds_status():
    """A simple placeholder for an odds status endpoint."""
    return {"status": "ok", "message": "Odds data is up to date."}


@app.post("/api/predictions/refresh")
def refresh_data():
    """Trigger data refresh using src/data_pipeline/refresh_all.py (non-blocking)."""
    script_path = BASE_DIR / "src" / "data_pipeline" / "refresh_all.py"
    if not script_path.exists():
        raise HTTPException(status_code=500, detail="refresh_all.py not found")

    def _run_refresh():
        try:
            subprocess.run(["python", str(script_path)], cwd=str(BASE_DIR), check=True)
        except Exception as exc:
            print(f"Data refresh failed: {exc}")

    threading.Thread(target=_run_refresh, daemon=True).start()
    return {"status": "started", "message": "Data refresh initiated."}


@app.post("/api/validation/run")
def run_validation():
    """Run pytest on validation tests to check leakage and report result."""
    try:
        result = subprocess.run(["python", str(BASE_DIR / "scripts" / "run_tests.py"), "-q", "tests/test_no_leakage.py"], cwd=str(BASE_DIR), capture_output=True, text=True)
        return {
            "returncode": result.returncode,
            "ok": result.returncode == 0,
            "stdout": result.stdout[-2000:],
            "stderr": result.stderr[-2000:],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/api/nfl-data")
def get_nfl_data():
    """Serves the main game data for the dashboard."""
    return load_json_data("upcoming-games.json")

# --- Server Startup ---
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting NFL Analytics API Server...")
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info") 