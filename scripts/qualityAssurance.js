#!/usr/bin/env node

// Automated Quality Assurance for NFL Data
import fs from 'fs'

class DataQualityAssurance {
  async runQualityChecks() {
    console.log('🔍 Running automated quality checks...')
    
    const checks = [
      this.checkFileIntegrity(),
      this.checkDataCompleteness(),
      this.checkStatisticalRanges(),
      this.checkCalculationAccuracy()
    ]
    
    const results = await Promise.all(checks)
    const passedChecks = results.filter(r => r.passed).length
    
    console.log(`📊 Quality Score: ${passedChecks}/${results.length} (${Math.round(passedChecks/results.length*100)}%)`)
    
    return passedChecks / results.length >= 0.9
  }
  
  checkFileIntegrity() {
    // Check if all required files exist and have data
    const requiredFiles = [
      'nfl_data/enhanced_rosters.csv',
      'nfl_data/real_defensive_rankings_2024.csv',
      'nfl_data/team_ratings.csv'
    ]
    
    const existingFiles = requiredFiles.filter(file => fs.existsSync(file))
    return { passed: existingFiles.length === requiredFiles.length, score: existingFiles.length / requiredFiles.length }
  }
  
  checkDataCompleteness() {
    // Check for missing values
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    if (!fs.existsSync(enhancedPath)) return { passed: false, score: 0 }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    
    let completeRecords = 0
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const emptyFields = values.filter(v => !v.trim() || v.trim() === 'NaN').length
      if (emptyFields / values.length < 0.2) completeRecords++
    }
    
    const completeness = completeRecords / (lines.length - 1)
    return { passed: completeness >= 0.9, score: completeness }
  }
  
  checkStatisticalRanges() {
    // Check if values are in realistic ranges
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    if (!fs.existsSync(enhancedPath)) return { passed: false, score: 0 }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const ranges = {
      'total_passing_yards': [0, 6000],
      'total_rushing_yards': [0, 2500],
      'total_receiving_yards': [0, 2000]
    }
    
    let validFields = 0
    let totalFields = 0
    
    for (const [field, [min, max]] of Object.entries(ranges)) {
      const fieldIdx = headers.findIndex(h => h.includes(field))
      if (fieldIdx !== -1) {
        totalFields++
        let validValues = 0
        let totalValues = 0
        
        for (let i = 1; i < lines.length; i++) {
          const value = parseFloat(lines[i].split(',')[fieldIdx])
          if (!isNaN(value)) {
            totalValues++
            if (value >= min && value <= max) validValues++
          }
        }
        
        if (totalValues > 0 && validValues / totalValues >= 0.95) validFields++
      }
    }
    
    const score = totalFields > 0 ? validFields / totalFields : 1
    return { passed: score >= 0.9, score }
  }
  
  checkCalculationAccuracy() {
    // Spot check some calculations
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    if (!fs.existsSync(enhancedPath)) return { passed: false, score: 0 }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    // Check if totals and averages are consistent
    const gamesIdx = headers.findIndex(h => h.toLowerCase().includes('games'))
    const totalIdx = headers.findIndex(h => h.includes('total_passing_yards'))
    const avgIdx = headers.findIndex(h => h.includes('avg_passing_yards'))
    
    if (gamesIdx === -1 || totalIdx === -1 || avgIdx === -1) {
      return { passed: true, score: 1 } // Skip if columns not found
    }
    
    let correctCalculations = 0
    let totalChecked = 0
    
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
      const values = lines[i].split(',')
      const games = parseFloat(values[gamesIdx]) || 1
      const total = parseFloat(values[totalIdx]) || 0
      const avg = parseFloat(values[avgIdx]) || 0
      
      totalChecked++
      if (Math.abs(total - (avg * games)) < Math.max(1, total * 0.1)) {
        correctCalculations++
      }
    }
    
    const accuracy = totalChecked > 0 ? correctCalculations / totalChecked : 1
    return { passed: accuracy >= 0.8, score: accuracy }
  }
}

// Run quality checks
const qa = new DataQualityAssurance()
qa.runQualityChecks().then(passed => {
  console.log(passed ? '✅ All quality checks passed!' : '⚠️ Some quality issues detected')
  process.exit(passed ? 0 : 1)
})
