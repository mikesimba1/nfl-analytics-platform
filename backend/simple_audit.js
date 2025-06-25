const fs = require('fs');

console.log('🔍 COMPREHENSIVE TESTING AUDIT');
console.log('='.repeat(60));

let issues = [];

// Check validation consistency
console.log('\n📊 CHECKING VALIDATION CONSISTENCY');
console.log('-'.repeat(40));

const files = [
    'data/real-current/comprehensive_system_fix.json',
    'data/real-current/proper_temporal_validation.json',
    'data/real-current/true_accuracy_validation.json'
];

let accuracies = [];

files.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            let accuracy = null;
            
            if (data.validation_results && data.validation_results.overall_accuracy) {
                accuracy = data.validation_results.overall_accuracy;
            } else if (data.accuracy_results && data.accuracy_results.overall_accuracy) {
                accuracy = data.accuracy_results.overall_accuracy;
            }
            
            if (accuracy) {
                accuracies.push({file, accuracy});
                console.log(`✅ ${file}: ${(accuracy * 100).toFixed(1)}%`);
            }
        } catch (e) {
            console.log(`❌ Error reading ${file}: ${e.message}`);
        }
    } else {
        console.log(`⚠️ ${file}: File not found`);
    }
});

// Check for inconsistencies
if (accuracies.length > 1) {
    const values = accuracies.map(a => a.accuracy);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    if (range > 0.15) {
        issues.push(`MAJOR INCONSISTENCY: Accuracy range ${(range * 100).toFixed(1)}%`);
        console.log(`❌ MAJOR INCONSISTENCY: ${(range * 100).toFixed(1)}% range`);
        accuracies.forEach(a => console.log(`   ${a.file}: ${(a.accuracy * 100).toFixed(1)}%`));
    } else {
        console.log(`✅ Reasonable consistency: ${(range * 100).toFixed(1)}% range`);
    }
}

// Check for suspicious results
console.log('\n🚨 CHECKING FOR SUSPICIOUS RESULTS');
console.log('-'.repeat(40));

const suspiciousFiles = [
    'SYSTEM_FIXED_SUMMARY.md',
    'comprehensive_system_fix.py',
    '../nfl-research-proven-site.mjs'
];

let suspicious = [];

suspiciousFiles.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('67%') || content.includes('67.0%')) {
                suspicious.push({file, issue: '67% accuracy'});
                console.log(`⚠️ ${file}: Contains 67% accuracy claims`);
            }
            if (content.includes('70%') || content.includes('75%') || content.includes('80%')) {
                suspicious.push({file, issue: 'Very high accuracy'});
                console.log(`🚨 ${file}: Contains very high accuracy claims`);
            }
        } catch (e) {
            // Skip file
        }
    }
});

if (suspicious.length > 0) {
    issues.push(`SUSPICIOUS: ${suspicious.length} files with high accuracy claims`);
}

// Check data leakage analysis
console.log('\n🚫 CHECKING DATA LEAKAGE ANALYSIS');
console.log('-'.repeat(40));

if (fs.existsSync('data/real-current/data_leakage_analysis.json')) {
    try {
        const leakageData = JSON.parse(fs.readFileSync('data/real-current/data_leakage_analysis.json', 'utf8'));
        console.log(`✅ Data leakage analysis found`);
        console.log(`   Issues found: ${leakageData.total_leakage_issues || 0}`);
        console.log(`   Severity: ${leakageData.severity || 'Unknown'}`);
        
        if (leakageData.severity === 'CRITICAL') {
            issues.push('CRITICAL: Data leakage issues found');
        }
    } catch (e) {
        console.log(`❌ Error reading data leakage analysis: ${e.message}`);
    }
} else {
    console.log(`⚠️ No data leakage analysis found`);
    issues.push('WARNING: No data leakage analysis found');
}

// Final assessment
console.log('\n🎯 FINAL ASSESSMENT');
console.log('='.repeat(60));

const critical = issues.filter(i => i.includes('CRITICAL')).length;
const major = issues.filter(i => i.includes('MAJOR')).length;

let quality;
if (critical > 0) {
    quality = 'POOR - Critical issues found';
} else if (major > 0) {
    quality = 'CONCERNING - Major inconsistencies';
} else if (issues.length > 3) {
    quality = 'NEEDS IMPROVEMENT - Multiple issues';
} else {
    quality = 'ACCEPTABLE - Minor issues only';
}

console.log(`📊 SUMMARY:`);
console.log(`   Total Issues: ${issues.length}`);
console.log(`   Overall Quality: ${quality}`);

if (issues.length > 0) {
    console.log('\n❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(`   - ${issue}`));
}

console.log('\n✅ KEY FINDINGS:');
console.log(`   Validation Files Found: ${accuracies.length}`);
console.log(`   Suspicious Claims: ${suspicious.length}`);
if (accuracies.length > 1) {
    const values = accuracies.map(a => a.accuracy);
    const range = Math.max(...values) - Math.min(...values);
    console.log(`   Accuracy Range: ${(range * 100).toFixed(1)}%`);
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
if (critical > 0) {
    console.log('   - Address all critical data leakage issues immediately');
}
if (major > 0) {
    console.log('   - Reconcile major inconsistencies in validation results');
}
if (suspicious.length > 0) {
    console.log('   - Review and validate high accuracy claims');
}
console.log('   - Use conservative accuracy expectations (55-60%) for marketing');
console.log('   - Implement transparent reporting of methodology');
console.log('   - Add comprehensive monitoring of real-world performance');

console.log('\n📝 CONCLUSION:');
if (quality.includes('POOR') || quality.includes('CRITICAL')) {
    console.log('❌ TESTING METHODOLOGY NEEDS MAJOR IMPROVEMENTS');
    console.log('   Current validation results should be considered unreliable');
    console.log('   Recommend complete re-validation with proper temporal methodology');
} else if (quality.includes('CONCERNING')) {
    console.log('⚠️ TESTING METHODOLOGY HAS SIGNIFICANT ISSUES');
    console.log('   Results may be overstated, use conservative projections');
    console.log('   Address inconsistencies before production deployment');
} else {
    console.log('✅ TESTING METHODOLOGY IS REASONABLY SOUND');
    console.log('   Minor improvements needed, but core approach is valid');
    console.log('   Proceed with conservative expectations and monitoring');
} 