"""Edge calculation utilities: odds conversion, vig removal, and edge computation.

This module centralises common logic so that multiple scripts (game edges, player-prop edges, etc.)
can share a single, well-tested implementation. Importing from here avoids duplicating
mathematical details throughout the codebase.
"""

from typing import Tuple, List


# -----------------------------------------------------------------------------
# Odds conversion helpers
# -----------------------------------------------------------------------------

def american_to_prob(american_odds: float) -> float:
    """Convert American odds (e.g. +120, -110) to implied probability (0-1).

    Args:
        american_odds: Positive for plus-money (e.g. +120), negative for favourite (e.g. -150).

    Returns:
        Implied probability 0-1 **with vig still embedded**.
    """
    if american_odds > 0:
        return 100.0 / (american_odds + 100.0)
    else:
        return abs(american_odds) / (abs(american_odds) + 100.0)


def prob_to_american(prob: float) -> int:
    """The inverse of `american_to_prob`. Included for completeness."""
    if prob <= 0 or prob >= 1:
        raise ValueError("Probability must be in (0, 1) open interval")
    if prob > 0.5:
        return int(-prob * 100 / (1 - prob))
    return int((1 - prob) * 100 / prob)


# -----------------------------------------------------------------------------
# Vig removal
# -----------------------------------------------------------------------------

def remove_vig_two_way(prob_side_a: float, prob_side_b: float) -> Tuple[float, float]:
    """Normalise a two-way market to eliminate the bookmaker vig.

    Args:
        prob_side_a: Implied probability for outcome A **with vig**.
        prob_side_b: Implied probability for outcome B **with vig**.

    Returns:
        Tuple of (fair_prob_a, fair_prob_b) such that they sum to exactly 1.0.
    """
    total = prob_side_a + prob_side_b
    if total == 0:
        raise ValueError("Sum of probabilities is zero; check input odds.")
    return prob_side_a / total, prob_side_b / total


# -----------------------------------------------------------------------------
# Edge computation
# -----------------------------------------------------------------------------

def compute_edge(model_prob: float, market_fair_prob: float) -> float:
    """Return edge percentage (+/-) between model and market fair probability.

    Edge = (model – market) * 100; positive means we think outcome is more likely
    than the market, negative means the opposite.
    """
    return (model_prob - market_fair_prob) * 100.0


# -----------------------------------------------------------------------------
# Guardrail helper
# -----------------------------------------------------------------------------

def within_guardrail(edge_pct: float, limit: float = 40.0) -> bool:
    """Return True if absolute edge is inside the accepted limit."""
    return abs(edge_pct) <= limit 