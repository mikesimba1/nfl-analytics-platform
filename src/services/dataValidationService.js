// Data Validation Service
// Ensures all NFL data is accurate and prevents future issues
// Validates schedules, odds, player props, and other critical data

import { API_CONFIG, TEAM_STANDARDIZATION, SCHEDULE_VERIFICATION } from '../config/api-config.js'

class DataValidationService {
  constructor() {
    this.validationErrors = []
    this.validationWarnings = []
    this.lastValidation = null
    this.validationHistory = []
    this.validationRules = {
      schedule: {
        required: ['homeTeam', 'awayTeam', 'date', 'week'],
        teamFormat: /^[A-Z]{2,3}$/,
        weekRange: [1, 18]
      },
      odds: {
        required: ['homeTeam', 'awayTeam', 'spread', 'total', 'moneyline'],
        spreadRange: [-28, 28],
        totalRange: [30, 70]
      },
      predictions: {
        confidenceRange: [50, 95],
        accuracyTracking: true
      }
    }
    
    this.dataQualityMetrics = {
      freshness: 0,
      completeness: 0,
      accuracy: 0,
      consistency: 0
    }
  }

  // COMPREHENSIVE DATA VALIDATION
  async validateAllData(data) {
    this.clearValidationResults()
    
    const validationResults = {
      schedule: await this.validateScheduleData(data.schedule),
      odds: await this.validateOddsData(data.odds),
      playerProps: await this.validatePlayerPropsData(data.playerProps),
      injuries: await this.validateInjuryData(data.injuries),
      overall: null
    }

    // Calculate overall validation score
    validationResults.overall = this.calculateOverallValidation(validationResults)
    
    // Store validation history
    this.storeValidationResult(validationResults)
    
    return validationResults
  }

