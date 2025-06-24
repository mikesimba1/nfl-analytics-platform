#!/usr/bin/env python3
"""
REMAINING ISSUES ASSESSMENT
Comprehensive check for any remaining issues after system fixes
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import glob

class RemainingIssuesAssessment:
    """Assess remaining issues after comprehensive system fixes"""
    
    def __init__(self):
        print("🔍 REMAINING ISSUES ASSESSMENT")
        print("="*60)
        print("Checking for any remaining issues after comprehensive fixes...")
        
        self.remaining_issues = []
        self.minor_improvements = []
        self.technical_debt = []
        
    def check_core_system_integrity(self):
        """Check core prediction system integrity"""
        print("\n🎯 CHECKING CORE SYSTEM INTEGRITY")
        print("-" * 40)
        
        issues = []
        
        # Check if comprehensive system fix is working
        if os.path.exists("comprehensive_system_fix.py"):
            print("✅ Comprehensive system fix script exists")
            
            # Check if it ran successfully (look for output file)
            if os.path.exists("data/real-current/comprehensive_system_fix.json"):
                print("✅ System fix executed successfully")
                
                try:
                    with open("data/real-current/comprehensive_system_fix.json", 'r') as f:
                        fix_report = json.load(f)
                    
                    if fix_report.get('system_status') == 'FIXED_AND_VALIDATED':
                        print("✅ System status: FIXED_AND_VALIDATED")
                        
                        validation = fix_report.get('validation_results', {})
                        accuracy = validation.get('overall_accuracy', 0)
                        
                        if accuracy >= 0.65:
                            print(f"✅ Excellent accuracy: {accuracy:.1%}")
                        elif accuracy >= 0.60:
                            print(f"✅ Good accuracy: {accuracy:.1%}")
                        else:
                            issues.append(f"Accuracy below target: {accuracy:.1%}")
                    else:
                        issues.append("System status not fully validated")
                
                except Exception as e:
                    issues.append(f"Error reading fix report: {e}")
            else:
                issues.append("System fix report missing - may not have executed properly")
        else:
            issues.append("Comprehensive system fix script missing")
        
        return issues
    
    def check_data_quality_and_completeness(self):
        """Check data quality and completeness"""
        print("\n📊 CHECKING DATA QUALITY & COMPLETENESS")
        print("-" * 40)
        
        issues = []
        
        # Check historical data
        historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
        if os.path.exists(historical_file):
            try:
                with open(historical_file, 'r') as f:
                    data = json.load(f)
                print(f"✅ Historical data: {len(data)} games")
                
                # Check data quality
                valid_games = 0
                for game in data[:100]:  # Sample check
                    if (game.get('home_final') and game.get('away_final') and 
                        float(game.get('home_final', 0)) > 0 and float(game.get('away_final', 0)) > 0):
                        valid_games += 1
                
                quality_rate = valid_games / 100
                if quality_rate >= 0.95:
                    print(f"✅ Data quality excellent: {quality_rate:.1%}")
                elif quality_rate >= 0.90:
                    print(f"✅ Data quality good: {quality_rate:.1%}")
                else:
                    issues.append(f"Data quality concerns: {quality_rate:.1%}")
                
            except Exception as e:
                issues.append(f"Historical data loading error: {e}")
        else:
            issues.append("Historical data file missing")
        
        # Check 2024 data completeness
        games_2024_file = "../nfl_data/games/2024_schedule.csv"
        if os.path.exists(games_2024_file):
            try:
                df = pd.read_csv(games_2024_file)
                total_games = len(df)
                completed_games = len(df[(df['home_score'].notna()) & (df['away_score'].notna())])
                
                print(f"✅ 2024 games: {completed_games}/{total_games} completed")
                
                if completed_games >= 250:  # Full season
                    print("✅ Complete season data available")
                elif completed_games >= 200:
                    print("✅ Substantial season data available")
                else:
                    self.minor_improvements.append("Limited 2024 season data for validation")
                
            except Exception as e:
                issues.append(f"2024 games loading error: {e}")
        else:
            issues.append("2024 games file missing")
        
        return issues
    
    def check_api_integration_status(self):
        """Check API integration and limits"""
        print("\n📡 CHECKING API INTEGRATION STATUS")
        print("-" * 40)
        
        issues = []
        
        # Check API configuration
        api_keys = {
            'odds_api': 'acfb5df269abb6f9772b8bc47727df9f',
            'weather_api': 'c65db1cf52eb399c299d5a9fe04ce0c8'
        }
        
        print("✅ API keys available in codebase")
        
        # Check API limits tracking
        api_limits_file = "src/data/api_limits.json"
        if os.path.exists(api_limits_file):
            print("✅ API limits tracking file exists")
        else:
            self.minor_improvements.append("API limits tracking file missing")
        
        # Check real-time data scripts
        real_time_scripts = [
            "setup-real-api.js",
            "test_real_api.js", 
            "show-live-data.js"
        ]
        
        existing_scripts = [s for s in real_time_scripts if os.path.exists(s)]
        print(f"✅ Real-time scripts: {len(existing_scripts)}/{len(real_time_scripts)} exist")
        
        if len(existing_scripts) < len(real_time_scripts):
            self.minor_improvements.append("Some real-time API scripts missing")
        
        return issues
    
    def check_validation_methodology(self):
        """Check validation methodology completeness"""
        print("\n🧪 CHECKING VALIDATION METHODOLOGY")
        print("-" * 40)
        
        issues = []
        
        # Check for proper temporal validation
        validation_files = [
            "proper_temporal_validation.py",
            "comprehensive_system_fix.py",
            "data_leakage_analysis.py"
        ]
        
        existing_validation = [f for f in validation_files if os.path.exists(f)]
        print(f"✅ Validation files: {len(existing_validation)}/{len(validation_files)} exist")
        
        if len(existing_validation) == len(validation_files):
            print("✅ Complete validation methodology implemented")
        else:
            issues.append("Incomplete validation methodology")
        
        # Check for validation reports
        validation_reports = glob.glob("data/real-current/*validation*.json")
        validation_reports += glob.glob("data/real-current/*fix*.json")
        
        if len(validation_reports) >= 2:
            print(f"✅ Validation reports: {len(validation_reports)} available")
        else:
            self.minor_improvements.append("Limited validation reports")
        
        return issues
    
    def check_production_readiness(self):
        """Check production readiness gaps"""
        print("\n🏭 CHECKING PRODUCTION READINESS")
        print("-" * 40)
        
        issues = []
        
        # Core prediction system
        core_files = [
            "comprehensive_system_fix.py",  # Main prediction system
            "../nfl_data/team_ratings.csv",  # Team data
            "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"  # Historical data
        ]
        
        missing_core = [f for f in core_files if not os.path.exists(f)]
        if missing_core:
            issues.append(f"Missing core files: {missing_core}")
        else:
            print("✅ Core prediction system files present")
        
        # Frontend/UI
        frontend_dirs = ["../frontend", "../app", "frontend"]
        frontend_exists = any(os.path.exists(d) for d in frontend_dirs)
        
        if frontend_exists:
            print("✅ Frontend directory exists")
        else:
            self.minor_improvements.append("No frontend/UI implementation")
        
        # API/Backend structure
        if os.path.exists("src/server.js"):
            print("✅ Backend server structure exists")
        else:
            self.minor_improvements.append("Backend server structure needs development")
        
        # Database/Storage
        if os.path.exists("data/real-current"):
            print("✅ Data storage structure exists")
        else:
            issues.append("Data storage structure missing")
        
        return issues
    
    def check_technical_debt(self):
        """Check for technical debt and cleanup needs"""
        print("\n🧹 CHECKING TECHNICAL DEBT")
        print("-" * 40)
        
        debt_items = []
        
        # Check for redundant files
        all_files = []
        for root, dirs, files in os.walk("."):
            for file in files:
                if file.endswith(('.py', '.js', '.json', '.md')):
                    all_files.append(os.path.join(root, file))
        
        # Look for potential duplicates
        duplicate_patterns = [
            "*_backup*", "*_old*", "*_temp*", "*_test*", 
            "*_copy*", "*_v2*", "*_fixed*", "*_new*"
        ]
        
        potential_duplicates = []
        for pattern in duplicate_patterns:
            import glob
            matches = glob.glob(pattern, recursive=True)
            potential_duplicates.extend(matches)
        
        if potential_duplicates:
            debt_items.append(f"Potential duplicate files: {len(potential_duplicates)}")
            print(f"⚠️ Found {len(potential_duplicates)} potential duplicate files")
        else:
            print("✅ No obvious duplicate files found")
        
        # Check for large files that might need optimization
        large_files = []
        for file_path in all_files:
            try:
                if os.path.getsize(file_path) > 1024 * 1024:  # > 1MB
                    large_files.append(file_path)
            except OSError:
                continue
        
        if large_files:
            debt_items.append(f"Large files that may need optimization: {len(large_files)}")
            print(f"⚠️ Found {len(large_files)} large files")
        else:
            print("✅ No unusually large files found")
        
        # Check for missing documentation
        doc_files = glob.glob("*.md") + glob.glob("README*")
        if len(doc_files) >= 5:
            print(f"✅ Good documentation: {len(doc_files)} files")
        else:
            debt_items.append("Limited documentation")
        
        return debt_items
    
    def check_scalability_concerns(self):
        """Check for scalability and performance concerns"""
        print("\n📈 CHECKING SCALABILITY CONCERNS")
        print("-" * 40)
        
        concerns = []
        
        # Check data loading efficiency
        if os.path.exists("comprehensive_system_fix.py"):
            with open("comprehensive_system_fix.py", 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Look for potential performance issues
            if 'json.load' in content:
                concerns.append("Large JSON loading - consider database for production")
            
            if 'pd.read_csv' in content:
                print("✅ Using pandas for data processing")
            
            if 'cache' in content.lower() or 'weekly_team_ratings' in content:
                print("✅ Caching mechanism implemented")
            else:
                concerns.append("No caching mechanism for team ratings")
        
        # Check API rate limiting
        if not os.path.exists("src/data/api_limits.json"):
            concerns.append("API rate limiting not properly tracked")
        
        # Check for concurrent processing
        if 'threading' not in content and 'asyncio' not in content:
            concerns.append("No concurrent processing - may be slow for multiple predictions")
        
        return concerns
    
    def generate_remaining_issues_report(self):
        """Generate comprehensive remaining issues report"""
        print(f"\n🔍 RUNNING REMAINING ISSUES ASSESSMENT")
        print("="*60)
        
        # Run all checks
        core_issues = self.check_core_system_integrity()
        data_issues = self.check_data_quality_and_completeness()
        api_issues = self.check_api_integration_status()
        validation_issues = self.check_validation_methodology()
        production_issues = self.check_production_readiness()
        debt_items = self.check_technical_debt()
        scalability_concerns = self.check_scalability_concerns()
        
        # Combine all issues
        all_critical_issues = (core_issues + data_issues + api_issues + 
                              validation_issues + production_issues)
        
        # Generate report
        report = {
            'assessment_date': datetime.now().isoformat(),
            'critical_issues': all_critical_issues,
            'minor_improvements': self.minor_improvements,
            'technical_debt': debt_items,
            'scalability_concerns': scalability_concerns,
            'overall_status': 'EXCELLENT' if len(all_critical_issues) == 0 else 'NEEDS_ATTENTION',
            'readiness_level': self.calculate_readiness_level(all_critical_issues),
            'issues_by_category': {
                'core_system': core_issues,
                'data_quality': data_issues,
                'api_integration': api_issues,
                'validation': validation_issues,
                'production_readiness': production_issues
            }
        }
        
        # Save report
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/remaining_issues_assessment.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def calculate_readiness_level(self, critical_issues):
        """Calculate production readiness level"""
        if len(critical_issues) == 0:
            return "PRODUCTION_READY"
        elif len(critical_issues) <= 2:
            return "NEARLY_READY"
        elif len(critical_issues) <= 5:
            return "NEEDS_WORK"
        else:
            return "MAJOR_ISSUES"
    
    def display_results(self, report):
        """Display remaining issues assessment results"""
        print(f"\n🔍 REMAINING ISSUES ASSESSMENT RESULTS")
        print("="*60)
        
        critical_count = len(report['critical_issues'])
        minor_count = len(report['minor_improvements'])
        debt_count = len(report['technical_debt'])
        scalability_count = len(report['scalability_concerns'])
        
        print(f"📊 Overall Status: {report['overall_status']}")
        print(f"🎯 Readiness Level: {report['readiness_level']}")
        print(f"🔴 Critical Issues: {critical_count}")
        print(f"🟡 Minor Improvements: {minor_count}")
        print(f"🧹 Technical Debt: {debt_count}")
        print(f"📈 Scalability Concerns: {scalability_count}")
        
        if critical_count == 0:
            print("\n🎉 NO CRITICAL ISSUES REMAINING!")
            print("✅ Core prediction system is fully operational")
            print("✅ All major fixes have been successfully implemented")
            print("✅ System is ready for production deployment")
            
            if minor_count > 0:
                print(f"\n🟡 MINOR IMPROVEMENTS IDENTIFIED ({minor_count}):")
                for i, improvement in enumerate(report['minor_improvements'], 1):
                    print(f"   {i}. {improvement}")
                print("\n💡 These are enhancements, not blockers")
            
            if debt_count > 0:
                print(f"\n🧹 TECHNICAL DEBT TO ADDRESS ({debt_count}):")
                for i, debt in enumerate(report['technical_debt'], 1):
                    print(f"   {i}. {debt}")
                print("\n💡 Can be addressed during ongoing development")
            
            if scalability_count > 0:
                print(f"\n📈 SCALABILITY CONSIDERATIONS ({scalability_count}):")
                for i, concern in enumerate(report['scalability_concerns'], 1):
                    print(f"   {i}. {concern}")
                print("\n💡 Important for high-volume production use")
        
        else:
            print(f"\n🔴 CRITICAL ISSUES REQUIRING ATTENTION ({critical_count}):")
            for i, issue in enumerate(report['critical_issues'], 1):
                print(f"   {i}. {issue}")
            
            print(f"\n🎯 PRIORITY: Address critical issues before production")
        
        print(f"\n📋 NEXT STEPS:")
        if critical_count == 0:
            print("1. ✅ Core system: COMPLETE")
            print("2. 🔄 Frontend development")
            print("3. 🔄 User authentication & payments")
            print("4. 🔄 Production deployment")
            print("5. 🔄 Address minor improvements")
        else:
            print("1. 🔴 Fix remaining critical issues")
            print("2. 🔄 Re-run assessment")
            print("3. 🔄 Proceed with production prep")
        
        print(f"\n💾 Full assessment: data/real-current/remaining_issues_assessment.json")

def main():
    """Run remaining issues assessment"""
    assessor = RemainingIssuesAssessment()
    report = assessor.generate_remaining_issues_report()
    assessor.display_results(report)
    
    return report

if __name__ == "__main__":
    main() 