#!/usr/bin/env python3
"""
COMPREHENSIVE TESTING AUDIT
Thorough examination of our validation methodology to identify any remaining issues
"""

import json
import pandas as pd
import numpy as np
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class ComprehensiveTestingAudit:
    """Audit our testing methodology for any remaining issues"""
    
    def __init__(self):
        print("🔍 COMPREHENSIVE TESTING AUDIT")
        print("="*60)
        print("Examining our validation methodology for any remaining issues...")
        
        self.issues_found = []
        self.warnings_found = []
        self.recommendations = []
        
    def audit_temporal_validation(self):
        """Audit temporal validation methodology"""
        print("\n⏰ AUDITING TEMPORAL VALIDATION")
        print("-" * 40)
        
        issues = []
        
        # Check 1: Are we using proper temporal splits?
        print("🔍 Checking temporal train/test splits...")
        
        # Look for validation files
        validation_files = [
            "comprehensive_system_fix.py",
            "proper_temporal_validation.py", 
            "run_validation.py"
        ]
        
        temporal_validation_found = False
        for file in validation_files:
            if os.path.exists(file):
                try:
                    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Check for proper temporal methodology
                    if 'week' in content.lower() and 'temporal' in content.lower():
                        temporal_validation_found = True
                        print(f"✅ {file} implements temporal validation")
                    
                    # Check for data leakage prevention
                    if 'before' in content.lower() and 'cutoff' in content.lower():
                        print(f"✅ {file} has temporal cutoff logic")
                    else:
                        issues.append(f"{file} may lack proper temporal cutoffs")
                    
                    # Check for walk-forward validation
                    if 'walk' in content.lower() or 'sequential' in content.lower():
                        print(f"✅ {file} uses walk-forward methodology")
                    else:
                        issues.append(f"{file} may not use walk-forward validation")
                        
                except Exception as e:
                    issues.append(f"Error reading {file}: {e}")
        
        if not temporal_validation_found:
            issues.append("CRITICAL: No proper temporal validation found")
        
        return issues
    
    def audit_team_ratings_calculation(self):
        """Audit team ratings calculation for temporal awareness"""
        print("\n📊 AUDITING TEAM RATINGS CALCULATION")
        print("-" * 40)
        
        issues = []
        
        # Check if team ratings have temporal awareness
        print("🔍 Checking team ratings temporal awareness...")
        
        # Look for team ratings data
        ratings_files = [
            "../nfl_data/team_ratings.csv",
            "data/team_ratings.json",
            "../nfl_data/team_stats/2024_team_desc.csv"
        ]
        
        temporal_ratings_found = False
        for file in ratings_files:
            if os.path.exists(file):
                try:
                    if file.endswith('.csv'):
                        df = pd.read_csv(file)
                        print(f"✅ Found ratings file: {file}")
                        print(f"   Columns: {df.columns.tolist()}")
                        
                        # Check for temporal columns
                        temporal_cols = ['date', 'week', 'season', 'year']
                        found_temporal = [col for col in df.columns if any(t in col.lower() for t in temporal_cols)]
                        
                        if found_temporal:
                            temporal_ratings_found = True
                            print(f"✅ Temporal columns found: {found_temporal}")
                        else:
                            issues.append(f"{file} lacks temporal columns")
                            print(f"❌ No temporal awareness in {file}")
                    
                    elif file.endswith('.json'):
                        with open(file, 'r') as f:
                            data = json.load(f)
                        print(f"✅ Found ratings file: {file}")
                        
                        # Check structure
                        if isinstance(data, dict) and len(data) > 0:
                            sample_key = list(data.keys())[0]
                            sample_data = data[sample_key]
                            
                            if isinstance(sample_data, dict):
                                if any(t in str(sample_data.keys()).lower() for t in ['date', 'week', 'season']):
                                    temporal_ratings_found = True
                                    print(f"✅ Temporal structure found")
                                else:
                                    issues.append(f"{file} lacks temporal structure")
                        
                except Exception as e:
                    issues.append(f"Error reading {file}: {e}")
        
        if not temporal_ratings_found:
            issues.append("CRITICAL: Team ratings lack temporal awareness")
        
        return issues
    
    def audit_validation_results(self):
        """Audit validation results for consistency and realism"""
        print("\n📈 AUDITING VALIDATION RESULTS")
        print("-" * 40)
        
        issues = []
        
        # Check validation result files
        result_files = [
            "data/real-current/comprehensive_system_fix.json",
            "data/real-current/proper_temporal_validation.json",
            "data/real-current/true_accuracy_validation.json"
        ]
        
        accuracies_found = []
        
        for file in result_files:
            if os.path.exists(file):
                try:
                    with open(file, 'r') as f:
                        data = json.load(f)
                    
                    # Extract accuracy results
                    if 'validation_results' in data and 'overall_accuracy' in data['validation_results']:
                        accuracy = data['validation_results']['overall_accuracy']
                        accuracies_found.append((file, accuracy))
                        print(f"✅ {file}: {accuracy:.1%} accuracy")
                    
                    elif 'accuracy_results' in data and 'overall_accuracy' in data['accuracy_results']:
                        accuracy = data['accuracy_results']['overall_accuracy']
                        accuracies_found.append((file, accuracy))
                        print(f"✅ {file}: {accuracy:.1%} accuracy")
                    
                    # Check methodology claims
                    if 'data_leakage_prevented' in data:
                        if data['data_leakage_prevented']:
                            print(f"✅ {file} claims no data leakage")
                        else:
                            issues.append(f"{file} indicates data leakage present")
                    
                except Exception as e:
                    issues.append(f"Error reading {file}: {e}")
        
        # Check for consistency in results
        if len(accuracies_found) > 1:
            accuracies = [acc for _, acc in accuracies_found]
            accuracy_range = max(accuracies) - min(accuracies)
            
            if accuracy_range > 0.15:  # More than 15% difference
                issues.append(f"INCONSISTENT RESULTS: Accuracy range {accuracy_range:.1%}")
                print(f"❌ Large accuracy variance: {accuracy_range:.1%}")
                for file, acc in accuracies_found:
                    print(f"   {file}: {acc:.1%}")
            else:
                print(f"✅ Consistent results: {accuracy_range:.1%} variance")
        
        # Check for unrealistic accuracies
        for file, accuracy in accuracies_found:
            if accuracy > 0.75:  # >75% is suspicious
                issues.append(f"SUSPICIOUS: {file} shows {accuracy:.1%} accuracy (too high)")
            elif accuracy < 0.45:  # <45% is worse than random
                issues.append(f"CONCERNING: {file} shows {accuracy:.1%} accuracy (worse than random)")
        
        return issues
    
    def audit_data_sources(self):
        """Audit data sources for completeness and quality"""
        print("\n📊 AUDITING DATA SOURCES")
        print("-" * 40)
        
        issues = []
        
        # Check historical data
        historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
        if os.path.exists(historical_file):
            try:
                with open(historical_file, 'r') as f:
                    historical_data = json.load(f)
                
                print(f"✅ Historical data: {len(historical_data)} games")
                
                # Check data quality
                valid_games = 0
                for game in historical_data[:100]:  # Sample first 100
                    try:
                        home_score = float(game.get('home_final', 0))
                        away_score = float(game.get('away_final', 0))
                        if home_score > 0 and away_score > 0:
                            valid_games += 1
                    except:
                        continue
                
                quality_rate = valid_games / 100
                if quality_rate < 0.9:
                    issues.append(f"Historical data quality: {quality_rate:.1%} (should be >90%)")
                else:
                    print(f"✅ Historical data quality: {quality_rate:.1%}")
                
            except Exception as e:
                issues.append(f"Error reading historical data: {e}")
        else:
            issues.append("CRITICAL: Historical data missing")
        
        # Check 2024 data
        games_2024_file = "../nfl_data/games/2024_schedule.csv"
        if os.path.exists(games_2024_file):
            try:
                df = pd.read_csv(games_2024_file)
                completed = df[(df['home_score'].notna()) & (df['away_score'].notna())]
                
                print(f"✅ 2024 games: {len(completed)} completed games")
                
                # Check for reasonable completion rate
                completion_rate = len(completed) / len(df)
                if completion_rate < 0.7:  # Less than 70% completed
                    self.warnings_found.append(f"2024 season only {completion_rate:.1%} complete")
                
                # Check week distribution
                if 'week' in df.columns:
                    week_counts = completed['week'].value_counts().sort_index()
                    if len(week_counts) < 10:  # Less than 10 weeks
                        self.warnings_found.append(f"Only {len(week_counts)} weeks of 2024 data")
                
            except Exception as e:
                issues.append(f"Error reading 2024 data: {e}")
        else:
            issues.append("CRITICAL: 2024 games data missing")
        
        return issues
    
    def audit_prediction_methodology(self):
        """Audit prediction methodology for soundness"""
        print("\n🧠 AUDITING PREDICTION METHODOLOGY")
        print("-" * 40)
        
        issues = []
        
        # Look for prediction logic
        prediction_files = [
            "comprehensive_system_fix.py",
            "run_validation.py",
            "research_analyzer.py"
        ]
        
        prediction_logic_found = False
        for file in prediction_files:
            if os.path.exists(file):
                try:
                    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Check for prediction functions
                    if 'def make_prediction' in content or 'def predict' in content:
                        prediction_logic_found = True
                        print(f"✅ {file} contains prediction logic")
                        
                        # Check for confidence scoring
                        if 'confidence' in content.lower():
                            print(f"✅ {file} includes confidence scoring")
                        else:
                            self.warnings_found.append(f"{file} lacks confidence scoring")
                        
                        # Check for ensemble methods
                        if 'ensemble' in content.lower() or 'xgboost' in content.lower():
                            print(f"✅ {file} uses advanced modeling")
                        else:
                            self.warnings_found.append(f"{file} uses simple modeling")
                    
                except Exception as e:
                    issues.append(f"Error reading {file}: {e}")
        
        if not prediction_logic_found:
            issues.append("CRITICAL: No prediction logic found")
        
        return issues
    
    def generate_audit_report(self):
        """Generate comprehensive audit report"""
        print(f"\n🔍 RUNNING COMPREHENSIVE TESTING AUDIT")
        print("="*60)
        
        # Run all audits
        temporal_issues = self.audit_temporal_validation()
        ratings_issues = self.audit_team_ratings_calculation()
        results_issues = self.audit_validation_results()
        data_issues = self.audit_data_sources()
        prediction_issues = self.audit_prediction_methodology()
        
        # Combine all issues
        all_issues = (temporal_issues + ratings_issues + results_issues + 
                     data_issues + prediction_issues)
        
        # Generate report
        report = {
            'audit_date': datetime.now().isoformat(),
            'total_issues': len(all_issues),
            'total_warnings': len(self.warnings_found),
            'audit_results': {
                'temporal_validation': temporal_issues,
                'team_ratings': ratings_issues,
                'validation_results': results_issues,
                'data_sources': data_issues,
                'prediction_methodology': prediction_issues
            },
            'warnings': self.warnings_found,
            'overall_assessment': self.assess_overall_quality(all_issues),
            'recommendations': self.generate_recommendations(all_issues)
        }
        
        # Save report
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/comprehensive_testing_audit.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def assess_overall_quality(self, all_issues):
        """Assess overall quality of testing methodology"""
        
        critical_issues = [issue for issue in all_issues if 'CRITICAL' in issue]
        suspicious_issues = [issue for issue in all_issues if 'SUSPICIOUS' in issue]
        
        if len(critical_issues) > 0:
            return "POOR - Critical issues found"
        elif len(suspicious_issues) > 0:
            return "CONCERNING - Suspicious results found"
        elif len(all_issues) > 10:
            return "NEEDS IMPROVEMENT - Many issues found"
        elif len(all_issues) > 5:
            return "FAIR - Some issues found"
        else:
            return "GOOD - Few issues found"
    
    def generate_recommendations(self, all_issues):
        """Generate recommendations based on issues found"""
        
        recommendations = []
        
        # Based on types of issues found
        issue_text = ' '.join(all_issues).lower()
        
        if 'temporal' in issue_text:
            recommendations.append("Implement proper temporal validation with walk-forward methodology")
        
        if 'team ratings' in issue_text:
            recommendations.append("Recalculate team ratings with temporal awareness")
        
        if 'data leakage' in issue_text:
            recommendations.append("Audit all features for temporal data leakage")
        
        if 'inconsistent' in issue_text:
            recommendations.append("Reconcile inconsistent validation results")
        
        if 'suspicious' in issue_text:
            recommendations.append("Investigate suspiciously high accuracy claims")
        
        if 'critical' in issue_text:
            recommendations.append("Address all critical issues before deployment")
        
        # Always recommend these
        recommendations.extend([
            "Implement conservative accuracy expectations (55-60%)",
            "Add comprehensive logging and monitoring",
            "Create transparent reporting of methodology",
            "Validate against industry benchmarks"
        ])
        
        return recommendations
    
    def display_results(self, report):
        """Display audit results"""
        print(f"\n🔍 COMPREHENSIVE TESTING AUDIT RESULTS")
        print("="*60)
        
        print(f"📊 AUDIT SUMMARY:")
        print(f"   Total Issues: {report['total_issues']}")
        print(f"   Total Warnings: {report['total_warnings']}")
        print(f"   Overall Assessment: {report['overall_assessment']}")
        
        print(f"\n❌ ISSUES BY CATEGORY:")
        for category, issues in report['audit_results'].items():
            if issues:
                print(f"   {category.replace('_', ' ').title()}: {len(issues)} issues")
                for issue in issues[:3]:  # Show first 3
                    print(f"     - {issue}")
                if len(issues) > 3:
                    print(f"     ... and {len(issues) - 3} more")
        
        print(f"\n⚠️ WARNINGS:")
        for warning in report['warnings'][:5]:  # Show first 5
            print(f"   - {warning}")
        if len(report['warnings']) > 5:
            print(f"   ... and {len(report['warnings']) - 5} more")
        
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in report['recommendations'][:5]:  # Show first 5
            print(f"   - {rec}")
        if len(report['recommendations']) > 5:
            print(f"   ... and {len(report['recommendations']) - 5} more")
        
        print(f"\n💾 Full audit report: data/real-current/comprehensive_testing_audit.json")

def main():
    """Run comprehensive testing audit"""
    auditor = ComprehensiveTestingAudit()
    report = auditor.generate_audit_report()
    auditor.display_results(report)
    
    return report

if __name__ == "__main__":
    main() 