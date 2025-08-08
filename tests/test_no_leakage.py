"""Leakage Sentinel Test

Fails if any training row date is AFTER any test row date for our walk-forward
season splitter. Ensures temporal integrity across the codebase.
"""

import pandas as pd
from validation.season_splitter import season_walk_forward


def test_walk_forward_no_leakage():
    # Minimal synthetic data for quick CI – extend with real CSV if desired.
    dates = pd.date_range("2020-09-01", periods=100, freq="7D")
    df = pd.DataFrame({
        "season": dates.year,
        "dummy": range(100),
    })

    for train_idx, test_idx in season_walk_forward(df, start_test_season=2022):
        assert df.loc[train_idx, "season"].max() < df.loc[test_idx, "season"].min(), "Leakage detected: train has future data" 