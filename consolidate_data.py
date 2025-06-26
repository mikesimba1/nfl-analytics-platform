#!/usr/bin/env python3
"""
Data Consolidation Script - No External Dependencies
Consolidates all our existing data into organized structure
"""

import json
import os
import csv
from datetime import datetime

def create_directories():
    """Create organized directory structure"""
    directories = [
        'data/consolidated',
        'data/features', 
        'data/models'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 Created: {directory}")

def load_json_file(filepath):
    """Safely load JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ Error loading {filepath}: {e}")
        return None

def consolidate_betting_odds():
    """Consolidate historical betting odds"""
    print("\n🎯 Consolidating Betting Odds Data...")
    
    # Load historical odds
    historical_odds = load_json_file('historical-odds-scraper/data/nfl_archive_10Y_fixed.json')
    
    if historical_odds:
        print(f"✅ Loaded {len(historical_odds)} historical games")
        
        # Save to consolidated location
        with open('data/consolidated/historical_betting_odds.json', 'w') as f:
            json.dump(historical_odds, f, indent=2)
        
        print(f"✅ Saved historical betting odds")
        return len(historical_odds)
    
    return 0

def consolidate_team_data():
    """Consolidate team statistics and features"""
    print("\n📊 Consolidating Team Data...")
    
    # Load various team data sources
    sources = [
        'backend/data/real-current/team-stats.json',
        'backend/data/real-current/unified_team_features.csv',
        'data/team-strength-history.json',
        'data/advanced-analytics-results.json'
    ]
    
    consolidated_data = {}
    
    for source in sources:
        if os.path.exists(source):
            if source.endswith('.json'):
                data = load_json_file(source)
                if data:
                    filename = os.path.basename(source).replace('.json', '')
                    consolidated_data[filename] = data
                    print(f"✅ Loaded: {filename}")
            elif source.endswith('.csv'):
                # Simple CSV reader
                try:
                    with open(source, 'r') as f:
                        reader = csv.DictReader(f)
                        csv_data = list(reader)
                        filename = os.path.basename(source).replace('.csv', '')
                        consolidated_data[filename] = csv_data
                        print(f"✅ Loaded: {filename} ({len(csv_data)} rows)")
                except Exception as e:
                    print(f"⚠️ Error loading CSV {source}: {e}")
    
    # Save consolidated team data
    if consolidated_data:
        with open('data/consolidated/team_data.json', 'w') as f:
            json.dump(consolidated_data, f, indent=2)
        print(f"✅ Saved consolidated team data")
    
    return len(consolidated_data)

def consolidate_current_season():
    """Consolidate current season data"""
    print("\n🏈 Consolidating Current Season Data...")
    
    current_data = {}
    
    # Current odds
    current_odds = load_json_file('backend/data/real-current/current_odds.json')
    if current_odds:
        current_data['current_odds'] = current_odds
        print(f"✅ Current odds: {len(current_odds)} games")
    
    # Upcoming games
    upcoming = load_json_file('backend/data/real-current/upcoming-games.json')
    if upcoming:
        current_data['upcoming_games'] = upcoming
        print(f"✅ Upcoming games loaded")
    
    # Predictions
    predictions = load_json_file('backend/data/real-current/week_predictions.json')
    if predictions:
        current_data['week_predictions'] = predictions
        print(f"✅ Week predictions loaded")
    
    if current_data:
        with open('data/consolidated/current_season.json', 'w') as f:
            json.dump(current_data, f, indent=2)
        print(f"✅ Saved current season data")
    
    return len(current_data)

def consolidate_weather_data():
    """Consolidate weather data"""
    print("\n🌤️ Consolidating Weather Data...")
    
    weather_data = load_json_file('data/weather-enhanced-games.json')
    
    if weather_data:
        print(f"✅ Weather data: {len(weather_data)} games")
        
        with open('data/consolidated/weather_data.json', 'w') as f:
            json.dump(weather_data, f, indent=2)
        
        print(f"✅ Saved weather data")
        return len(weather_data)
    
    return 0

def create_feature_matrix():
    """Create basic feature matrix from available data"""
    print("\n🔧 Creating Feature Matrix...")
    
    # Load consolidated data
    betting_odds = load_json_file('data/consolidated/historical_betting_odds.json')
    team_data = load_json_file('data/consolidated/team_data.json')
    weather_data = load_json_file('data/consolidated/weather_data.json')
    
    features = []
    
    if betting_odds and isinstance(betting_odds, list):
        for game in betting_odds[:100]:  # Sample first 100 games
            try:
                feature_row = {
                    'game_id': game.get('game_id', ''),
                    'date': game.get('date', ''),
                    'home_team': game.get('home_team', ''),
                    'away_team': game.get('away_team', ''),
                    'home_score': game.get('home_score', 0),
                    'away_score': game.get('away_score', 0),
                    'spread_open': game.get('spread_open', 0),
                    'spread_close': game.get('spread_close', 0),
                    'total_open': game.get('total_open', 0),
                    'total_close': game.get('total_close', 0),
                    'home_ml_open': game.get('home_ml_open', 0),
                    'away_ml_open': game.get('away_ml_open', 0)
                }
                features.append(feature_row)
            except Exception as e:
                continue
    
    if features:
        # Save as CSV
        with open('data/features/game_features.csv', 'w', newline='') as f:
            if features:
                writer = csv.DictWriter(f, fieldnames=features[0].keys())
                writer.writeheader()
                writer.writerows(features)
        
        print(f"✅ Created feature matrix: {len(features)} games")
        return len(features)
    
    return 0

def generate_consolidation_report():
    """Generate consolidation report"""
    print("\n📊 CONSOLIDATION REPORT")
    print("=" * 50)
    
    # Check what we created
    consolidated_files = []
    
    if os.path.exists('data/consolidated'):
        for file in os.listdir('data/consolidated'):
            filepath = os.path.join('data/consolidated', file)
            size = os.path.getsize(filepath)
            consolidated_files.append((file, size))
    
    print(f"📁 Consolidated Files: {len(consolidated_files)}")
    for filename, size in consolidated_files:
        size_mb = size / (1024 * 1024)
        print(f"   • {filename}: {size_mb:.2f} MB")
    
    # Check features
    feature_files = []
    if os.path.exists('data/features'):
        for file in os.listdir('data/features'):
            filepath = os.path.join('data/features', file)
            size = os.path.getsize(filepath)
            feature_files.append((file, size))
    
    print(f"\n🔧 Feature Files: {len(feature_files)}")
    for filename, size in feature_files:
        size_kb = size / 1024
        print(f"   • {filename}: {size_kb:.1f} KB")
    
    print(f"\n✅ DATA CONSOLIDATION COMPLETE")
    print(f"   Ready for XGBoost implementation!")

def main():
    """Main consolidation process"""
    print("🎯 NFL DATA CONSOLIDATION")
    print("=" * 50)
    print("Organizing scattered data into unified structure...")
    
    # Create directory structure
    create_directories()
    
    # Consolidate different data types
    betting_count = consolidate_betting_odds()
    team_count = consolidate_team_data()
    current_count = consolidate_current_season()
    weather_count = consolidate_weather_data()
    
    # Create features
    feature_count = create_feature_matrix()
    
    # Generate report
    generate_consolidation_report()
    
    print(f"\n🎉 SUCCESS!")
    print(f"   • Historical games: {betting_count}")
    print(f"   • Team data sources: {team_count}")
    print(f"   • Current season items: {current_count}")
    print(f"   • Weather games: {weather_count}")
    print(f"   • Feature rows: {feature_count}")
    
    print(f"\n🚀 NEXT: Implement XGBoost with organized data!")

if __name__ == "__main__":
    main() 