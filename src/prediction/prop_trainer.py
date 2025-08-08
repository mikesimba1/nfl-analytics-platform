"""Prop Trainer

Trains LightGBM binary classifiers for Over probability on passing, rushing, and
receiving yards using the simple features produced by prop_feature_builder.

Usage (manual):
    python -m prediction.prop_trainer

Models are saved to `xgboost_model/props/<stat>.txt`.
"""

from pathlib import Path
from typing import List

import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss, accuracy_score

from prediction.prop_feature_builder import load_all

MODEL_DIR = Path("xgboost_model/props")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

SEASONS = list(range(2018, 2025))  # 2018-2024 inclusive
HOLDOUT_SEASON = 2024

STAT_CATEGORIES = {
    "pass": {
        "cat_col": "cat_pass",
    },
    "rush": {
        "cat_col": "cat_rush",
    },
    "recv": {
        "cat_col": "cat_recv",
    },
}


def train_and_save():
    df = load_all(SEASONS)

    train_df = df[df["season"] < HOLDOUT_SEASON]
    test_df = df[df["season"] == HOLDOUT_SEASON]

    feature_cols = [
        "line",
        "cat_pass",
        "cat_rush",
        "cat_recv",
        "week",
        # season can be sense-checked but excluded to avoid leakage
    ]

    for stat_key, meta in STAT_CATEGORIES.items():
        stat_train = train_df[train_df[meta["cat_col"]] == 1]
        stat_test = test_df[test_df[meta["cat_col"]] == 1]
        if stat_train.empty or stat_test.empty:
            print(f"⚠️  No data for {stat_key}; skipping")
            continue

        X_train = stat_train[feature_cols]
        y_train = stat_train["over_hit"]
        X_test = stat_test[feature_cols]
        y_test = stat_test["over_hit"]

        lgb_train = lgb.Dataset(X_train, y_train)
        lgb_eval = lgb.Dataset(X_test, y_test, reference=lgb_train)

        params = {
            "objective": "binary",
            "metric": "binary_logloss",
            "learning_rate": 0.1,
            "num_leaves": 31,
            "feature_pre_filter": False,
            "seed": 42,
            "lambda_l2": 0.1,
        }

        model = lgb.train(
            params,
            lgb_train,
            valid_sets=[lgb_train, lgb_eval],
            num_boost_round=300,
            verbose_eval=50,
            early_stopping_rounds=30,
        )

        # Evaluation
        y_pred_prob = model.predict(X_test, num_iteration=model.best_iteration)
        brier = brier_score_loss(y_test, y_pred_prob)
        acc = accuracy_score(y_test, (y_pred_prob > 0.5).astype(int))
        print(f"📊 {stat_key.upper()} hold-out 2024: Brier {brier:.3f}, Acc {acc:.3f}")

        # Save model
        model_path = MODEL_DIR / f"{stat_key}.txt"
        model.save_model(str(model_path))
        print(f"💾 Saved {stat_key} model → {model_path.relative_to(Path.cwd())}")


if __name__ == "__main__":
    train_and_save() 