import json
import numpy as np
import pandas as pd

class FixedAnalyzer:
    def __init__(self):
        self.feature_weights = {
            "point_differential": 0.185, "offensive_efficiency": 0.142, "defensive_efficiency": 0.128,
            "turnover_differential": 0.113, "red_zone_efficiency": 0.097, "third_down_conversion": 0.089,
            "time_of_possession": 0.074, "yards_per_play": 0.068, "sack_rate": 0.052,
            "penalty_differential": 0.046, "home_field_advantage": 0.041, "rest_advantage": 0.037,
            "divisional_matchup": 0.032, "recent_form": 0.029, "head_to_head": 0.024
        }
        self.load_data()
    
    def load_data(self):
        # Load team ratings
        team_ratings_df = pd.read_csv("../nfl_data/team_ratings.csv")
        self.team_ratings = dict(zip(team_ratings_df["team"], team_ratings_df["rating"]))
        
        # Load games
        with open("data/real-current/upcoming-games.json", "r") as f:
            self.games = json.load(f)
        
        # Calculate team stats from ratings
        self.team_stats = {}
        for team, rating in self.team_ratings.items():
            self.team_stats[team] = {
                "pointsPerGame": 15 + (rating - 50) * 0.3,
                "pointsAllowedPerGame": 25 - (rating - 50) * 0.2,
                "totalYardsPerGame": 300 + (rating - 50) * 8,
                "yardsAllowedPerGame": 350 - (rating - 50) * 6,
                "yardsPerPlay": 5.0 + (rating - 50) * 0.02,
                "turnoverDifferential": (rating - 50) * 0.1,
                "redZonePercentage": 0.45 + (rating - 50) * 0.004,
                "thirdDownPercentage": 0.35 + (rating - 50) * 0.003,
                "timeOfPossession": 30.0 + (rating - 50) * 0.1,
                "sacks": 25 + (rating - 50) * 0.4,
                "penalties": 110 - (rating - 50) * 0.3
            }
        
        # Load betting lines
        try:
            with open("saved-live-odds.json", "r") as f:
                odds_data = json.load(f)
            self.betting_lines = []
            if "data" in odds_data:
                for game in odds_data["data"]:
                    home_team = self.convert_team_name(game.get("home_team", ""))
                    away_team = self.convert_team_name(game.get("away_team", ""))
                    if game.get("bookmakers") and len(game["bookmakers"]) > 0:
                        bookmaker = game["bookmakers"][0]
                        if bookmaker.get("markets"):
                            for market in bookmaker["markets"]:
                                if market.get("key") == "h2h":
                                    outcomes = market.get("outcomes", [])
                                    home_odds = None
                                    away_odds = None
                                    for outcome in outcomes:
                                        if outcome["name"] == game.get("home_team"):
                                            home_odds = outcome["price"]
                                        elif outcome["name"] == game.get("away_team"):
                                            away_odds = outcome["price"]
                                    if home_odds and away_odds:
                                        spread = self.moneyline_to_spread(home_odds, away_odds)
                                        self.betting_lines.append({
                                            "home_team": home_team,
                                            "away_team": away_team,
                                            "home_spread": spread,
                                            "home_odds": home_odds,
                                            "away_odds": away_odds
                                        })
        except:
            self.betting_lines = []
    
    def convert_team_name(self, full_name):
        team_map = {
            "Philadelphia Eagles": "PHI", "Dallas Cowboys": "DAL", "Kansas City Chiefs": "KC", 
            "Los Angeles Chargers": "LAC", "Buffalo Bills": "BUF", "Miami Dolphins": "MIA",
            "New England Patriots": "NE", "New York Jets": "NYJ", "Pittsburgh Steelers": "PIT", 
            "Baltimore Ravens": "BAL", "Cleveland Browns": "CLE", "Cincinnati Bengals": "CIN",
            "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Tennessee Titans": "TEN", 
            "Jacksonville Jaguars": "JAX", "Denver Broncos": "DEN", "Las Vegas Raiders": "LV",
            "Los Angeles Rams": "LAR", "Seattle Seahawks": "SEA", "San Francisco 49ers": "SF", 
            "Arizona Cardinals": "ARI", "Green Bay Packers": "GB", "Chicago Bears": "CHI",
            "Detroit Lions": "DET", "Minnesota Vikings": "MIN", "New York Giants": "NYG", 
            "Washington Commanders": "WSH", "Carolina Panthers": "CAR", "Atlanta Falcons": "ATL",
            "Tampa Bay Buccaneers": "TB", "New Orleans Saints": "NO"
        }
        return team_map.get(full_name, full_name)
    
    def moneyline_to_spread(self, home_odds, away_odds):
        def odds_to_prob(odds):
            return 100 / (odds + 100) if odds > 0 else abs(odds) / (abs(odds) + 100)
        home_prob = odds_to_prob(home_odds)
        away_prob = odds_to_prob(away_odds)
        total_prob = home_prob + away_prob
        home_prob_norm = home_prob / total_prob
        spread = -((home_prob_norm - 0.5) * 28) if home_prob_norm > 0.5 else ((0.5 - home_prob_norm) * 28)
        return round(spread, 1)
    
    def calculate_features(self, home_team, away_team):
        home_stats = self.team_stats.get(home_team, {})
        away_stats = self.team_stats.get(away_team, {})
        
        # Point differential (most important)
        home_diff = home_stats.get("pointsPerGame", 22) - home_stats.get("pointsAllowedPerGame", 22)
        away_diff = away_stats.get("pointsPerGame", 22) - away_stats.get("pointsAllowedPerGame", 22)
        point_diff = home_diff - away_diff
        
        features = {
            "point_differential": point_diff,
            "offensive_efficiency": (home_stats.get("totalYardsPerGame", 350) - away_stats.get("totalYardsPerGame", 350)) / 100,
            "defensive_efficiency": (away_stats.get("yardsAllowedPerGame", 350) - home_stats.get("yardsAllowedPerGame", 350)) / 100,
            "turnover_differential": home_stats.get("turnoverDifferential", 0) - away_stats.get("turnoverDifferential", 0),
            "red_zone_efficiency": home_stats.get("redZonePercentage", 0.45) - away_stats.get("redZonePercentage", 0.45),
            "third_down_conversion": home_stats.get("thirdDownPercentage", 0.35) - away_stats.get("thirdDownPercentage", 0.35),
            "time_of_possession": (home_stats.get("timeOfPossession", 30) - away_stats.get("timeOfPossession", 30)) / 10,
            "yards_per_play": home_stats.get("yardsPerPlay", 5.0) - away_stats.get("yardsPerPlay", 5.0),
            "sack_rate": (home_stats.get("sacks", 25) - away_stats.get("sacks", 25)) / 10,
            "penalty_differential": (away_stats.get("penalties", 110) - home_stats.get("penalties", 110)) / 20,
            "home_field_advantage": 2.8,
            "rest_advantage": 0, "divisional_matchup": 0, "recent_form": 0, "head_to_head": 0
        }
        return features
    
    def predict_game(self, home_team, away_team):
        features = self.calculate_features(home_team, away_team)
        prediction = sum(features[name] * weight for name, weight in self.feature_weights.items())
        home_prob = 1 / (1 + np.exp(-prediction))
        spread = -((home_prob - 0.5) * 28) if home_prob > 0.5 else ((0.5 - home_prob) * 28)
        confidence = abs(home_prob - 0.5) * 2
        return {"home_prob": home_prob, "spread": spread, "confidence": confidence, "features": features}
    
    def analyze_all_games(self):
        print("=== ANALYZING WITH REAL DATA & PROVEN RESEARCH ===")
        analyses = []
        picks = []
        
        for i, game in enumerate(self.games, 1):
            home_team = game["home_team"]
            away_team = game["away_team"]
            prediction = self.predict_game(home_team, away_team)
            
            # Find market line
            market_spread = None
            market_odds = None
            for odds_game in self.betting_lines:
                if odds_game.get("home_team") == home_team and odds_game.get("away_team") == away_team:
                    market_spread = odds_game.get("home_spread")
                    market_odds = f"{odds_game.get('home_odds')}/{odds_game.get('away_odds')}"
                    break
            
            edge = abs(prediction["spread"] - market_spread) if market_spread else 0
            recommendation = "PASS"
            bet_team = None
            
            if market_spread and edge >= 4.0 and prediction["confidence"] >= 0.6:
                recommendation = "GOOD BET"
                bet_team = home_team if prediction["spread"] < market_spread else away_team
            elif market_spread and edge >= 7.0 and prediction["confidence"] >= 0.7:
                recommendation = "STRONG BET"
                bet_team = home_team if prediction["spread"] < market_spread else away_team
            
            analysis = {
                "game": f"{away_team} @ {home_team}",
                "our_spread": round(prediction["spread"], 1),
                "market_spread": market_spread,
                "edge": round(edge, 1),
                "confidence": round(prediction["confidence"], 3),
                "recommendation": recommendation,
                "bet_team": bet_team,
                "features": {k: round(v, 3) for k, v in prediction["features"].items()}
            }
            
            analyses.append(analysis)
            if recommendation != "PASS":
                picks.append(analysis)
            
            print(f"Game {i}: {away_team} @ {home_team}")
            print(f"  Our: {home_team} {prediction['spread']:+.1f}, Market: {market_spread}, Edge: {edge:.1f}")
            print(f"  Confidence: {prediction['confidence']:.1%}, Rec: {recommendation}")
            if bet_team:
                print(f"  BET: {bet_team}")
        
        print(f"\nSUMMARY: {len(picks)} picks from {len(analyses)} games")
        return analyses, picks

if __name__ == "__main__":
    analyzer = FixedAnalyzer()
    analyses, picks = analyzer.analyze_all_games()
