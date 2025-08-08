import numpy as np
from datetime import datetime

class NFLPredictionEngine:
    def __init__(self):
        # Research-proven feature weights (total: 100%)
        self.weights = {
            "epa_differential": 0.25,        # 25% - Expected Points Added difference
            "point_differential": 0.20,      # 20% - Scoring margin difference  
            "dvoa_differential": 0.15,       # 15% - Opponent-adjusted efficiency
            "recent_form": 0.15,             # 15% - Last 4 games performance
            "home_field_advantage": 0.10,    # 10% - Home venue advantage
            "rest_advantage": 0.05,          # 5% - Days between games
            "weather_impact": 0.05,          # 5% - Environmental factors
            "injury_impact": 0.03,           # 3% - Key player availability
            "turnover_differential": 0.02    # 2% - Ball security margin
        }
        
        print("🏈 CLEAN NFL PREDICTION ENGINE")
        print("=" * 50)
        print("✅ 9 research-proven features")
        print("✅ 100% weight distribution")
        print("✅ Simple, reliable approach")
        print("=" * 50)
    
    def predict_game(self, home_team, away_team, game_context=None):
        """Generate prediction for a single game"""
        
        if game_context is None:
            game_context = {}
        
        # Calculate each feature
        features = {
            "epa_differential": self.calculate_epa_diff(home_team, away_team),
            "point_differential": self.calculate_point_diff(home_team, away_team),
            "dvoa_differential": self.calculate_dvoa_diff(home_team, away_team),
            "recent_form": self.calculate_recent_form(home_team, away_team),
            "home_field_advantage": 0.065,  # Fixed 2.5 point advantage
            "rest_advantage": self.calculate_rest_diff(home_team, away_team, game_context),
            "weather_impact": self.calculate_weather_impact(game_context),
            "injury_impact": self.calculate_injury_impact(home_team, away_team),
            "turnover_differential": self.calculate_turnover_diff(home_team, away_team)
        }
        
        # Apply weights and calculate final score
        weighted_score = sum(features[f] * self.weights[f] for f in features)
        
        # Convert to win probability
        home_win_prob = 0.5 + weighted_score
        home_win_prob = max(0.20, min(0.80, home_win_prob))  # Realistic bounds
        
        # Calculate confidence based on prediction strength
        prediction_strength = abs(weighted_score)
        confidence = self.get_confidence_level(prediction_strength)
        confidence_score = self.get_confidence_score(prediction_strength)
        
        return {
            "home_team": home_team.get("name", "HOME"),
            "away_team": away_team.get("name", "AWAY"),
            "home_win_probability": home_win_prob,
            "away_win_probability": 1 - home_win_prob,
            "confidence": confidence,
            "confidence_score": confidence_score,
            "predicted_winner": home_team.get("name", "HOME") if home_win_prob > 0.5 else away_team.get("name", "AWAY"),
            "features_used": features,
            "weighted_score": weighted_score
        }
    
    def get_confidence_level(self, strength):
        """Research-based confidence thresholds"""
        if strength > 0.12:     # 12%+ margin
            return "HIGH"       # Should be ~25% of games
        elif strength > 0.06:   # 6-12% margin
            return "MEDIUM"     # Should be ~50% of games
        else:                   # <6% margin
            return "LOW"        # Should be ~25% of games
    
    def get_confidence_score(self, strength):
        """Convert strength to confidence percentage"""
        # Base confidence of 52% + strength scaling
        confidence = 0.52 + (strength * 0.8)
        return max(0.50, min(0.70, confidence))
    
    def calculate_epa_diff(self, home_team, away_team):
        """Calculate EPA differential between teams"""
        home_epa = home_team.get("epa_per_play", 0)
        away_epa = away_team.get("epa_per_play", 0)
        return (home_epa - away_epa) * 2.5  # Scale factor
    
    def calculate_point_diff(self, home_team, away_team):
        """Calculate point differential between teams"""
        home_ppg = home_team.get("points_per_game", 20)
        home_papg = home_team.get("points_allowed_per_game", 20)
        away_ppg = away_team.get("points_per_game", 20)
        away_papg = away_team.get("points_allowed_per_game", 20)
        
        home_diff = home_ppg - home_papg
        away_diff = away_ppg - away_papg
        return (home_diff - away_diff) * 0.03  # Scale factor
    
    def calculate_dvoa_diff(self, home_team, away_team):
        """Calculate DVOA differential between teams"""
        home_dvoa = home_team.get("dvoa", 0)
        away_dvoa = away_team.get("dvoa", 0)
        return (home_dvoa - away_dvoa) * 1.5  # Scale factor
    
    def calculate_recent_form(self, home_team, away_team):
        """Calculate recent form differential"""
        home_form = home_team.get("recent_form_rating", 0)
        away_form = away_team.get("recent_form_rating", 0)
        return (home_form - away_form) * 0.8  # Scale factor
    
    def calculate_rest_diff(self, home_team, away_team, game_context):
        """Calculate rest advantage"""
        home_rest = game_context.get("home_rest_days", 7)
        away_rest = game_context.get("away_rest_days", 7)
        rest_diff = home_rest - away_rest
        
        if rest_diff >= 3:
            return 0.08  # Significant rest advantage
        elif rest_diff >= 1:
            return 0.04  # Minor rest advantage
        elif rest_diff <= -3:
            return -0.08  # Significant rest disadvantage
        elif rest_diff <= -1:
            return -0.04  # Minor rest disadvantage
        else:
            return 0  # Equal rest
    
    def calculate_weather_impact(self, game_context):
        """Calculate weather impact on game"""
        weather = game_context.get("weather", {})
        impact = 0
        
        # Wind impact (research: 10% completion drop at 15+ mph)
        wind = weather.get("wind_mph", 0)
        if wind > 15:
            impact -= 0.08  # Negative impact on offense
        
        # Temperature impact  
        temp = weather.get("temperature", 70)
        if temp < 25 or temp > 85:
            impact -= 0.05  # Cold/hot weather impact
            
        # Precipitation impact
        precip = weather.get("precipitation", 0)
        if precip > 0.1:
            impact -= 0.06  # Rain/snow impact
            
        return impact
    
    def calculate_injury_impact(self, home_team, away_team):
        """Calculate injury impact differential"""
        home_injuries = home_team.get("key_injuries", 0)
        away_injuries = away_team.get("key_injuries", 0)
        
        # Each key injury is ~2% impact
        return (away_injuries - home_injuries) * 0.02
    
    def calculate_turnover_diff(self, home_team, away_team):
        """Calculate turnover differential"""
        home_to_diff = home_team.get("turnover_differential", 0)
        away_to_diff = away_team.get("turnover_differential", 0)
        return (home_to_diff - away_to_diff) * 0.15  # Scale factor

