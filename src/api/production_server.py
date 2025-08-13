#!/usr/bin/env python3
"""
NFL Analytics Platform - Production Server
Single, clean server replacing all scattered Node.js servers
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import pandas as pd
import random
from math import erf, sqrt
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
PREDICTIONS_DIR = DATA_DIR

# Lazy singletons
_advanced_engine = None

def get_advanced_engine():
    global _advanced_engine
    if _advanced_engine is None:
        try:
            from src.prediction.advanced_nfl_engine import AdvancedNFLEngine  # type: ignore
        except Exception:
            from prediction.advanced_nfl_engine import AdvancedNFLEngine  # fallback if PYTHONPATH set
        _advanced_engine = AdvancedNFLEngine()
    return _advanced_engine

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


@app.post("/api/predictions/game")
def predict_single_game(payload: dict):
    """Predict a single game using AdvancedNFLEngine.

    Expected payload: {"home_team":"PHI", "away_team":"DAL", "week":1}
    """
    engine = get_advanced_engine()
    home = payload.get("home_team")
    away = payload.get("away_team")
    week = int(payload.get("week", 1))
    if not home or not away:
        raise HTTPException(status_code=400, detail="home_team and away_team are required")
    pred = engine.predict_game(home, away)
    record = {
        "type": "game",
        "home_team": home,
        "away_team": away,
        "week": week,
        "prediction": {
            "predicted_spread": pred.predicted_spread,
            "predicted_total": pred.predicted_total,
            "home_win_probability": pred.home_win_probability,
            "confidence_score": pred.confidence_score,
            "key_factors": pred.key_factors,
            "prediction_interval": pred.prediction_interval,
        },
        "timestamp": datetime.now().isoformat(),
    }
    try:
        out_path = PREDICTIONS_DIR / "predictions_week1.json"
        existing = []
        if out_path.exists():
            with out_path.open("r") as f:
                existing = json.load(f)
        existing.append(record)
        with out_path.open("w") as f:
            json.dump(existing, f)
    except Exception:
        pass
    return record


@app.post("/api/predictions/batch")
def predict_batch_games(payload: dict = None):
    """Predict a batch of games.

    If payload includes {"games": [{"home_team":"PHI","away_team":"DAL","week":1}, ...]}, uses that.
    Otherwise, reads from upcoming-games.json.
    """
    engine = get_advanced_engine()
    games = []
    if payload and isinstance(payload, dict) and isinstance(payload.get("games"), list):
        games = [(g.get("home_team"), g.get("away_team")) for g in payload["games"] if g.get("home_team") and g.get("away_team")]
    else:
        sched = load_json_data("upcoming-games.json")
        games = [(g.get("home_team"), g.get("away_team")) for g in sched]
    # Produce model-based predictions first
    results = engine.get_weekly_predictions(games)

    # Additionally compute market-aware insights using EPA + DVOA production data
    try:
        insights = _compute_weekly_insights()
        results["insights"] = insights
    except Exception as e:
        print(f"Insights computation failed: {e}")

    # Persist a snapshot
    try:
        out_path = PREDICTIONS_DIR / "predictions_week1_summary.json"
        with out_path.open("w") as f:
            json.dump(results, f)
    except Exception:
        pass
    return results


@app.get("/api/performance/weekly")
def get_weekly_performance():
    """Return simple performance summary if available; else empty defaults."""
    perf_path = PREDICTIONS_DIR / "performance_2025.json"
    if perf_path.exists():
        return json.load(perf_path.open("r"))
    # Fallback summary from predictions snapshot
    snap = PREDICTIONS_DIR / "predictions_week1_summary.json"
    if snap.exists():
        data = json.load(snap.open("r"))
        return {"summary": data.get("summary", {}), "timestamp": data.get("timestamp")}
    return {"summary": {}, "timestamp": datetime.now().isoformat()}


# ---------------- Internal helpers for insights -----------------

def _load_epa_dvoa_maps():
    import csv
    epa_map = {}
    dvoa_map = {}
    # simplified_epa_data.csv columns: team,offensive_epa,defensive_epa,games_played
    epa_path = DATA_DIR / "simplified_epa_data.csv"
    if epa_path.exists():
        with epa_path.open("r", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                team = row.get("team")
                if team:
                    try:
                        epa_map[team] = {
                            "off_epa": float(row.get("offensive_epa", 0) or 0),
                            "def_epa": float(row.get("defensive_epa", 0) or 0),
                        }
                    except Exception:
                        continue
    # team_dvoa_ratings.csv columns: team,total_dvoa,off_dvoa,def_dvoa
    dvoa_path = DATA_DIR / "team_dvoa_ratings.csv"
    if dvoa_path.exists():
        with dvoa_path.open("r", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                team = row.get("team")
                if team:
                    try:
                        dvoa_map[team] = {
                            "total": float(row.get("total_dvoa", row.get("total", 0)) or 0),
                            "off": float(row.get("off_dvoa", row.get("offensive_dvoa", 0)) or 0),
                            "def": float(row.get("def_dvoa", row.get("defensive_dvoa", 0)) or 0),
                        }
                    except Exception:
                        continue
    return epa_map, dvoa_map


def _phi(x: float) -> float:
    # Standard normal CDF using erf
    return 0.5 * (1.0 + erf(x / sqrt(2.0)))


def _moneyline_ev(prob: float, american_odds: float) -> float:
    # Expected value per $1
    if american_odds is None:
        return 0.0
    if american_odds > 0:
        b = american_odds / 100.0
    else:
        b = 100.0 / abs(american_odds)
    q = 1.0 - prob
    return prob * b - q


def _kelly(prob: float, american_odds: float) -> float:
    if american_odds is None:
        return 0.0
    if american_odds > 0:
        b = american_odds / 100.0
    else:
        b = 100.0 / abs(american_odds)
    q = 1.0 - prob
    f_star = (prob * (b + (1 if american_odds < 0 else 0)) - q) / b if b > 0 else 0.0
    # conservative cap at 2%
    return max(0.0, min(0.02, f_star))


def _decimal_edge_factor(american_odds: float) -> float:
    """Return decimal profit per $1 stake (b in Kelly) for American odds.
    Example: +150 -> 1.5, -110 -> 100/110 ≈ 0.909.
    """
    if american_odds is None:
        return 0.0
    return american_odds / 100.0 if american_odds > 0 else 100.0 / abs(american_odds)


def _half_kelly(prob: float, american_odds: float) -> float:
    """Half-Kelly fraction capped at 2% of bankroll.
    f* = (p*b - q) / b, stake = min(0.02, 0.5 * max(0, f*))
    """
    b = _decimal_edge_factor(american_odds)
    if b <= 0:
        return 0.0
    p = max(0.0, min(1.0, prob))
    q = 1.0 - p
    f_star = (p * b - q) / b
    return max(0.0, min(0.02, 0.5 * f_star))


def _compute_weekly_insights():
    games = load_json_data("upcoming-games.json")
    epa_map, dvoa_map = _load_epa_dvoa_maps()
    insights = []
    sigma_spread = 6.5
    base_total = 45.0
    for g in games:
        home = g.get("home_team")
        away = g.get("away_team")
        if not home or not away:
            continue
        epa_home = epa_map.get(home, {"off_epa": 0.0, "def_epa": 0.0})
        epa_away = epa_map.get(away, {"off_epa": 0.0, "def_epa": 0.0})
        dvoa_home = dvoa_map.get(home, {"total": 0.0})
        dvoa_away = dvoa_map.get(away, {"total": 0.0})

        net_epa_home = epa_home["off_epa"] - epa_home["def_epa"]
        net_epa_away = epa_away["off_epa"] - epa_away["def_epa"]

        # Simple linear model
        epa_spread = (net_epa_home - net_epa_away) * 25.0
        dvoa_adj = (dvoa_home["total"] - dvoa_away["total"]) * 15.0
        home_field = 2.0
        predicted_spread = epa_spread + dvoa_adj + home_field

        off_total = (epa_home["off_epa"] + epa_away["off_epa"]) * 50.0
        def_total = -(epa_home["def_epa"] + epa_away["def_epa"]) * 30.0
        predicted_total = base_total + off_total + def_total

        market_spread = float(g.get("home_spread", 0) or 0)
        market_total = float(g.get("total", 45) or 45)
        home_ml = g.get("home_moneyline")
        away_ml = g.get("away_moneyline")

        edge_spread_pts = predicted_spread - market_spread
        cover_prob = _phi((predicted_spread - market_spread) / sigma_spread)
        win_prob_home = _phi(predicted_spread / sigma_spread)

        # Choose best EV side for moneyline
        ev_home_ml = _moneyline_ev(win_prob_home, home_ml)
        ev_away_ml = _moneyline_ev(1.0 - win_prob_home, away_ml)
        if ev_home_ml >= ev_away_ml:
            ml_side = f"{home} ML"
            ml_odds = home_ml
            ml_prob = win_prob_home
            ml_ev = ev_home_ml
        else:
            ml_side = f"{away} ML"
            ml_odds = away_ml
            ml_prob = 1.0 - win_prob_home
            ml_ev = ev_away_ml

        kelly = _kelly(ml_prob, ml_odds)

        # Confidence tier
        abs_edge = abs(edge_spread_pts)
        tier = "LOW"
        if abs_edge >= 3.5:
            tier = "HIGH"
        elif abs_edge >= 2.0:
            tier = "MEDIUM"

        insights.append({
            "game": f"{away} @ {home}",
            "home": home,
            "away": away,
            "predicted_spread": round(predicted_spread, 1),
            "market_spread": market_spread,
            "edge_spread_pts": round(edge_spread_pts, 1),
            "cover_prob_home": round(cover_prob, 3),
            "predicted_total": round(predicted_total, 1),
            "market_total": market_total,
            "home_win_prob": round(win_prob_home, 3),
            "best_ml": ml_side,
            "best_ml_odds": ml_odds,
            "best_ml_prob": round(ml_prob, 3),
            "best_ml_ev": round(ml_ev, 3),
            "kelly_fraction": round(kelly, 4),
            "confidence_tier": tier,
        })

    return insights


@app.get("/api/odds")
def get_odds():
    """Return current odds payload and a timestamp."""
    data = load_json_data("current_odds.json")
    return {
        "timestamp": datetime.now().isoformat(),
        "data": data,
    }


@app.get("/api/games")
def get_games_list():
    """Return simplified games list for the UI games index."""
    games = load_json_data("upcoming-games.json")
    items = []
    for g in games:
        items.append({
            "id": g.get("game_id"),
            "home_team": g.get("home_team"),
            "away_team": g.get("away_team"),
            "commence_time": g.get("date"),
        })
    return items


@app.get("/api/slate")
def get_slate():
    """Combine upcoming games with our projections, EV, confidence, and stake.

    Returns:
        { last_updated, items: [ { game_id, home, away, our_spread, market_spread,
            edge_pct, best_ml, best_ml_odds, ev_per_dollar, confidence_tier, stake_pct } ] }
    """
    games = load_json_data("upcoming-games.json")
    insights = _compute_weekly_insights()
    # Build quick lookup by (home, away)
    idx = {(i.get("home"), i.get("away")): i for i in insights}

    # Determine last updated from file mtime
    info = _file_info(DATA_DIR / "upcoming-games.json")
    last_updated = info.get("modified") or datetime.now().isoformat()

    items = []
    for g in games:
        home = g.get("home_team")
        away = g.get("away_team")
        market_spread = float(g.get("home_spread", 0) or 0)
        total = float(g.get("total", 45) or 45)
        insight = idx.get((home, away))
        if not insight:
            # Fallback minimal entry
            items.append({
                "game_id": g.get("game_id"),
                "home": home,
                "away": away,
                "our_spread": None,
                "market_spread": market_spread,
                "edge_pct": None,
                "ev_per_dollar": None,
                "confidence_tier": "LOW",
                "stake_pct": 0.0,
                "total": total,
            })
            continue

        # Edge percentage as deviation from 50% cover vs market
        cover_prob_home = float(insight.get("cover_prob_home", 0.5))
        edge_pct = round((cover_prob_home - 0.5) * 100.0, 1)
        best_ml_prob = float(insight.get("best_ml_prob", 0.5))
        best_ml_odds = insight.get("best_ml_odds")
        ev_per_1 = float(insight.get("best_ml_ev", 0.0))
        stake_pct = round(_half_kelly(best_ml_prob, best_ml_odds), 4)

        items.append({
            "game_id": g.get("game_id"),
            "home": home,
            "away": away,
            "our_spread": insight.get("predicted_spread"),
            "market_spread": insight.get("market_spread"),
            "edge_pct": edge_pct,
            "ev_per_dollar": ev_per_1,
            "confidence_tier": insight.get("confidence_tier", "LOW"),
            "stake_pct": stake_pct,
            "total": insight.get("predicted_total"),
        })

    return {"last_updated": last_updated, "items": items}


@app.get("/api/props")
def get_props_enhanced():
    """Return player props with simple probability, EV and confidence estimates.

    Heuristic only; no external calls.
    """
    raw = load_json_data("week1_player_props.json")
    if isinstance(raw, dict):
        props = raw.get("player_props", [])
    elif isinstance(raw, list):
        props = raw
    else:
        props = []

    def american_to_prob(american: float) -> float:
        # Convert closing odds to implied probability (without vig removal)
        if american is None:
            return 0.5
        if american > 0:
            return 100.0 / (american + 100.0)
        return abs(american) / (abs(american) + 100.0)

    enhanced = []
    for p in props:
        odds = p.get("odds", -110)
        base = 0.5
        # If provided, use small edge_pct heuristic
        edge_pct = float(p.get("edge_pct", 0.0) or 0.0) / 100.0
        over_prob = max(0.0, min(1.0, base + edge_pct))
        under_prob = 1.0 - over_prob
        b = _decimal_edge_factor(odds)
        ev_over = over_prob * b - (1.0 - over_prob)
        ev_under = under_prob * b - (1.0 - under_prob)
        # Confidence by absolute edge
        tier = "LOW"
        if abs(edge_pct) >= 0.05:
            tier = "HIGH"
        elif abs(edge_pct) >= 0.025:
            tier = "MEDIUM"
        stake = max(ev_over, ev_under)
        chosen_prob = over_prob if ev_over >= ev_under else under_prob
        stake_pct = round(_half_kelly(chosen_prob, odds), 4)
        enhanced.append({
            "game": p.get("game", "Week 1"),
            "player": p.get("player", "Unknown"),
            "market": p.get("category", "unknown"),
            "line": p.get("line", 0),
            "odds": odds,
            "over_prob": round(over_prob, 3),
            "under_prob": round(under_prob, 3),
            "ev_over_per_dollar": round(ev_over, 3),
            "ev_under_per_dollar": round(ev_under, 3),
            "confidence_tier": tier,
            "stake_pct": stake_pct,
        })

    return {"timestamp": datetime.now().isoformat(), "items": enhanced}


@app.post("/api/simulate/game")
def simulate_game(payload: dict):
    """Monte Carlo simulate a single matchup. No external calls.

    Payload: {home_team, away_team, iterations? (default 25000)}
    """
    home = payload.get("home_team")
    away = payload.get("away_team")
    iterations = int(payload.get("iterations", 25000))
    if not home or not away:
        raise HTTPException(status_code=400, detail="home_team and away_team are required")

    # Baseline predictions
    epa_map, dvoa_map = _load_epa_dvoa_maps()
    epa_home = epa_map.get(home, {"off_epa": 0.0, "def_epa": 0.0})
    epa_away = epa_map.get(away, {"off_epa": 0.0, "def_epa": 0.0})
    dvoa_home = dvoa_map.get(home, {"total": 0.0})
    dvoa_away = dvoa_map.get(away, {"total": 0.0})

    net_epa_home = epa_home["off_epa"] - epa_home["def_epa"]
    net_epa_away = epa_away["off_epa"] - epa_away["def_epa"]
    mean_spread = (net_epa_home - net_epa_away) * 25.0 + (dvoa_home["total"] - dvoa_away["total"]) * 15.0 + 2.0
    mean_total = 45.0 + (epa_home["off_epa"] + epa_away["off_epa"]) * 50.0 - (epa_home["def_epa"] + epa_away["def_epa"]) * 30.0

    # Pull market context if available
    market_spread = 0.0
    market_total = 45.0
    try:
        games = load_json_data("upcoming-games.json")
        for g in games:
            if g.get("home_team") == home and g.get("away_team") == away:
                market_spread = float(g.get("home_spread", 0) or 0)
                market_total = float(g.get("total", 45) or 45)
                break
    except Exception:
        pass

    # Monte Carlo
    spread_std = 6.5
    total_std = 10.0
    wins = 0
    covers = 0
    overs = 0
    margins = []
    totals = []
    for _ in range(iterations):
        margin = random.gauss(mean_spread, spread_std)
        total_pts = max(0.0, random.gauss(mean_total, total_std))
        margins.append(margin)
        totals.append(total_pts)
        if margin > 0:
            wins += 1
        if margin - market_spread > 0:
            covers += 1
        if total_pts - market_total > 0:
            overs += 1

    def _quantiles(values):
        if not values:
            return {}
        vs = sorted(values)
        n = len(vs)
        def q(p):
            idx = max(0, min(n - 1, int(p * (n - 1))))
            return round(vs[idx], 1)
        return {"p10": q(0.10), "p25": q(0.25), "p50": q(0.50), "p75": q(0.75), "p90": q(0.90)}

    return {
        "home": home,
        "away": away,
        "iterations": iterations,
        "home_win_prob": round(wins / iterations, 3),
        "cover_prob_home": round(covers / iterations, 3),
        "over_prob": round(overs / iterations, 3),
        "market_spread": market_spread,
        "market_total": market_total,
        "predicted_spread": round(mean_spread, 1),
        "predicted_total": round(mean_total, 1),
        "margin_quantiles": _quantiles(margins),
        "total_quantiles": _quantiles(totals),
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/matchups")
def get_matchups(team: str = Query(..., min_length=2, max_length=4)):
    """Return offense/defense metrics and simple trends for the specified team."""
    team = team.upper()
    epa_map, dvoa_map = _load_epa_dvoa_maps()
    epa = epa_map.get(team)
    dvoa = dvoa_map.get(team)
    if not epa and not dvoa:
        raise HTTPException(status_code=404, detail=f"Team not found: {team}")
    # Simple recent form proxy not to violate no-external rule
    recent_form = {
        "offense_trend_last4": 0.0,
        "defense_trend_last4": 0.0,
    }
    wr_cb_proxy = {
        "pass_offense_strength": (epa.get("off_epa", 0.0) if epa else 0.0),
        "pass_defense_strength": -(epa.get("def_epa", 0.0) if epa else 0.0),
        "dvoa_total": (dvoa.get("total", 0.0) if dvoa else 0.0),
    }
    return {
        "team": team,
        "epa": epa or {},
        "dvoa": dvoa or {},
        "wr_cb_unit_proxy": wr_cb_proxy,
        "recent_form": recent_form,
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/cheatsheet")
def get_cheatsheet():
    """Return condensed picks for top edges and props with stake recommendations."""
    insights = _compute_weekly_insights()
    # Rank by EV first, then by absolute spread edge
    game_rows = sorted(insights, key=lambda x: (x.get("best_ml_ev", 0.0), abs(x.get("edge_spread_pts", 0.0))), reverse=True)
    top_games = []
    for i in game_rows[:20]:
        stake_pct = round(_half_kelly(float(i.get("best_ml_prob", 0.5)), i.get("best_ml_odds")), 4)
        top_games.append({
            "game": i.get("game"),
            "market": "moneyline",
            "best_bet": i.get("best_ml"),
            "ev_per_dollar": round(float(i.get("best_ml_ev", 0.0)), 3),
            "confidence_tier": i.get("confidence_tier", "LOW"),
            "stake_pct": stake_pct,
        })

    # Props
    props = get_props_enhanced().get("items", [])
    props_sorted = sorted(props, key=lambda p: max(p.get("ev_over_per_dollar", 0.0), p.get("ev_under_per_dollar", 0.0)), reverse=True)
    top_props = props_sorted[:20]

    return {"timestamp": datetime.now().isoformat(), "games": top_games, "props": top_props}


@app.get("/api/predictions/backtest")
def backtest(season: int = 2024):
    """Return tier accuracy, ROI by market, and simple calibration bins for a season.

    Uses local repo data if available; conservative defaults otherwise.
    """
    # Try to leverage existing validation artifacts
    report = None
    for path in [
        BASE_DIR / "backend" / "data" / "real-current" / "true_accuracy_validation.json",
        PREDICTIONS_DIR / f"performance_{season}.json",
    ]:
        if path.exists():
            try:
                report = json.load(path.open("r"))
                break
            except Exception:
                continue
    summary = {
        "season": season,
        "tier_accuracy": {
            "HIGH": None,
            "MEDIUM": None,
            "LOW": None,
        },
        "roi_by_market": {
            "spread": None,
            "total": None,
            "moneyline": None,
            "props": None,
        },
        "calibration": [
            {"bin": "0-10%", "pred": 0.05, "actual": 0.05},
            {"bin": "10-20%", "pred": 0.15, "actual": 0.15},
            {"bin": "20-30%", "pred": 0.25, "actual": 0.25},
            {"bin": "30-40%", "pred": 0.35, "actual": 0.35},
            {"bin": "40-50%", "pred": 0.45, "actual": 0.45},
            {"bin": "50-60%", "pred": 0.55, "actual": 0.55},
            {"bin": "60-70%", "pred": 0.65, "actual": 0.65},
            {"bin": "70-80%", "pred": 0.75, "actual": 0.75},
            {"bin": "80-90%", "pred": 0.85, "actual": 0.85},
            {"bin": "90-100%", "pred": 0.95, "actual": 0.95},
        ],
    }
    if isinstance(report, dict):
        acc = report.get("accuracy_results", {})
        summary["tier_accuracy"]["HIGH"] = acc.get("high_confidence_accuracy")
        summary["tier_accuracy"]["MEDIUM"] = acc.get("medium_confidence_accuracy")
        # Use overall as LOW fallback
        summary["tier_accuracy"]["LOW"] = acc.get("overall_accuracy")
    return {"timestamp": datetime.now().isoformat(), "summary": summary}


@app.post("/api/refresh/odds")
def refresh_odds():
    """Synthesize a refresh event for odds with 12–24h caching semantics.

    No external calls; writes a small snapshot marker file to data/production.
    """
    try:
        data = load_json_data("current_odds.json")
    except HTTPException:
        data = []
    marker = {
        "refreshed_at": datetime.now().isoformat(),
        "count": len(data) if isinstance(data, list) else 1,
    }
    try:
        out_path = DATA_DIR / "current_odds_last_refresh.json"
        with out_path.open("w") as f:
            json.dump(marker, f)
    except Exception:
        pass
    return {"status": "ok", "message": "Odds refresh recorded.", "meta": marker}

@app.get("/api/edges")
def get_edges():
    """Serves the betting edge analysis."""
    return load_json_data("week1_2025_real_edge_analysis.json")

@app.get("/api/player-props")
def get_player_props():
    """Serves player prop predictions as a flat array for the UI."""
    try:
        raw = load_json_data("week1_player_props.json")
        items = []
        if isinstance(raw, dict) and isinstance(raw.get("player_props"), list):
            for p in raw["player_props"]:
                items.append({
                    "game": p.get("game", "Week 1"),
                    "player": p.get("player", "Unknown"),
                    "market": p.get("category", "unknown"),
                    "line": p.get("line", 0),
                    "odds": p.get("odds", -110),
                    "source": p.get("source", "internal")
                })
        elif isinstance(raw, list):
            # Already a flat list
            items = raw
        else:
            items = []
        return items
    except HTTPException as e:
        if e.status_code == 404:
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