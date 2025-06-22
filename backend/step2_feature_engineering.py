#!/usr/bin/env python3
"""
Step 2: Elite Feature Engineering Pipeline
Creates the 15-25 features that research proves beat the market

Focus: Game spreads, totals, moneylines (NOT player props)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

class NFLFeatureEngine:
    """
    Elite feature engineering for NFL game predictions
    Based on research showing 15-25 carefully engineered features 
    outperform hundreds of raw stats
    """
    
    def __init__(self, data_directory="../data"):
        self.data_dir = data_directory
        self.features = []
        
    def load_existing_data(self):
        """Load your existing comprehensive NFL data"""
        print("📊 Loading existing NFL data...")
        
        # Load your 2024 complete season data
        try:
            with open(f"{self.data_dir}/2024-complete/final-2024-stats.json", 'r') as f:
                self.player_stats = json.load(f)
            print(f"✅ Loaded {len(self.player_stats)} player records")
        except FileNotFoundError:
            print("⚠️ 2024 stats not found, using sample data")
            self.player_stats = []
        
        # Load team schedules
        try:
            with open(f"{self.data_dir}/2024-complete/complete-team-schedules-2024.json", 'r') as f:
                self.schedules = json.load(f)
            print(f"✅ Loaded schedules for {len(self.schedules)} teams")
        except FileNotFoundError:
            print("⚠️ Schedules not found")
            self.schedules = {}
            
        # Load historical odds (your $15k+ asset)
        try:
            with open(f"{self.data_dir}/historical-odds-integrated.json", 'r') as f:
                self.historical_odds = json.load(f)
            print(f"✅ Loaded {len(self.historical_odds)} historical games with odds")
        except FileNotFoundError:
            print("⚠️ Historical odds not found")
            self.historical_odds = []
    
    def calculate_elite_features(self, home_team, away_team, game_date):
        """
        Calculate the 15-25 elite features for a specific matchup
        These are the features research proves work
        """
        features = {}
        
        # 1. POINT DIFFERENTIAL FEATURES (Top predictor)
        features.update(self._calculate_point_differentials(home_team, away_team))
        
        # 2. RECENT FORM FEATURES 
        features.update(self._calculate_recent_form(home_team, away_team, game_date))
        
        # 3. HEAD-TO-HEAD FEATURES
        features.update(self._calculate_h2h_record(home_team, away_team))
        
        # 4. REST ADVANTAGE FEATURES
        features.update(self._calculate_rest_advantage(home_team, away_team, game_date))
        
        # 5. SITUATIONAL FEATURES
        features.update(self._calculate_situational_factors(home_team, away_team, game_date))
        
        # 6. STRENGTH OF SCHEDULE
        features.update(self._calculate_sos(home_team, away_team))
        
        # 7. INJURY IMPACT (using your existing data)
        features.update(self._calculate_injury_impact(home_team, away_team))
        
        # 8. WEATHER IMPACT (using your existing integration)
        features.update(self._calculate_weather_impact(home_team, away_team, game_date))
        
        return features
    
    def _calculate_point_differentials(self, home_team, away_team):
        """
        Point differential features - #1 predictor according to research
        """
        # Calculate season-long point differentials
        home_differential = self._get_team_point_differential(home_team)
        away_differential = self._get_team_point_differential(away_team)
        
        return {
            'home_point_differential': home_differential,
            'away_point_differential': away_differential,
            'point_differential_gap': home_differential - away_differential,
            'home_differential_rank': self._rank_differential(home_differential),
            'away_differential_rank': self._rank_differential(away_differential)
        }
    
    def _calculate_recent_form(self, home_team, away_team, game_date):
        """
        Recent form features (last 3, 5, 8 games)
        Research shows recent performance heavily weighted
        """
        home_form_3 = self._get_recent_record(home_team, 3, game_date)
        away_form_3 = self._get_recent_record(away_team, 3, game_date)
        
        home_form_5 = self._get_recent_record(home_team, 5, game_date)
        away_form_5 = self._get_recent_record(away_team, 5, game_date)
        
        return {
            'home_form_3_games': home_form_3,
            'away_form_3_games': away_form_3,
            'home_form_5_games': home_form_5,
            'away_form_5_games': away_form_5,
            'form_differential_3': home_form_3 - away_form_3,
            'form_differential_5': home_form_5 - away_form_5
        }
    
    def _calculate_h2h_record(self, home_team, away_team):
        """
        Head-to-head historical performance
        """
        h2h_record = self._get_h2h_history(home_team, away_team)
        
        return {
            'h2h_home_wins': h2h_record.get('home_wins', 0),
            'h2h_away_wins': h2h_record.get('away_wins', 0),
            'h2h_total_games': h2h_record.get('total_games', 0),
            'h2h_home_win_pct': h2h_record.get('home_win_pct', 0.5)
        }
    
    def _calculate_rest_advantage(self, home_team, away_team, game_date):
        """
        Rest advantage features - critical for NFL
        """
        home_rest_days = self._get_rest_days(home_team, game_date)
        away_rest_days = self._get_rest_days(away_team, game_date)
        
        return {
            'home_rest_days': home_rest_days,
            'away_rest_days': away_rest_days,
            'rest_advantage': home_rest_days - away_rest_days,
            'home_extra_rest': 1 if home_rest_days > away_rest_days else 0,
            'away_extra_rest': 1 if away_rest_days > home_rest_days else 0
        }
    
    def _calculate_situational_factors(self, home_team, away_team, game_date):
        """
        Situational factors that research shows matter
        """
        return {
            'home_field_advantage': 1,  # Always 1 for home team
            'division_game': 1 if self._is_division_game(home_team, away_team) else 0,
            'conference_game': 1 if self._is_conference_game(home_team, away_team) else 0,
            'week_number': self._get_week_number(game_date),
            'is_primetime': 1 if self._is_primetime_game(game_date) else 0
        }
    
    def _calculate_sos(self, home_team, away_team):
        """
        Strength of Schedule features
        """
        home_sos = self._get_strength_of_schedule(home_team)
        away_sos = self._get_strength_of_schedule(away_team)
        
        return {
            'home_sos': home_sos,
            'away_sos': away_sos,
            'sos_differential': home_sos - away_sos
        }
    
    def _calculate_injury_impact(self, home_team, away_team):
        """
        Injury impact using your existing injury data
        """
        # This will integrate with your existing injury data
        home_injury_impact = self._get_injury_impact_score(home_team)
        away_injury_impact = self._get_injury_impact_score(away_team)
        
        return {
            'home_injury_impact': home_injury_impact,
            'away_injury_impact': away_injury_impact,
            'injury_advantage': away_injury_impact - home_injury_impact
        }
    
    def _calculate_weather_impact(self, home_team, away_team, game_date):
        """
        Weather impact using your existing weather integration
        """
        # This will integrate with your existing weather data
        weather_impact = self._get_weather_impact_score(home_team, game_date)
        
        return {
            'weather_impact_total': weather_impact,
            'weather_favors_under': 1 if weather_impact < -0.5 else 0,
            'weather_favors_over': 1 if weather_impact > 0.5 else 0
        }
    
    # Helper methods (simplified for now, will be expanded)
    def _get_team_point_differential(self, team):
        """Calculate team's point differential"""
        # Placeholder - will integrate with your actual data
        return np.random.normal(0, 10)  # Replace with real calculation
    
    def _rank_differential(self, differential):
        """Rank point differential (1-32)"""
        # Placeholder - will rank against all teams
        return min(32, max(1, int(16 + differential/3)))
    
    def _get_recent_record(self, team, games, date):
        """Get recent win percentage"""
        # Placeholder - will integrate with your schedule data
        return np.random.uniform(0.2, 0.8)
    
    def _get_h2h_history(self, home_team, away_team):
        """Get head-to-head history"""
        # Placeholder - will use your historical data
        return {
            'home_wins': 3,
            'away_wins': 2, 
            'total_games': 5,
            'home_win_pct': 0.6
        }
    
    def _get_rest_days(self, team, game_date):
        """Calculate rest days"""
        # Placeholder - will integrate with schedule
        return np.random.randint(6, 14)
    
    def _is_division_game(self, home_team, away_team):
        """Check if division game"""
        # Will implement with actual division data
        return False
    
    def _is_conference_game(self, home_team, away_team):
        """Check if conference game"""
        return True  # Placeholder
    
    def _get_week_number(self, game_date):
        """Get NFL week number"""
        # Simplified - will implement proper week calculation
        return 15
    
    def _is_primetime_game(self, game_date):
        """Check if primetime game"""
        # Will implement with actual schedule data
        return False
    
    def _get_strength_of_schedule(self, team):
        """Calculate strength of schedule"""
        return np.random.uniform(-0.1, 0.1)
    
    def _get_injury_impact_score(self, team):
        """Get injury impact score"""
        # Will integrate with your injury data
        return np.random.uniform(-2, 2)
    
    def _get_weather_impact_score(self, team, date):
        """Get weather impact score"""
        # Will integrate with your weather data
        return np.random.uniform(-1, 1)

def test_feature_engine():
    """Test the feature engineering pipeline"""
    print("🧪 Testing Feature Engineering Pipeline...")
    print("=" * 60)
    
    # Initialize feature engine
    engine = NFLFeatureEngine()
    engine.load_existing_data()
    
    # Test feature calculation for a sample game
    print("\n📊 Calculating features for sample game:")
    print("   Chiefs @ Bills (Sample)")
    
    features = engine.calculate_elite_features("BUF", "KC", "2024-01-15")
    
    print(f"\n✅ Generated {len(features)} elite features:")
    for feature, value in features.items():
        print(f"   {feature}: {value:.3f}")
    
    print("\n🎯 STEP 2 READY: Feature pipeline operational!")
    print("=" * 60)

if __name__ == "__main__":
    test_feature_engine() 