"""Player Prop Prediction Engine (LightGBM)

This is an MVP skeleton; the heavy lifting (feature assembly, training) will be
implemented incrementally. For now, the engine can load a pre-trained model if
present and expose `predict_over_probability` for a given player prop line.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict

import numpy as np
import lightgbm as lgb  # assuming lightgbm is installed in env

MODEL_DIR = Path("xgboost_model") / "props"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

CATEGORY_TO_MODEL = {
    "player-passing-yards": "pass",
    "player-rushing-yards": "rush",
    "player-receiving-yards": "recv",
}


class PlayerPropEngine:
    _model_cache: Dict[str, lgb.Booster] = {}

    @classmethod
    def get_model(cls, model_key: str) -> lgb.Booster | None:
        if model_key in cls._model_cache:
            return cls._model_cache[model_key]
        model_path = MODEL_DIR / f"{model_key}.txt"
        if not model_path.exists():
            print(f"⚠️  Model file {model_path} not found.")
            return None
        model = lgb.Booster(model_file=str(model_path))
        cls._model_cache[model_key] = model
        return model

    # ---------------------------------------------------------------------
    # Feature engineering – placeholder for now
    # ---------------------------------------------------------------------
    def _build_feature_vector(self, player_game_row: Dict) -> np.ndarray:
        """Translate raw player-game dict to model-ready numpy array (placeholder)."""
        # For MVP we rely on same features the trainer uses
        return np.array([
            player_game_row.get("line", 0),
            1 if player_game_row.get("category") == "player-passing-yards" else 0,
            1 if player_game_row.get("category") == "player-rushing-yards" else 0,
            1 if player_game_row.get("category") == "player-receiving-yards" else 0,
            player_game_row.get("week", 1),
        ]).reshape(1, -1)

    # ---------------------------------------------------------------------
    # Prediction API
    # ---------------------------------------------------------------------
    def predict_over_probability(self, player_game_row: Dict) -> float:
        """Return probability the stat goes OVER the sportsbook line."""
        category = player_game_row.get("category")
        model_key = CATEGORY_TO_MODEL.get(category)
        model = self.get_model(model_key) if model_key else None
        if model is None:
            return 0.5

        prop_line = player_game_row.get("line", 0)
        features = self._build_feature_vector(player_game_row)
        pred_yards = model.predict(features)[0]
        # naive normal assumption with fixed std dev (placeholder)
        sigma = 15.0
        z = (pred_yards - prop_line) / sigma
        # probability yards > line
        from math import erf, sqrt
        prob_over = 0.5 * (1 + erf(z / sqrt(2)))
        return float(prob_over) 