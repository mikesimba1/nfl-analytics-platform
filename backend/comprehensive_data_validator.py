#!/usr/bin/env python3
"""
COMPREHENSIVE DATA VALIDATOR
Validates all critical data components after fixes have been applied

VALIDATION AREAS:
1. EPA data availability and quality
2. DVOA data availability and quality
3. Team ratings schema and completeness
4. Real-time API connectivity
5. Historical data integrity
6. Prediction model readiness
"""

import pandas as pd
import numpy as np
import json
import os
import requests
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class ComprehensiveDataValidator:
    """Comprehensive validation of all critical data components"""
    
    def __init__(self):
        print("🔍 COMPREHENSIVE DATA VALIDATOR")
        print("="*60)
        print("Validating all critical data components...")
        
        self.validation_results = {
            'epa_data': {'status': 'unknown', 'issues': [], 'coverage': 0},
            'dvoa_data': {'status': 'unknown', 'issues': [], 'coverage': 0},
            'team_ratings': {'status': 'unknown', 'issues': [], 'coverage': 0},
            'api_connectivity': {'status': 'unknown', 'issues': [], 'coverage': 0},
            'historical_data': {'status': 'unknown', 'issues': [], 'coverage': 0},
            'prediction_readiness': {'status': 'unknown', 'issues': [], 'coverage': 0}
        }
        
        self.api_keys = {
            'odds': 'acfb5df269abb6f9772b8bc47727df9f',
            'weather': 'c65db1cf52eb399c299d5a9fe04ce0c8'
        }
        
    def validate_epa_data(self):
        """Validate EPA data availability and quality"""
        print("\n📊 VALIDATING EPA DATA")
        print("-" * 40)
        
        issues = []
        coverage = 0
        
        # Check for real EPA data
        real_epa_file = "data/real-current/team_epa_data.csv"
        estimated_epa_file = "data/real-current/estimated_epa_data.json"
        
        if os.path.exists(real_epa_file):
            try:
                epa_df = pd.read_csv(real_epa_file)
                print(f"✅ Real EPA data found: {len(epa_df)} records")
                
                # Validate EPA data quality
                required_cols = ['season', 'week', 'posteam', 'epa_mean']
                missing_cols = [col for col in required_cols if col not in epa_df.columns]
                if missing_cols:
                    issues.append(f"Missing EPA columns: {missing_cols}")
                
                # Check EPA value ranges (should be between -1 and 1 typically)
                if 'epa_mean' in epa_df.columns:
                    epa_values = epa_df['epa_mean'].dropna()
                    if len(epa_values) > 0:
                        epa_min, epa_max = epa_values.min(), epa_values.max()
                        print(f"   EPA range: {epa_min:.3f} to {epa_max:.3f}")
                        
                        if epa_min < -2 or epa_max > 2:
                            issues.append(f"EPA values outside expected range: {epa_min:.3f} to {epa_max:.3f}")
                        
                        coverage = 85  # High coverage for real data
                    else:
                        issues.append("EPA data contains no valid values")
                
            except Exception as e:
                issues.append(f"Error reading real EPA data: {e}")
                
        elif os.path.exists(estimated_epa_file):
            try:
                with open(estimated_epa_file, 'r') as f:
                    epa_data = json.load(f)
                
                print(f"✅ Estimated EPA data found: {len(epa_data)} teams")
                
                # Validate estimated EPA data
                for team, data in epa_data.items():
                    if 'offensive_epa' not in data or 'defensive_epa' not in data:
                        issues.append(f"Team {team} missing EPA components")
                    else:
                        off_epa = data['offensive_epa']
                        def_epa = data['defensive_epa']
                        
                        if abs(off_epa) > 1 or abs(def_epa) > 1:
                            issues.append(f"Team {team} EPA values seem unrealistic")
                
                coverage = 60  # Medium coverage for estimated data
                
            except Exception as e:
                issues.append(f"Error reading estimated EPA data: {e}")
        else:
            issues.append("No EPA data found (real or estimated)")
            coverage = 0
        
        # Determine status
        if coverage >= 80:
            status = 'excellent'
        elif coverage >= 60:
            status = 'good'
        elif coverage >= 40:
            status = 'fair'
        else:
            status = 'poor'
        
        self.validation_results['epa_data'] = {
            'status': status,
            'issues': issues,
            'coverage': coverage
        }
        
        print(f"📊 EPA Data Status: {status.upper()} ({coverage}% coverage)")
        if issues:
            for issue in issues:
                print(f"   ⚠️ {issue}")
    
    def validate_dvoa_data(self):
        """Validate DVOA data availability and quality"""
        print("\n📊 VALIDATING DVOA DATA")
        print("-" * 40)
        
        issues = []
        coverage = 0
        
        dvoa_file = "data/real-current/team_dvoa_data.json"
        
        if os.path.exists(dvoa_file):
            try:
                with open(dvoa_file, 'r') as f:
                    dvoa_data = json.load(f)
                
                print(f"✅ DVOA data found: {len(dvoa_data)} teams")
                
                # Validate DVOA data quality
                dvoa_values = []
                for team, data in dvoa_data.items():
                    if 'total_dvoa' not in data:
                        issues.append(f"Team {team} missing total DVOA")
                    else:
                        dvoa_values.append(data['total_dvoa'])
                
                if dvoa_values:
                    dvoa_min, dvoa_max = min(dvoa_values), max(dvoa_values)
                    dvoa_avg = np.mean(dvoa_values)
                    print(f"   DVOA range: {dvoa_min:.1f}% to {dvoa_max:.1f}% (avg: {dvoa_avg:.1f}%)")
                    
                    # DVOA should typically range from -40% to +40%
                    if dvoa_min < -50 or dvoa_max > 50:
                        issues.append(f"DVOA values outside expected range: {dvoa_min:.1f}% to {dvoa_max:.1f}%")
                    
                    # Check for reasonable spread
                    dvoa_spread = dvoa_max - dvoa_min
                    if dvoa_spread < 20:
                        issues.append(f"DVOA spread too narrow: {dvoa_spread:.1f}%")
                    
                    coverage = 75  # Good coverage for calculated DVOA
                else:
                    issues.append("No valid DVOA values found")
                
            except Exception as e:
                issues.append(f"Error reading DVOA data: {e}")
        else:
            issues.append("No DVOA data found")
            coverage = 0
        
        # Determine status
        if coverage >= 80:
            status = 'excellent'
        elif coverage >= 60:
            status = 'good'
        elif coverage >= 40:
            status = 'fair'
        else:
            status = 'poor'
        
        self.validation_results['dvoa_data'] = {
            'status': status,
            'issues': issues,
            'coverage': coverage
        }
        
        print(f"📊 DVOA Data Status: {status.upper()} ({coverage}% coverage)")
        if issues:
            for issue in issues:
                print(f"   ⚠️ {issue}")
    
    def validate_team_ratings(self):
        """Validate team ratings schema and completeness"""
        print("\n📊 VALIDATING TEAM RATINGS")
        print("-" * 40)
        
        issues = []
        coverage = 0
        
        team_ratings_file = "../nfl_data/team_ratings.csv"
        
        if os.path.exists(team_ratings_file):
            try:
                df = pd.read_csv(team_ratings_file)
                print(f"✅ Team ratings found: {len(df)} teams")
                
                # Check required columns
                required_cols = ['team', 'overall_rating', 'offensive_rating', 'defensive_rating']
                missing_cols = [col for col in required_cols if col not in df.columns]
                
                if missing_cols:
                    issues.append(f"Missing required columns: {missing_cols}")
                else:
                    print("✅ All required columns present")
                
                # Check for all 32 NFL teams
                expected_teams = 32
                actual_teams = len(df)
                if actual_teams != expected_teams:
                    issues.append(f"Expected {expected_teams} teams, found {actual_teams}")
                
                # Validate rating ranges (should be 20-80 typically)
                for col in ['overall_rating', 'offensive_rating', 'defensive_rating']:
                    if col in df.columns:
                        ratings = df[col].dropna()
                        if len(ratings) > 0:
                            rating_min, rating_max = ratings.min(), ratings.max()
                            print(f"   {col}: {rating_min:.1f} to {rating_max:.1f}")
                            
                            if rating_min < 10 or rating_max > 90:
                                issues.append(f"{col} values outside expected range")
                
                # Check for missing values
                missing_values = df.isnull().sum().sum()
                if missing_values > 0:
                    issues.append(f"{missing_values} missing values in team ratings")
                
                coverage = 90 if len(issues) == 0 else 70
                
            except Exception as e:
                issues.append(f"Error reading team ratings: {e}")
        else:
            issues.append("Team ratings file not found")
            coverage = 0
        
        # Determine status
        if coverage >= 80:
            status = 'excellent'
        elif coverage >= 60:
            status = 'good'
        elif coverage >= 40:
            status = 'fair'
        else:
            status = 'poor'
        
        self.validation_results['team_ratings'] = {
            'status': status,
            'issues': issues,
            'coverage': coverage
        }
        
        print(f"📊 Team Ratings Status: {status.upper()} ({coverage}% coverage)")
        if issues:
            for issue in issues:
                print(f"   ⚠️ {issue}")
    
    def validate_api_connectivity(self):
        """Validate real-time API connectivity"""
        print("\n📊 VALIDATING API CONNECTIVITY")
        print("-" * 40)
        
        issues = []
        coverage = 0
        
        # Test Odds API
        try:
            print("📡 Testing Odds API...")
            odds_url = f"https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds"
            params = {
                'apiKey': self.api_keys['odds'],
                'regions': 'us',
                'markets': 'spreads,totals',
                'oddsFormat': 'american'
            }
            
            response = requests.get(odds_url, params=params, timeout=10)
            
            if response.status_code == 200:
                odds_data = response.json()
                print(f"✅ Odds API working: {len(odds_data)} games available")
                coverage += 50
            else:
                issues.append(f"Odds API error: {response.status_code}")
                
        except Exception as e:
            issues.append(f"Odds API connection failed: {e}")
        
        # Test Weather API
        try:
            print("🌤️ Testing Weather API...")
            weather_url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': 39.0489,  # Kansas City
                'lon': -94.4839,
                'appid': self.api_keys['weather'],
                'units': 'imperial'
            }
            
            response = requests.get(weather_url, params=params, timeout=10)
            
            if response.status_code == 200:
                weather_data = response.json()
                print(f"✅ Weather API working: {weather_data['weather'][0]['description']}")
                coverage += 50
            else:
                issues.append(f"Weather API error: {response.status_code}")
                
        except Exception as e:
            issues.append(f"Weather API connection failed: {e}")
        
        # Determine status
        if coverage >= 80:
            status = 'excellent'
        elif coverage >= 60:
            status = 'good'
        elif coverage >= 40:
            status = 'fair'
        else:
            status = 'poor'
        
        self.validation_results['api_connectivity'] = {
            'status': status,
            'issues': issues,
            'coverage': coverage
        }
        
        print(f"📊 API Connectivity Status: {status.upper()} ({coverage}% coverage)")
        if issues:
            for issue in issues:
                print(f"   ⚠️ {issue}")
    
    def validate_historical_data(self):
        """Validate historical data integrity"""
        print("\n📊 VALIDATING HISTORICAL DATA")
        print("-" * 40)
        
        issues = []
        coverage = 0
        
        # Check 2024 games
        games_2024_file = "../nfl_data/games/2024_schedule.csv"
        if os.path.exists(games_2024_file):
            try:
                games_df = pd.read_csv(games_2024_file)
                completed_games = games_df.dropna(subset=['home_score', 'away_score'])
                
                print(f"✅ 2024 games: {len(completed_games)} completed games")
                
                if len(completed_games) >= 200:
                    coverage += 40
                elif len(completed_games) >= 100:
                    coverage += 30
                else:
                    issues.append(f"Low number of completed 2024 games: {len(completed_games)}")
                
            except Exception as e:
                issues.append(f"Error reading 2024 games: {e}")
        else:
            issues.append("2024 games file not found")
        
        # Check historical odds data
        historical_odds_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
        if os.path.exists(historical_odds_file):
            try:
                with open(historical_odds_file, 'r') as f:
                    odds_data = json.load(f)
                
                print(f"✅ Historical odds: {len(odds_data)} records")
                
                if len(odds_data) >= 2000:
                    coverage += 60
                elif len(odds_data) >= 1000:
                    coverage += 40
                else:
                    issues.append(f"Low historical odds coverage: {len(odds_data)}")
                
            except Exception as e:
                issues.append(f"Error reading historical odds: {e}")
        else:
            issues.append("Historical odds file not found")
        
        # Check player stats
        player_stats_files = [
            "../nfl_data/player_stats/2024_weekly_stats.csv",
            "../nfl_data/player_stats/2023_weekly_stats.csv"
        ]
        
        player_stats_found = 0
        for file in player_stats_files:
            if os.path.exists(file):
                player_stats_found += 1
        
        if player_stats_found >= 2:
            coverage += 30
            print(f"✅ Player stats: {player_stats_found} seasons available")
        elif player_stats_found >= 1:
            coverage += 15
            print(f"⚠️ Player stats: {player_stats_found} season available")
        else:
            issues.append("No player stats files found")
        
        # Determine status
        if coverage >= 80:
            status = 'excellent'
        elif coverage >= 60:
            status = 'good'
        elif coverage >= 40:
            status = 'fair'
        else:
            status = 'poor'
        
        self.validation_results['historical_data'] = {
            'status': status,
            'issues': issues,
            'coverage': coverage
        }
        
        print(f"📊 Historical Data Status: {status.upper()} ({coverage}% coverage)")
        if issues:
            for issue in issues:
                print(f"   ⚠️ {issue}")
    
    def validate_prediction_readiness(self):
        """Validate overall prediction model readiness"""
        print("\n📊 VALIDATING PREDICTION READINESS")
        print("-" * 40)
        
        issues = []
        coverage = 0
        
        # Check for required prediction components
        components = {
            'EPA data': self.validation_results['epa_data']['coverage'],
            'DVOA data': self.validation_results['dvoa_data']['coverage'],
            'Team ratings': self.validation_results['team_ratings']['coverage'],
            'Historical data': self.validation_results['historical_data']['coverage']
        }
        
        print("📊 Prediction Model Components:")
        for component, comp_coverage in components.items():
            status_icon = "✅" if comp_coverage >= 60 else "⚠️" if comp_coverage >= 40 else "❌"
            print(f"   {status_icon} {component}: {comp_coverage}%")
        
        # Calculate overall readiness
        total_coverage = sum(components.values()) / len(components)
        coverage = int(total_coverage)
        
        # Check for critical missing components
        critical_missing = [comp for comp, cov in components.items() if cov < 40]
        if critical_missing:
            issues.append(f"Critical components missing: {', '.join(critical_missing)}")
        
        # Check for minimum viable product requirements
        if components['Team ratings'] >= 80 and components['Historical data'] >= 60:
            print("✅ Minimum viable product requirements met")
        else:
            issues.append("Minimum viable product requirements not met")
        
        # Check for production readiness
        if all(cov >= 60 for cov in components.values()):
            print("✅ Production readiness achieved")
        else:
            issues.append("Not ready for production deployment")
        
        # Determine status
        if coverage >= 80:
            status = 'excellent'
        elif coverage >= 60:
            status = 'good'
        elif coverage >= 40:
            status = 'fair'
        else:
            status = 'poor'
        
        self.validation_results['prediction_readiness'] = {
            'status': status,
            'issues': issues,
            'coverage': coverage
        }
        
        print(f"📊 Prediction Readiness Status: {status.upper()} ({coverage}% coverage)")
        if issues:
            for issue in issues:
                print(f"   ⚠️ {issue}")
    
    def generate_comprehensive_report(self):
        """Generate comprehensive validation report"""
        print("\n📊 COMPREHENSIVE VALIDATION REPORT")
        print("="*60)
        
        # Calculate overall system health
        all_coverages = [result['coverage'] for result in self.validation_results.values()]
        overall_health = int(np.mean(all_coverages))
        
        # Count issues by severity
        all_issues = []
        for component, result in self.validation_results.items():
            for issue in result['issues']:
                all_issues.append(f"{component}: {issue}")
        
        # Status summary
        status_counts = {'excellent': 0, 'good': 0, 'fair': 0, 'poor': 0}
        for result in self.validation_results.values():
            status_counts[result['status']] += 1
        
        print(f"🎯 OVERALL SYSTEM HEALTH: {overall_health}%")
        print(f"📊 COMPONENT STATUS BREAKDOWN:")
        for status, count in status_counts.items():
            if count > 0:
                print(f"   {status.upper()}: {count} components")
        
        print(f"\n🔍 DETAILED COMPONENT STATUS:")
        for component, result in self.validation_results.items():
            status_icon = {"excellent": "🟢", "good": "🟡", "fair": "🟠", "poor": "🔴"}[result['status']]
            print(f"   {status_icon} {component.replace('_', ' ').title()}: {result['status'].upper()} ({result['coverage']}%)")
        
        if all_issues:
            print(f"\n⚠️ ISSUES FOUND ({len(all_issues)} total):")
            for issue in all_issues[:10]:  # Show first 10 issues
                print(f"   • {issue}")
            if len(all_issues) > 10:
                print(f"   ... and {len(all_issues) - 10} more issues")
        else:
            print("\n✅ NO CRITICAL ISSUES FOUND")
        
        # Recommendations
        print(f"\n🎯 RECOMMENDATIONS:")
        if overall_health >= 80:
            print("   ✅ System is production-ready")
            print("   🚀 Consider advanced optimizations")
        elif overall_health >= 60:
            print("   ⚠️ System is functional but needs improvements")
            print("   🔧 Focus on fixing remaining issues")
        else:
            print("   ❌ System needs significant work before deployment")
            print("   🛠️ Address critical issues first")
        
        # Save comprehensive report
        report = {
            "validation_date": datetime.now().isoformat(),
            "overall_health": overall_health,
            "component_results": self.validation_results,
            "status_summary": status_counts,
            "total_issues": len(all_issues),
            "all_issues": all_issues,
            "recommendations": self.get_recommendations(overall_health)
        }
        
        report_file = "data/real-current/comprehensive_validation_report.json"
        os.makedirs("data/real-current", exist_ok=True)
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Comprehensive report saved to {report_file}")
        
        return overall_health >= 60
    
    def get_recommendations(self, health_score):
        """Get specific recommendations based on health score"""
        if health_score >= 80:
            return [
                "System is production-ready",
                "Consider implementing advanced features",
                "Monitor system performance",
                "Plan for scaling"
            ]
        elif health_score >= 60:
            return [
                "Fix remaining data quality issues",
                "Improve API reliability",
                "Enhance prediction accuracy",
                "Test thoroughly before production"
            ]
        else:
            return [
                "Address critical data gaps immediately",
                "Fix API connectivity issues",
                "Validate all data sources",
                "Delay production deployment until issues resolved"
            ]
    
    def run_comprehensive_validation(self):
        """Run complete validation suite"""
        print("\n🚀 RUNNING COMPREHENSIVE VALIDATION")
        print("="*60)
        
        # Run all validations
        self.validate_epa_data()
        self.validate_dvoa_data()
        self.validate_team_ratings()
        self.validate_api_connectivity()
        self.validate_historical_data()
        self.validate_prediction_readiness()
        
        # Generate comprehensive report
        is_ready = self.generate_comprehensive_report()
        
        return is_ready

def main():
    """Run comprehensive data validation"""
    validator = ComprehensiveDataValidator()
    is_ready = validator.run_comprehensive_validation()
    
    if is_ready:
        print("\n🎉 SYSTEM VALIDATION PASSED!")
        print("   Your NFL prediction system is ready for deployment")
    else:
        print("\n❌ SYSTEM VALIDATION FAILED")
        print("   Address critical issues before deployment")

if __name__ == "__main__":
    main() 