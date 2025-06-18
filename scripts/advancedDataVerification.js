#!/usr/bin/env node

import fs from 'fs'

class AdvancedDataVerification {
  constructor() {
    this.verificationResults = {
      sourceDataIntegrity: { score: 0, details: [] },
      derivedDataAccuracy: { score: 0, details: [] },
      crossReferenceValidation: { score: 0, details: [] },
      statisticalConsistency: { score: 0, details: [] },
      businessLogicValidation: { score: 0, details: [] }
    }
  }

  async runAdvancedVerification() {
    console.log('🔬 ADVANCED NFL DATA VERIFICATION')
    console.log('=' .repeat(50))
    console.log('Running comprehensive accuracy validation...\n')
    
    await this.verifySourceDataIntegrity()
    await this.validateDerivedDataAccuracy()
    await this.performCrossReferenceValidation()
    await this.checkStatisticalConsistency()
    await this.validateBusinessLogic()
    
    this.generateVerificationReport()
  }

  async verifySourceDataIntegrity() {
    console.log('🔍 Verifying Source Data Integrity...')
    
    const sourceFiles = [
      'nfl_data/player_stats/2024_seasonal_stats.csv',
      'nfl_data/player_stats/2024_weekly_stats.csv',
      'nfl_data/rosters/2024_rosters.csv',
      'nfl_data/rosters/2024_snap_counts.csv'
    ]
    
    let totalScore = 0
    let fileCount = 0
    
    for (const file of sourceFiles) {
      if (fs.existsSync(file)) {
        const integrity = this.checkFileIntegrity(file)
        totalScore += integrity.score
        fileCount++
        
        this.verificationResults.sourceDataIntegrity.details.push({
          file: file,
          score: integrity.score,
          issues: integrity.issues,
          recordCount: integrity.recordCount
        })
        
        console.log(`   📄 ${file}: ${integrity.score}/100 (${integrity.recordCount} records)`)
        if (integrity.issues.length > 0) {
          integrity.issues.forEach(issue => console.log(`     ⚠️ ${issue}`))
        }
      }
    }
    
    this.verificationResults.sourceDataIntegrity.score = fileCount > 0 ? Math.round(totalScore / fileCount) : 0
    console.log(`   📊 Source Data Integrity: ${this.verificationResults.sourceDataIntegrity.score}/100\n`)
  }

  checkFileIntegrity(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return { score: 0, issues: ['File is empty or has no data'], recordCount: 0 }
    }
    
    const headers = lines[0].split(',')
    const issues = []
    let score = 100
    
    // Check for duplicate headers
    const uniqueHeaders = new Set(headers)
    if (uniqueHeaders.size !== headers.length) {
      issues.push('Duplicate column headers detected')
      score -= 10
    }
    
    // Check for empty headers
    const emptyHeaders = headers.filter(h => !h.trim())
    if (emptyHeaders.length > 0) {
      issues.push(`${emptyHeaders.length} empty column headers`)
      score -= 5
    }
    
    // Check data consistency
    let inconsistentRows = 0
    for (let i = 1; i < Math.min(100, lines.length); i++) {
      const values = lines[i].split(',')
      if (values.length !== headers.length) {
        inconsistentRows++
      }
    }
    
    if (inconsistentRows > 0) {
      const inconsistencyRate = inconsistentRows / Math.min(99, lines.length - 1)
      if (inconsistencyRate > 0.05) {
        issues.push(`${Math.round(inconsistencyRate * 100)}% of rows have inconsistent column counts`)
        score -= Math.min(20, inconsistencyRate * 100)
      }
    }
    
