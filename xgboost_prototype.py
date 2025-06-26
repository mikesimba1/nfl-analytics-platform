#!/usr/bin/env python3
"""
XGBoost NFL Prediction Prototype
Using our consolidated data for 58%+ accuracy target
"""

import json
import csv
import os
from datetime import datetime
import random

# Simple feature engineering without pandas
def load_consolidated_data():
    """Load our consolidated data"""
    print("📊 Loading consolidated data...")
    
    data = {}
    
    # Load betting odds
    try:
        with open('data/consolidated/historical_betting_odds.json', 'r') as f:
            data['betting_odds'] = json.load(f)
        print(f"✅ Betting odds: {len(data['betting_odds'])} games")
    except Exception as e:
        print(f"⚠️ Error loading betting odds: {e}")
        data['betting_odds'] = []
    
    # Load team data
    try:
        with open('data/consolidated/team_data.json', 'r') as f:
            data['team_data'] = json.load(f)
        print(f"✅ Team data loaded")
    except Exception as e:
        print(f"⚠️ Error loading team data: {e}")
        data['team_data'] = {}
    
    # Load weather data
    try:
        with open('data/consolidated/weather_data.json', 'r') as f:
            data['weather_data'] = json.load(f)
        print(f"✅ Weather data: {len(data['weather_data'])} games")
    except Exception as e:
        print(f"⚠️ Error loading weather data: {e}")
        data['weather_data'] = []
    
    return data

def create_team_strength_ratings(betting_odds):
    """Create simple team strength ratings from historical performance"""
    print("🏈 Creating team strength ratings...")
    
    team_stats = {}
    
    # Process historical games
    for game in betting_odds:
        try:
            home_team = game.get('home_team', '')
            away_team = game.get('away_team', '')
            home_score = float(game.get('home_score', 0))
            away_score = float(game.get('away_score', 0))
            spread_close = float(game.get('spread_close', 0))
            
            if not home_team or not away_team:
                continue
            
            # Initialize team stats
            for team in [home_team, away_team]:
                if team not in team_stats:
                    team_stats[team] = {
                        'games': 0,
                        'points_for': 0,
                        'points_against': 0,
                        'ats_wins': 0,
                        'ats_losses': 0,
                        'total_margin': 0
                    }
            
            # Update home team stats
            team_stats[home_team]['games'] += 1
            team_stats[home_team]['points_for'] += home_score
            team_stats[home_team]['points_against'] += away_score
            team_stats[home_team]['total_margin'] += (home_score - away_score)
            
            # ATS performance (home team perspective)
            home_ats_margin = (home_score - away_score) + spread_close
            if home_ats_margin > 0:
                team_stats[home_team]['ats_wins'] += 1
            else:
                team_stats[home_team]['ats_losses'] += 1
            
            # Update away team stats
            team_stats[away_team]['games'] += 1
            team_stats[away_team]['points_for'] += away_score
            team_stats[away_team]['points_against'] += home_score
            team_stats[away_team]['total_margin'] += (away_score - home_score)
            
            # ATS performance (away team perspective)
            away_ats_margin = (away_score - home_score) - spread_close
            if away_ats_margin > 0:
                team_stats[away_team]['ats_wins'] += 1
            else:
                team_stats[away_team]['ats_losses'] += 1
                
        except Exception as e:
            continue
    
    # Calculate derived metrics
    team_ratings = {}
    for team, stats in team_stats.items():
        if stats['games'] > 0:
            team_ratings[team] = {
                'offensive_rating': stats['points_for'] / stats['games'],
                'defensive_rating': stats['points_against'] / stats['games'],
                'net_rating': stats['total_margin'] / stats['games'],
                'ats_percentage': stats['ats_wins'] / (stats['ats_wins'] + stats['ats_losses']) if (stats['ats_wins'] + stats['ats_losses']) > 0 else 0.5,
                'games_played': stats['games']
            }
    
    print(f"✅ Created ratings for {len(team_ratings)} teams")
    return team_ratings

