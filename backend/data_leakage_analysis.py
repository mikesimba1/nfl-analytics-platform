#!/usr/bin/env python3
"""
DATA LEAKAGE ANALYSIS
Examining temporal data leakage issues in our validation methodology
"""

import json
import pandas as pd
import numpy as np
import os
from datetime import datetime

class DataLeakageAnalyzer:
    """Analyze data leakage issues in our validation methodology"""
    
    def __init__(self):
        print("🚨 DATA LEAKAGE ANALYSIS")
        print("="*60)
        print("Examining temporal data leakage in validation methodology...")
        
        self.leakage_issues = []
        self.temporal_violations = []
        self.recommendations = []
        
    def analyze_temporal_data_usage(self):
        """Analyze how we used time-dependent data"""
        print("\n📅 ANALYZING TEMPORAL DATA USAGE")
        print("-" * 40)
        
        issues = []
        
        # Check team ratings usage
        team_ratings_file = "../nfl_data/team_ratings.csv"
        if os.path.exists(team_ratings_file):
            try:
                df = pd.read_csv(team_ratings_file)
                print(f"✅ Team ratings loaded: {len(df)} teams")
                print(f"   Columns: {df.columns.tolist()}")
                
                # CRITICAL ISSUE: These ratings don't have timestamps
                if 'date' not in df.columns and 'week' not in df.columns and 'season' not in df.columns:
                    issues.append("CRITICAL: Team ratings have no temporal information")
                    issues.append("ISSUE: Same ratings used for all historical predictions")
                    issues.append("LEAKAGE: Future performance included in past predictions")
                    
                    print("❌ MAJOR DATA LEAKAGE DETECTED:")
                    print("   - Team ratings have no date/week/season columns")
                    print("   - Same ratings applied to all historical games")
                    print("   - Future team performance leaked into past predictions")
                
                # Show sample of ratings
                print("\n📊 Sample team ratings:")
                print(df.head())
                
            except Exception as e:
                issues.append(f"Error analyzing team ratings: {e}")
        else:
            issues.append("Team ratings file missing")
        
        return issues
    
    def examine_validation_methodology(self):
        """Examine our validation methodology for temporal issues"""
        print("\n🔍 EXAMINING VALIDATION METHODOLOGY")
        print("-" * 40)
        
        issues = []
        
        # Check our true_accuracy_validation.py approach
        validation_file = "true_accuracy_validation.py"
        if os.path.exists(validation_file):
            try:
                with open(validation_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                print("✅ Validation script found")
                
                # Check for temporal awareness
                temporal_keywords = [
                    'date', 'week', 'season', 'time', 'temporal', 
                    'chronological', 'before', 'after'
                ]
                
                found_temporal = []
                for keyword in temporal_keywords:
                    if keyword in content.lower():
                        found_temporal.append(keyword)
                
                if found_temporal:
                    print(f"✅ Some temporal awareness: {found_temporal}")
                else:
                    issues.append("No temporal awareness in validation script")
                
                # Check for proper time-series split
                if 'TimeSeriesSplit' in content:
                    print("✅ Time series split methodology used")
                elif 'train_test_split' in content:
                    issues.append("ISSUE: Used random split instead of temporal split")
                    print("❌ Used random train/test split (ignores time order)")
                else:
                    issues.append("No clear train/test split methodology")
                
                # Check for future data usage
                if 'team_ratings' in content.lower():
                    issues.append("POTENTIAL LEAKAGE: Team ratings used without temporal validation")
                    print("⚠️ Team ratings used without checking temporal validity")
                
            except Exception as e:
                issues.append(f"Error reading validation script: {e}")
        else:
            issues.append("Validation script missing")
        
        return issues
    
    def analyze_historical_data_structure(self):
        """Analyze historical data for temporal structure"""
        print("\n📊 ANALYZING HISTORICAL DATA STRUCTURE")
        print("-" * 40)
        
        issues = []
        
        # Check historical games data
        historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
        if os.path.exists(historical_file):
            try:
                with open(historical_file, 'r') as f:
                    historical_data = json.load(f)
                
                print(f"✅ Historical data: {len(historical_data)} games")
                
                # Check temporal structure
                sample_games = historical_data[:10]
                dates = []
                
                for game in sample_games:
                    if 'date' in game and game['date']:
                        dates.append(game['date'])
                
                if dates:
                    print(f"✅ Games have dates: {min(dates)} to {max(dates)}")
                    
                    # Check if dates are sortable
                    try:
                        sorted_dates = sorted(dates)
                        print(f"✅ Dates are sortable: {sorted_dates[0]} to {sorted_dates[-1]}")
                    except:
                        issues.append("Game dates are not properly sortable")
                else:
                    issues.append("Historical games missing date information")
                
                # Check what features are available
                if sample_games:
                    sample_features = sample_games[0].keys()
                    print(f"✅ Available features: {list(sample_features)}")
                    
                    # Look for time-dependent features
                    time_dependent = ['ranking', 'elo', 'rating', 'strength', 'momentum']
                    found_time_features = [f for f in sample_features if any(td in str(f).lower() for td in time_dependent)]
                    
                    if found_time_features:
                        issues.append(f"POTENTIAL LEAKAGE: Time-dependent features found: {found_time_features}")
                        print(f"⚠️ Time-dependent features: {found_time_features}")
                    else:
                        print("✅ No obvious time-dependent features in historical data")
                
            except Exception as e:
                issues.append(f"Error analyzing historical data: {e}")
        else:
            issues.append("Historical data file missing")
        
        return issues
    
    def examine_2024_data_usage(self):
        """Examine how 2024 data was used in validation"""
        print("\n📈 EXAMINING 2024 DATA USAGE")
        print("-" * 40)
        
        issues = []
        
        # Check 2024 games
        games_2024_file = "../nfl_data/games/2024_schedule.csv"
        if os.path.exists(games_2024_file):
            try:
                df = pd.read_csv(games_2024_file)
                print(f"✅ 2024 games loaded: {len(df)} total")
                
                completed = df[(df['home_score'].notna()) & (df['away_score'].notna())]
                print(f"✅ Completed games: {len(completed)}")
                
                # Check temporal structure
                if 'week' in df.columns:
                    print(f"✅ Games have week information")
                    print(f"   Week range: {df['week'].min()} to {df['week'].max()}")
                    
                    # CRITICAL CHECK: Did we predict week N using data from week N+1?
                    issues.append("NEED TO VERIFY: Were team ratings calculated using future 2024 results?")
                    print("❌ CRITICAL QUESTION: Do team ratings include 2024 season results?")
                    print("   If YES, then we have MASSIVE data leakage")
                    
                else:
                    issues.append("2024 games missing week information")
                
                # Check if we have game dates
                if 'gameday' in df.columns or 'date' in df.columns:
                    print("✅ Games have date information")
                else:
                    issues.append("2024 games missing date information")
                
            except Exception as e:
                issues.append(f"Error analyzing 2024 games: {e}")
        else:
            issues.append("2024 games file missing")
        
        return issues
    
    def investigate_team_ratings_calculation(self):
        """Investigate how team ratings were calculated"""
        print("\n🔍 INVESTIGATING TEAM RATINGS CALCULATION")
        print("-" * 40)
        
        issues = []
        
        # Look for rating calculation scripts
        rating_scripts = [
            "calculate_team_ratings.py",
            "team_ratings.py", 
            "rating_calculator.py",
            "team_strength.py"
        ]
        
        found_scripts = [script for script in rating_scripts if os.path.exists(script)]
        
        if found_scripts:
            print(f"✅ Found rating scripts: {found_scripts}")
            
            for script in found_scripts:
                try:
                    with open(script, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Check if it uses 2024 data
                    if '2024' in content:
                        issues.append(f"CRITICAL: {script} references 2024 data")
                        print(f"❌ {script} references 2024 data - POTENTIAL LEAKAGE")
                    
                    # Check temporal awareness
                    if 'date' in content.lower() or 'week' in content.lower():
                        print(f"✅ {script} has some temporal awareness")
                    else:
                        issues.append(f"{script} lacks temporal awareness")
                
                except Exception as e:
                    issues.append(f"Error reading {script}: {e}")
        else:
            issues.append("CRITICAL: No team rating calculation scripts found")
            print("❌ No scripts found for team rating calculation")
            print("   This suggests ratings may be static or calculated elsewhere")
        
        # Check if ratings are in nfl_data directory
        nfl_data_files = []
        if os.path.exists("../nfl_data"):
            for root, dirs, files in os.walk("../nfl_data"):
                for file in files:
                    if 'rating' in file.lower() or 'strength' in file.lower():
                        nfl_data_files.append(os.path.join(root, file))
        
        if nfl_data_files:
            print(f"✅ Found rating files: {nfl_data_files}")
            
            # Check file dates to see when they were created/modified
            for file_path in nfl_data_files:
                try:
                    mod_time = os.path.getmtime(file_path)
                    mod_date = datetime.fromtimestamp(mod_time)
                    print(f"   {file_path}: Last modified {mod_date}")
                    
                    # If modified during 2024, might include 2024 data
                    if mod_date.year == 2024:
                        issues.append(f"SUSPICIOUS: {file_path} modified in 2024 - may include 2024 results")
                
                except Exception as e:
                    continue
        
        return issues
    
    def propose_correct_methodology(self):
        """Propose correct temporal validation methodology"""
        print("\n✅ PROPOSING CORRECT METHODOLOGY")
        print("-" * 40)
        
        print("🎯 PROPER TEMPORAL VALIDATION APPROACH:")
        print()
        print("1. **TEMPORAL TRAIN/TEST SPLIT**")
        print("   - Training: Games before specific date (e.g., end of 2023)")
        print("   - Testing: Games after that date (e.g., 2024 season)")
        print("   - NO random shuffling across time periods")
        print()
        print("2. **TIME-AWARE FEATURE ENGINEERING**")
        print("   - Team ratings calculated ONLY from games before prediction date")
        print("   - ELO ratings updated game-by-game chronologically")
        print("   - Rolling averages with proper time windows")
        print()
        print("3. **WALK-FORWARD VALIDATION**")
        print("   - Predict week N using only data through week N-1")
        print("   - Update models after each week")
        print("   - No future information leakage")
        print()
        print("4. **FEATURE TEMPORAL VALIDATION**")
        print("   - Every feature must have timestamp")
        print("   - Verify no future data in training features")
        print("   - Implement temporal feature pipeline")
        
        recommendations = [
            "Implement proper temporal train/test split",
            "Recalculate team ratings with temporal awareness",
            "Use walk-forward validation methodology",
            "Add timestamps to all features",
            "Implement time-series cross-validation",
            "Verify no future data leakage in any features"
        ]
        
        return recommendations
    
    def generate_leakage_report(self):
        """Generate comprehensive data leakage analysis report"""
        print(f"\n🚨 RUNNING DATA LEAKAGE ANALYSIS")
        print("="*60)
        
        # Run all analyses
        temporal_issues = self.analyze_temporal_data_usage()
        validation_issues = self.examine_validation_methodology()
        historical_issues = self.analyze_historical_data_structure()
        data_2024_issues = self.examine_2024_data_usage()
        rating_issues = self.investigate_team_ratings_calculation()
        recommendations = self.propose_correct_methodology()
        
        # Combine all issues
        all_issues = (temporal_issues + validation_issues + historical_issues + 
                     data_2024_issues + rating_issues)
        
        # Generate report
        report = {
            'analysis_date': datetime.now().isoformat(),
            'total_leakage_issues': len(all_issues),
            'severity': 'CRITICAL' if len(all_issues) > 5 else 'MODERATE',
            'leakage_analysis': {
                'temporal_data_usage': temporal_issues,
                'validation_methodology': validation_issues,
                'historical_data_structure': historical_issues,
                'data_2024_usage': data_2024_issues,
                'team_ratings_calculation': rating_issues
            },
            'recommendations': recommendations,
            'corrective_actions_required': True
        }
        
        # Save report
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/data_leakage_analysis.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def display_results(self, report):
        """Display leakage analysis results"""
        print(f"\n🚨 DATA LEAKAGE ANALYSIS RESULTS")
        print("="*60)
        
        total_issues = report['total_leakage_issues']
        severity = report['severity']
        
        print(f"📊 Severity Level: {severity}")
        print(f"🔍 Total Issues Found: {total_issues}")
        
        if total_issues > 0:
            print(f"\n❌ CRITICAL DATA LEAKAGE ISSUES FOUND:")
            
            for category, issues in report['leakage_analysis'].items():
                if issues:
                    print(f"\n{category.upper().replace('_', ' ')}:")
                    for issue in issues:
                        print(f"   • {issue}")
            
            print(f"\n🔧 REQUIRED CORRECTIVE ACTIONS:")
            for rec in report['recommendations']:
                print(f"   • {rec}")
            
            print(f"\n🎯 BOTTOM LINE:")
            print("❌ Current validation methodology has SERIOUS data leakage")
            print("❌ Accuracy results are INVALID due to temporal violations")
            print("❌ Must implement proper temporal validation")
            
        else:
            print("\n✅ NO MAJOR DATA LEAKAGE ISSUES FOUND")
            print("✅ Validation methodology appears sound")
        
        print(f"\n💾 Full analysis saved: data/real-current/data_leakage_analysis.json")

def main():
    """Run data leakage analysis"""
    analyzer = DataLeakageAnalyzer()
    report = analyzer.generate_leakage_report()
    analyzer.display_results(report)
    
    return report

if __name__ == "__main__":
    main() 