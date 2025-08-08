#!/usr/bin/env python3
"""
Data Consolidation System
Merges 2022-2024 NFL data into unified training dataset for XGBoost model
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class NFLDataConsolidator:
    """Consolidates all NFL data sources into unified training dataset"""
    
    def __init__(self):
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.consolidated_data = []
        self.data_quality_report = {
            'total_games': 0,
            'missing_data': {},
            'data_sources': [],
            'date_range': {},
            'validation_status': 'pending'
        }
    
    def load_historical_odds(self):
        """Load historical betting odds (2011-2021)"""
        print("📊 Loading historical betting odds...")
        
        odds_file = os.path.join(self.base_path, 'data', 'consolidated', 'historical_betting_odds.json')
        
        if os.path.exists(odds_file):
            with open(odds_file, 'r') as f:
                odds_data = json.load(f)
            print(f"✅ Loaded {len(odds_data)} historical games with betting odds")
            self.data_quality_report['data_sources'].append('historical_betting_odds')
            return odds_data
        else:
            print("❌ Historical odds file not found")
            return []
    
    def load_player_stats(self, year):
        """Load player stats for specific year"""
        print(f"📊 Loading {year} player stats...")
        
        stats_file = os.path.join(self.base_path, 'nfl_data', 'player_stats', f'{year}_weekly_stats.csv')
        
        if os.path.exists(stats_file):
            df = pd.read_csv(stats_file)
            print(f"✅ Loaded {len(df)} player records for {year}")
            self.data_quality_report['data_sources'].append(f'{year}_player_stats')
            return df
        else:
            print(f"❌ Player stats file for {year} not found")
            return pd.DataFrame()
    
    def load_game_schedules(self, year):
        """Load game schedules for specific year"""
        print(f"📊 Loading {year} game schedules...")
        
        schedule_file = os.path.join(self.base_path, 'nfl_data', 'games', f'{year}_schedule.csv')
        
        if os.path.exists(schedule_file):
            df = pd.read_csv(schedule_file)
            print(f"✅ Loaded {len(df)} games for {year}")
            self.data_quality_report['data_sources'].append(f'{year}_schedule')
            return df
        else:
            print(f"❌ Schedule file for {year} not found")
            return pd.DataFrame()
    
    def load_team_data(self):
        """Load current team data and ratings"""
        print("📊 Loading team data...")
        
        # Load from consolidated team data
        team_file = os.path.join(self.base_path, 'data', 'consolidated', 'team_data.json')
        
        if os.path.exists(team_file):
            with open(team_file, 'r') as f:
                team_data = json.load(f)
            print(f"✅ Loaded data for {len(team_data)} teams")
            self.data_quality_report['data_sources'].append('team_data')
            return team_data
        else:
            print("❌ Team data file not found")
            return {}
    
    def consolidate_training_data(self):
        """Consolidate all data sources into unified training dataset"""
        print("\n🔄 CONSOLIDATING TRAINING DATA")
        print("=" * 50)
        
        # Load all data sources
        historical_odds = self.load_historical_odds()
        team_data = self.load_team_data()
        
        # Load player stats for training years (2022-2024)
        training_years = [2022, 2023, 2024]
        all_player_stats = {}
        all_schedules = {}
        
        for year in training_years:
            all_player_stats[year] = self.load_player_stats(year)
            all_schedules[year] = self.load_game_schedules(year)
        
        # Create consolidated dataset
        consolidated_games = []
        
        # Process each year's games
        for year in training_years:
            if not all_schedules[year].empty:
                year_games = self.process_year_games(
                    year, 
                    all_schedules[year], 
                    all_player_stats[year],
                    team_data
                )
                consolidated_games.extend(year_games)
        
        self.consolidated_data = consolidated_games
        self.data_quality_report['total_games'] = len(consolidated_games)
        
        print(f"\n✅ CONSOLIDATION COMPLETE")
        print(f"📊 Total training games: {len(consolidated_games)}")
        print(f"📅 Years covered: {training_years}")
        
        return consolidated_games
    
    def process_year_games(self, year, schedule_df, stats_df, team_data):
        """Process games for a specific year"""
        games = []
        
        for _, game in schedule_df.iterrows():
            game_data = {
                'season': year,
                'week': game.get('week', 0),
                'home_team': game.get('home_team', ''),
                'away_team': game.get('away_team', ''),
                'game_date': game.get('gameday', ''),
                'home_score': game.get('home_score', 0),
                'away_score': game.get('away_score', 0),
                'spread_line': game.get('spread_line', 0),
                'total_line': game.get('total', 0),
                'result': game.get('result', 0),  # 1 if home wins, 0 if away wins
                'total_points': game.get('home_score', 0) + game.get('away_score', 0)
            }
            
            # Add basic validation
            if game_data['home_team'] and game_data['away_team']:
                games.append(game_data)
        
        return games
    
    def validate_data_quality(self):
        """Validate the quality of consolidated data"""
        print("\n🔍 VALIDATING DATA QUALITY")
        print("=" * 40)
        
        if not self.consolidated_data:
            print("❌ No consolidated data to validate")
            return False
        
        # Check for missing values
        missing_counts = {}
        total_games = len(self.consolidated_data)
        
        for game in self.consolidated_data:
            for key, value in game.items():
                if value is None or value == '' or value == 0:
                    if key not in missing_counts:
                        missing_counts[key] = 0
                    missing_counts[key] += 1
        
        # Report missing data
        for field, count in missing_counts.items():
            percentage = (count / total_games) * 100
            print(f"📊 {field}: {count}/{total_games} missing ({percentage:.1f}%)")
            if percentage > 50:
                print(f"⚠️  WARNING: {field} has >50% missing data")
        
        self.data_quality_report['missing_data'] = missing_counts
        
        # Date range validation
        dates = [game['game_date'] for game in self.consolidated_data if game['game_date']]
        if dates:
            self.data_quality_report['date_range'] = {
                'earliest': min(dates),
                'latest': max(dates),
                'total_games': len(dates)
            }
        
        self.data_quality_report['validation_status'] = 'complete'
        
        print(f"\n✅ VALIDATION COMPLETE")
        print(f"📊 Total games validated: {total_games}")
        
        return True
    
    def save_consolidated_data(self):
        """Save consolidated data to file"""
        print("\n💾 SAVING CONSOLIDATED DATA")
        print("=" * 35)
        
        # Save consolidated games
        output_file = os.path.join(self.base_path, 'xgboost_model', 'consolidated_training_data.json')
        
        with open(output_file, 'w') as f:
            json.dump(self.consolidated_data, f, indent=2)
        
        print(f"✅ Saved {len(self.consolidated_data)} games to: {output_file}")
        
        # Save data quality report
        report_file = os.path.join(self.base_path, 'xgboost_model', 'data_quality_report.json')
        
        with open(report_file, 'w') as f:
            json.dump(self.data_quality_report, f, indent=2)
        
        print(f"✅ Saved data quality report to: {report_file}")
        
        return output_file
    
    def generate_summary(self):
        """Generate summary of consolidation process"""
        print("\n📋 CONSOLIDATION SUMMARY")
        print("=" * 30)
        print(f"📊 Total games: {self.data_quality_report['total_games']}")
        print(f"📅 Data sources: {len(self.data_quality_report['data_sources'])}")
        print(f"🔍 Validation: {self.data_quality_report['validation_status']}")
        
        if self.data_quality_report['date_range']:
            date_range = self.data_quality_report['date_range']
            print(f"📅 Date range: {date_range['earliest']} to {date_range['latest']}")
        
        print("\n✅ DATA CONSOLIDATION READY FOR FEATURE ENGINEERING")

def main():
    """Main execution function"""
    print("🏈 NFL DATA CONSOLIDATION SYSTEM")
    print("=" * 50)
    
    consolidator = NFLDataConsolidator()
    
    # Execute consolidation process
    consolidator.consolidate_training_data()
    consolidator.validate_data_quality()
    consolidator.save_consolidated_data()
    consolidator.generate_summary()
    
    print("\n🎯 PHASE 1 COMPLETE - READY FOR FEATURE ENGINEERING")

if __name__ == "__main__":
    main() 