def create_features_for_game(game, team_ratings, weather_data):
    """Create feature vector for a single game"""
    try:
        home_team = game.get('home_team', '')
        away_team = game.get('away_team', '')
        
        if not home_team or not away_team:
            return None
        
        # Get team ratings
        home_rating = team_ratings.get(home_team, {})
        away_rating = team_ratings.get(away_team, {})
        
        # Basic features
        features = {
            'home_offensive_rating': home_rating.get('offensive_rating', 21.0),
            'home_defensive_rating': home_rating.get('defensive_rating', 21.0),
            'home_net_rating': home_rating.get('net_rating', 0.0),
            'home_ats_percentage': home_rating.get('ats_percentage', 0.5),
            'away_offensive_rating': away_rating.get('offensive_rating', 21.0),
            'away_defensive_rating': away_rating.get('defensive_rating', 21.0),
            'away_net_rating': away_rating.get('net_rating', 0.0),
            'away_ats_percentage': away_rating.get('ats_percentage', 0.5),
            'home_field_advantage': 2.5,  # Standard NFL home field advantage
            'spread_open': float(game.get('spread_open', 0)),
            'total_open': float(game.get('total_open', 45)),
            'spread_movement': float(game.get('spread_close', 0)) - float(game.get('spread_open', 0)),
            'total_movement': float(game.get('total_close', 45)) - float(game.get('total_open', 45))
        }
        
        # Derived features
        features['offensive_matchup'] = features['home_offensive_rating'] - features['away_defensive_rating']
        features['defensive_matchup'] = features['away_offensive_rating'] - features['home_defensive_rating']
        features['net_rating_diff'] = features['home_net_rating'] - features['away_net_rating']
        features['ats_diff'] = features['home_ats_percentage'] - features['away_ats_percentage']
        
        # Target variables
        home_score = float(game.get('home_score', 0))
        away_score = float(game.get('away_score', 0))
        spread_close = float(game.get('spread_close', 0))
        
        features['home_covered'] = 1 if (home_score - away_score + spread_close) > 0 else 0
        features['total_points'] = home_score + away_score
        features['over_hit'] = 1 if features['total_points'] > features['total_open'] else 0
        
        return features
        
    except Exception as e:
        return None

def simple_xgboost_simulation(features_data):
    """Simulate XGBoost predictions without actual ML library"""
    print("🤖 Simulating XGBoost predictions...")
    
    predictions = []
    correct_spread = 0
    correct_total = 0
    
    for game_features in features_data:
        if not game_features:
            continue
        
        # Simple prediction logic based on key features
        # This simulates what XGBoost would learn
        
        # Spread prediction
        spread_score = (
            game_features['net_rating_diff'] * 0.4 +
            game_features['offensive_matchup'] * 0.3 +
            game_features['defensive_matchup'] * 0.2 +
            game_features['home_field_advantage'] * 0.1
        )
        
        # Add some market respect
        market_adjustment = game_features['spread_open'] * 0.3
        final_spread_score = spread_score + market_adjustment
        
        spread_prediction = 1 if final_spread_score > 0 else 0
        
        # Total prediction  
        total_score = (
            (game_features['home_offensive_rating'] + game_features['away_offensive_rating']) * 0.5 +
            (game_features['home_defensive_rating'] + game_features['away_defensive_rating']) * -0.3 +
            game_features['total_open'] * 0.2
        )
        
        total_prediction = 1 if total_score > game_features['total_open'] else 0
        
        # Check accuracy
        if spread_prediction == game_features['home_covered']:
            correct_spread += 1
        
        if total_prediction == game_features['over_hit']:
            correct_total += 1
        
        predictions.append({
            'spread_prediction': spread_prediction,
            'total_prediction': total_prediction,
            'spread_actual': game_features['home_covered'],
            'total_actual': game_features['over_hit'],
            'confidence': abs(final_spread_score) / 10.0  # Normalized confidence
        })
    
    total_games = len(predictions)
    spread_accuracy = correct_spread / total_games if total_games > 0 else 0
    total_accuracy = correct_total / total_games if total_games > 0 else 0
    
    print(f"✅ Processed {total_games} games")
    print(f"📊 Spread Accuracy: {spread_accuracy:.1%}")
    print(f"📊 Total Accuracy: {total_accuracy:.1%}")
    print(f"📊 Combined Accuracy: {(spread_accuracy + total_accuracy) / 2:.1%}")
    
    return predictions, spread_accuracy, total_accuracy

