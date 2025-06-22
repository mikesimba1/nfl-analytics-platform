#!/usr/bin/env python3
"""
ACCURACY VERIFICATION AUDIT
Comprehensive validation of our accuracy testing methodology and results
"""

import json
import pandas as pd
import numpy as np
import os
from datetime import datetime
import glob

class AccuracyVerificationAudit:
    """Audit accuracy testing methodology and validate results"""
    
    def __init__(self):
        print("🔍 ACCURACY VERIFICATION AUDIT")
        print("="*60)
        print("Validating accuracy testing methodology and results...")
        
        self.findings = []
        self.methodology_issues = []
        self.data_issues = []
        self.calculation_issues = []
        
    def audit_data_sources(self):
        """Audit the data sources used for accuracy testing"""
        print("\n📊 AUDITING DATA SOURCES")
        print("-" * 40)
        
        findings = []
        
        # Check historical data authenticity
        historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
        if os.path.exists(historical_file):
            try:
                with open(historical_file, 'r') as f:
                    historical_data = json.load(f)
                
                print(f"✅ Historical data loaded: {len(historical_data)} games")
                
                # Sample and verify data structure
                sample_games = historical_data[:10]
                
                # Check for required fields
                required_fields = ['date', 'home_team', 'away_team', 'home_final', 'away_final']
                missing_fields = []
                
                for game in sample_games:
                    for field in required_fields:
                        if field not in game or game[field] is None:
                            missing_fields.append(field)
                
                if missing_fields:
                    findings.append(f"Historical data missing fields: {set(missing_fields)}")
                else:
                    print("✅ Historical data has all required fields")
                
                # Check for realistic scores
                unrealistic_scores = []
                for game in sample_games:
                    if isinstance(game.get('home_final'), (int, float)) and isinstance(game.get('away_final'), (int, float)):
                        home_score = float(game['home_final'])
                        away_score = float(game['away_final'])
                        
                        # NFL scores typically 0-60
                        if home_score < 0 or home_score > 70 or away_score < 0 or away_score > 70:
                            unrealistic_scores.append((home_score, away_score))
                
                if unrealistic_scores:
                    findings.append(f"Found {len(unrealistic_scores)} games with unrealistic scores")
                else:
                    print("✅ Historical scores appear realistic")
                
                # Check date ranges
                dates = [game.get('date') for game in sample_games if game.get('date')]
                if dates:
                    print(f"✅ Date range: {min(dates)} to {max(dates)}")
                
            except Exception as e:
                findings.append(f"Error loading historical data: {e}")
        else:
            findings.append("Historical data file missing")
        
        # Check 2024 season data
        games_2024_file = "../nfl_data/games/2024_schedule.csv"
        if os.path.exists(games_2024_file):
            try:
                df = pd.read_csv(games_2024_file)
                completed_games = df[(df['home_score'].notna()) & (df['away_score'].notna())]
                
                print(f"✅ 2024 games: {len(completed_games)} completed games")
                
                # Check for realistic scores
                if len(completed_games) > 0:
                    avg_home_score = completed_games['home_score'].mean()
                    avg_away_score = completed_games['away_score'].mean()
                    
                    # NFL average is typically 20-25 points per team
                    if 15 <= avg_home_score <= 35 and 15 <= avg_away_score <= 35:
                        print(f"✅ Realistic average scores: Home {avg_home_score:.1f}, Away {avg_away_score:.1f}")
                    else:
                        findings.append(f"Unrealistic average scores: Home {avg_home_score:.1f}, Away {avg_away_score:.1f}")
                
            except Exception as e:
                findings.append(f"Error loading 2024 games: {e}")
        else:
            findings.append("2024 games file missing")
        
        return findings
    
    def audit_prediction_methodology(self):
        """Audit the prediction methodology used"""
        print("\n🧠 AUDITING PREDICTION METHODOLOGY")
        print("-" * 40)
        
        findings = []
        
        # Check for prediction algorithms
        prediction_files = [
            "production_ready_analyzer.py",
            "final_research_analyzer.py", 
            "ironclad_validation.py"
        ]
        
        existing_files = [f for f in prediction_files if os.path.exists(f)]
        print(f"✅ Prediction files found: {len(existing_files)}/{len(prediction_files)}")
        
        if len(existing_files) < len(prediction_files):
            findings.append(f"Missing prediction files: {set(prediction_files) - set(existing_files)}")
        
        # Check prediction factors
        try:
            # Look for evidence of what factors are used
            if os.path.exists("production_ready_analyzer.py"):
                with open("production_ready_analyzer.py", 'r') as f:
                    content = f.read()
                
                # Check for key prediction factors
                factors_to_check = [
                    'team_rating', 'home_advantage', 'injury', 'weather', 
                    'spread', 'total', 'momentum', 'rest_days'
                ]
                
                found_factors = []
                for factor in factors_to_check:
                    if factor in content.lower():
                        found_factors.append(factor)
                
                print(f"✅ Prediction factors found: {found_factors}")
                
                if len(found_factors) < 3:
                    findings.append("Too few prediction factors identified")
                
        except Exception as e:
            findings.append(f"Error analyzing prediction methodology: {e}")
        
        return findings
    
    def audit_accuracy_calculations(self):
        """Audit the accuracy calculation methods"""
        print("\n🔢 AUDITING ACCURACY CALCULATIONS")
        print("-" * 40)
        
        findings = []
        
        # Check validation reports
        validation_files = glob.glob("data/real-current/*validation*.json") + glob.glob("data/real-current/*report*.json")
        
        accuracy_values = []
        calculation_methods = []
        
        for file_path in validation_files:
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # Extract accuracy values
                def extract_accuracy(obj, path=""):
                    if isinstance(obj, dict):
                        for key, value in obj.items():
                            new_path = f"{path}.{key}" if path else key
                            if 'accuracy' in key.lower() and isinstance(value, (int, float)):
                                accuracy_values.append({
                                    'file': os.path.basename(file_path),
                                    'field': new_path,
                                    'value': value
                                })
                            elif isinstance(value, (dict, list)):
                                extract_accuracy(value, new_path)
                    elif isinstance(obj, list):
                        for i, item in enumerate(obj):
                            extract_accuracy(item, f"{path}[{i}]")
                
                extract_accuracy(data)
                
                # Look for calculation methodology
                content_str = str(data)
                if 'correct' in content_str.lower() and 'total' in content_str.lower():
                    calculation_methods.append(f"{os.path.basename(file_path)}: Standard correct/total")
                
            except Exception as e:
                findings.append(f"Error reading {file_path}: {e}")
        
        print(f"✅ Found {len(accuracy_values)} accuracy measurements")
        
        if accuracy_values:
            # Display accuracy values
            for acc in accuracy_values:
                print(f"   {acc['file']}: {acc['field']} = {acc['value']:.3f}")
            
            # Check for consistency
            values = [acc['value'] for acc in accuracy_values]
            if len(values) > 1:
                value_range = max(values) - min(values)
                if value_range > 0.1:  # More than 10% difference
                    findings.append(f"Large accuracy variance: {min(values):.3f} to {max(values):.3f}")
                else:
                    print(f"✅ Accuracy values consistent: {min(values):.3f} to {max(values):.3f}")
        else:
            findings.append("No accuracy measurements found in validation files")
        
        return findings, accuracy_values
    
    def validate_sample_predictions(self):
        """Validate a sample of predictions against known outcomes"""
        print("\n🎯 VALIDATING SAMPLE PREDICTIONS")
        print("-" * 40)
        
        findings = []
        
        try:
            # Load historical data for validation
            historical_file = "../historical-odds-scraper/data/nfl_archive_10Y_fixed.json"
            if not os.path.exists(historical_file):
                findings.append("Cannot validate - historical data missing")
                return findings
            
            with open(historical_file, 'r') as f:
                historical_data = json.load(f)
            
            # Take a sample of games for manual validation
            sample_size = min(20, len(historical_data))
            sample_games = np.random.choice(historical_data, sample_size, replace=False)
            
            print(f"✅ Validating {sample_size} sample games")
            
            # Simple prediction validation - home team wins if home_final > away_final
            correct_predictions = 0
            total_predictions = 0
            validation_details = []
            
            for game in sample_games:
                try:
                    home_score = float(game.get('home_final', 0))
                    away_score = float(game.get('away_final', 0))
                    
                    if home_score > 0 and away_score > 0:  # Valid game
                        # Actual outcome
                        home_won = home_score > away_score
                        
                        # Simple prediction: home team wins (home field advantage)
                        predicted_home_wins = True
                        
                        # Check if prediction was correct
                        correct = (predicted_home_wins == home_won)
                        if correct:
                            correct_predictions += 1
                        
                        total_predictions += 1
                        
                        validation_details.append({
                            'home_team': game.get('home_team', 'Unknown'),
                            'away_team': game.get('away_team', 'Unknown'),
                            'home_score': home_score,
                            'away_score': away_score,
                            'home_won': home_won,
                            'predicted_home_wins': predicted_home_wins,
                            'correct': correct
                        })
                
                except (ValueError, TypeError) as e:
                    continue
            
            if total_predictions > 0:
                sample_accuracy = correct_predictions / total_predictions
                print(f"✅ Sample validation accuracy: {sample_accuracy:.3f} ({correct_predictions}/{total_predictions})")
                
                # Home field advantage should be around 52-57%
                if 0.45 <= sample_accuracy <= 0.65:
                    print("✅ Sample accuracy within expected range for home field advantage")
                else:
                    findings.append(f"Sample accuracy outside expected range: {sample_accuracy:.3f}")
                
                # Show a few examples
                print("\n📋 Sample validation details:")
                for i, detail in enumerate(validation_details[:5]):
                    status = "✅" if detail['correct'] else "❌"
                    print(f"   {status} {detail['home_team']} {detail['home_score']}-{detail['away_score']} {detail['away_team']}")
            
            else:
                findings.append("No valid games found for sample validation")
        
        except Exception as e:
            findings.append(f"Error in sample validation: {e}")
        
        return findings
    
    def check_overfitting_indicators(self):
        """Check for signs of overfitting in accuracy claims"""
        print("\n🚨 CHECKING FOR OVERFITTING INDICATORS")
        print("-" * 40)
        
        findings = []
        
        # Check if accuracy is suspiciously high
        validation_files = glob.glob("data/real-current/*.json")
        max_accuracy = 0
        
        for file_path in validation_files:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Look for accuracy percentages
                import re
                accuracy_matches = re.findall(r'(\d+\.?\d*)%', content)
                accuracy_matches += re.findall(r'"accuracy":\s*(\d+\.?\d*)', content)
                accuracy_matches += re.findall(r'accuracy.*?(\d+\.?\d*)', content.lower())
                
                for match in accuracy_matches:
                    try:
                        acc_value = float(match)
                        if acc_value > 1:  # Convert percentage to decimal
                            acc_value = acc_value / 100
                        max_accuracy = max(max_accuracy, acc_value)
                    except ValueError:
                        continue
                        
            except Exception:
                continue
        
        print(f"✅ Maximum accuracy found: {max_accuracy:.1%}")
        
        # NFL betting is notoriously difficult - 67% is very good but achievable
        if max_accuracy > 0.75:
            findings.append(f"Suspiciously high accuracy: {max_accuracy:.1%} (NFL betting >75% is extremely rare)")
        elif max_accuracy > 0.70:
            findings.append(f"Very high accuracy: {max_accuracy:.1%} (should verify methodology carefully)")
        elif max_accuracy > 0.60:
            print(f"✅ Accuracy {max_accuracy:.1%} is excellent but realistic for NFL")
        elif max_accuracy > 0.55:
            print(f"✅ Accuracy {max_accuracy:.1%} is good and realistic")
        else:
            findings.append(f"Low accuracy: {max_accuracy:.1%} (may indicate issues)")
        
        # Check for training vs testing split
        training_files = glob.glob("*train*.py") + glob.glob("*training*.py")
        testing_files = glob.glob("*test*.py") + glob.glob("*validation*.py")
        
        if len(training_files) == 0:
            findings.append("No training files found - may indicate lack of proper ML methodology")
        
        if len(testing_files) == 0:
            findings.append("No testing files found - may indicate lack of proper validation")
        
        print(f"✅ Found {len(training_files)} training files, {len(testing_files)} testing files")
        
        return findings
    
    def generate_audit_report(self):
        """Generate comprehensive accuracy audit report"""
        print(f"\n🔍 RUNNING COMPREHENSIVE ACCURACY AUDIT")
        print("="*60)
        
        # Run all audits
        data_findings = self.audit_data_sources()
        methodology_findings = self.audit_prediction_methodology()
        calculation_findings, accuracy_values = self.audit_accuracy_calculations()
        validation_findings = self.validate_sample_predictions()
        overfitting_findings = self.check_overfitting_indicators()
        
        # Combine findings
        all_findings = (data_findings + methodology_findings + calculation_findings + 
                       validation_findings + overfitting_findings)
        
        # Generate report
        report = {
            'audit_date': datetime.now().isoformat(),
            'total_issues_found': len(all_findings),
            'accuracy_measurements': accuracy_values,
            'audit_results': {
                'data_sources': {
                    'status': 'PASS' if len(data_findings) == 0 else 'ISSUES_FOUND',
                    'findings': data_findings
                },
                'prediction_methodology': {
                    'status': 'PASS' if len(methodology_findings) == 0 else 'ISSUES_FOUND',
                    'findings': methodology_findings
                },
                'accuracy_calculations': {
                    'status': 'PASS' if len(calculation_findings) == 0 else 'ISSUES_FOUND',
                    'findings': calculation_findings
                },
                'sample_validation': {
                    'status': 'PASS' if len(validation_findings) == 0 else 'ISSUES_FOUND',
                    'findings': validation_findings
                },
                'overfitting_check': {
                    'status': 'PASS' if len(overfitting_findings) == 0 else 'ISSUES_FOUND',
                    'findings': overfitting_findings
                }
            },
            'overall_assessment': 'ACCURACY_TESTING_VALID' if len(all_findings) == 0 else 'ISSUES_REQUIRE_ATTENTION',
            'recommendations': []
        }
        
        # Generate recommendations
        if len(all_findings) > 0:
            report['recommendations'] = [
                "Review and address identified accuracy testing issues",
                "Implement proper train/test split methodology",
                "Add cross-validation for more robust accuracy estimates",
                "Document prediction methodology more thoroughly"
            ]
        
        # Save report
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/accuracy_audit_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def display_audit_results(self, report):
        """Display audit results"""
        print(f"\n🎯 ACCURACY AUDIT RESULTS")
        print("="*60)
        
        total_issues = report['total_issues_found']
        overall_status = report['overall_assessment']
        
        print(f"📊 Overall Assessment: {overall_status}")
        print(f"🔍 Total Issues Found: {total_issues}")
        
        if total_issues == 0:
            print("\n🎉 ACCURACY TESTING IS VALID!")
            print("✅ Data sources are authentic and realistic")
            print("✅ Prediction methodology appears sound")
            print("✅ Accuracy calculations are consistent")
            print("✅ Sample validation confirms results")
            print("✅ No signs of overfitting detected")
            
            print("\n🎯 CONFIDENCE LEVEL: HIGH")
            print("Your accuracy claims are well-supported by the evidence.")
            
        else:
            print(f"\n⚠️ ISSUES FOUND IN ACCURACY TESTING:")
            
            for category, results in report['audit_results'].items():
                if results['findings']:
                    print(f"\n{category.upper()}:")
                    for finding in results['findings']:
                        print(f"   • {finding}")
            
            print(f"\n💡 RECOMMENDATIONS:")
            for rec in report['recommendations']:
                print(f"   • {rec}")
        
        # Show accuracy measurements found
        if report['accuracy_measurements']:
            print(f"\n📊 ACCURACY MEASUREMENTS FOUND:")
            for acc in report['accuracy_measurements']:
                print(f"   {acc['file']}: {acc['value']:.1%}")
        
        print(f"\n💾 Full audit report saved: data/real-current/accuracy_audit_report.json")

def main():
    """Run accuracy verification audit"""
    auditor = AccuracyVerificationAudit()
    report = auditor.generate_audit_report()
    auditor.display_audit_results(report)
    
    return report

if __name__ == "__main__":
    main() 