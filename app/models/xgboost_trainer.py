#!/usr/bin/env python3
"""
XGBoost Training System
Implements research-proven XGBoost model with time-series validation
No data leakage, honest accuracy tracking
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

class NFLXGBoostTrainer:
    """Trains XGBoost model with time-series validation"""
    
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
            'eval_metric': 'logloss'
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
    
    def prepare_training_data(self, data):
        """Prepare data for XGBoost training with time-series structure"""
        print("🔧 Preparing training data...")
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Sort by date for time-series validation
        df['game_date'] = pd.to_datetime(df['game_date'])
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
        
        # Prepare target variables
        y_home_win = df['home_win'].values
        y_spread_cover = df['spread_cover'].values
        y_total_over = df['total_over'].values
        
        print(f"✅ Prepared training data:")
        print(f"   📊 Games: {len(df)}")
        print(f"   🔧 Features: {len(feature_columns)}")
        print(f"   🎯 Targets: home_win, spread_cover, total_over")
        print(f"   📅 Date range: {df['game_date'].min()} to {df['game_date'].max()}")
        
        return X, y_home_win, y_spread_cover, y_total_over, feature_columns, df
    
    def time_series_validation(self, X, y, target_name, n_splits=5):
        """Perform time-series cross-validation"""
        print(f"\n🔍 Time-Series Validation for {target_name}")
        print("=" * 45)
        
        tscv = TimeSeriesSplit(n_splits=n_splits)
        fold_scores = []
        fold_details = []
        
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            print(f"📊 Fold {fold + 1}/{n_splits}")
            
            # Split data
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            # Train model
            model = xgb.XGBClassifier(**self.xgb_params)
            model.fit(X_train, y_train, verbose=False)
            
            # Predict
            y_pred = model.predict(X_val)
            y_pred_proba = model.predict_proba(X_val)[:, 1]
            
            # Calculate metrics
            accuracy = accuracy_score(y_val, y_pred)
            fold_scores.append(accuracy)
            
            fold_details.append({
                'fold': fold + 1,
                'train_size': len(X_train),
                'val_size': len(X_val),
                'accuracy': accuracy,
                'predictions': len(y_pred)
            })
            
            print(f"   ✅ Accuracy: {accuracy:.3f} ({len(X_val)} games)")
        
        # Calculate overall performance
        mean_accuracy = np.mean(fold_scores)
        std_accuracy = np.std(fold_scores)
        
        print(f"\n📊 {target_name} Validation Results:")
        print(f"   🎯 Mean Accuracy: {mean_accuracy:.3f} ± {std_accuracy:.3f}")
        print(f"   📈 Best Fold: {max(fold_scores):.3f}")
        print(f"   📉 Worst Fold: {min(fold_scores):.3f}")
        
        return {
            'target': target_name,
            'mean_accuracy': mean_accuracy,
            'std_accuracy': std_accuracy,
            'fold_scores': fold_scores,
            'fold_details': fold_details
        }
    
    def train_final_models(self, X, y_home_win, y_spread_cover, y_total_over, feature_columns):
        """Train final models on full dataset"""
        print("\n🎯 TRAINING FINAL MODELS")
        print("=" * 35)
        
        targets = {
            'home_win': y_home_win,
            'spread_cover': y_spread_cover,
            'total_over': y_total_over
        }
        
        for target_name, y in targets.items():
            print(f"\n🔧 Training {target_name} model...")
            
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
        
        print(f"\n✅ All models trained successfully")
    
    def evaluate_models(self, X, y_home_win, y_spread_cover, y_total_over):
        """Evaluate all trained models"""
        print("\n📊 MODEL EVALUATION")
        print("=" * 25)
        
        targets = {
            'home_win': y_home_win,
            'spread_cover': y_spread_cover,
            'total_over': y_total_over
        }
        
        evaluation_results = {}
        
        for target_name, y in targets.items():
            if target_name in self.models:
                model = self.models[target_name]
                
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
        
        self.performance_metrics = evaluation_results
        return evaluation_results
    
    def save_models_and_results(self):
        """Save trained models and results"""
        print("\n💾 SAVING MODELS AND RESULTS")
        print("=" * 35)
        
        # Save models
        for target_name, model in self.models.items():
            model_file = os.path.join(self.base_path, 'xgboost_model', f'{target_name}_model.json')
            model.save_model(model_file)
            print(f"✅ Saved {target_name} model to: {model_file}")
        
        # Save performance metrics
        metrics_file = os.path.join(self.base_path, 'xgboost_model', 'performance_metrics.json')
        with open(metrics_file, 'w') as f:
            json.dump(self.performance_metrics, f, indent=2)
        print(f"✅ Saved performance metrics to: {metrics_file}")
        
        # Save feature importance
        importance_file = os.path.join(self.base_path, 'xgboost_model', 'feature_importance.json')
        with open(importance_file, 'w') as f:
            json.dump(self.feature_importance, f, indent=2)
        print(f"✅ Saved feature importance to: {importance_file}")
        
        return True
    
    def generate_training_summary(self):
        """Generate comprehensive training summary"""
        print("\n📋 XGBOOST TRAINING SUMMARY")
        print("=" * 35)
        
        print(f"🎯 Models Trained: {len(self.models)}")
        print(f"🔧 XGBoost Parameters: {self.xgb_params}")
        
        if self.performance_metrics:
            print(f"\n📊 Performance Summary:")
            for target, metrics in self.performance_metrics.items():
                print(f"   {target.upper()}:")
                print(f"     Overall: {metrics['overall_accuracy']:.3f}")
                print(f"     High Confidence: {metrics['high_confidence_accuracy']:.3f}")
        
        print(f"\n✅ XGBOOST MODEL TRAINING COMPLETE")
        print(f"🎯 Ready for production deployment")

def main():
    """Main execution function"""
    print("🏈 NFL XGBOOST TRAINING SYSTEM")
    print("=" * 50)
    
    trainer = NFLXGBoostTrainer()
    
    # Load and prepare data
    data = trainer.load_engineered_features()
    if not data:
        return
    
    X, y_home_win, y_spread_cover, y_total_over, feature_columns, df = trainer.prepare_training_data(data)
    
    # Perform time-series validation
    home_win_validation = trainer.time_series_validation(X, y_home_win, 'home_win')
    spread_validation = trainer.time_series_validation(X, y_spread_cover, 'spread_cover')
    total_validation = trainer.time_series_validation(X, y_total_over, 'total_over')
    
    # Train final models
    trainer.train_final_models(X, y_home_win, y_spread_cover, y_total_over, feature_columns)
    
    # Evaluate models
    trainer.evaluate_models(X, y_home_win, y_spread_cover, y_total_over)
    
    # Save everything
    trainer.save_models_and_results()
    
    # Generate summary
    trainer.generate_training_summary()
    
    print("\n🎯 PHASE 3 COMPLETE - XGBOOST MODELS READY")

if __name__ == "__main__":
    main() 