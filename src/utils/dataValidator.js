// Comprehensive Data Validation System
import fs from 'fs';
import path from 'path';

class DataValidator {
  constructor() {
    this.validationResults = {
      teams: { status: 'unknown', issues: [], coverage: 0, lastUpdated: null },
      players: { status: 'unknown', issues: [], coverage: 0, lastUpdated: null },
      rosters: { status: 'unknown', issues: [], coverage: 0, espnIntegration: false },
      gameData: { status: 'unknown', issues: [], coverage: 0, lastUpdated: null },
      analytics: { status: 'unknown', issues: [], completeness: 0 },
      overall: { status: 'unknown', score: 0, criticalIssues: [] }
    }
    
    this.expectedTeams = [
      'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
      'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
      'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
      'TEN', 'WAS'
    ]
  }

  async validateAllData() {
    console.log('🔍 Starting comprehensive data validation...')
    
    try {
      await Promise.all([
        this.validateTeamData(),
        this.validatePlayerData(),
        this.validateRosterData(),
        this.validateGameData(),
        this.validateAnalyticsData()
      ])
      
      this.calculateOverallScore()
      this.generateReport()
      
      return this.validationResults
    } catch (error) {
      console.error('❌ Data validation failed:', error)
      this.validationResults.overall.status = 'failed'
      this.validationResults.overall.criticalIssues.push(`Validation error: ${error.message}`)
      return this.validationResults
    }
  }

  async validateTeamData() {
    console.log('📊 Validating team data...')
    const teamData = this.validationResults.teams
    
    try {
      // Check team ratings
      const ratingsPath = 'nfl_data/team_ratings.csv'
      if (fs.existsSync(ratingsPath)) {
        const ratingsContent = fs.readFileSync(ratingsPath, 'utf8')
        const lines = ratingsContent.trim().split('\n')
        const teams = lines.slice(1).map(line => line.split(',')[0])
        
        teamData.coverage = (teams.length / this.expectedTeams.length) * 100
        
        // Check for missing teams
        const missingTeams = this.expectedTeams.filter(team => !teams.includes(team))
        if (missingTeams.length > 0) {
          teamData.issues.push(`Missing teams: ${missingTeams.join(', ')}`)
        }
        
        // Check rating validity
        lines.slice(1).forEach((line, index) => {
          const [team, rating] = line.split(',')
          const numRating = parseFloat(rating)
          if (isNaN(numRating) || numRating < 0 || numRating > 100) {
            teamData.issues.push(`Invalid rating for ${team}: ${rating}`)
          }
        })
        
        teamData.status = teamData.issues.length === 0 ? 'valid' : 'issues'
      } else {
        teamData.status = 'missing'
        teamData.issues.push('Team ratings file not found')
      }
      
      // Check defensive rankings
      const defensePath = 'nfl_data/real_defensive_rankings_2024.csv'
      if (fs.existsSync(defensePath)) {
        const defenseContent = fs.readFileSync(defensePath, 'utf8')
        const defenseLines = defenseContent.trim().split('\n')
        if (defenseLines.length < 33) { // Header + 32 teams
          teamData.issues.push(`Incomplete defensive data: only ${defenseLines.length - 1} teams`)
        }
      } else {
        teamData.issues.push('Defensive rankings file not found')
      }
      
    } catch (error) {
      teamData.status = 'error'
      teamData.issues.push(`Team validation error: ${error.message}`)
    }
  }

  async validatePlayerData() {
    console.log('👥 Validating player data...')
    const playerData = this.validationResults.players
    
    try {
      // Check enhanced rosters
      const rostersPath = 'nfl_data/enhanced_rosters.csv'
      if (fs.existsSync(rostersPath)) {
        const rostersContent = fs.readFileSync(rostersPath, 'utf8')
        const lines = rostersContent.trim().split('\n')
        const playerCount = lines.length - 1 // Subtract header
        
        playerData.coverage = playerCount
        
        // Check for data quality
        const headers = lines[0].split(',')
        const expectedColumns = ['name', 'team', 'position', 'overall_score']
        const missingColumns = expectedColumns.filter(col => !headers.includes(col))
        
        if (missingColumns.length > 0) {
          playerData.issues.push(`Missing columns: ${missingColumns.join(', ')}`)
        }
        
        // Sample data quality check
        const sampleLines = lines.slice(1, Math.min(11, lines.length))
        sampleLines.forEach((line, index) => {
          const values = line.split(',')
          if (values.length !== headers.length) {
            playerData.issues.push(`Row ${index + 2}: Column count mismatch`)
          }
          
          // Check team validity
          const teamIndex = headers.indexOf('team')
          if (teamIndex !== -1 && !this.expectedTeams.includes(values[teamIndex])) {
            playerData.issues.push(`Row ${index + 2}: Invalid team ${values[teamIndex]}`)
          }
        })
        
        playerData.status = playerData.issues.length === 0 ? 'valid' : 'issues'
      } else {
        playerData.status = 'missing'
        playerData.issues.push('Enhanced rosters file not found')
      }
      
    } catch (error) {
      playerData.status = 'error'
      playerData.issues.push(`Player validation error: ${error.message}`)
    }
  }

