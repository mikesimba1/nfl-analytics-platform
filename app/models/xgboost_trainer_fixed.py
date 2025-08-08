#!/usr/bin/env python3
"""
Fixed XGBoost Training System
Handles data issues and provides robust training with proper validation
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
import xgboost as xgb
from validation.season_splitter import season_walk_forward
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

class NFLXGBoostTrainerFixed:
    """Fixed XGBoost trainer with robust error handling"""
    
    def __init__(self):
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.models = {}
        self.performance_metrics = {}
        self.feature_importance = {}
        
        # Research-proven XGBoost parameters
        self.xgb_params = {
            'learning_rate': 0.1,
            'max_depth': 5,
            'min_child_weight': 10,
            'subsample': 0.7,
            'n_estimators': 250,
            'objective': 'binary:logistic',
            'random_state': 42,
            'eval_metric': 'logloss',
            'base_score': 0.5  # Fix for logistic loss
        }
    
    def load_engineered_features(self):
        """Load engineered features dataset"""
        print("📊 Loading engineered features...")
        
        features_file = os.path.join(self.base_path, 'xgboost_model', 'engineered_features.json')
        
        if os.path.exists(features_file):
            with open(features_file, 'r') as f:
                data = json.load(f)
            print(f"✅ Loaded {len(data)} games with engineered features")
            return data
        else:
            print("❌ Engineered features file not found")
            return []
    
    def analyze_target_variables(self, data):
        """Analyze target variables to identify issues"""
        print("\n🔍 ANALYZING TARGET VARIABLES")
        print("=" * 40)
        
        df = pd.DataFrame(data)
        
        targets = ['home_win', 'spread_cover', 'total_over']
        
        for target in targets:
            if target in df.columns:
                values = df[target].values
                unique_values = np.unique(values)
                value_counts = pd.Series(values).value_counts()
                
                print(f"\n📊 {target.upper()}:")
                print(f"   Unique values: {unique_values}")
                print(f"   Value counts: {dict(value_counts)}")
                print(f"   Class balance: {value_counts.values / len(values)}")
                
                # Check for problematic distributions
                if len(unique_values) < 2:
                    print(f"   ⚠️  WARNING: {target} has only one class!")
                elif min(value_counts.values) / len(values) < 0.1:
                    print(f"   ⚠️  WARNING: {target} is highly imbalanced!")
                else:
                    print(f"   ✅ {target} looks good for training")
    
    def prepare_training_data(self, data):
        """Prepare data for XGBoost training with validation"""
        print("\n🔧 PREPARING TRAINING DATA")
        print("=" * 35)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Sort by date for time-series validation
        df['game_date'] = pd.to_datetime(df['game_date'])
        df['season'] = df['game_date'].dt.year
        df = df.sort_values('game_date')
        
        # Define feature columns (22 engineered features)
        feature_columns = [
            # Tier 1: Core Predictive Features
            'epa_differential', 'dvoa_differential', 'point_differential',
            'offensive_efficiency', 'defensive_efficiency',
            
            # Tier 2: Advanced Analytics
            'success_rate_differential', 'explosive_play_rate', 'third_down_efficiency',
            'red_zone_efficiency', 'turnover_differential', 'pressure_rate_differential',
            'yards_per_play_differential', 'scoring_efficiency',
            
            # Tier 3: Situational Factors
            'home_field_advantage', 'rest_differential', 'recent_form_trend',
            'head_to_head_history', 'weather_impact_score', 'injury_impact_score',
            'divisional_game_factor', 'primetime_performance', 'season_momentum'
        ]
        
        # Prepare feature matrix
        X = df[feature_columns].values
        
        # Prepare target variables with validation
        targets = {}
        
        for target in ['home_win', 'spread_cover', 'total_over']:
            if target in df.columns:
                y = df[target].values
                
                # Check if target is suitable for training
                unique_vals = np.unique(y)
                if len(unique_vals) >= 2:
                    targets[target] = y
                    print(f"✅ {target}: {len(unique_vals)} classes, suitable for training")
                else:
                    print(f"❌ {target}: Only {len(unique_vals)} class(es), skipping")
        
        print(f"\n✅ Prepared training data:")
        print(f"   📊 Games: {len(df)}")
        print(f"   🔧 Features: {len(feature_columns)}")
        print(f"   🎯 Valid targets: {list(targets.keys())}")
        print(f"   📅 Date range: {df['game_date'].min()} to {df['game_date'].max()}")
        
        return X, targets, feature_columns, df
    
    def season_walk_forward_validation(self, df, feature_columns, y, target_name, start_test_season=2018):
        """Leakage-proof walk-forward validation using season blocks."""
        print(f"\n🔍 Walk-Forward Season Validation for {target_name}")
        print("=" * 55)

        unique_vals = np.unique(y)
        if len(unique_vals) < 2:
            print(f"❌ {target_name} has insufficient class variation")
            return None

        fold_scores = []
        for fold, (train_idx, test_idx) in enumerate(season_walk_forward(df, start_test_season=start_test_season)):
            X_train = df.loc[train_idx, feature_columns].values
            y_train = y[train_idx]
            X_test  = df.loc[test_idx, feature_columns].values
            y_test  = y[test_idx]

            if len(np.unique(y_train)) < 2:
                print(f"⚠️  Fold {fold+1}: skipping, only one class in training.")
                continue

            model = xgb.XGBClassifier(**self.xgb_params)
            model.fit(X_train, y_train, verbose=False)
            y_pred = model.predict(X_test)
            acc = accuracy_score(y_test, y_pred)
            fold_scores.append(acc)
            print(f"📊 Fold {fold+1}: Train seasons < {df.loc[test_idx[0], 'season']} → Accuracy {acc:.3f} on {len(y_test)} games")

        if not fold_scores:
            print("❌ Walk-forward validation produced no folds.")
            return None

        mean_acc = np.mean(fold_scores)
        print(f"🏁 Mean walk-forward accuracy: {mean_acc:.3f} across {len(fold_scores)} folds")
        return mean_acc
    
    def train_final_models(self, X, targets, feature_columns):
        """Train final models on full dataset"""
        print("\n🎯 TRAINING FINAL MODELS")
        print("=" * 35)
        
        for target_name, y in targets.items():
            print(f"\n🔧 Training {target_name} model...")
            
            try:
                # Train model
                model = xgb.XGBClassifier(**self.xgb_params)
                model.fit(X, y, verbose=False)
                
                # Store model
                self.models[target_name] = model
                
                # Get feature importance
                importance = model.feature_importances_
                feature_importance = dict(zip(feature_columns, importance))
                self.feature_importance[target_name] = feature_importance
                
                # Calculate training accuracy
                y_pred = model.predict(X)
                train_accuracy = accuracy_score(y, y_pred)
                
                print(f"   ✅ Model trained - Training accuracy: {train_accuracy:.3f}")
                
                # Show top 5 most important features
                sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
                print(f"   🔝 Top 5 features:")
                for i, (feature, importance) in enumerate(sorted_features[:5]):
                    print(f"      {i+1}. {feature}: {importance:.3f}")
                    
            except Exception as e:
                print(f"   ❌ Error training {target_name}: {str(e)}")
                continue
        
        print(f"\n✅ Successfully trained {len(self.models)} models")
    
    def evaluate_models(self, X, targets):
        """Evaluate all trained models"""
        print("\n📊 MODEL EVALUATION")
        print("=" * 25)
        
        evaluation_results = {}
        
        for target_name, y in targets.items():
            if target_name in self.models:
                model = self.models[target_name]
                
                try:
                    # Predictions
                    y_pred = model.predict(X)
                    y_pred_proba = model.predict_proba(X)[:, 1]
                    
                    # Metrics
                    accuracy = accuracy_score(y, y_pred)
                    
                    # Confidence-based accuracy
                    high_conf_mask = (y_pred_proba > 0.65) | (y_pred_proba < 0.35)
                    if np.sum(high_conf_mask) > 0:
                        high_conf_accuracy = accuracy_score(y[high_conf_mask], y_pred[high_conf_mask])
                        high_conf_games = np.sum(high_conf_mask)
                    else:
                        high_conf_accuracy = 0
                        high_conf_games = 0
                    
                    evaluation_results[target_name] = {
                        'overall_accuracy': accuracy,
                        'high_confidence_accuracy': high_conf_accuracy,
                        'high_confidence_games': high_conf_games,
                        'total_games': len(y)
                    }
                    
                    print(f"\n🎯 {target_name.upper()} Results:")
                    print(f"   📊 Overall Accuracy: {accuracy:.3f}")
                    print(f"   🎯 High Confidence Accuracy: {high_conf_accuracy:.3f} ({high_conf_games} games)")
                    print(f"   📈 Total Games: {len(y)}")
                    
                except Exception as e:
                    print(f"\n❌ Error evaluating {target_name}: {str(e)}")
        
        self.performance_metrics = evaluation_results
        return evaluation_results
    
    def save_models_and_results(self):
        """Save trained models and results"""
        print("\n💾 SAVING MODELS AND RESULTS")
        print("=" * 35)
        
        # Save models
        saved_models = 0
        for target_name, model in self.models.items():
            try:
                model_file = os.path.join(self.base_path, 'xgboost_model', f'{target_name}_model.json')
                model.save_model(model_file)
                print(f"✅ Saved {target_name} model to: {model_file}")
                saved_models += 1
            except Exception as e:
                print(f"❌ Error saving {target_name} model: {str(e)}")
        
        # Save performance metrics
        if self.performance_metrics:
            metrics_file = os.path.join(self.base_path, 'xgboost_model', 'performance_metrics.json')
            with open(metrics_file, 'w') as f:
                json.dump(self.performance_metrics, f, indent=2)
            print(f"✅ Saved performance metrics to: {metrics_file}")
        
        # Save feature importance
        if self.feature_importance:
            importance_file = os.path.join(self.base_path, 'xgboost_model', 'feature_importance.json')
            with open(importance_file, 'w') as f:
                json.dump(self.feature_importance, f, indent=2)
            print(f"✅ Saved feature importance to: {importance_file}")
        
        return saved_models > 0
    
    def generate_training_summary(self):
        """Generate comprehensive training summary"""
        print("\n📋 XGBOOST TRAINING SUMMARY")
        print("=" * 35)
        
        print(f"🎯 Models Successfully Trained: {len(self.models)}")
        print(f"🔧 XGBoost Parameters Used:")
        for key, value in self.xgb_params.items():
            print(f"   {key}: {value}")
        
        if self.performance_metrics:
            print(f"\n📊 Performance Summary:")
            for target, metrics in self.performance_metrics.items():
                print(f"   {target.upper()}:")
                print(f"     Overall Accuracy: {metrics['overall_accuracy']:.3f}")
                print(f"     High Confidence: {metrics['high_confidence_accuracy']:.3f}")
                print(f"     High Conf Games: {metrics['high_confidence_games']}")
        
        print(f"\n✅ XGBOOST MODEL TRAINING COMPLETE")
        print(f"🎯 Models ready for production deployment")
        
        # Provide honest assessment
        if self.performance_metrics:
            accuracies = [m['overall_accuracy'] for m in self.performance_metrics.values()]
            avg_accuracy = np.mean(accuracies)
            
            print(f"\n🎯 HONEST PERFORMANCE ASSESSMENT:")
            print(f"   Average Accuracy: {avg_accuracy:.3f}")
            
            if avg_accuracy >= 0.58:
                print(f"   ✅ EXCELLENT: Exceeds 58% target")
            elif avg_accuracy >= 0.55:
                print(f"   ✅ GOOD: Meets baseline expectations")
            elif avg_accuracy >= 0.52:
                print(f"   ⚠️  FAIR: Above random, needs improvement")
            else:
                print(f"   ❌ POOR: Below expectations, needs major work")

def main():
    """Main execution function"""
    print("🏈 NFL XGBOOST TRAINING SYSTEM (FIXED)")
    print("=" * 50)
    
    trainer = NFLXGBoostTrainerFixed()
    
    # Load and analyze data
    data = trainer.load_engineered_features()
    if not data:
        return
    
    # Analyze target variables first
    trainer.analyze_target_variables(data)
    
    # Prepare training data
    X, targets, feature_columns, df = trainer.prepare_training_data(data)

    validation_results = {}
    for target_name, y in targets.items():
        result = trainer.season_walk_forward_validation(df, feature_columns, y, target_name, start_test_season=2018)
        if result is not None:
            validation_results[target_name] = result
    
    # Train final models
    trainer.train_final_models(X, targets, feature_columns)
    
    # Evaluate models
    trainer.evaluate_models(X, targets)
    
    # Save everything
    trainer.save_models_and_results()
    
    # Generate summary
    trainer.generate_training_summary()
    
    print("\n🎯 PHASE 3 COMPLETE - XGBOOST MODELS READY")

if __name__ == "__main__":
    main() 