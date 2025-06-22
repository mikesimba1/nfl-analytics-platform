import json
import numpy as np
import pandas as pd
import warnings
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import nfl_data_py as nfl

warnings.filterwarnings("ignore")

class ResearchProvenAnalyzer:
    def __init__(self):
        print("🔬 INITIALIZING RESEARCH-PROVEN NFL ANALYZER")
        self.feature_weights = {
            "epa_differential": 0.220, "point_differential": 0.165, "dvoa_differential": 0.135,
            "offensive_efficiency": 0.110, "defensive_efficiency": 0.095, "turnover_differential": 0.080,
            "red_zone_efficiency": 0.070, "third_down_conversion": 0.065, "recent_form_4game": 0.055,
            "home_field_advantage": 0.041, "rest_advantage": 0.037, "strength_of_schedule": 0.032,
            "divisional_matchup": 0.028, "weather_impact": 0.025, "injury_impact": 0.022
        }
        self.xgb_params = {
            "learning_rate": 0.1, "max_depth": 5, "min_child_weight": 10, "subsample": 0.7,
            "n_estimators": 250, "objective": "binary:logistic", "random_state": 42, "verbosity": 0
        }
        self.ensemble_weights = {"xgboost": 0.40, "random_forest": 0.30, "logistic": 0.30}
        self.models = {}
        self.is_trained = False
        self.load_data()
    
    def load_data(self):
        print("📊 LOADING DATA SOURCES...")
        with open("data/real-current/upcoming-games.json", "r") as f:
            self.games = json.load(f)
        team_ratings_df = pd.read_csv("../nfl_data/team_ratings.csv")
        self.team_ratings = dict(zip(team_ratings_df["team"], team_ratings_df["rating"]))
        self.get_epa_data()
        self.calculate_dvoa_ratings()
        self.calculate_comprehensive_team_stats()
        print(f"✅ Data loaded: {len(self.games)} games, {len(self.team_ratings)} teams")

if __name__ == "__main__":
    analyzer = ResearchProvenAnalyzer()
    print("Basic initialization complete")