def generate_xgboost_report(predictions, spread_accuracy, total_accuracy):
    """Generate comprehensive XGBoost prototype report"""
    print("\n🎯 XGBOOST PROTOTYPE REPORT")
    print("=" * 60)
    
    total_games = len(predictions)
    combined_accuracy = (spread_accuracy + total_accuracy) / 2
    
    # Confidence analysis
    high_confidence = [p for p in predictions if p['confidence'] > 0.6]
    medium_confidence = [p for p in predictions if 0.3 <= p['confidence'] <= 0.6]
    low_confidence = [p for p in predictions if p['confidence'] < 0.3]
    
    print(f"📊 OVERALL PERFORMANCE:")
    print(f"   • Total Games Analyzed: {total_games:,}")
    print(f"   • Spread Accuracy: {spread_accuracy:.1%}")
    print(f"   • Total Accuracy: {total_accuracy:.1%}")
    print(f"   • Combined Accuracy: {combined_accuracy:.1%}")
    
    print(f"\n🎯 CONFIDENCE BREAKDOWN:")
    print(f"   • High Confidence (>60%): {len(high_confidence)} games")
    print(f"   • Medium Confidence (30-60%): {len(medium_confidence)} games")
    print(f"   • Low Confidence (<30%): {len(low_confidence)} games")
    
    # Performance by confidence
    if high_confidence:
        hc_spread_acc = sum(1 for p in high_confidence if p['spread_prediction'] == p['spread_actual']) / len(high_confidence)
        print(f"   • High Confidence Accuracy: {hc_spread_acc:.1%}")
    
    print(f"\n🚀 NEXT STEPS:")
    if combined_accuracy >= 0.58:
        print(f"   ✅ EXCELLENT: {combined_accuracy:.1%} accuracy achieved!")
        print(f"   ✅ Ready for real XGBoost implementation")
        print(f"   ✅ Can proceed to ensemble methods")
    elif combined_accuracy >= 0.55:
        print(f"   ⚠️ GOOD: {combined_accuracy:.1%} accuracy - close to target")
        print(f"   🔧 Need feature engineering improvements")
        print(f"   🔧 Add EPA data for 58%+ target")
    else:
        print(f"   ❌ NEEDS WORK: {combined_accuracy:.1%} accuracy")
        print(f"   🔧 Requires significant feature improvements")
        print(f"   🔧 Need EPA data and advanced metrics")
    
    # Save report
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_games': total_games,
        'spread_accuracy': spread_accuracy,
        'total_accuracy': total_accuracy,
        'combined_accuracy': combined_accuracy,
        'confidence_breakdown': {
            'high': len(high_confidence),
            'medium': len(medium_confidence),
            'low': len(low_confidence)
        },
        'status': 'PROTOTYPE_COMPLETE',
        'ready_for_real_xgboost': combined_accuracy >= 0.55
    }
    
    os.makedirs('data/models', exist_ok=True)
    with open('data/models/xgboost_prototype_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n💾 Report saved: data/models/xgboost_prototype_report.json")

def main():
    """Main XGBoost prototype process"""
    print("🤖 XGBOOST NFL PROTOTYPE")
    print("=" * 50)
    print("Testing our data with XGBoost-style predictions...")
    
    # Load consolidated data
    data = load_consolidated_data()
    
    if not data['betting_odds']:
        print("❌ No betting odds data found!")
        return
    
    # Create team ratings
    team_ratings = create_team_strength_ratings(data['betting_odds'])
    
    # Create features for all games
    print("\n🔧 Creating feature matrix...")
    features_data = []
    
    for game in data['betting_odds']:
        features = create_features_for_game(game, team_ratings, data['weather_data'])
        if features:
            features_data.append(features)
    
    print(f"✅ Created features for {len(features_data)} games")
    
    # Run XGBoost simulation
    predictions, spread_acc, total_acc = simple_xgboost_simulation(features_data)
    
    # Generate report
    generate_xgboost_report(predictions, spread_acc, total_acc)
    
    print(f"\n🎉 XGBOOST PROTOTYPE COMPLETE!")
    
    combined_accuracy = (spread_acc + total_acc) / 2
    if combined_accuracy >= 0.58:
        print(f"🚀 READY FOR PRODUCTION: {combined_accuracy:.1%} accuracy!")
    else:
        print(f"🔧 NEEDS EPA DATA: Current {combined_accuracy:.1%}, need 58%+")

if __name__ == "__main__":
    main() 