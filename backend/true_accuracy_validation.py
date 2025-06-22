#!/usr/bin/env python3
"""
TRUE ACCURACY VALIDATION
Rigorous validation of actual model accuracy using proper methodology
"""

import json
import pandas as pd
import numpy as np
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

class TrueAccuracyValidator:
    """Validate true model accuracy with proper methodology"""
    
    def __init__(self):
        print("🎯 TRUE ACCURACY VALIDATION")
        print("="*60)
        print("Running rigorous accuracy validation with proper methodology...")
        
        self.historical_data = None
        self.games_2024 = None
        self.team_ratings = None
        
    def load_and_validate_data(self):
        """Load and validate all data sources"""
        print("\n📊 LOADING AND VALIDATING DATA")
        print("-" * 40)
        
        try:
            # Load historical data
            historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
            if os.path.exists(historical_file):
                with open(historical_file, 'r') as f:
                    self.historical_data = json.load(f)
                print(f"✅ Historical data: {len(self.historical_data)} games")
            else:
                print("❌ Historical data file missing")
                return False
            
            # Load 2024 games
            games_2024_file = "../nfl_data/games/2024_schedule.csv"
            if os.path.exists(games_2024_file):
                self.games_2024 = pd.read_csv(games_2024_file)
                completed = self.games_2024[(self.games_2024['home_score'].notna()) & 
                                          (self.games_2024['away_score'].notna())]
                print(f"✅ 2024 games: {len(completed)} completed")
            else:
                print("❌ 2024 games file missing")
                return False
            
            # Load team ratings
            team_ratings_file = "../nfl_data/team_ratings.csv"
            if os.path.exists(team_ratings_file):
                self.team_ratings = pd.read_csv(team_ratings_file)
                print(f"✅ Team ratings: {len(self.team_ratings)} teams")
            else:
                print("❌ Team ratings file missing")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Data loading error: {e}")
            return False
    
    def prepare_training_data(self):
        """Prepare training data from historical games"""
        print("\n🔧 PREPARING TRAINING DATA")
        print("-" * 40)
        
        try:
            training_data = []
            
            # Process historical games
            for game in self.historical_data:
                try:
                    home_score = float(game.get('home_final', 0))
                    away_score = float(game.get('away_final', 0))
                    
                    if home_score > 0 and away_score > 0:  # Valid completed game
                        # Features (simplified for validation)
                        features = {
                            'home_team': game.get('home_team', ''),
                            'away_team': game.get('away_team', ''),
                            'home_score': home_score,
                            'away_score': away_score,
                            'home_won': 1 if home_score > away_score else 0,
                            'total_points': home_score + away_score,
                            'point_differential': abs(home_score - away_score)
                        }
                        
                        # Add spread if available
                        if 'spread' in game:
                            features['spread'] = float(game.get('spread', 0))
                        else:
                            features['spread'] = 0  # No spread data
                        
                        training_data.append(features)
                
                except (ValueError, TypeError):
                    continue
            
            training_df = pd.DataFrame(training_data)
            print(f"✅ Training data prepared: {len(training_df)} games")
            
            if len(training_df) > 0:
                print(f"   Home team win rate: {training_df['home_won'].mean():.3f}")
                print(f"   Average total points: {training_df['total_points'].mean():.1f}")
                print(f"   Average point differential: {training_df['point_differential'].mean():.1f}")
            
            return training_df
            
        except Exception as e:
            print(f"❌ Training data preparation error: {e}")
            return None
    
    def prepare_test_data(self):
        """Prepare test data from 2024 games"""
        print("\n🔧 PREPARING TEST DATA")
        print("-" * 40)
        
        try:
            completed_games = self.games_2024[(self.games_2024['home_score'].notna()) & 
                                            (self.games_2024['away_score'].notna())].copy()
            
            test_data = []
            
            for _, game in completed_games.iterrows():
                try:
                    home_score = float(game['home_score'])
                    away_score = float(game['away_score'])
                    
                    features = {
                        'home_team': game.get('home_team', ''),
                        'away_team': game.get('away_team', ''),
                        'home_score': home_score,
                        'away_score': away_score,
                        'home_won': 1 if home_score > away_score else 0,
                        'total_points': home_score + away_score,
                        'point_differential': abs(home_score - away_score)
                    }
                    
                    # Add spread if available
                    features['spread'] = float(game.get('spread', 0))
                    
                    test_data.append(features)
                
                except (ValueError, TypeError):
                    continue
            
            test_df = pd.DataFrame(test_data)
            print(f"✅ Test data prepared: {len(test_df)} games")
            
            if len(test_df) > 0:
                print(f"   Home team win rate: {test_df['home_won'].mean():.3f}")
                print(f"   Average total points: {test_df['total_points'].mean():.1f}")
            
            return test_df
            
        except Exception as e:
            print(f"❌ Test data preparation error: {e}")
            return None
    
    def simple_prediction_model(self, training_df):
        """Create a simple but realistic prediction model"""
        print("\n🧠 CREATING PREDICTION MODEL")
        print("-" * 40)
        
        try:
            # Calculate home field advantage from training data
            home_win_rate = training_df['home_won'].mean()
            print(f"✅ Historical home field advantage: {home_win_rate:.3f}")
            
            # Create team strength ratings from historical data
            team_performance = {}
            
            for _, game in training_df.iterrows():
                home_team = game['home_team']
                away_team = game['away_team']
                home_won = game['home_won']
                
                # Initialize teams if not seen
                if home_team not in team_performance:
                    team_performance[home_team] = {'wins': 0, 'games': 0}
                if away_team not in team_performance:
                    team_performance[away_team] = {'wins': 0, 'games': 0}
                
                # Update performance
                team_performance[home_team]['games'] += 1
                team_performance[away_team]['games'] += 1
                
                if home_won:
                    team_performance[home_team]['wins'] += 1
                else:
                    team_performance[away_team]['wins'] += 1
            
            # Calculate win rates
            team_win_rates = {}
            for team, stats in team_performance.items():
                if stats['games'] > 0:
                    team_win_rates[team] = stats['wins'] / stats['games']
                else:
                    team_win_rates[team] = 0.5  # Default
            
            print(f"✅ Team performance calculated for {len(team_win_rates)} teams")
            
            model_params = {
                'home_field_advantage': home_win_rate,
                'team_win_rates': team_win_rates
            }
            
            return model_params
            
        except Exception as e:
            print(f"❌ Model creation error: {e}")
            return None
    
    def make_predictions(self, test_df, model_params):
        """Make predictions on test data"""
        print("\n🎯 MAKING PREDICTIONS")
        print("-" * 40)
        
        try:
            predictions = []
            confidence_scores = []
            
            home_advantage = model_params['home_field_advantage']
            team_win_rates = model_params['team_win_rates']
            
            for _, game in test_df.iterrows():
                home_team = game['home_team']
                away_team = game['away_team']
                
                # Get team strengths (default to 0.5 if unknown)
                home_strength = team_win_rates.get(home_team, 0.5)
                away_strength = team_win_rates.get(away_team, 0.5)
                
                # Simple prediction model
                # Home team probability = home_strength + home_advantage - away_strength
                home_prob = home_strength + (home_advantage - 0.5) - (away_strength - 0.5)
                home_prob = max(0.1, min(0.9, home_prob))  # Clamp between 0.1 and 0.9
                
                # Predict home team wins if probability > 0.5
                prediction = 1 if home_prob > 0.5 else 0
                predictions.append(prediction)
                
                # Confidence is distance from 0.5
                confidence = abs(home_prob - 0.5) * 2
                confidence_scores.append(confidence)
            
            print(f"✅ Generated {len(predictions)} predictions")
            print(f"   Average confidence: {np.mean(confidence_scores):.3f}")
            print(f"   Predicted home wins: {np.mean(predictions):.3f}")
            
            return predictions, confidence_scores
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return None, None
    
    def evaluate_accuracy(self, test_df, predictions, confidence_scores):
        """Evaluate prediction accuracy"""
        print("\n📊 EVALUATING ACCURACY")
        print("-" * 40)
        
        try:
            actual_outcomes = test_df['home_won'].values
            
            # Overall accuracy
            overall_accuracy = accuracy_score(actual_outcomes, predictions)
            print(f"✅ Overall Accuracy: {overall_accuracy:.3f} ({overall_accuracy:.1%})")
            
            # High confidence accuracy
            high_confidence_mask = np.array(confidence_scores) > 0.6
            if np.sum(high_confidence_mask) > 0:
                high_conf_accuracy = accuracy_score(
                    actual_outcomes[high_confidence_mask], 
                    np.array(predictions)[high_confidence_mask]
                )
                print(f"✅ High Confidence Accuracy: {high_conf_accuracy:.3f} ({high_conf_accuracy:.1%})")
                print(f"   High confidence games: {np.sum(high_confidence_mask)}/{len(predictions)}")
            else:
                high_conf_accuracy = overall_accuracy
                print("⚠️ No high confidence predictions")
            
            # Medium confidence accuracy
            medium_confidence_mask = (np.array(confidence_scores) > 0.3) & (np.array(confidence_scores) <= 0.6)
            if np.sum(medium_confidence_mask) > 0:
                medium_conf_accuracy = accuracy_score(
                    actual_outcomes[medium_confidence_mask], 
                    np.array(predictions)[medium_confidence_mask]
                )
                print(f"✅ Medium Confidence Accuracy: {medium_conf_accuracy:.3f} ({medium_conf_accuracy:.1%})")
                print(f"   Medium confidence games: {np.sum(medium_confidence_mask)}/{len(predictions)}")
            else:
                medium_conf_accuracy = overall_accuracy
            
            # Baseline comparison (always predict home team wins)
            baseline_predictions = [1] * len(actual_outcomes)
            baseline_accuracy = accuracy_score(actual_outcomes, baseline_predictions)
            print(f"📊 Baseline (always home): {baseline_accuracy:.3f} ({baseline_accuracy:.1%})")
            
            # Model improvement over baseline
            improvement = overall_accuracy - baseline_accuracy
            print(f"📈 Model improvement: {improvement:+.3f} ({improvement:+.1%})")
            
            return {
                'overall_accuracy': overall_accuracy,
                'high_confidence_accuracy': high_conf_accuracy,
                'medium_confidence_accuracy': medium_conf_accuracy,
                'baseline_accuracy': baseline_accuracy,
                'improvement_over_baseline': improvement,
                'total_predictions': len(predictions),
                'high_confidence_count': np.sum(high_confidence_mask),
                'medium_confidence_count': np.sum(medium_confidence_mask)
            }
            
        except Exception as e:
            print(f"❌ Evaluation error: {e}")
            return None
    
    def cross_validation(self, training_df, n_folds=5):
        """Perform cross-validation for more robust accuracy estimate"""
        print(f"\n🔄 CROSS-VALIDATION ({n_folds} folds)")
        print("-" * 40)
        
        try:
            from sklearn.model_selection import KFold
            
            kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
            fold_accuracies = []
            
            for fold, (train_idx, val_idx) in enumerate(kf.split(training_df)):
                train_fold = training_df.iloc[train_idx]
                val_fold = training_df.iloc[val_idx]
                
                # Train model on fold
                model_params = self.simple_prediction_model(train_fold)
                if model_params is None:
                    continue
                
                # Make predictions on validation fold
                predictions, confidence_scores = self.make_predictions(val_fold, model_params)
                if predictions is None:
                    continue
                
                # Calculate accuracy
                actual_outcomes = val_fold['home_won'].values
                fold_accuracy = accuracy_score(actual_outcomes, predictions)
                fold_accuracies.append(fold_accuracy)
                
                print(f"   Fold {fold + 1}: {fold_accuracy:.3f} ({fold_accuracy:.1%})")
            
            if fold_accuracies:
                cv_mean = np.mean(fold_accuracies)
                cv_std = np.std(fold_accuracies)
                print(f"✅ Cross-validation accuracy: {cv_mean:.3f} ± {cv_std:.3f}")
                print(f"   Range: {min(fold_accuracies):.3f} to {max(fold_accuracies):.3f}")
                
                return cv_mean, cv_std
            else:
                print("❌ Cross-validation failed")
                return None, None
                
        except Exception as e:
            print(f"❌ Cross-validation error: {e}")
            return None, None
    
    def generate_validation_report(self):
        """Generate comprehensive validation report"""
        print(f"\n🔍 RUNNING TRUE ACCURACY VALIDATION")
        print("="*60)
        
        # Load data
        if not self.load_and_validate_data():
            return None
        
        # Prepare training and test data
        training_df = self.prepare_training_data()
        test_df = self.prepare_test_data()
        
        if training_df is None or test_df is None:
            print("❌ Cannot proceed without valid training/test data")
            return None
        
        # Create model
        model_params = self.simple_prediction_model(training_df)
        if model_params is None:
            return None
        
        # Make predictions
        predictions, confidence_scores = self.make_predictions(test_df, model_params)
        if predictions is None:
            return None
        
        # Evaluate accuracy
        accuracy_results = self.evaluate_accuracy(test_df, predictions, confidence_scores)
        if accuracy_results is None:
            return None
        
        # Cross-validation
        cv_mean, cv_std = self.cross_validation(training_df)
        
        # Generate report
        report = {
            'validation_date': datetime.now().isoformat(),
            'methodology': 'PROPER_TRAIN_TEST_SPLIT',
            'training_games': len(training_df),
            'test_games': len(test_df),
            'model_type': 'TEAM_STRENGTH_WITH_HOME_ADVANTAGE',
            'accuracy_results': accuracy_results,
            'cross_validation': {
                'mean_accuracy': cv_mean,
                'std_accuracy': cv_std
            } if cv_mean is not None else None,
            'data_sources': {
                'historical_games': len(self.historical_data),
                'completed_2024_games': len(test_df),
                'team_ratings': len(self.team_ratings)
            },
            'validation_status': 'COMPLETED_SUCCESSFULLY'
        }
        
        # Save report
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/true_accuracy_validation.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def display_results(self, report):
        """Display validation results"""
        print(f"\n🎯 TRUE ACCURACY VALIDATION RESULTS")
        print("="*60)
        
        if report is None:
            print("❌ Validation failed - no results to display")
            return
        
        accuracy_results = report['accuracy_results']
        
        print(f"📊 VALIDATED ACCURACY RESULTS:")
        print(f"   Overall Accuracy: {accuracy_results['overall_accuracy']:.1%}")
        print(f"   High Confidence: {accuracy_results['high_confidence_accuracy']:.1%}")
        print(f"   Medium Confidence: {accuracy_results['medium_confidence_accuracy']:.1%}")
        print(f"   Baseline (Home): {accuracy_results['baseline_accuracy']:.1%}")
        print(f"   Improvement: {accuracy_results['improvement_over_baseline']:+.1%}")
        
        if report['cross_validation'] and report['cross_validation']['mean_accuracy']:
            cv_results = report['cross_validation']
            print(f"\n🔄 CROSS-VALIDATION:")
            print(f"   Mean Accuracy: {cv_results['mean_accuracy']:.1%}")
            print(f"   Std Deviation: ±{cv_results['std_accuracy']:.1%}")
        
        print(f"\n📈 DATA USED:")
        print(f"   Training Games: {report['training_games']}")
        print(f"   Test Games: {report['test_games']}")
        print(f"   Historical Games: {report['data_sources']['historical_games']}")
        
        # Assessment
        overall_acc = accuracy_results['overall_accuracy']
        
        print(f"\n🎯 ACCURACY ASSESSMENT:")
        if overall_acc >= 0.60:
            print("✅ EXCELLENT: Above 60% accuracy achieved")
        elif overall_acc >= 0.55:
            print("✅ GOOD: Above 55% accuracy achieved")
        elif overall_acc >= 0.52:
            print("✅ DECENT: Above random chance")
        else:
            print("⚠️ NEEDS IMPROVEMENT: Below 52% accuracy")
        
        print(f"\n💾 Full validation report: data/real-current/true_accuracy_validation.json")

def main():
    """Run true accuracy validation"""
    validator = TrueAccuracyValidator()
    report = validator.generate_validation_report()
    validator.display_results(report)
    
    return report

if __name__ == "__main__":
    main() 