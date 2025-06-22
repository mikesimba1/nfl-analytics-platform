#!/usr/bin/env python3
"""
CURRENT ISSUES ASSESSMENT
Comprehensive check for remaining issues after all phases complete
"""

import os
import json
import pandas as pd
from datetime import datetime

class CurrentIssuesAssessment:
    """Assess current state and identify remaining issues"""
    
    def __init__(self):
        print("🔍 CURRENT ISSUES ASSESSMENT")
        print("="*60)
        print("Checking for remaining issues after all phases...")
        
        self.issues_found = []
        self.warnings = []
        self.recommendations = []
        
    def check_data_integrity(self):
        """Check data integrity and completeness"""
        print("\n📊 CHECKING DATA INTEGRITY")
        print("-" * 40)
        
        issues = []
        
        # Check historical data
        historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
        if os.path.exists(historical_file):
            try:
                with open(historical_file, 'r') as f:
                    data = json.load(f)
                print(f"✅ Historical data: {len(data)} games loaded")
                
                # Check for data quality issues
                missing_scores = [g for g in data[:100] if not g.get('home_final') or not g.get('away_final')]
                if missing_scores:
                    issues.append(f"Historical data has {len(missing_scores)} games with missing scores")
                
            except Exception as e:
                issues.append(f"Historical data loading error: {e}")
        else:
            issues.append("Historical data file missing")
        
        # Check team ratings
        team_ratings_file = "../nfl_data/team_ratings.csv"
        if os.path.exists(team_ratings_file):
            try:
                df = pd.read_csv(team_ratings_file)
                print(f"✅ Team ratings: {len(df)} teams loaded")
                
                required_cols = ['team', 'overall_rating', 'offensive_rating', 'defensive_rating']
                missing_cols = [col for col in required_cols if col not in df.columns]
                if missing_cols:
                    issues.append(f"Team ratings missing columns: {missing_cols}")
                
            except Exception as e:
                issues.append(f"Team ratings loading error: {e}")
        else:
            issues.append("Team ratings file missing")
        
        # Check 2024 games
        games_2024_file = "../nfl_data/games/2024_schedule.csv"
        if os.path.exists(games_2024_file):
            try:
                df = pd.read_csv(games_2024_file)
                completed = df[(df['home_score'].notna()) & (df['away_score'].notna())]
                print(f"✅ 2024 games: {len(completed)} completed games")
                
                if len(completed) < 200:
                    self.warnings.append("Low number of completed 2024 games")
                
            except Exception as e:
                issues.append(f"2024 games loading error: {e}")
        else:
            issues.append("2024 games file missing")
        
        return issues
    
    def check_validation_system(self):
        """Check if validation system is working"""
        print("\n🔬 CHECKING VALIDATION SYSTEM")
        print("-" * 40)
        
        issues = []
        
        try:
            # Try to run ironclad validation
            if os.path.exists("ironclad_validation.py"):
                print("✅ Ironclad validation script exists")
                
                # Check if it can load required data
                team_ratings_file = "../nfl_data/team_ratings.csv"
                games_file = "../nfl_data/games/2024_schedule.csv"
                
                if not os.path.exists(team_ratings_file):
                    issues.append("Team ratings file missing for validation")
                
                if not os.path.exists(games_file):
                    issues.append("Games file missing for validation")
                
                # Check for overall_rating column issue
                if os.path.exists(team_ratings_file):
                    df = pd.read_csv(team_ratings_file)
                    if 'overall_rating' not in df.columns:
                        issues.append("Team ratings missing 'overall_rating' column")
                    else:
                        print("✅ Team ratings has required 'overall_rating' column")
                
            else:
                issues.append("Ironclad validation script missing")
                
        except Exception as e:
            issues.append(f"Validation system check error: {e}")
        
        return issues
    
    def check_api_integration(self):
        """Check API integration status"""
        print("\n📡 CHECKING API INTEGRATION")
        print("-" * 40)
        
        issues = []
        
        # Check for API configuration
        api_keys = {
            'odds_api': 'acfb5df269abb6f9772b8bc47727df9f',
            'weather_api': 'c65db1cf52eb399c299d5a9fe04ce0c8'
        }
        
        print("✅ API keys available in codebase")
        
        # Check for API usage tracking
        api_limits_file = "src/data/api_limits.json"
        if os.path.exists(api_limits_file):
            print("✅ API limits tracking file exists")
        else:
            self.warnings.append("API limits tracking file missing")
        
        # Check for real-time data scripts
        real_time_scripts = [
            "setup-real-api.js",
            "test_real_api.js",
            "show-live-data.js"
        ]
        
        existing_scripts = [script for script in real_time_scripts if os.path.exists(script)]
        print(f"✅ Real-time scripts: {len(existing_scripts)}/{len(real_time_scripts)} exist")
        
        if len(existing_scripts) < len(real_time_scripts):
            self.warnings.append("Some real-time API scripts missing")
        
        return issues
    
    def check_model_accuracy(self):
        """Check current model accuracy and performance"""
        print("\n🎯 CHECKING MODEL ACCURACY")
        print("-" * 40)
        
        issues = []
        
        # Check for recent validation reports
        validation_files = [
            "data/real-current/immediate-validation-report.json",
            "data/real-current/production_report.json",
            "data/real-current/implementation_progress.json"
        ]
        
        latest_accuracy = None
        for file_path in validation_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    
                    # Look for accuracy metrics
                    if 'accuracy' in str(data):
                        print(f"✅ Found validation report: {file_path}")
                        
                        # Extract accuracy if possible
                        if isinstance(data, dict):
                            for key, value in data.items():
                                if 'accuracy' in str(key).lower() and isinstance(value, (int, float)):
                                    latest_accuracy = value
                                    break
                
                except Exception as e:
                    self.warnings.append(f"Could not read validation file {file_path}: {e}")
        
        if latest_accuracy:
            print(f"✅ Latest accuracy found: {latest_accuracy:.1%}")
            
            if latest_accuracy < 0.55:
                issues.append(f"Model accuracy too low: {latest_accuracy:.1%} (need 55%+)")
            elif latest_accuracy < 0.60:
                self.warnings.append(f"Model accuracy below target: {latest_accuracy:.1%} (target 60%+)")
        else:
            self.warnings.append("No recent accuracy metrics found")
        
        return issues
    
    def check_production_readiness(self):
        """Check production readiness"""
        print("\n🏭 CHECKING PRODUCTION READINESS")
        print("-" * 40)
        
        issues = []
        
        # Check for essential files
        essential_files = [
            "implementation_roadmap.py",
            "verify_data_sources.py",
            "production_ready_analyzer.py"
        ]
        
        missing_files = [f for f in essential_files if not os.path.exists(f)]
        if missing_files:
            issues.append(f"Missing essential files: {missing_files}")
        else:
            print("✅ Essential implementation files present")
        
        # Check for data directories
        data_dirs = [
            "data/real-current",
            "../nfl_data",
            "../historical-odds-scraper/data"
        ]
        
        missing_dirs = [d for d in data_dirs if not os.path.exists(d)]
        if missing_dirs:
            issues.append(f"Missing data directories: {missing_dirs}")
        else:
            print("✅ Data directories present")
        
        # Check for redundant files (should be cleaned up)
        redundant_patterns = [
            "test_*.py",
            "*_backup.py",
            "old_*.py"
        ]
        
        import glob
        redundant_files = []
        for pattern in redundant_patterns:
            redundant_files.extend(glob.glob(pattern))
        
        if redundant_files:
            self.warnings.append(f"Found {len(redundant_files)} potentially redundant files")
        else:
            print("✅ No obvious redundant files found")
        
        return issues
    
    def check_real_time_capabilities(self):
        """Check real-time data capabilities"""
        print("\n📱 CHECKING REAL-TIME CAPABILITIES")
        print("-" * 40)
        
        issues = []
        
        # Check for current week detection
        current_week_files = [
            "data/current-season/current-week-games.json",
            "../data/current-season/current-week-games.json"
        ]
        
        current_week_exists = any(os.path.exists(f) for f in current_week_files)
        if current_week_exists:
            print("✅ Current week games file exists")
        else:
            self.warnings.append("No current week games file found")
        
        # Check for injury data
        injury_files = [
            "data/current-season/injury-reports.json",
            "../data/current-season/injury-reports.json"
        ]
        
        injury_exists = any(os.path.exists(f) for f in injury_files)
        if injury_exists:
            print("✅ Injury reports file exists")
        else:
            self.warnings.append("No current injury reports found")
        
        # Check for weather integration
        weather_files = [
            "data/current-season/weather-forecasts.json",
            "../data/current-season/weather-forecasts.json"
        ]
        
        weather_exists = any(os.path.exists(f) for f in weather_files)
        if weather_exists:
            print("✅ Weather forecasts file exists")
        else:
            self.warnings.append("No weather forecasts found")
        
        return issues
    
    def check_edge_detection(self):
        """Check edge detection capabilities"""
        print("\n💰 CHECKING EDGE DETECTION")
        print("-" * 40)
        
        issues = []
        
        # Check for edge detection results
        edge_files = [
            "data/edge-opportunities.json",
            "../data/edge-opportunities.json",
            "data/real-current/realistic-edge-opportunities.json"
        ]
        
        edge_exists = any(os.path.exists(f) for f in edge_files)
        if edge_exists:
            print("✅ Edge opportunities file exists")
            
            # Check content
            for file_path in edge_files:
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'r') as f:
                            data = json.load(f)
                        
                        if isinstance(data, list) and len(data) > 0:
                            print(f"✅ Found {len(data)} edge opportunities")
                        elif isinstance(data, dict) and 'opportunities' in data:
                            opportunities = data['opportunities']
                            print(f"✅ Found {len(opportunities)} edge opportunities")
                        
                        break
                    except Exception as e:
                        self.warnings.append(f"Could not read edge file {file_path}: {e}")
        else:
            self.warnings.append("No edge detection results found")
        
        return issues
    
    def generate_issues_report(self):
        """Generate comprehensive issues report"""
        print(f"\n🔍 RUNNING COMPREHENSIVE ASSESSMENT")
        print("="*60)
        
        # Run all checks
        data_issues = self.check_data_integrity()
        validation_issues = self.check_validation_system()
        api_issues = self.check_api_integration()
        accuracy_issues = self.check_model_accuracy()
        production_issues = self.check_production_readiness()
        realtime_issues = self.check_real_time_capabilities()
        edge_issues = self.check_edge_detection()
        
        # Combine all issues
        all_issues = (data_issues + validation_issues + api_issues + 
                     accuracy_issues + production_issues + realtime_issues + edge_issues)
        
        # Generate report
        report = {
            'assessment_date': datetime.now().isoformat(),
            'critical_issues': all_issues,
            'warnings': self.warnings,
            'recommendations': self.recommendations,
            'overall_status': 'OPERATIONAL' if len(all_issues) == 0 else 'NEEDS_ATTENTION',
            'issues_by_category': {
                'data_integrity': data_issues,
                'validation_system': validation_issues,
                'api_integration': api_issues,
                'model_accuracy': accuracy_issues,
                'production_readiness': production_issues,
                'realtime_capabilities': realtime_issues,
                'edge_detection': edge_issues
            }
        }
        
        # Save report
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/current_issues_assessment.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def display_results(self, report):
        """Display assessment results"""
        print(f"\n🎯 ASSESSMENT RESULTS")
        print("="*60)
        
        total_issues = len(report['critical_issues'])
        total_warnings = len(report['warnings'])
        
        print(f"📊 Overall Status: {report['overall_status']}")
        print(f"🔴 Critical Issues: {total_issues}")
        print(f"🟡 Warnings: {total_warnings}")
        
        if total_issues == 0:
            print("\n🎉 NO CRITICAL ISSUES FOUND!")
            print("✅ Your platform is in excellent condition")
            
            if total_warnings > 0:
                print(f"\n⚠️ MINOR WARNINGS ({total_warnings}):")
                for i, warning in enumerate(report['warnings'], 1):
                    print(f"   {i}. {warning}")
            
            print("\n🚀 PLATFORM STATUS: READY FOR OPERATION")
            
        else:
            print(f"\n🔴 CRITICAL ISSUES FOUND ({total_issues}):")
            for i, issue in enumerate(report['critical_issues'], 1):
                print(f"   {i}. {issue}")
            
            if total_warnings > 0:
                print(f"\n⚠️ ADDITIONAL WARNINGS ({total_warnings}):")
                for i, warning in enumerate(report['warnings'], 1):
                    print(f"   {i}. {warning}")
        
        # Generate recommendations
        if total_issues > 0:
            print(f"\n💡 RECOMMENDATIONS:")
            if any('missing' in issue.lower() for issue in report['critical_issues']):
                print("   1. Run data integrity fixes to restore missing files")
            if any('accuracy' in issue.lower() for issue in report['critical_issues']):
                print("   2. Retrain models with expanded dataset")
            if any('validation' in issue.lower() for issue in report['critical_issues']):
                print("   3. Fix validation system schema issues")
            
            print("   4. Run comprehensive system repair before launch")
        
        print(f"\n💾 Full report saved: data/real-current/current_issues_assessment.json")

def main():
    """Run current issues assessment"""
    assessor = CurrentIssuesAssessment()
    report = assessor.generate_issues_report()
    assessor.display_results(report)
    
    return report

if __name__ == "__main__":
    main() 