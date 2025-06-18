#!/usr/bin/env node

import DataValidator from '../src/utils/dataValidator.js'

async function main() {
  console.log('🚀 Starting NFL Data Validation...\n')
  
  const validator = new DataValidator()
  
  try {
    const results = await validator.validateAllData()
    
    console.log('\n📋 RECOMMENDATIONS:')
    console.log('='.repeat(40))
    
    const recommendations = validator.getRecommendations()
    
    if (recommendations.length === 0) {
      console.log('🌟 No major issues found! Your data looks excellent.')
    } else {
      recommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'HIGH' ? '🚨' : rec.priority === 'MEDIUM' ? '⚠️' : 'ℹ️'
        console.log(`\n${priorityIcon} ${rec.priority} PRIORITY - ${rec.category}`)
        console.log(`   Action: ${rec.action}`)
        console.log(`   Details: ${rec.description}`)
      })
    }
    
    console.log('\n📊 NEXT STEPS:')
    console.log('='.repeat(40))
    
    if (results.overall.score >= 90) {
      console.log('✅ Data quality is excellent! Focus on advanced analytics and real-time features.')
    } else if (results.overall.score >= 75) {
      console.log('✅ Good foundation. Address the issues above to reach excellence.')
    } else if (results.overall.score >= 50) {
      console.log('⚠️  Data needs improvement. Focus on the HIGH priority items first.')
    } else {
      console.log('🚨 Critical data issues. Recommend immediate cleanup before building new features.')
    }
    
    // Export results for further analysis
    const fs = await import('fs')
    fs.writeFileSync('data-validation-results.json', JSON.stringify(results, null, 2))
    console.log('\n💾 Full results saved to: data-validation-results.json')
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error) 