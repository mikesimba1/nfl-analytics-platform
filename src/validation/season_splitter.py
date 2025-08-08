"""Season Splitter - walk-forward generator to avoid data leakage.

Provides a simple generator that yields (train_index, test_index) tuples for
season-based walk-forward validation.  The pattern is:

    • Train on seasons ≤ (current_season - 1)
    • Test  on current_season

Example
-------
>>> import pandas as pd
>>> from validation.season_splitter import season_walk_forward
>>> df = pd.DataFrame({'season':[2016,2016,2017,2017,2018,2018]})
>>> for train_idx, test_idx in season_walk_forward(df, start_test_season=2018):
...     print(len(train_idx), len(test_idx))
4 2

Intended for use with Pandas DataFrames that already include a `season` column.
"""

from typing import Iterator, Tuple
import pandas as pd


def season_walk_forward(df: pd.DataFrame, *, season_column: str = "season", start_test_season: int) -> Iterator[Tuple[pd.Index, pd.Index]]:
    """Yield train/test indices for walk-forward validation by season.

    Args:
        df: DataFrame containing at least a `season_column`.
        season_column: Column name that stores season (int).
        start_test_season: First season to allocate to the *test* fold. All seasons < this
            are used exclusively for training the first iteration.

    Yields:
        Tuple (train_index, test_index) where each is a Pandas Index referring to df rows.
    """
    if season_column not in df.columns:
        raise ValueError(f"DataFrame is missing required column '{season_column}'.")

    seasons_sorted = sorted(df[season_column].unique())

    if start_test_season not in seasons_sorted:
        raise ValueError("start_test_season must be present in the DataFrame.")

    for season in seasons_sorted:
        if season < start_test_season:
            continue  # Nothing to test yet
        train_mask = df[season_column] < season
        test_mask = df[season_column] == season
        if train_mask.sum() == 0 or test_mask.sum() == 0:
            continue  # Skip if we lack data
        yield df[train_mask].index, df[test_mask].index 