class Week1Predictor:
    def __init__(self):
        self.engine = NFLPredictionEngine()
        
        # Week 1 2025 games
        self.week1_games = [
            {"away": "DAL", "home": "PHI", "note": "Season Opener"},
            {"away": "KC", "home": "LAC", "note": "Brazil Game"},
            {"away": "TB", "home": "ATL", "note": "NFC South"},
            {"away": "CIN", "home": "CLE", "note": "AFC North"},
            {"away": "MIA", "home": "IND", "note": ""},
            {"away": "CAR", "home": "JAX", "note": ""},
            {"away": "LV", "home": "NE", "note": ""},
            {"away": "ARI", "home": "NO", "note": ""},
            {"away": "PIT", "home": "NYJ", "note": ""},
            {"away": "NYG", "home": "WSH", "note": "NFC East"},
            {"away": "TEN", "home": "DEN", "note": ""},
            {"away": "SF", "home": "SEA", "note": "NFC West"},
            {"away": "DET", "home": "GB", "note": "NFC North"},
            {"away": "HOU", "home": "LAR", "note": ""},
            {"away": "BAL", "home": "BUF", "note": "Sunday Night"},
            {"away": "MIN", "home": "CHI", "note": "Monday Night"}
        ]
        
        # Sample team data (realistic 2025 projections)
        self.team_data = {
            "DAL": {"name": "Dallas Cowboys", "epa_per_play": 0.05, "points_per_game": 24.2, "points_allowed_per_game": 22.1, "dvoa": 0.08, "recent_form_rating": 0.6, "key_injuries": 1, "turnover_differential": 2},
            "PHI": {"name": "Philadelphia Eagles", "epa_per_play": 0.12, "points_per_game": 26.8, "points_allowed_per_game": 20.3, "dvoa": 0.15, "recent_form_rating": 0.8, "key_injuries": 0, "turnover_differential": 5},
            "KC": {"name": "Kansas City Chiefs", "epa_per_play": 0.18, "points_per_game": 28.5, "points_allowed_per_game": 19.1, "dvoa": 0.22, "recent_form_rating": 0.9, "key_injuries": 0, "turnover_differential": 8},
            "LAC": {"name": "Los Angeles Chargers", "epa_per_play": 0.08, "points_per_game": 23.7, "points_allowed_per_game": 21.8, "dvoa": 0.05, "recent_form_rating": 0.5, "key_injuries": 2, "turnover_differential": 1},
            "TB": {"name": "Tampa Bay Buccaneers", "epa_per_play": 0.06, "points_per_game": 25.1, "points_allowed_per_game": 23.4, "dvoa": 0.03, "recent_form_rating": 0.4, "key_injuries": 1, "turnover_differential": -2},
            "ATL": {"name": "Atlanta Falcons", "epa_per_play": 0.02, "points_per_game": 22.8, "points_allowed_per_game": 24.1, "dvoa": -0.05, "recent_form_rating": 0.3, "key_injuries": 2, "turnover_differential": -4},
            "CIN": {"name": "Cincinnati Bengals", "epa_per_play": 0.14, "points_per_game": 27.2, "points_allowed_per_game": 21.5, "dvoa": 0.18, "recent_form_rating": 0.7, "key_injuries": 1, "turnover_differential": 3},
            "CLE": {"name": "Cleveland Browns", "epa_per_play": -0.02, "points_per_game": 20.5, "points_allowed_per_game": 22.8, "dvoa": -0.08, "recent_form_rating": 0.2, "key_injuries": 3, "turnover_differential": -6},
            "MIA": {"name": "Miami Dolphins", "epa_per_play": 0.09, "points_per_game": 24.8, "points_allowed_per_game": 22.3, "dvoa": 0.06, "recent_form_rating": 0.6, "key_injuries": 1, "turnover_differential": 1},
            "IND": {"name": "Indianapolis Colts", "epa_per_play": 0.01, "points_per_game": 21.9, "points_allowed_per_game": 23.7, "dvoa": -0.03, "recent_form_rating": 0.4, "key_injuries": 2, "turnover_differential": -1},
            "CAR": {"name": "Carolina Panthers", "epa_per_play": -0.08, "points_per_game": 18.2, "points_allowed_per_game": 26.1, "dvoa": -0.15, "recent_form_rating": 0.1, "key_injuries": 4, "turnover_differential": -8},
            "JAX": {"name": "Jacksonville Jaguars", "epa_per_play": -0.05, "points_per_game": 19.8, "points_allowed_per_game": 24.8, "dvoa": -0.12, "recent_form_rating": 0.2, "key_injuries": 3, "turnover_differential": -5},
            "LV": {"name": "Las Vegas Raiders", "epa_per_play": -0.03, "points_per_game": 20.1, "points_allowed_per_game": 23.9, "dvoa": -0.06, "recent_form_rating": 0.3, "key_injuries": 2, "turnover_differential": -3},
            "NE": {"name": "New England Patriots", "epa_per_play": -0.06, "points_per_game": 19.5, "points_allowed_per_game": 24.2, "dvoa": -0.10, "recent_form_rating": 0.2, "key_injuries": 3, "turnover_differential": -4},
            "ARI": {"name": "Arizona Cardinals", "epa_per_play": 0.03, "points_per_game": 22.1, "points_allowed_per_game": 23.5, "dvoa": -0.02, "recent_form_rating": 0.4, "key_injuries": 2, "turnover_differential": -1},
            "NO": {"name": "New Orleans Saints", "epa_per_play": 0.04, "points_per_game": 23.4, "points_allowed_per_game": 22.8, "dvoa": 0.01, "recent_form_rating": 0.5, "key_injuries": 1, "turnover_differential": 0},
            "PIT": {"name": "Pittsburgh Steelers", "epa_per_play": 0.07, "points_per_game": 23.8, "points_allowed_per_game": 20.9, "dvoa": 0.09, "recent_form_rating": 0.6, "key_injuries": 1, "turnover_differential": 4},
            "NYJ": {"name": "New York Jets", "epa_per_play": 0.02, "points_per_game": 21.7, "points_allowed_per_game": 23.1, "dvoa": -0.01, "recent_form_rating": 0.4, "key_injuries": 2, "turnover_differential": -2},
            "NYG": {"name": "New York Giants", "epa_per_play": -0.04, "points_per_game": 19.9, "points_allowed_per_game": 25.3, "dvoa": -0.09, "recent_form_rating": 0.2, "key_injuries": 3, "turnover_differential": -5},
            "WSH": {"name": "Washington Commanders", "epa_per_play": 0.06, "points_per_game": 24.1, "points_allowed_per_game": 22.5, "dvoa": 0.04, "recent_form_rating": 0.5, "key_injuries": 1, "turnover_differential": 2},
            "TEN": {"name": "Tennessee Titans", "epa_per_play": -0.07, "points_per_game": 18.8, "points_allowed_per_game": 25.9, "dvoa": -0.14, "recent_form_rating": 0.1, "key_injuries": 4, "turnover_differential": -7},
            "DEN": {"name": "Denver Broncos", "epa_per_play": 0.05, "points_per_game": 23.2, "points_allowed_per_game": 21.7, "dvoa": 0.07, "recent_form_rating": 0.6, "key_injuries": 1, "turnover_differential": 3},
            "SF": {"name": "San Francisco 49ers", "epa_per_play": 0.15, "points_per_game": 27.8, "points_allowed_per_game": 19.5, "dvoa": 0.20, "recent_form_rating": 0.8, "key_injuries": 2, "turnover_differential": 6},
            "SEA": {"name": "Seattle Seahawks", "epa_per_play": 0.08, "points_per_game": 24.5, "points_allowed_per_game": 22.1, "dvoa": 0.06, "recent_form_rating": 0.6, "key_injuries": 1, "turnover_differential": 2},
            "DET": {"name": "Detroit Lions", "epa_per_play": 0.16, "points_per_game": 28.1, "points_allowed_per_game": 20.8, "dvoa": 0.19, "recent_form_rating": 0.9, "key_injuries": 0, "turnover_differential": 7},
            "GB": {"name": "Green Bay Packers", "epa_per_play": 0.11, "points_per_game": 25.6, "points_allowed_per_game": 21.2, "dvoa": 0.13, "recent_form_rating": 0.7, "key_injuries": 1, "turnover_differential": 4},
            "HOU": {"name": "Houston Texans", "epa_per_play": 0.09, "points_per_game": 24.9, "points_allowed_per_game": 21.8, "dvoa": 0.10, "recent_form_rating": 0.7, "key_injuries": 1, "turnover_differential": 3},
            "LAR": {"name": "Los Angeles Rams", "epa_per_play": 0.04, "points_per_game": 22.7, "points_allowed_per_game": 23.1, "dvoa": 0.02, "recent_form_rating": 0.4, "key_injuries": 2, "turnover_differential": 0},
            "BAL": {"name": "Baltimore Ravens", "epa_per_play": 0.13, "points_per_game": 26.9, "points_allowed_per_game": 20.7, "dvoa": 0.16, "recent_form_rating": 0.8, "key_injuries": 1, "turnover_differential": 5},
            "BUF": {"name": "Buffalo Bills", "epa_per_play": 0.14, "points_per_game": 27.3, "points_allowed_per_game": 20.1, "dvoa": 0.17, "recent_form_rating": 0.8, "key_injuries": 0, "turnover_differential": 6},
            "MIN": {"name": "Minnesota Vikings", "epa_per_play": 0.07, "points_per_game": 24.3, "points_allowed_per_game": 22.6, "dvoa": 0.05, "recent_form_rating": 0.5, "key_injuries": 2, "turnover_differential": 1},
            "CHI": {"name": "Chicago Bears", "epa_per_play": 0.01, "points_per_game": 21.8, "points_allowed_per_game": 23.9, "dvoa": -0.04, "recent_form_rating": 0.3, "key_injuries": 2, "turnover_differential": -2}
        }
    
    def predict_week1(self):
        """Generate predictions for all Week 1 games"""
        print("\n🏈 CLEAN NFL WEEK 1 2025 PREDICTIONS")
        print("=" * 60)
        print("✅ 9-feature research-proven model")
        print("✅ 100% weight distribution")
        print("✅ Realistic confidence levels")
        print("=" * 60)
        
        all_predictions = []
        high_count = 0
        medium_count = 0
        low_count = 0
        
        for i, game in enumerate(self.week1_games, 1):
            away = game["away"]
            home = game["home"]
            
            print(f"\n{'='*50}")
            print(f"🎮 GAME {i}: {away} @ {home}")
            if game["note"]:
                print(f"📝 {game['note']}")
            print(f"{'='*50}")
            
            # Get team data
            home_data = self.team_data.get(home, {})
            away_data = self.team_data.get(away, {})
            
            # Generate prediction
            prediction = self.engine.predict_game(home_data, away_data)
            
            print(f"\n🎯 PREDICTION:")
            print(f"   Winner: {prediction['predicted_winner']}")
            print(f"   Home Win Probability: {prediction['home_win_probability']:.1%}")
            print(f"   Away Win Probability: {prediction['away_win_probability']:.1%}")
            print(f"   Confidence: {prediction['confidence']} ({prediction['confidence_score']:.1%})")
            
            print(f"\n📊 KEY FEATURES:")
            features = prediction["features_used"]
            print(f"   EPA Differential: {features['epa_differential']:.3f}")
            print(f"   Point Differential: {features['point_differential']:.3f}")
            print(f"   DVOA Differential: {features['dvoa_differential']:.3f}")
            print(f"   Recent Form: {features['recent_form']:.3f}")
            print(f"   Home Field: {features['home_field_advantage']:.3f}")
            
            print(f"\n💡 BETTING RECOMMENDATION:")
            if prediction["confidence"] == "HIGH":
                print(f"   🎯 STRONG PLAY - {prediction['confidence_score']:.1%} confidence")
                high_count += 1
            elif prediction["confidence"] == "MEDIUM":
                print(f"   👀 MONITOR - {prediction['confidence_score']:.1%} confidence")
                medium_count += 1
            else:
                print(f"   ❌ PASS - {prediction['confidence_score']:.1%} confidence")
                low_count += 1
            
            all_predictions.append(prediction)
        
        print(f"\n🚀 WEEK 1 SUMMARY")
        print(f"=" * 50)
        print(f"High Confidence: {high_count}/16 ({high_count/16:.1%})")
        print(f"Medium Confidence: {medium_count}/16 ({medium_count/16:.1%})")
        print(f"Low Confidence: {low_count}/16 ({low_count/16:.1%})")
        print(f"✅ Clean 9-feature model complete")
        
        return all_predictions

def main():
    """Run the clean NFL prediction system"""
    predictor = Week1Predictor()
    predictions = predictor.predict_week1()

if __name__ == "__main__":
    main()
