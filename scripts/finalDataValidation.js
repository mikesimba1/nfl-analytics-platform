#!/usr/bin/env node

import fs from 'fs'

class FinalDataValidator {
  constructor() {
    this.validTeams = [
      'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
      'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
      'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
      'TEN', 'WAS'
    ]
    this.results = {
      files: {},
      overall: { score: 0, status: 'unknown', issues: [] }
    }
  }

  async validateAllData() {
    console.log('🔍 FINAL COMPREHENSIVE DATA VALIDATION\n')
    console.log('=' .repeat(60))
    
    const dataFiles = [
      'nfl_data/enhanced_rosters.csv',
      'nfl_data/team_ratings.csv',
      'nfl_data/real_defensive_rankings_2024.csv',
      'nfl_data/position_matchup_analysis_2024.csv',
      'nfl_data/target_depth_analysis_2024.csv',
      'nfl_data/game_script_analysis_2024.csv'
    ]
    
    let totalScore = 0
    let maxScore = 0
    
    for (const file of dataFiles) {
      console.log(`\n📊 Validating ${file}...`)
      const result = await this.validateFile(file)
      this.results.files[file] = result
      totalScore += result.score
      maxScore += 100
      
      console.log(`   Score: ${result.score}/100 (${result.status})`)
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   ⚠️ ${issue}`))
      } else {
        console.log('   ✅ No issues found')
      }
    }
    
    // Calculate overall score
    this.results.overall.score = Math.round((totalScore / maxScore) * 100)
    this.results.overall.status = this.getStatusFromScore(this.results.overall.score)
    
    // Collect all issues
    Object.values(this.results.files).forEach(file => {
      this.results.overall.issues.push(...file.issues)
    })
    
    this.generateFinalReport()
  }
  
  async validateFile(filePath) {
    const result = {
      exists: false,
      score: 0,
      status: 'failed',
      issues: [],
      stats: {}
    }
    
    if (!fs.existsSync(filePath)) {
      result.issues.push('File does not exist')
      return result
    }
    
    result.exists = true
    let score = 20 // Base score for existing
    
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        result.issues.push('File is empty')
        return result
      }
      
      score += 20 // Has content
      
      const headers = lines[0].split(',')
      const dataRows = lines.length - 1
      
      result.stats = {
        totalRows: dataRows,
        columns: headers.length,
        headers: headers
      }
      
      if (dataRows > 0) {
        score += 20 // Has data rows
      }
      
      // Validate team codes if team column exists
      const teamIndex = headers.findIndex(h => h.toLowerCase().includes('team'))
      if (teamIndex !== -1) {
        const invalidTeams = this.validateTeamCodes(lines, teamIndex)
        if (invalidTeams.length === 0) {
          score += 20 // Valid team codes
        } else {
          result.issues.push(`${invalidTeams.length} invalid team codes: ${invalidTeams.join(', ')}`)
        }
      } else {
        score += 20 // No team validation needed
      }
      
      // Check for data quality
      if (this.checkDataQuality(lines)) {
        score += 20 // Good data quality
      } else {
        result.issues.push('Data quality issues detected')
      }
      
    } catch (error) {
      result.issues.push(`Error reading file: ${error.message}`)
    }
    
    result.score = score
    result.status = this.getStatusFromScore(score)
    return result
  }
  
  validateTeamCodes(lines, teamIndex) {
    const invalidTeams = new Set()
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length <= teamIndex) continue
      
      const teamCode = values[teamIndex].trim().toUpperCase()
      if (teamCode && !this.validTeams.includes(teamCode)) {
        invalidTeams.add(teamCode)
      }
    }
    
    return Array.from(invalidTeams)
  }
  
  checkDataQuality(lines) {
    if (lines.length < 2) return false
    
    const headers = lines[0].split(',')
    let validRows = 0
    
    for (let i = 1; i < Math.min(lines.length, 11); i++) { // Check first 10 rows
      const values = lines[i].split(',')
      if (values.length === headers.length && values.some(v => v.trim())) {
        validRows++
      }
    }
    
    return validRows >= Math.min(5, lines.length - 1) // At least 5 valid rows or all rows if less than 5
  }
  
  getStatusFromScore(score) {
    if (score >= 95) return 'EXCELLENT'
    if (score >= 85) return 'VERY GOOD'
    if (score >= 75) return 'GOOD'
    if (score >= 60) return 'FAIR'
    return 'POOR'
  }
  
  generateFinalReport() {
    console.log('\n' + '=' .repeat(60))
    console.log('🎯 FINAL DATA VALIDATION REPORT')
    console.log('=' .repeat(60))
    
    console.log(`\n📊 Overall Score: ${this.results.overall.score}/100 (${this.results.overall.status})`)
    
    console.log('\n📋 File Summary:')
    Object.entries(this.results.files).forEach(([file, result]) => {
      const status = result.exists ? '✅' : '❌'
      const fileName = file.split('/').pop()
      console.log(`  ${status} ${fileName}: ${result.score}/100 (${result.status})`)
      if (result.stats.totalRows) {
        console.log(`     ${result.stats.totalRows} rows, ${result.stats.columns} columns`)
      }
    })
    
    if (this.results.overall.issues.length > 0) {
      console.log('\n⚠️ Issues Found:')
      this.results.overall.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`)
      })
    } else {
      console.log('\n✅ No issues found - Data is perfect!')
    }
    
    console.log('\n🚀 Data Engine Status:')
    if (this.results.overall.score >= 95) {
      console.log('   🟢 READY FOR PRODUCTION - Your data engine is rock solid!')
    } else if (this.results.overall.score >= 85) {
      console.log('   🟡 READY WITH MINOR FIXES - Excellent quality with minor improvements needed')
    } else if (this.results.overall.score >= 75) {
      console.log('   🟠 NEEDS IMPROVEMENT - Good foundation but requires fixes')
    } else {
      console.log('   🔴 NEEDS MAJOR WORK - Significant issues need addressing')
    }
    
    console.log('\n' + '=' .repeat(60))
    
    // Save detailed report
    fs.writeFileSync('final-data-validation-report.json', JSON.stringify(this.results, null, 2))
    console.log('💾 Detailed report saved to: final-data-validation-report.json')
  }
}

const validator = new FinalDataValidator()
validator.validateAllData().catch(console.error) 