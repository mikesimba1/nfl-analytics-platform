#!/usr/bin/env python3
"""
COMPREHENSIVE TESTING AUDIT
Examining our validation methodology for remaining issues
"""

import json
import os
from datetime import datetime

class TestingAudit:
    """Audit our testing methodology"""
    
    def __init__(self):
        print("🔍 COMPREHENSIVE TESTING AUDIT")
        print("="*60)
        self.issues = []
        
    def check_validation_consistency(self):
        """Check for consistency in validation results"""
        print("\n📊 CHECKING VALIDATION CONSISTENCY")
        print("-" * 40)
        
        # Check different validation files
        files_to_check = [
            "data/real-current/comprehensive_system_fix.json",
            "data/real-current/proper_temporal_validation.json", 
            "data/real-current/true_accuracy_validation.json"
        ]
        
        accuracies = []
        
        for file in files_to_check:
            if os.path.exists(file):
                try:
                    with open(file, 'r') as f:
                        data = json.load(f)
                    
                    # Try different accuracy field names
                    accuracy = None
                    if 'validation_results' in data and 'overall_accuracy' in data['validation_results']:
                        accuracy = data['validation_results']['overall_accuracy']
                    elif 'accuracy_results' in data and 'overall_accuracy' in data['accuracy_results']:
                        accuracy = data['accuracy_results']['overall_accuracy']
                    
                    if accuracy:
                        accuracies.append((file, accuracy))
                        print(f"✅ {file}: {accuracy:.1%}")
                
                except Exception as e:
                    print(f"❌ Error reading {file}: {e}")
        
        # Check for major inconsistencies
        if len(accuracies) > 1:
            acc_values = [acc for _, acc in accuracies]
            max_acc = max(acc_values)
            min_acc = min(acc_values)
            range_acc = max_acc - min_acc
            
            if range_acc > 0.15:  # >15% difference is concerning
                self.issues.append(f"MAJOR INCONSISTENCY: Accuracy range {range_acc:.1%}")
                print(f"❌ MAJOR INCONSISTENCY: {range_acc:.1%} range")
                for file, acc in accuracies:
                    print(f"   {file}: {acc:.1%}")
            else:
                print(f"✅ Reasonable consistency: {range_acc:.1%} range")
        
        return accuracies
    
    def check_suspicious_results(self):
        """Check for suspiciously high results"""
        print("\n🚨 CHECKING FOR SUSPICIOUS RESULTS")
        print("-" * 40)
        
        # Look for any claims of >70% accuracy
        suspicious_files = []
        
        # Check validation files
        files_to_check = [
            "SYSTEM_FIXED_SUMMARY.md",
            "comprehensive_system_fix.py",
            "nfl-research-proven-site.mjs"
        ]
        
        for file in files_to_check:
            if os.path.exists(file):
                try:
                    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Look for high accuracy claims
                    if '67%' in content or '67.0%' in content:
                        suspicious_files.append((file, "67% accuracy"))
                        print(f"⚠️ {file}: Contains 67% accuracy claims")
                    
                    if any(claim in content for claim in ['70%', '75%', '80%']):
                        suspicious_files.append((file, "Very high accuracy"))
                        print(f"🚨 {file}: Contains very high accuracy claims")
                
                except Exception as e:
                    continue
        
        if suspicious_files:
            self.issues.append(f"SUSPICIOUS: {len(suspicious_files)} files with high accuracy claims")
        
        return suspicious_files
    
    def check_temporal_methodology(self):
        """Check if temporal validation is properly implemented"""
        print("\n⏰ CHECKING TEMPORAL METHODOLOGY")
        print("-" * 40)
        
        temporal_files = [
            "comprehensive_system_fix.py",
            "proper_temporal_validation.py"
        ]
        
        proper_temporal = False
        
        for file in temporal_files:
            if os.path.exists(file):
                try:
                    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Check for proper temporal keywords
                    temporal_indicators = [
                        'week < ' in content,  # Proper week filtering
                        'cutoff' in content.lower(),  # Temporal cutoffs
                        'before' in content.lower(),  # Using data before
                        'temporal' in content.lower()  # Temporal awareness
                    ]
                    
                    if sum(temporal_indicators) >= 3:
                        proper_temporal = True
                        print(f"✅ {file}: Proper temporal methodology")
                    else:
                        print(f"⚠️ {file}: May lack proper temporal validation")
                
                except Exception as e:
                    continue
        
        if not proper_temporal:
            self.issues.append("CRITICAL: No proper temporal validation found")
        
        return proper_temporal
    
    def check_data_leakage_prevention(self):
        """Check if data leakage is properly prevented"""
        print("\n🚫 CHECKING DATA LEAKAGE PREVENTION")
        print("-" * 40)
        
        # Look for data leakage analysis
        leakage_files = [
            "data_leakage_analysis.py",
            "FINAL_DATA_LEAKAGE_SUMMARY.md"
        ]
        
        leakage_addressed = False
        
        for file in leakage_files:
            if os.path.exists(file):
                print(f"✅ {file}: Data leakage analysis exists")
                leakage_addressed = True
        
        # Check if leakage was found and fixed
        if os.path.exists("data/real-current/data_leakage_analysis.json"):
            try:
                with open("data/real-current/data_leakage_analysis.json", 'r') as f:
                    data = json.load(f)
                
                if data.get('total_leakage_issues', 0) > 0:
                    print(f"⚠️ Data leakage issues found: {data['total_leakage_issues']}")
                    if data.get('severity') == 'CRITICAL':
                        self.issues.append("CRITICAL: Data leakage issues found")
            
            except Exception as e:
                print(f"❌ Error reading leakage analysis: {e}")
        
        if not leakage_addressed:
            self.issues.append("WARNING: No data leakage analysis found")
        
        return leakage_addressed
    
    def generate_final_assessment(self):
        """Generate final assessment of testing methodology"""
        print(f"\n🎯 FINAL ASSESSMENT")
        print("="*60)
        
        # Run all checks
        accuracies = self.check_validation_consistency()
        suspicious = self.check_suspicious_results()
        temporal = self.check_temporal_methodology()
        leakage = self.check_data_leakage_prevention()
        
        # Generate assessment
        assessment = {
            'audit_date': datetime.now().isoformat(),
            'total_issues': len(self.issues),
            'validation_consistency': len(accuracies) > 0,
            'suspicious_results': len(suspicious) > 0,
            'proper_temporal': temporal,
            'leakage_addressed': leakage,
            'issues_found': self.issues,
            'overall_quality': self.assess_quality()
        }
        
        # Save assessment
        os.makedirs('data/real-current', exist_ok=True)
        with open('data/real-current/testing_audit.json', 'w') as f:
            json.dump(assessment, f, indent=2)
        
        return assessment
    
    def assess_quality(self):
        """Assess overall quality"""
        critical_issues = [i for i in self.issues if 'CRITICAL' in i]
        major_issues = [i for i in self.issues if 'MAJOR' in i]
        
        if len(critical_issues) > 0:
            return "POOR - Critical issues found"
        elif len(major_issues) > 0:
            return "CONCERNING - Major inconsistencies"
        elif len(self.issues) > 3:
            return "NEEDS IMPROVEMENT - Multiple issues"
        else:
            return "ACCEPTABLE - Minor issues only"
    
    def display_results(self, assessment):
        """Display final results"""
        print(f"\n🔍 TESTING AUDIT RESULTS")
        print("="*50)
        
        print(f"📊 SUMMARY:")
        print(f"   Total Issues: {assessment['total_issues']}")
        print(f"   Overall Quality: {assessment['overall_quality']}")
        
        if assessment['issues_found']:
            print(f"\n❌ ISSUES FOUND:")
            for issue in assessment['issues_found']:
                print(f"   - {issue}")
        
        print(f"\n✅ METHODOLOGY STATUS:")
        print(f"   Validation Consistency: {'✅' if assessment['validation_consistency'] else '❌'}")
        print(f"   Proper Temporal Method: {'✅' if assessment['proper_temporal'] else '❌'}")
        print(f"   Data Leakage Addressed: {'✅' if assessment['leakage_addressed'] else '❌'}")
        print(f"   Suspicious Results: {'⚠️' if assessment['suspicious_results'] else '✅'}")

def main():
    """Run the testing audit"""
    auditor = TestingAudit()
    assessment = auditor.generate_final_assessment()
    auditor.display_results(assessment)
    return assessment

if __name__ == "__main__":
    main() 