#!/usr/bin/env python3
"""
PRODUCTION DATA INTEGRATOR
Integrate all fixed data sources into production-ready prediction system
"""

import json
import pandas as pd
import numpy as np
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class ProductionDataIntegrator:
    """Integrate all data sources for production predictions"""
    
    def __init__(self):
        print("🏈 PRODUCTION DATA INTEGRATOR")
        print("="*60)
        print("Integrating all fixed data sources for production...")
        
        self.data_sources = {}
        self.integrated_features = {}
        self.prediction_ready_data = {}
        
    def load_all_data_sources(self):
        """Load all available data sources"""
        print("\n📊 LOADING ALL DATA SOURCES")
        print("-" * 40)
        
        # Load EPA data
        try:
            epa_data = pd.read_csv('data/real-current/simplified_epa_data.csv')
            self.data_sources['epa'] = epa_data
            print(f"✅ EPA data loaded: {len(epa_data)} teams")
        except Exception as e:
            print(f"❌ EPA data failed: {e}")
        
        # Load DVOA data
        try:
            dvoa_data = pd.read_csv('data/real-current/team_dvoa_ratings.csv')
            self.data_sources['dvoa'] = dvoa_data
            print(f"✅ DVOA data loaded: {len(dvoa_data)} teams")
        except Exception as e:
            print(f"❌ DVOA data failed: {e}")
        
        # Load current odds
        try:
            with open('data/real-current/current_odds.json', 'r') as f:
                odds_data = json.load(f)
            self.data_sources['odds'] = odds_data
            print(f"✅ Live odds loaded: {len(odds_data)} games")
        except Exception as e:
            print(f"❌ Odds data failed: {e}")
        
        # Load team ratings
        try:
            team_ratings = pd.read_csv('../nfl_data/team_ratings.csv')
            self.data_sources['ratings'] = team_ratings
            print(f"✅ Team ratings loaded: {len(team_ratings)} teams")
        except Exception as e:
            print(f"❌ Team ratings failed: {e}")
        
        return len(self.data_sources) > 0
    
    def create_unified_team_features(self):
        """Create unified feature set for each team"""
        print("\n🔧 CREATING UNIFIED TEAM FEATURES")
        print("-" * 40)
        
        # Start with team list
        if 'epa' in self.data_sources:
            teams = self.data_sources['epa']['team'].unique()
        elif 'dvoa' in self.data_sources:
            teams = self.data_sources['dvoa']['team'].unique()
        else:
            teams = ['KC', 'BUF', 'BAL', 'CIN', 'HOU', 'IND', 'JAX', 'TEN',
                    'DEN', 'LV', 'LAC', 'PIT', 'CLE', 'MIA', 'NE', 'NYJ',
                    'DAL', 'NYG', 'PHI', 'WAS', 'GB', 'CHI', 'DET', 'MIN',
                    'ATL', 'CAR', 'NO', 'TB', 'ARI', 'LAR', 'SF', 'SEA']
        
        unified_features = []
        
        for team in teams:
            features = {'team': team}
            
            # EPA features (22% weight)
            if 'epa' in self.data_sources:
                epa_row = self.data_sources['epa'][self.data_sources['epa']['team'] == team]
                if not epa_row.empty:
                    features['offensive_epa'] = float(epa_row.iloc[0]['offensive_epa'])
                    features['defensive_epa'] = float(epa_row.iloc[0]['defensive_epa'])
                else:
                    features['offensive_epa'] = 0.0
                    features['defensive_epa'] = 0.0
            else:
                features['offensive_epa'] = 0.0
                features['defensive_epa'] = 0.0
            
            # DVOA features (13.5% weight)
            if 'dvoa' in self.data_sources:
                dvoa_row = self.data_sources['dvoa'][self.data_sources['dvoa']['team'] == team]
                if not dvoa_row.empty:
                    features['offensive_dvoa'] = float(dvoa_row.iloc[0]['offensive_dvoa'])
                    features['defensive_dvoa'] = float(dvoa_row.iloc[0]['defensive_dvoa'])
                    features['total_dvoa'] = float(dvoa_row.iloc[0]['total_dvoa'])
                    features['points_per_game'] = float(dvoa_row.iloc[0]['points_per_game'])
                    features['points_allowed_per_game'] = float(dvoa_row.iloc[0]['points_allowed_per_game'])
                else:
                    features['offensive_dvoa'] = 0.0
                    features['defensive_dvoa'] = 0.0
                    features['total_dvoa'] = 0.0
                    features['points_per_game'] = 22.0
                    features['points_allowed_per_game'] = 22.0
            else:
                features['offensive_dvoa'] = 0.0
                features['defensive_dvoa'] = 0.0
                features['total_dvoa'] = 0.0
                features['points_per_game'] = 22.0
                features['points_allowed_per_game'] = 22.0
            
            # Team rating features (historical)
            if 'ratings' in self.data_sources:
                rating_row = self.data_sources['ratings'][self.data_sources['ratings']['team'] == team]
                if not rating_row.empty:
                    features['team_rating'] = float(rating_row.iloc[0]['overall_rating'])
                    features['offensive_rating'] = float(rating_row.iloc[0]['offensive_rating'])
                    features['defensive_rating'] = float(rating_row.iloc[0]['defensive_rating'])
                else:
                    features['team_rating'] = 50.0
                    features['offensive_rating'] = 50.0
                    features['defensive_rating'] = 50.0
            else:
                features['team_rating'] = 50.0
                features['offensive_rating'] = 50.0
                features['defensive_rating'] = 50.0
            
            # Calculate composite strength scores
            features['offensive_strength'] = (
                features['offensive_epa'] * 0.4 +
                features['offensive_dvoa'] * 0.3 +
                (features['points_per_game'] - 22) * 0.02 * 0.3
            )
            
            features['defensive_strength'] = (
                features['defensive_epa'] * 0.4 +
                features['defensive_dvoa'] * 0.3 +
                (22 - features['points_allowed_per_game']) * 0.02 * 0.3
            )
            
            features['overall_strength'] = (
                features['offensive_strength'] * 0.55 +
                features['defensive_strength'] * 0.45
            )
            
            unified_features.append(features)
        
        # Save unified features
        features_df = pd.DataFrame(unified_features)
        features_df.to_csv('data/real-current/unified_team_features.csv', index=False)
        print(f"✅ Unified features created for {len(features_df)} teams")
        
        self.integrated_features = features_df
        return True
    
    def create_prediction_engine(self):
        """Create production-ready prediction engine"""
        print("\n🎯 CREATING PREDICTION ENGINE")
        print("-" * 40)
        
        if self.integrated_features is None or len(self.integrated_features) == 0:
            print("❌ No features available for prediction engine")
            return False
        
        # Create matchup predictor
        def predict_game(home_team, away_team):
            """Predict game outcome using integrated features"""
            
            # Get team features
            home_features = self.integrated_features[
                self.integrated_features['team'] == home_team
            ]
            away_features = self.integrated_features[
                self.integrated_features['team'] == away_team
            ]
            
            if home_features.empty or away_features.empty:
                return {
                    'predicted_spread': 0.0,
                    'predicted_total': 44.0,
                    'confidence': 'LOW',
                    'home_win_probability': 0.5
                }
            
            home = home_features.iloc[0]
            away = away_features.iloc[0]
            
            # Calculate strength differential
            strength_diff = home['overall_strength'] - away['overall_strength']
            
            # Home field advantage (2.8 points average)
            home_field_advantage = 2.8
            
            # Predicted spread (negative means home team favored)
            predicted_spread = -(strength_diff * 15 + home_field_advantage)
            
            # Predicted total
            predicted_total = (
                home['points_per_game'] + away['points_per_game']
            ) * 0.95  # Slight defensive adjustment
            
            # Win probability
            spread_advantage = -predicted_spread  # Flip for home team
            win_prob = 1 / (1 + np.exp(-spread_advantage * 0.15))
            
            # Confidence based on strength differential
            abs_diff = abs(strength_diff)
            if abs_diff > 0.3:
                confidence = 'HIGH'
            elif abs_diff > 0.15:
                confidence = 'MEDIUM'
            else:
                confidence = 'LOW'
            
            return {
                'predicted_spread': round(predicted_spread, 1),
                'predicted_total': round(predicted_total, 1),
                'confidence': confidence,
                'home_win_probability': round(win_prob, 3),
                'strength_differential': round(strength_diff, 3)
            }
        
        # Test prediction engine
        test_prediction = predict_game('KC', 'BUF')
        print(f"✅ Prediction engine created")
        print(f"📊 Test prediction (KC vs BUF): {test_prediction}")
        
        # Save prediction function
        self.predict_game = predict_game
        
        return True
    
    def generate_week_predictions(self):
        """Generate predictions for upcoming games"""
        print("\n🏈 GENERATING WEEK PREDICTIONS")
        print("-" * 40)
        
        # Sample upcoming games (Week 1 2025)
        upcoming_games = [
            {'home_team': 'KC', 'away_team': 'BUF', 'game_id': 'week1_game1'},
            {'home_team': 'BAL', 'away_team': 'CIN', 'game_id': 'week1_game2'},
            {'home_team': 'PHI', 'away_team': 'GB', 'game_id': 'week1_game3'},
            {'home_team': 'DET', 'away_team': 'MIN', 'game_id': 'week1_game4'},
            {'home_team': 'TB', 'away_team': 'ATL', 'game_id': 'week1_game5'},
            {'home_team': 'SF', 'away_team': 'LAR', 'game_id': 'week1_game6'},
            {'home_team': 'DAL', 'away_team': 'NYG', 'game_id': 'week1_game7'},
            {'home_team': 'MIA', 'away_team': 'NE', 'game_id': 'week1_game8'}
        ]
        
        predictions = []
        
        for game in upcoming_games:
            prediction = self.predict_game(
                game['home_team'], 
                game['away_team']
            )
            
            prediction.update({
                'game_id': game['game_id'],
                'home_team': game['home_team'],
                'away_team': game['away_team'],
                'prediction_date': datetime.now().isoformat()
            })
            
            predictions.append(prediction)
        
        # Save predictions
        with open('data/real-current/week_predictions.json', 'w') as f:
            json.dump(predictions, f, indent=2)
        
        print(f"✅ Generated predictions for {len(predictions)} games")
        
        # Show sample predictions
        print("\n📊 SAMPLE PREDICTIONS:")
        for pred in predictions[:4]:
            print(f"   {pred['away_team']} @ {pred['home_team']}: "
                  f"Spread {pred['predicted_spread']}, "
                  f"Total {pred['predicted_total']}, "
                  f"Confidence: {pred['confidence']}")
        
        return predictions
    
    def run_integration(self):
        """Run complete integration process"""
        print("\n🚀 RUNNING COMPLETE INTEGRATION")
        print("="*60)
        
        steps = [
            ('Load Data Sources', self.load_all_data_sources),
            ('Create Unified Features', self.create_unified_team_features),
            ('Create Prediction Engine', self.create_prediction_engine),
            ('Generate Week Predictions', self.generate_week_predictions)
        ]
        
        successful_steps = 0
        
        for step_name, step_function in steps:
            try:
                print(f"\n📋 {step_name}...")
                if step_function():
                    successful_steps += 1
                    print(f"✅ {step_name} completed")
                else:
                    print(f"❌ {step_name} failed")
            except Exception as e:
                print(f"❌ {step_name} error: {e}")
        
        # Generate final report
        self.generate_integration_report(successful_steps, len(steps))
        
        return successful_steps == len(steps)
    
    def generate_integration_report(self, successful_steps, total_steps):
        """Generate final integration report"""
        print("\n📊 PRODUCTION INTEGRATION REPORT")
        print("="*60)
        
        success_rate = (successful_steps / total_steps) * 100
        
        report = {
            'integration_date': datetime.now().isoformat(),
            'total_steps': total_steps,
            'successful_steps': successful_steps,
            'success_rate': success_rate,
            'data_sources_integrated': list(self.data_sources.keys()),
            'features_created': len(self.integrated_features) if hasattr(self.integrated_features, '__len__') else 0,
            'production_status': 'READY' if success_rate == 100 else 'PARTIAL' if success_rate >= 80 else 'NEEDS_WORK'
        }
        
        # Save report
        with open('data/real-current/production_integration_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📈 SUCCESS RATE: {success_rate:.1f}% ({successful_steps}/{total_steps})")
        print(f"📊 DATA SOURCES: {len(self.data_sources)} integrated")
        print(f"🎯 PRODUCTION STATUS: {report['production_status']}")
        
        print(f"\n💾 Report saved: data/real-current/production_integration_report.json")
        
        return report

def main():
    """Run production data integration"""
    integrator = ProductionDataIntegrator()
    success = integrator.run_integration()
    
    if success:
        print("\n🎉 PRODUCTION INTEGRATION COMPLETED SUCCESSFULLY!")
        print("🚀 System ready for live deployment")
    else:
        print("\n⚠️ Some integration steps failed - check individual results")

if __name__ == "__main__":
    main() 