  // SCHEDULE VALIDATION
  async validateScheduleData(scheduleData) {
    const errors = []
    const warnings = []
    
    if (!scheduleData || !Array.isArray(scheduleData)) {
      errors.push('Schedule data is missing or invalid format')
      return { valid: false, errors, warnings, confidence: 0 }
    }

    // Validate each game
    scheduleData.forEach((game, index) => {
      const gameValidation = this.validateSingleGame(game, index)
      errors.push(...gameValidation.errors)
      warnings.push(...gameValidation.warnings)
    })

    // Validate Week 1 specifically (known facts)
    const week1Games = scheduleData.filter(game => game.week === 1)
    if (week1Games.length > 0) {
      const week1Validation = SCHEDULE_VERIFICATION.validateWeek1Schedule(week1Games)
      if (!week1Validation.valid) {
        errors.push(`Week 1 validation failed: ${week1Validation.error}`)
      }
    }

    // Check for duplicate games
    const duplicates = this.findDuplicateGames(scheduleData)
    if (duplicates.length > 0) {
      errors.push(`Found ${duplicates.length} duplicate games`)
    }

    // Validate season structure
    const structureValidation = this.validateSeasonStructure(scheduleData)
    errors.push(...structureValidation.errors)
    warnings.push(...structureValidation.warnings)

    const confidence = this.calculateValidationConfidence(errors, warnings, scheduleData.length)
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence,
      gamesValidated: scheduleData.length,
      lastValidated: new Date().toISOString()
    }
  }

  validateSingleGame(game, index) {
    const errors = []
    const warnings = []
    const config = API_CONFIG.validation.schedule

    // Check required fields
    config.requiredFields.forEach(field => {
      if (!game[field]) {
        errors.push(`Game ${index}: Missing required field '${field}'`)
      }
    })

    // Validate team codes
    if (game.homeTeam && !config.teamFormat.test(game.homeTeam)) {
      errors.push(`Game ${index}: Invalid home team format '${game.homeTeam}'`)
    }
    if (game.awayTeam && !config.teamFormat.test(game.awayTeam)) {
      errors.push(`Game ${index}: Invalid away team format '${game.awayTeam}'`)
    }

    // Validate season and week
    if (game.season && (game.season < config.seasonRange[0] || game.season > config.seasonRange[1])) {
      errors.push(`Game ${index}: Invalid season '${game.season}'`)
    }
    if (game.week && (game.week < config.weekRange[0] || game.week > config.weekRange[1])) {
      errors.push(`Game ${index}: Invalid week '${game.week}'`)
    }

    // Validate game time format
    if (game.gameTime && !this.isValidDateTime(game.gameTime)) {
      errors.push(`Game ${index}: Invalid game time format '${game.gameTime}'`)
    }

    // Check for same team playing itself
    if (game.homeTeam === game.awayTeam) {
      errors.push(`Game ${index}: Team cannot play itself (${game.homeTeam})`)
    }

    // Validate team names exist
    if (game.homeTeam && !this.isValidTeam(game.homeTeam)) {
      warnings.push(`Game ${index}: Unknown home team '${game.homeTeam}'`)
    }
    if (game.awayTeam && !this.isValidTeam(game.awayTeam)) {
      warnings.push(`Game ${index}: Unknown away team '${game.awayTeam}'`)
    }

    return { errors, warnings }
  }

  // ODDS VALIDATION
  async validateOddsData(oddsData) {
    const errors = []
    const warnings = []
    
    if (!oddsData || !Array.isArray(oddsData)) {
      errors.push('Odds data is missing or invalid format')
      return { valid: false, errors, warnings, confidence: 0 }
    }

    oddsData.forEach((gameOdds, index) => {
      const oddsValidation = this.validateSingleGameOdds(gameOdds, index)
      errors.push(...oddsValidation.errors)
      warnings.push(...oddsValidation.warnings)
    })

    // Check for consensus across sportsbooks
    const consensusValidation = this.validateOddsConsensus(oddsData)
    warnings.push(...consensusValidation.warnings)

    const confidence = this.calculateValidationConfidence(errors, warnings, oddsData.length)
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence,
      gamesValidated: oddsData.length,
      lastValidated: new Date().toISOString()
    }
  }

  validateSingleGameOdds(gameOdds, index) {
    const errors = []
    const warnings = []
    const config = API_CONFIG.validation.odds

    // Check required fields
    config.requiredFields.forEach(field => {
      if (!gameOdds[field]) {
        errors.push(`Odds ${index}: Missing required field '${field}'`)
      }
    })

    // Validate spread values
    if (gameOdds.spread) {
      gameOdds.spread.forEach((spread, spreadIndex) => {
        if (spread.spread < config.spreadRange[0] || spread.spread > config.spreadRange[1]) {
          warnings.push(`Odds ${index}: Unusual spread value ${spread.spread} from ${spread.sportsbook}`)
        }
      })
    }

    // Validate total values
    if (gameOdds.total) {
      gameOdds.total.forEach((total, totalIndex) => {
        if (total.total < config.totalRange[0] || total.total > config.totalRange[1]) {
          warnings.push(`Odds ${index}: Unusual total value ${total.total} from ${total.sportsbook}`)
        }
      })
    }

    // Validate moneyline values
    if (gameOdds.moneyline) {
      gameOdds.moneyline.forEach((ml, mlIndex) => {
        if (ml.odds < config.moneylineRange[0] || ml.odds > config.moneylineRange[1]) {
          warnings.push(`Odds ${index}: Unusual moneyline value ${ml.odds} from ${ml.sportsbook}`)
        }
      })
    }

    // Check data freshness
    const dataAge = this.calculateDataAge(gameOdds.lastUpdated)
    if (dataAge > API_CONFIG.qualityThresholds.dataFreshnessMinutes) {
      warnings.push(`Odds ${index}: Data is ${dataAge} minutes old (stale)`)
    }

    return { errors, warnings }
  }

  // PLAYER PROPS VALIDATION
  async validatePlayerPropsData(playerPropsData) {
    const errors = []
    const warnings = []
    
    if (!playerPropsData || !Array.isArray(playerPropsData)) {
      errors.push('Player props data is missing or invalid format')
      return { valid: false, errors, warnings, confidence: 0 }
    }

    playerPropsData.forEach((prop, index) => {
      const propValidation = this.validateSinglePlayerProp(prop, index)
      errors.push(...propValidation.errors)
      warnings.push(...propValidation.warnings)
    })

    const confidence = this.calculateValidationConfidence(errors, warnings, playerPropsData.length)
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      confidence,
      propsValidated: playerPropsData.length,
      lastValidated: new Date().toISOString()
    }
  }

  validateSinglePlayerProp(prop, index) {
    const errors = []
    const warnings = []
    const config = API_CONFIG.validation.playerProps

    // Check required fields
    config.requiredFields.forEach(field => {
      if (!prop[field]) {
        errors.push(`Prop ${index}: Missing required field '${field}'`)
      }
    })

    // Validate stat type
    if (prop.stat && !config.statTypes.includes(prop.stat)) {
      warnings.push(`Prop ${index}: Unknown stat type '${prop.stat}'`)
    }

    // Validate odds range
    if (prop.odds && (prop.odds < config.oddsRange[0] || prop.odds > config.oddsRange[1])) {
      warnings.push(`Prop ${index}: Unusual odds value ${prop.odds}`)
    }

    // Validate line value based on stat type
    if (prop.line && prop.stat) {
      const lineValidation = this.validatePropLine(prop.stat, prop.line)
      if (!lineValidation.valid) {
        warnings.push(`Prop ${index}: ${lineValidation.message}`)
      }
    }

    return { errors, warnings }
  }

  // UTILITY METHODS
  validatePropLine(statType, line) {
    const ranges = {
      passing_yards: [50, 500],
      rushing_yards: [10, 300],
      receiving_yards: [10, 200],
      touchdowns: [0, 5],
      receptions: [1, 15],
      completions: [5, 50]
    }

    const range = ranges[statType]
    if (!range) {
      return { valid: true } // Unknown stat type, can't validate
    }

    if (line < range[0] || line > range[1]) {
      return { 
        valid: false, 
        message: `Unusual ${statType} line: ${line} (expected ${range[0]}-${range[1]})` 
      }
    }

    return { valid: true }
  }

  isValidDateTime(dateTime) {
    const date = new Date(dateTime)
    return date instanceof Date && !isNaN(date)
  }

  isValidTeam(teamCode) {
    const validTeams = Object.values(TEAM_STANDARDIZATION.nameMap)
    return validTeams.includes(teamCode)
  }

  findDuplicateGames(games) {
    const seen = new Set()
    const duplicates = []

    games.forEach(game => {
      const key = `${game.homeTeam}_${game.awayTeam}_${game.week}_${game.season}`
      if (seen.has(key)) {
        duplicates.push(game)
      } else {
        seen.add(key)
      }
    })

    return duplicates
  }

  validateSeasonStructure(games) {
    const errors = []
    const warnings = []
    const expectedStructure = SCHEDULE_VERIFICATION.knownFacts.seasonStructure

    // Group games by week
    const gamesByWeek = {}
    games.forEach(game => {
      if (!gamesByWeek[game.week]) {
        gamesByWeek[game.week] = []
      }
      gamesByWeek[game.week].push(game)
    })

    // Check each week has correct number of games
    Object.keys(gamesByWeek).forEach(week => {
      const weekGames = gamesByWeek[week]
      if (weekGames.length !== expectedStructure.gamesPerWeek) {
        if (week == 1 && weekGames.length === 16) {
          // Week 1 might have 16 games (normal)
        } else {
          warnings.push(`Week ${week} has ${weekGames.length} games (expected ${expectedStructure.gamesPerWeek})`)
        }
      }
    })

    // Check total number of weeks
    const totalWeeks = Object.keys(gamesByWeek).length
    if (totalWeeks !== expectedStructure.regularSeasonWeeks) {
      warnings.push(`Found ${totalWeeks} weeks (expected ${expectedStructure.regularSeasonWeeks})`)
    }

    return { errors, warnings }
  }

  calculateDataAge(lastUpdated) {
    if (!lastUpdated) return Infinity
    const now = new Date()
    const updated = new Date(lastUpdated)
    return Math.floor((now - updated) / (1000 * 60)) // Minutes
  }

  validateOddsConsensus(oddsData) {
    const warnings = []
    const threshold = API_CONFIG.qualityThresholds.consensusThreshold

    oddsData.forEach((gameOdds, index) => {
      // Check spread consensus
      if (gameOdds.spread && gameOdds.spread.length > 1) {
        const spreads = gameOdds.spread.map(s => s.spread)
        const consensus = this.calculateConsensus(spreads)
        if (consensus < threshold) {
          warnings.push(`Game ${index}: Low spread consensus (${(consensus * 100).toFixed(1)}%)`)
        }
      }

      // Check total consensus
      if (gameOdds.total && gameOdds.total.length > 1) {
        const totals = gameOdds.total.map(t => t.total)
        const consensus = this.calculateConsensus(totals)
        if (consensus < threshold) {
          warnings.push(`Game ${index}: Low total consensus (${(consensus * 100).toFixed(1)}%)`)
        }
      }
    })

    return { warnings }
  }

  calculateConsensus(values) {
    if (values.length < 2) return 1

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    // Calculate percentage of values within 1 standard deviation
    const withinRange = values.filter(val => Math.abs(val - mean) <= stdDev).length
    return withinRange / values.length
  }

  calculateValidationConfidence(errors, warnings, dataCount) {
    if (dataCount === 0) return 0
    
    const errorWeight = 0.8
    const warningWeight = 0.2
    
    const errorPenalty = (errors.length / dataCount) * errorWeight
    const warningPenalty = (warnings.length / dataCount) * warningWeight
    
    const confidence = Math.max(0, 1 - errorPenalty - warningPenalty)
    return Math.round(confidence * 100) / 100
  }

  calculateOverallValidation(validationResults) {
    const weights = {
      schedule: 0.4,
      odds: 0.3,
      playerProps: 0.2,
      injuries: 0.1
    }

    let weightedScore = 0
    let totalWeight = 0

    Object.keys(weights).forEach(key => {
      if (validationResults[key] && validationResults[key].confidence !== undefined) {
        weightedScore += validationResults[key].confidence * weights[key]
        totalWeight += weights[key]
      }
    })

    const overallConfidence = totalWeight > 0 ? weightedScore / totalWeight : 0
    const allValid = Object.values(validationResults).every(result => 
      result && result.valid !== false
    )

    return {
      valid: allValid,
      confidence: overallConfidence,
      lastValidated: new Date().toISOString(),
      summary: this.generateValidationSummary(validationResults)
    }
  }

  generateValidationSummary(validationResults) {
    const totalErrors = Object.values(validationResults).reduce((sum, result) => 
      sum + (result?.errors?.length || 0), 0
    )
    const totalWarnings = Object.values(validationResults).reduce((sum, result) => 
      sum + (result?.warnings?.length || 0), 0
    )

    let status = 'EXCELLENT'
    if (totalErrors > 0) status = 'POOR'
    else if (totalWarnings > 5) status = 'FAIR'
    else if (totalWarnings > 0) status = 'GOOD'

    return {
      status,
      totalErrors,
      totalWarnings,
      message: this.getStatusMessage(status, totalErrors, totalWarnings)
    }
  }

  getStatusMessage(status, errors, warnings) {
    switch (status) {
      case 'EXCELLENT':
        return 'All data validated successfully with no issues'
      case 'GOOD':
        return `Data validated with ${warnings} minor warnings`
      case 'FAIR':
        return `Data validated with ${warnings} warnings that should be reviewed`
      case 'POOR':
        return `Data validation failed with ${errors} errors that must be fixed`
      default:
        return 'Unknown validation status'
    }
  }

  clearValidationResults() {
    this.validationErrors = []
    this.validationWarnings = []
  }

  storeValidationResult(result) {
    this.lastValidation = result
    this.validationHistory.push({
      timestamp: new Date().toISOString(),
      result: result
    })

    // Keep only last 100 validation results
    if (this.validationHistory.length > 100) {
      this.validationHistory = this.validationHistory.slice(-100)
    }
  }

  getValidationHistory() {
    return this.validationHistory
  }

  getLastValidation() {
    return this.lastValidation
  }

  // Validate incoming data and assign quality scores
  validateData(data, type) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      qualityScore: 0,
      trustLevel: 'UNKNOWN'
    }

    try {
      // Basic structure validation
      if (!data || !Array.isArray(data) && typeof data !== 'object') {
        validation.isValid = false
        validation.errors.push('Invalid data structure')
        return validation
      }

      // Type-specific validation
      switch (type) {
        case 'schedule':
          this.validateScheduleData(data, validation)
          break
        case 'odds':
          this.validateOddsData(data, validation)
          break
        case 'predictions':
          this.validatePredictionData(data, validation)
          break
        default:
          validation.warnings.push(`Unknown data type: ${type}`)
      }

      // Calculate quality score
      validation.qualityScore = this.calculateQualityScore(validation, type)
      validation.trustLevel = this.determineTrustLevel(validation.qualityScore)

      return validation
    } catch (error) {
      validation.isValid = false
      validation.errors.push(`Validation error: ${error.message}`)
      return validation
    }
  }

  // Enhanced schedule validation for subscription reliability
  validateScheduleData(data, validation) {
    const games = Array.isArray(data) ? data : [data]
    
    games.forEach((game, index) => {
      // Check required fields
      this.validationRules.schedule.required.forEach(field => {
        if (!game[field]) {
          validation.errors.push(`Game ${index}: Missing ${field}`)
        }
      })

      // Validate team format
      if (game.homeTeam && !this.validationRules.schedule.teamFormat.test(game.homeTeam)) {
        validation.errors.push(`Game ${index}: Invalid home team format`)
      }
      if (game.awayTeam && !this.validationRules.schedule.teamFormat.test(game.awayTeam)) {
        validation.errors.push(`Game ${index}: Invalid away team format`)
      }

      // Validate week
      if (game.week && (game.week < 1 || game.week > 18)) {
        validation.errors.push(`Game ${index}: Invalid week ${game.week}`)
      }

      // Check for realistic dates
      if (game.date) {
        const gameDate = new Date(game.date)
        const now = new Date()
        const seasonStart = new Date('2024-09-05') // 2024 season start
        const seasonEnd = new Date('2025-02-15')   // Through playoffs
        
        if (gameDate < seasonStart || gameDate > seasonEnd) {
          validation.warnings.push(`Game ${index}: Date outside typical NFL season`)
        }
      }
    })
  }

  // Enhanced odds validation for betting accuracy
  validateOddsData(data, validation) {
    const odds = Array.isArray(data) ? data : [data]
    
    odds.forEach((odd, index) => {
      // Check required fields
      this.validationRules.odds.required.forEach(field => {
        if (!odd[field]) {
          validation.errors.push(`Odds ${index}: Missing ${field}`)
        }
      })

      // Validate spread range
      if (odd.spread && typeof odd.spread === 'object') {
        const homeSpread = odd.spread.home
        const awaySpread = odd.spread.away
        
        if (Math.abs(homeSpread) > 28 || Math.abs(awaySpread) > 28) {
          validation.warnings.push(`Odds ${index}: Unusual spread values`)
        }
        
        // Spreads should be opposite
        if (homeSpread + awaySpread !== 0) {
          validation.errors.push(`Odds ${index}: Spread mismatch`)
        }
      }

      // Validate total range
      if (odd.total && typeof odd.total === 'object') {
        const total = odd.total.over || odd.total.under
        if (total && (total < 30 || total > 70)) {
          validation.warnings.push(`Odds ${index}: Unusual total ${total}`)
        }
      }

      // Validate moneylines make sense
      if (odd.moneyline && typeof odd.moneyline === 'object') {
        const homeML = odd.moneyline.home
        const awayML = odd.moneyline.away
        
        // Both can't be negative (would guarantee profit)
        if (homeML < 0 && awayML < 0) {
          validation.errors.push(`Odds ${index}: Invalid moneyline combination`)
        }
      }
    })
  }

  // Track prediction accuracy for subscription trust
  validatePredictionData(data, validation) {
    const predictions = Array.isArray(data) ? data : [data]
    
    predictions.forEach((pred, index) => {
      // Confidence validation
      if (pred.confidence) {
        if (pred.confidence < 50 || pred.confidence > 95) {
          validation.warnings.push(`Prediction ${index}: Unusual confidence ${pred.confidence}%`)
        }
      }

      // Check for required prediction fields
      if (!pred.spread && !pred.total && !pred.moneyline) {
        validation.errors.push(`Prediction ${index}: No prediction values provided`)
      }

      // Validate prediction reasoning
      if (!pred.reasoning && !pred.factors) {
        validation.warnings.push(`Prediction ${index}: No reasoning provided`)
      }
    })
  }

  // Calculate data quality score (0-100)
  calculateQualityScore(validation, type) {
    let score = 100

    // Deduct for errors
    score -= validation.errors.length * 25

    // Deduct for warnings
    score -= validation.warnings.length * 10

    // Type-specific scoring
    switch (type) {
      case 'schedule':
        // Bonus for complete game information
        break
      case 'odds':
        // Bonus for realistic odds ranges
        break
      case 'predictions':
        // Bonus for detailed reasoning
        break
    }

    return Math.max(0, Math.min(100, score))
  }

  // Determine trust level for subscription users
  determineTrustLevel(score) {
    if (score >= 90) return 'EXCELLENT'
    if (score >= 75) return 'GOOD'
    if (score >= 60) return 'FAIR'
    if (score >= 40) return 'POOR'
    return 'UNRELIABLE'
  }

  // Get data quality metrics for dashboard
  getDataQualityMetrics() {
    return {
      overall: {
        freshness: this.dataQualityMetrics.freshness,
        completeness: this.dataQualityMetrics.completeness,
        accuracy: this.dataQualityMetrics.accuracy,
        consistency: this.dataQualityMetrics.consistency
      },
      trustScore: Math.round(
        (this.dataQualityMetrics.freshness + 
         this.dataQualityMetrics.completeness + 
         this.dataQualityMetrics.accuracy + 
         this.dataQualityMetrics.consistency) / 4
      ),
      lastUpdated: new Date().toISOString(),
      recommendations: this.getQualityRecommendations()
    }
  }

  // Provide improvement recommendations
  getQualityRecommendations() {
    const recommendations = []
    
    if (this.dataQualityMetrics.freshness < 80) {
      recommendations.push('Update data sources more frequently')
    }
    if (this.dataQualityMetrics.completeness < 80) {
      recommendations.push('Add missing data fields')
    }
    if (this.dataQualityMetrics.accuracy < 80) {
      recommendations.push('Improve prediction model calibration')
    }
    if (this.dataQualityMetrics.consistency < 80) {
      recommendations.push('Standardize data formats across sources')
    }
    
    return recommendations
  }

  // Update quality metrics (called after data processing)
  updateQualityMetrics(type, validationResult) {
    const score = validationResult.qualityScore
    
    // Simple moving average for now
    switch (type) {
      case 'freshness':
        this.dataQualityMetrics.freshness = (this.dataQualityMetrics.freshness + score) / 2
        break
      case 'completeness':
        this.dataQualityMetrics.completeness = (this.dataQualityMetrics.completeness + score) / 2
        break
      case 'accuracy':
        this.dataQualityMetrics.accuracy = (this.dataQualityMetrics.accuracy + score) / 2
        break
      case 'consistency':
        this.dataQualityMetrics.consistency = (this.dataQualityMetrics.consistency + score) / 2
        break
    }
  }

  // Subscription-ready: Track prediction performance
  trackPredictionAccuracy(predictions, outcomes) {
    const results = {
      total: predictions.length,
      correct: 0,
      accuracy: 0,
      byConfidence: {
        high: { total: 0, correct: 0 },
        medium: { total: 0, correct: 0 },
        low: { total: 0, correct: 0 }
      }
    }

    predictions.forEach((prediction, index) => {
      const outcome = outcomes[index]
      if (!outcome) return

      const isCorrect = this.evaluatePrediction(prediction, outcome)
      if (isCorrect) results.correct++

      // Track by confidence level
      const confidenceLevel = this.getConfidenceLevel(prediction.confidence)
      results.byConfidence[confidenceLevel].total++
      if (isCorrect) results.byConfidence[confidenceLevel].correct++
    })

    results.accuracy = (results.correct / results.total) * 100

    // Update accuracy metric
    this.updateQualityMetrics('accuracy', { qualityScore: results.accuracy })

    return results
  }

  // Evaluate if a prediction was correct
  evaluatePrediction(prediction, outcome) {
    // Spread prediction evaluation
    if (prediction.spread && outcome.finalSpread !== undefined) {
      const predictedWinner = prediction.spread > 0 ? prediction.awayTeam : prediction.homeTeam
      const actualWinner = outcome.finalSpread > 0 ? outcome.awayTeam : outcome.homeTeam
      return predictedWinner === actualWinner
    }

    // Total prediction evaluation
    if (prediction.total && outcome.finalTotal !== undefined) {
      const predictedOver = prediction.total > outcome.projectedTotal
      const actualOver = outcome.finalTotal > outcome.projectedTotal
      return predictedOver === actualOver
    }

    return false
  }

  // Get confidence level category
  getConfidenceLevel(confidence) {
    if (confidence >= 80) return 'high'
    if (confidence >= 65) return 'medium'
    return 'low'
  }
}

export default new DataValidationService() 