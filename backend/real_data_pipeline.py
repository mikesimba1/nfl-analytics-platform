#!/usr/bin/env python3
"""
REAL DATA PIPELINE - Using ONLY your actual data
No fake/sample data - production ready
"""

import pandas as pd
import numpy as np
import json
import csv
from datetime import datetime

class RealDataPipeline:
    """
    Uses ONLY your real data to build predictions
    No fake or sample data
    """
    
    def __init__(self):
        self.load_real_data()
        
    def load_real_data(self):
        """Load only real data that exists"""
        print("📊 Loading REAL data only...")
        
        # Load real injury data
        try:
            with open("../data/current-season/injury-reports.json", 'r') as f:
                self.injuries = json.load(f)
            print(f"✅ Real injuries: {len(self.injuries)} teams")
        except:
            self.injuries = []
            print("❌ No injury data")
        
        # Load real weather data  
        try:
            with open("../data/weather-enhanced-games.json", 'r') as f:
                self.weather = json.load(f)
            print(f"✅ Real weather: {len(self.weather)} historical games")
        except:
            self.weather = []
            print("❌ No weather data")
        
        # Load real 2024 team stats
        try:
            self.team_stats = pd.read_csv("../nfl_data/team_stats/2024_team_desc.csv")
            print(f"✅ Real team stats: {len(self.team_stats)} teams")
        except:
            self.team_stats = pd.DataFrame()
            print("❌ No team stats")
            
        # Load real 2024 schedule
        try:
            self.schedule = pd.read_csv("../nfl_data/games/2024_schedule.csv")
            print(f"✅ Real schedule: {len(self.schedule)} games")
        except:
            self.schedule = pd.DataFrame()
            print("❌ No schedule data")
            
        # Load real player stats
        try:
            self.player_stats = pd.read_csv("../nfl_data/player_stats/2024_seasonal_stats.csv")
            print(f"✅ Real player stats: {len(self.player_stats)} players")
        except:
            self.player_stats = pd.DataFrame()
            print("❌ No player stats")
    
    def calculate_real_team_ratings(self):
        """Calculate team ratings from your REAL data"""
        print("\n🎯 Calculating team ratings from REAL data...")
        
        if self.player_stats.empty:
            print("❌ Cannot calculate - no player stats")
            return {}
        
        # Group by team and calculate offensive ratings
        team_ratings = {}
        
        # Get unique teams from player stats
        if 'team' in self.player_stats.columns:
            teams = self.player_stats['team'].unique()
            
            for team in teams:
                team_players = self.player_stats[self.player_stats['team'] == team]
                
                # Calculate offensive rating from passing/rushing/receiving yards
                passing_yards = team_players[team_players['position'] == 'QB']['passing_yards'].sum() if 'passing_yards' in team_players.columns else 0
                rushing_yards = team_players[team_players['position'].isin(['RB', 'QB'])]['rushing_yards'].sum() if 'rushing_yards' in team_players.columns else 0
                receiving_yards = team_players[team_players['position'].isin(['WR', 'TE'])]['receiving_yards'].sum() if 'receiving_yards' in team_players.columns else 0
                
                total_offense = passing_yards + rushing_yards + receiving_yards
                
                team_ratings[team] = {
                    'offensive_yards': total_offense,
                    'passing_yards': passing_yards,
                    'rushing_yards': rushing_yards,
                    'receiving_yards': receiving_yards
                }
                
                print(f"   {team}: {total_offense:,} total yards")
        
        return team_ratings
    
    def get_real_current_games(self):
        """Get current week games from REAL schedule data"""
        print("\n📅 Finding current week games from REAL data...")
        
        if self.schedule.empty:
            print("❌ No schedule data available")
            return []
        
        # Find the most recent week that hasn't been played
        current_week_games = []
        
        # Look for games in the schedule
        if 'week' in self.schedule.columns and 'home_team' in self.schedule.columns:
            # Get the latest week
            latest_week = self.schedule['week'].max()
            week_games = self.schedule[self.schedule['week'] == latest_week]
            
            for _, game in week_games.iterrows():
                current_week_games.append({
                    'home_team': game.get('home_team', ''),
                    'away_team': game.get('away_team', ''),
                    'week': game.get('week', latest_week),
                    'date': game.get('game_date', ''),
                    'time': game.get('game_time', 'TBD')
                })
            
            print(f"✅ Found {len(current_week_games)} games in week {latest_week}")
        else:
            print("❌ Schedule format not compatible")
        
        return current_week_games
    
    def calculate_real_injury_impact(self, team):
        """Calculate injury impact from REAL injury data"""
        total_impact = 0
        
        for team_injuries in self.injuries:
            if team_injuries.get('abbreviation') == team:
                for injury in team_injuries.get('injuries', []):
                    position = injury.get('position', '')
                    status = injury.get('status', 'Questionable')
                    
                    # Position impact weights
                    position_weights = {
                        'QB': 5.0, 'RB': 2.0, 'WR': 1.5, 'TE': 1.0,
                        'OL': 1.5, 'DL': 1.0, 'LB': 1.0, 'CB': 0.8, 'S': 0.6
                    }
                    
                    base_impact = position_weights.get(position, 0.5)
                    
                    # Status multipliers
                    if status == 'Out' or status == 'IR':
                        multiplier = 1.0
                    elif status == 'Doubtful':
                        multiplier = 0.7
                    elif status == 'Questionable':
                        multiplier = 0.3
                    else:
                        multiplier = 0.1
                    
                    total_impact += base_impact * multiplier
        
        return total_impact
    
    def get_real_weather_impact(self, home_team, date):
        """Get weather impact from REAL historical data"""
        # Find similar games for this team
        team_weather_games = [g for g in self.weather if g.get('homeTeam') == home_team]
        
        if not team_weather_games:
            return 0
        
        # Calculate average weather impact for this team
        total_impact = 0
        count = 0
        
        for game in team_weather_games:
            weather = game.get('weather', {})
            temp = weather.get('temperature', 70)
            wind = weather.get('wind_speed', 0)
            precip = weather.get('precipitation', 0)
            
            impact = 0
            if temp < 32: impact -= 2.0
            elif temp < 45: impact -= 1.0
            
            if wind > 15: impact -= 1.5
            elif wind > 10: impact -= 0.5
            
            if precip > 0.5: impact -= 2.0
            elif precip > 0.1: impact -= 0.5
            
            total_impact += impact
            count += 1
        
        return total_impact / count if count > 0 else 0
    
    def analyze_real_game(self, home_team, away_team):
        """Analyze a game using ONLY real data"""
        print(f"\n🎯 Analyzing {away_team} @ {home_team} with REAL data...")
        
        # Get real team ratings
        team_ratings = self.calculate_real_team_ratings()
        
        home_rating = team_ratings.get(home_team, {}).get('offensive_yards', 0)
        away_rating = team_ratings.get(away_team, {}).get('offensive_yards', 0)
        
        # Get real injury impact
        home_injuries = self.calculate_real_injury_impact(home_team)
        away_injuries = self.calculate_real_injury_impact(away_team)
        
        # Get real weather impact
        weather_impact = self.get_real_weather_impact(home_team, datetime.now().strftime('%Y-%m-%d'))
        
        # Calculate prediction based on real data
        point_differential = (home_rating - away_rating) / 1000  # Scale down
        injury_advantage = away_injuries - home_injuries
        home_field = 2.5  # Standard home field advantage
        
        predicted_spread = point_differential + injury_advantage + home_field + weather_impact
        
        # Calculate confidence based on data quality
        data_quality = 0
        if home_rating > 0 and away_rating > 0: data_quality += 30
        if home_injuries >= 0 and away_injuries >= 0: data_quality += 20
        if weather_impact != 0: data_quality += 10
        confidence = min(95, max(55, data_quality + 40))
        
        return {
            'matchup': f"{away_team} @ {home_team}",
            'predicted_spread': round(predicted_spread, 1),
            'confidence': round(confidence, 1),
            'data_sources': {
                'home_offensive_yards': home_rating,
                'away_offensive_yards': away_rating,
                'home_injury_impact': home_injuries,
                'away_injury_impact': away_injuries,
                'weather_impact': weather_impact
            },
            'data_quality': f"{data_quality}% complete"
        }
    
    def run_real_analysis(self):
        """Run analysis using only real data"""
        print("🎯 REAL DATA ANALYSIS")
        print("=" * 50)
        print("Using ONLY your actual data - no fake/sample data")
        print("=" * 50)
        
        # Get current games from real schedule
        current_games = self.get_real_current_games()
        
        if not current_games:
            print("❌ No current games found in schedule data")
            return
        
        # Analyze each game with real data
        analyses = []
        for game in current_games[:5]:  # Limit to first 5 for demo
            try:
                analysis = self.analyze_real_game(
                    game['home_team'], 
                    game['away_team']
                )
                analyses.append(analysis)
                
                print(f"\n📊 {analysis['matchup']}")
                print(f"   Predicted Spread: {analysis['predicted_spread']}")
                print(f"   Confidence: {analysis['confidence']}%")
                print(f"   Data Quality: {analysis['data_quality']}")
                
            except Exception as e:
                print(f"❌ Error analyzing {game['home_team']} vs {game['away_team']}: {e}")
        
        print(f"\n✅ Analyzed {len(analyses)} games with REAL data")
        return analyses

def main():
    """Main function to run real data analysis"""
    pipeline = RealDataPipeline()
    results = pipeline.run_real_analysis()
    
    print("\n🎯 NEXT STEPS FOR PRODUCTION:")
    print("1. Get current week's betting lines (API needed)")
    print("2. Get current weather forecasts (API integration)")
    print("3. Build larger historical dataset for training")
    print("4. Add real-time data updates")
    print("5. Implement live odds comparison")

if __name__ == "__main__":
    main() 