  async validateRosterData() {
    console.log('📋 Validating roster data and ESPN integration...')
    const rosterData = this.validationResults.rosters
    
    try {
      // Check for ESPN integration in rosters
      const rosterDirs = ['nfl_data/rosters']
      let totalPlayers = 0
      let espnIntegrated = false
      
      for (const dir of rosterDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir)
          const csvFiles = files.filter(f => f.endsWith('.csv'))
          
          for (const file of csvFiles) {
            const filePath = path.join(dir, file)
            const content = fs.readFileSync(filePath, 'utf8')
            const lines = content.trim().split('\n')
            
            if (lines.length > 1) {
              totalPlayers += lines.length - 1
              
              // Check for ESPN ID columns
              const headers = lines[0].toLowerCase()
              if (headers.includes('espn_id') || headers.includes('espn')) {
                espnIntegrated = true
              }
            }
          }
        }
      }
      
      rosterData.coverage = totalPlayers
      rosterData.espnIntegration = espnIntegrated
      
      if (!espnIntegrated) {
        rosterData.issues.push('ESPN integration not detected in roster data')
      }
      
      if (totalPlayers < 1500) { // Rough estimate for NFL roster size
        rosterData.issues.push(`Low player count: ${totalPlayers} (expected ~1600+)`)
      }
      