    return {
      score: Math.max(0, Math.round(score)),
      issues,
      recordCount: lines.length - 1
    }
  }

  async validateDerivedDataAccuracy() {
    console.log('🎯 Validating Derived Data Accuracy...')
    
    const derivedFiles = [
      'nfl_data/enhanced_rosters.csv',
      'nfl_data/real_defensive_rankings_2024.csv',
      'nfl_data/team_ratings.csv'
    ]
    
    let totalScore = 0
    let fileCount = 0
    
    for (const file of derivedFiles) {
      if (fs.existsSync(file)) {
        const accuracy = await this.validateDerivedFile(file)
        totalScore += accuracy.score
        fileCount++
        
        this.verificationResults.derivedDataAccuracy.details.push({
          file: file,
          score: accuracy.score,
          validations: accuracy.validations
        })
        
        console.log(`   📄 ${file}: ${accuracy.score}/100`)
        accuracy.validations.forEach(v => {
          const status = v.passed ? '✅' : '⚠️'
          console.log(`     ${status} ${v.test}: ${v.result}`)
        })
      }
    }
    
    this.verificationResults.derivedDataAccuracy.score = fileCount > 0 ? Math.round(totalScore / fileCount) : 0
    console.log(`   📊 Derived Data Accuracy: ${this.verificationResults.derivedDataAccuracy.score}/100\n`)
  }

  async validateDerivedFile(filePath) {
    const validations = []
    let score = 100
    
    if (filePath.includes('enhanced_rosters')) {
      const results = this.validateEnhancedRosters(filePath)
      validations.push(...results.validations)
      score = results.score
    } else if (filePath.includes('defensive_rankings')) {
      const results = this.validateDefensiveRankings(filePath)
      validations.push(...results.validations)
      score = results.score
    } else if (filePath.includes('team_ratings')) {
      const results = this.validateTeamRatings(filePath)
      validations.push(...results.validations)
      score = results.score
    }
    
    return { score, validations }
  }

  validateEnhancedRosters(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const validations = []
    let score = 100
    
    // Check for required columns
    const requiredColumns = ['player_name', 'team', 'position']
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
    )
    
    if (missingColumns.length === 0) {
      validations.push({ test: 'Required columns', passed: true, result: 'All present' })
    } else {
      validations.push({ test: 'Required columns', passed: false, result: `Missing: ${missingColumns.join(', ')}` })
      score -= 20
    }
    
    // Check statistical ranges
    const statColumns = headers.filter(h => 
      h.includes('yards') || h.includes('points') || h.includes('avg_')
    )
    
    let validStats = 0
    for (const col of statColumns.slice(0, 5)) {
      const colIdx = headers.indexOf(col)
      const values = []
      
      for (let i = 1; i < Math.min(50, lines.length); i++) {
        const value = parseFloat(lines[i].split(',')[colIdx])
        if (!isNaN(value)) values.push(value)
      }
      
      if (values.length > 0) {
        const allPositive = values.every(v => v >= 0)
        const reasonableMax = values.every(v => v < 10000)
        
        if (allPositive && reasonableMax) {
          validStats++
        }
      }
    }
    
    const statAccuracy = statColumns.length > 0 ? (validStats / Math.min(5, statColumns.length)) * 100 : 100
    validations.push({ 
      test: 'Statistical ranges', 
      passed: statAccuracy >= 80, 
      result: `${Math.round(statAccuracy)}% within expected ranges` 
    })
    
    if (statAccuracy < 80) score -= 15
    
    return { score: Math.max(0, score), validations }
  }

  validateDefensiveRankings(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const validations = []
    let score = 100
    
    // Check if we have 32 teams (NFL requirement)
    const teamCount = lines.length - 1
    const hasAllTeams = teamCount === 32
    
    validations.push({ 
      test: 'Team count', 
      passed: hasAllTeams, 
      result: `${teamCount}/32 teams` 
    })
    
    if (!hasAllTeams) score -= 25
    
    // Check ranking consistency
    const rankColumns = headers.filter(h => h.toLowerCase().includes('rank'))
    let validRankings = 0
    
    for (const rankCol of rankColumns.slice(0, 3)) {
      const colIdx = headers.indexOf(rankCol)
      const ranks = []
      
      for (let i = 1; i < lines.length; i++) {
        const rank = parseInt(lines[i].split(',')[colIdx])
        if (!isNaN(rank)) ranks.push(rank)
      }
      
      if (ranks.length > 0) {
        const minRank = Math.min(...ranks)
        const maxRank = Math.max(...ranks)
        const uniqueRanks = new Set(ranks)
        
        if (minRank === 1 && maxRank <= 32 && uniqueRanks.size === ranks.length) {
          validRankings++
        }
      }
    }
    
    const rankAccuracy = rankColumns.length > 0 ? (validRankings / Math.min(3, rankColumns.length)) * 100 : 100
    validations.push({ 
      test: 'Ranking consistency', 
      passed: rankAccuracy >= 80, 
      result: `${Math.round(rankAccuracy)}% rankings valid` 
    })
    
    if (rankAccuracy < 80) score -= 20
    
    return { score: Math.max(0, score), validations }
  }

  validateTeamRatings(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const validations = []
    let score = 100
    
    // Check team count
    const teamCount = lines.length - 1
    validations.push({ 
      test: 'Team count', 
      passed: teamCount === 32, 
      result: `${teamCount}/32 teams` 
    })
    
    if (teamCount !== 32) score -= 20
    
    // Check rating ranges
    const ratingColumns = headers.filter(h => h.toLowerCase().includes('rating'))
    let validRatings = 0
    
    for (const ratingCol of ratingColumns) {
      const colIdx = headers.indexOf(ratingCol)
      const ratings = []
      
      for (let i = 1; i < lines.length; i++) {
        const rating = parseFloat(lines[i].split(',')[colIdx])
        if (!isNaN(rating)) ratings.push(rating)
      }
      
      if (ratings.length > 0) {
        const allInRange = ratings.every(r => r >= 0 && r <= 100)
        if (allInRange) validRatings++
      }
    }
    
    const ratingAccuracy = ratingColumns.length > 0 ? (validRatings / ratingColumns.length) * 100 : 100
    validations.push({ 
      test: 'Rating ranges', 
      passed: ratingAccuracy >= 90, 
      result: `${Math.round(ratingAccuracy)}% ratings in valid range (0-100)` 
    })
    
    if (ratingAccuracy < 90) score -= 15
    
    return { score: Math.max(0, score), validations }
  }

  async performCrossReferenceValidation() {
    console.log('🔗 Performing Cross-Reference Validation...')
    
    // Validate team consistency across files
    const teamConsistency = this.validateTeamConsistency()
    
    // Validate player data consistency
    const playerConsistency = this.validatePlayerConsistency()
    
    const overallScore = Math.round((teamConsistency.score + playerConsistency.score) / 2)
    
    this.verificationResults.crossReferenceValidation.score = overallScore
    this.verificationResults.crossReferenceValidation.details = [teamConsistency, playerConsistency]
    
    console.log(`   🏈 Team consistency: ${teamConsistency.score}/100`)
    console.log(`   👤 Player consistency: ${playerConsistency.score}/100`)
    console.log(`   📊 Cross-Reference Validation: ${overallScore}/100\n`)
  }

  validateTeamConsistency() {
    const teamFiles = [
      'nfl_data/team_ratings.csv',
      'nfl_data/real_defensive_rankings_2024.csv'
    ]
    
    const teamSets = []
    
    for (const file of teamFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8')
        const lines = content.split('\n').filter(line => line.trim())
        const teams = new Set()
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          const team = values[0]?.trim().toUpperCase()
          if (team && team.length <= 4) {
            teams.add(team)
          }
        }
        
        teamSets.push({ file, teams, count: teams.size })
      }
    }
    
    if (teamSets.length < 2) {
      return { score: 50, message: 'Insufficient files for team consistency check' }
    }
    
    const commonTeams = new Set([...teamSets[0].teams].filter(x => teamSets[1].teams.has(x)))
    const maxTeams = Math.max(...teamSets.map(ts => ts.count))
    const consistency = (commonTeams.size / maxTeams) * 100
    
    return {
      score: Math.round(consistency),
      commonTeams: commonTeams.size,
      totalTeams: maxTeams,
      consistency: Math.round(consistency)
    }
  }

  validatePlayerConsistency() {
    // This is a simplified check - in a real scenario you'd want more sophisticated matching
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    
    if (!fs.existsSync(enhancedPath)) {
      return { score: 0, message: 'Enhanced rosters file not found' }
    }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    // Check for data completeness
    let completeRecords = 0
    let totalRecords = lines.length - 1
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const emptyFields = values.filter(v => !v.trim() || v.trim() === 'NaN' || v.trim() === '0').length
      
      if (emptyFields / values.length < 0.3) { // Less than 30% empty fields
        completeRecords++
      }
    }
    
    const completeness = totalRecords > 0 ? (completeRecords / totalRecords) * 100 : 0
    
    return {
      score: Math.round(completeness),
      completeRecords,
      totalRecords,
      completeness: Math.round(completeness)
    }
  }

  async checkStatisticalConsistency() {
    console.log('📊 Checking Statistical Consistency...')
    
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    
    if (!fs.existsSync(enhancedPath)) {
      this.verificationResults.statisticalConsistency.score = 0
      console.log('   ⚠️ Enhanced rosters file not found\n')
      return
    }
    
    const consistency = this.analyzeStatisticalConsistency(enhancedPath)
    
    this.verificationResults.statisticalConsistency.score = consistency.overallScore
    this.verificationResults.statisticalConsistency.details = consistency.checks
    
    console.log(`   📈 Distribution normality: ${consistency.checks.distributions.score}/100`)
    console.log(`   🎯 Correlation validity: ${consistency.checks.correlations.score}/100`)
    console.log(`   🔢 Calculation accuracy: ${consistency.checks.calculations.score}/100`)
    console.log(`   📊 Statistical Consistency: ${consistency.overallScore}/100\n`)
  }

  analyzeStatisticalConsistency(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const checks = {
      distributions: this.checkDistributions(lines, headers),
      correlations: this.checkCorrelations(lines, headers),
      calculations: this.checkCalculations(lines, headers)
    }
    
    const overallScore = Math.round(
      (checks.distributions.score + checks.correlations.score + checks.calculations.score) / 3
    )
    
    return { overallScore, checks }
  }

  checkDistributions(lines, headers) {
    const statFields = ['total_passing_yards', 'total_rushing_yards', 'total_receiving_yards', 'fantasy_points']
    let validDistributions = 0
    
    for (const field of statFields) {
      const fieldIdx = headers.findIndex(h => h.includes(field))
      if (fieldIdx !== -1) {
        const values = []
        
        for (let i = 1; i < lines.length; i++) {
          const value = parseFloat(lines[i].split(',')[fieldIdx])
          if (!isNaN(value) && value >= 0) {
            values.push(value)
          }
        }
        
        if (values.length > 10) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length
          const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
          const stdDev = Math.sqrt(variance)
          
          // Check if distribution seems reasonable (not too skewed)
          const outliers = values.filter(v => Math.abs(v - mean) > 3 * stdDev)
          if (outliers.length / values.length < 0.05) { // Less than 5% outliers
            validDistributions++
          }
        }
      }
    }
    
    const score = Math.round((validDistributions / statFields.length) * 100)
    return { score, validDistributions, totalFields: statFields.length }
  }

  checkCorrelations(lines, headers) {
    // Check expected positive correlations
    const correlationPairs = [
      ['total_passing_yards', 'fantasy_points'],
      ['total_receiving_yards', 'fantasy_points'],
      ['avg_receptions', 'avg_targets']
    ]
    
    let validCorrelations = 0
    
    for (const [field1, field2] of correlationPairs) {
      const idx1 = headers.findIndex(h => h.includes(field1))
      const idx2 = headers.findIndex(h => h.includes(field2))
      
      if (idx1 !== -1 && idx2 !== -1) {
        const values1 = []
        const values2 = []
        
        for (let i = 1; i < Math.min(50, lines.length); i++) {
          const val1 = parseFloat(lines[i].split(',')[idx1])
          const val2 = parseFloat(lines[i].split(',')[idx2])
          
          if (!isNaN(val1) && !isNaN(val2)) {
            values1.push(val1)
            values2.push(val2)
          }
        }
        
        if (values1.length > 10) {
          const correlation = this.calculateCorrelation(values1, values2)
          if (correlation > 0.3) { // Positive correlation as expected
            validCorrelations++
          }
        }
      }
    }
    
    const score = Math.round((validCorrelations / correlationPairs.length) * 100)
    return { score, validCorrelations, totalPairs: correlationPairs.length }
  }

  calculateCorrelation(x, y) {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  checkCalculations(lines, headers) {
    // Check if averages are calculated correctly
    const gamesIdx = headers.findIndex(h => h.toLowerCase().includes('games'))
    const totalIdx = headers.findIndex(h => h.includes('total_passing_yards'))
    const avgIdx = headers.findIndex(h => h.includes('avg_passing_yards'))
    
    if (gamesIdx === -1 || totalIdx === -1 || avgIdx === -1) {
      return { score: 100, message: 'Calculation columns not found (skipped)' }
    }
    
    let correctCalculations = 0
    let totalChecked = 0
    
    for (let i = 1; i <= Math.min(20, lines.length - 1); i++) {
      const values = lines[i].split(',')
      const games = parseFloat(values[gamesIdx]) || 1
      const total = parseFloat(values[totalIdx]) || 0
      const avg = parseFloat(values[avgIdx]) || 0
      
      totalChecked++
      
      if (total === 0 && avg === 0) {
        correctCalculations++
      } else if (games > 0) {
        const expectedAvg = total / games
        if (Math.abs(expectedAvg - avg) < Math.max(0.1, expectedAvg * 0.05)) {
          correctCalculations++
        }
      }
    }
    
    const accuracy = totalChecked > 0 ? (correctCalculations / totalChecked) * 100 : 100
    return { score: Math.round(accuracy), correctCalculations, totalChecked }
  }

  async validateBusinessLogic() {
    console.log('🏈 Validating Business Logic...')
    
    const businessRules = [
      this.validateNFLTeamCount(),
      this.validatePositionDistribution(),
      this.validateStatisticalRanges(),
      this.validateSeasonalConsistency()
    ]
    
    const passedRules = businessRules.filter(rule => rule.passed).length
    const score = Math.round((passedRules / businessRules.length) * 100)
    
    this.verificationResults.businessLogicValidation.score = score
    this.verificationResults.businessLogicValidation.details = businessRules
    
    businessRules.forEach(rule => {
      const status = rule.passed ? '✅' : '⚠️'
      console.log(`   ${status} ${rule.rule}: ${rule.result}`)
    })
    
    console.log(`   📊 Business Logic Validation: ${score}/100\n`)
  }

  validateNFLTeamCount() {
    const teamFiles = ['nfl_data/team_ratings.csv', 'nfl_data/real_defensive_rankings_2024.csv']
    
    for (const file of teamFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8')
        const lines = content.split('\n').filter(line => line.trim())
        const teamCount = lines.length - 1
        
        if (teamCount !== 32) {
          return {
            rule: 'NFL team count',
            passed: false,
            result: `Found ${teamCount} teams, expected 32`
          }
        }
      }
    }
    
    return {
      rule: 'NFL team count',
      passed: true,
      result: 'All files have 32 teams'
    }
  }

  validatePositionDistribution() {
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    
    if (!fs.existsSync(enhancedPath)) {
      return {
        rule: 'Position distribution',
        passed: false,
        result: 'Enhanced rosters file not found'
      }
    }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const positionIdx = headers.findIndex(h => h.toLowerCase().includes('position'))
    
    if (positionIdx === -1) {
      return {
        rule: 'Position distribution',
        passed: false,
        result: 'Position column not found'
      }
    }
    
    const positions = new Set()
    for (let i = 1; i < lines.length; i++) {
      const position = lines[i].split(',')[positionIdx]?.trim()
      if (position) positions.add(position)
    }
    
    // NFL should have at least these basic positions
    const expectedPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
    const hasBasicPositions = expectedPositions.some(pos => 
      Array.from(positions).some(p => p.includes(pos))
    )
    
    return {
      rule: 'Position distribution',
      passed: hasBasicPositions,
      result: `Found ${positions.size} unique positions`
    }
  }

  validateStatisticalRanges() {
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    
    if (!fs.existsSync(enhancedPath)) {
      return {
        rule: 'Statistical ranges',
        passed: false,
        result: 'Enhanced rosters file not found'
      }
    }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    // Check if fantasy points are in reasonable range
    const fantasyIdx = headers.findIndex(h => h.includes('fantasy_points'))
    
    if (fantasyIdx !== -1) {
      let validValues = 0
      let totalValues = 0
      
      for (let i = 1; i < lines.length; i++) {
        const value = parseFloat(lines[i].split(',')[fantasyIdx])
        if (!isNaN(value)) {
          totalValues++
          if (value >= 0 && value <= 500) { // Reasonable fantasy points range
            validValues++
          }
        }
      }
      
      const validRate = totalValues > 0 ? validValues / totalValues : 0
      
      return {
        rule: 'Statistical ranges',
        passed: validRate >= 0.95,
        result: `${Math.round(validRate * 100)}% of values in expected ranges`
      }
    }
    
    return {
      rule: 'Statistical ranges',
      passed: true,
      result: 'Fantasy points column not found (skipped)'
    }
  }

  validateSeasonalConsistency() {
    // Check if the data represents a full season (reasonable game counts)
    const enhancedPath = 'nfl_data/enhanced_rosters.csv'
    
    if (!fs.existsSync(enhancedPath)) {
      return {
        rule: 'Seasonal consistency',
        passed: false,
        result: 'Enhanced rosters file not found'
      }
    }
    
    const content = fs.readFileSync(enhancedPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    const gamesIdx = headers.findIndex(h => h.toLowerCase().includes('games'))
    
    if (gamesIdx !== -1) {
      const gamesCounts = []
      
      for (let i = 1; i < lines.length; i++) {
        const games = parseInt(lines[i].split(',')[gamesIdx])
        if (!isNaN(games) && games > 0) {
          gamesCounts.push(games)
        }
      }
      
      if (gamesCounts.length > 0) {
        const maxGames = Math.max(...gamesCounts)
        const avgGames = gamesCounts.reduce((a, b) => a + b, 0) / gamesCounts.length
        
        // NFL season is typically 17 games, so reasonable range is 1-17
        const seasonalConsistency = maxGames <= 18 && avgGames >= 1
        
        return {
          rule: 'Seasonal consistency',
          passed: seasonalConsistency,
          result: `Max games: ${maxGames}, Avg games: ${avgGames.toFixed(1)}`
        }
      }
    }
    
    return {
      rule: 'Seasonal consistency',
      passed: true,
      result: 'Games column not found (skipped)'
    }
  }

  generateVerificationReport() {
    console.log('=' .repeat(50))
    console.log('📋 ADVANCED VERIFICATION REPORT')
    console.log('=' .repeat(50))
    
    const scores = [
      this.verificationResults.sourceDataIntegrity.score,
      this.verificationResults.derivedDataAccuracy.score,
      this.verificationResults.crossReferenceValidation.score,
      this.verificationResults.statisticalConsistency.score,
      this.verificationResults.businessLogicValidation.score
    ]
    
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    
    console.log(`\n🎯 OVERALL DATA ACCURACY SCORE: ${overallScore}/100`)
    
    console.log('\n📊 Detailed Scores:')
    console.log(`   🔍 Source Data Integrity: ${this.verificationResults.sourceDataIntegrity.score}/100`)
    console.log(`   🎯 Derived Data Accuracy: ${this.verificationResults.derivedDataAccuracy.score}/100`)
    console.log(`   🔗 Cross-Reference Validation: ${this.verificationResults.crossReferenceValidation.score}/100`)
    console.log(`   📊 Statistical Consistency: ${this.verificationResults.statisticalConsistency.score}/100`)
    console.log(`   🏈 Business Logic Validation: ${this.verificationResults.businessLogicValidation.score}/100`)
    
    console.log('\n🎉 Data Quality Assessment:')
    if (overallScore >= 95) {
      console.log('   🟢 EXCELLENT - Your data is highly accurate and reliable!')
      console.log('   🟢 Ready for production NFL prediction models.')
    } else if (overallScore >= 90) {
      console.log('   🟢 VERY GOOD - Your data quality is strong.')
      console.log('   🟢 Suitable for advanced NFL analytics.')
    } else if (overallScore >= 80) {
      console.log('   🟡 GOOD - Your data quality is acceptable.')
      console.log('   🟡 Consider addressing identified issues for optimal performance.')
    } else {
      console.log('   🔴 NEEDS IMPROVEMENT - Several data quality issues detected.')
      console.log('   🔴 Recommend addressing issues before using for predictions.')
    }
    
    console.log('\n💡 Recommendations:')
    if (this.verificationResults.sourceDataIntegrity.score < 90) {
      console.log('   • Review source data files for consistency issues')
    }
    if (this.verificationResults.derivedDataAccuracy.score < 90) {
      console.log('   • Validate derived data calculations and transformations')
    }
    if (this.verificationResults.crossReferenceValidation.score < 90) {
      console.log('   • Improve data linking and cross-reference validation')
    }
    if (this.verificationResults.statisticalConsistency.score < 90) {
      console.log('   • Check statistical distributions and correlations')
    }
    if (this.verificationResults.businessLogicValidation.score < 90) {
      console.log('   • Ensure data follows NFL business rules and constraints')
    }
    
    console.log('\n' + '=' .repeat(50))
    
    // Save detailed report
    const report = {
      overallScore,
      timestamp: new Date().toISOString(),
      verificationResults: this.verificationResults,
      summary: {
        totalFiles: this.verificationResults.sourceDataIntegrity.details.length,
        totalRecords: this.verificationResults.sourceDataIntegrity.details.reduce((sum, file) => sum + file.recordCount, 0),
        qualityLevel: overallScore >= 95 ? 'EXCELLENT' : overallScore >= 90 ? 'VERY GOOD' : overallScore >= 80 ? 'GOOD' : 'NEEDS IMPROVEMENT'
      }
    }
    
    fs.writeFileSync('advanced-verification-report.json', JSON.stringify(report, null, 2))
    console.log('💾 Detailed report saved to: advanced-verification-report.json')
  }
}

const verifier = new AdvancedDataVerification()
verifier.runAdvancedVerification().catch(console.error) 