      rosterData.status = rosterData.issues.length === 0 ? 'valid' : 'issues'
      
    } catch (error) {
      rosterData.status = 'error'
      rosterData.issues.push(`Roster validation error: ${error.message}`)
    }
  }

  async validateGameData() {
    console.log('🏈 Validating game data...')
    const gameData = this.validationResults.gameData
    
    try {
      // Check position matchup analysis
      const matchupPath = 'nfl_data/position_matchup_analysis_2024.csv'
      if (fs.existsSync(matchupPath)) {
        const matchupContent = fs.readFileSync(matchupPath, 'utf8')
        const lines = matchupContent.trim().split('\n')
        gameData.coverage = lines.length - 1
        
        if (lines.length < 100) {
          gameData.issues.push(`Low matchup data: ${lines.length - 1} records`)
        }
        
        // Check data structure
        const headers = lines[0].split(',')
        const expectedHeaders = ['position', 'team', 'week']
        const missingHeaders = expectedHeaders.filter(h => !headers.some(header => header.toLowerCase().includes(h)))
        
        if (missingHeaders.length > 0) {
          gameData.issues.push(`Missing game data headers: ${missingHeaders.join(', ')}`)
        }
      } else {
        gameData.issues.push('Position matchup analysis file not found')
      }
      
      // Check game script analysis
      const scriptPath = 'nfl_data/game_script_analysis_2024.csv'
      if (!fs.existsSync(scriptPath)) {
        gameData.issues.push('Game script analysis file not found')
      }
      
      gameData.status = gameData.issues.length === 0 ? 'valid' : 'issues'
      
    } catch (error) {
      gameData.status = 'error'
      gameData.issues.push(`Game data validation error: ${error.message}`)
    }
  }

  async validateAnalyticsData() {
    console.log('📈 Validating analytics data...')
    const analyticsData = this.validationResults.analytics
    
    try {
      const analyticsFiles = [
        'nfl_data/target_depth_analysis_2024.csv',
        'nfl_data/real_defensive_rankings_2024.csv',
        'nfl_data/game_script_analysis_2024.csv',
        'nfl_data/coaching_intelligence.csv'
      ]
      
      let existingFiles = 0
      
      for (const file of analyticsFiles) {
        if (fs.existsSync(file)) {
          existingFiles++
        } else {
          analyticsData.issues.push(`Missing analytics file: ${path.basename(file)}`)
        }
      }
      
      analyticsData.completeness = (existingFiles / analyticsFiles.length) * 100
      analyticsData.status = analyticsData.completeness > 75 ? 'valid' : 'incomplete'
      
    } catch (error) {
      analyticsData.status = 'error'
      analyticsData.issues.push(`Analytics validation error: ${error.message}`)
    }
  }

  calculateOverallScore() {
    const results = this.validationResults
    let score = 0
    let maxScore = 0
    
    // Weight different components
    const weights = {
      teams: 20,
      players: 25,
      rosters: 20,
      gameData: 20,
      analytics: 15
    }
    
    Object.keys(weights).forEach(category => {
      const categoryData = results[category]
      maxScore += weights[category]
      
      if (categoryData.status === 'valid') {
        score += weights[category]
      } else if (categoryData.status === 'issues') {
        score += weights[category] * 0.7 // Partial credit
      } else if (categoryData.status === 'incomplete') {
        score += weights[category] * 0.5
      }
    })
    
    results.overall.score = Math.round((score / maxScore) * 100)
    
    // Determine overall status
    if (results.overall.score >= 90) {
      results.overall.status = 'excellent'
    } else if (results.overall.score >= 75) {
      results.overall.status = 'good'
    } else if (results.overall.score >= 50) {
      results.overall.status = 'needs_improvement'
    } else {
      results.overall.status = 'critical'
    }
    
    // Collect critical issues
    Object.keys(weights).forEach(category => {
      const categoryData = results[category]
      if (categoryData.status === 'missing' || categoryData.status === 'error') {
        results.overall.criticalIssues.push(`${category}: ${categoryData.issues[0]}`)
      }
    })
  }

  generateReport() {
    const results = this.validationResults
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 DATA VALIDATION REPORT')
    console.log('='.repeat(60))
    
    console.log(`\n🎯 Overall Score: ${results.overall.score}/100 (${results.overall.status.toUpperCase()})`)
    
    if (results.overall.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:')
      results.overall.criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue}`)
      })
    }
    
    console.log('\n📋 Category Breakdown:')
    
    Object.keys(results).forEach(category => {
      if (category === 'overall') return
      
      const data = results[category]
      const statusIcon = this.getStatusIcon(data.status)
      console.log(`\n${statusIcon} ${category.toUpperCase()}:`)
      console.log(`   Status: ${data.status}`)
      
      if (data.coverage !== undefined) {
        console.log(`   Coverage: ${data.coverage}${typeof data.coverage === 'number' && data.coverage <= 100 ? '%' : ' records'}`)
      }
      
      if (data.espnIntegration !== undefined) {
        console.log(`   ESPN Integration: ${data.espnIntegration ? '✅' : '❌'}`)
      }
      
      if (data.issues.length > 0) {
        console.log('   Issues:')
        data.issues.forEach(issue => {
          console.log(`     • ${issue}`)
        })
      }
    })
    
    console.log('\n' + '='.repeat(60))
  }

  getStatusIcon(status) {
    switch (status) {
      case 'valid': return '✅'
      case 'excellent': return '🌟'
      case 'good': return '✅'
      case 'issues': return '⚠️'
      case 'incomplete': return '⚠️'
      case 'needs_improvement': return '⚠️'
      case 'missing': return '❌'
      case 'error': return '💥'
      case 'critical': return '🚨'
      default: return '❓'
    }
  }

  // Method to get recommendations based on validation results
  getRecommendations() {
    const recommendations = []
    const results = this.validationResults
    
    if (!results.rosters.espnIntegration) {
      recommendations.push({
        priority: 'HIGH',
        category: 'ESPN Integration',
        action: 'Implement ESPN API roster updates',
        description: 'Your rosters are not connected to ESPN API for real-time updates'
      })
    }
    
    if (results.teams.coverage < 100) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Team Data',
        action: 'Complete team data coverage',
        description: `Missing data for ${32 - Math.round(results.teams.coverage * 32 / 100)} teams`
      })
    }
    
    if (results.analytics.completeness < 75) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Analytics',
        action: 'Enhance analytics data',
        description: 'Missing some advanced analytics files'
      })
    }
    
    if (results.overall.score < 75) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Overall Quality',
        action: 'Comprehensive data cleanup',
        description: 'Multiple data quality issues need attention'
      })
    }
    
    return recommendations
  }
}

export default DataValidator 