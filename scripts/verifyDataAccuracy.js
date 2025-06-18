#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

class DataAccuracyVerifier {
  constructor() {
    this.results = {
      teamData: { accurate: true, issues: [] },
      playerData: { accurate: true, issues: [] },
      gameData: { accurate: true, issues: [] },
      analyticsData: { accurate: true, issues: [] },
      espnIntegration: { active: false, issues: [] },
      overall: { score: 0, status: 'unknown' }
    }
  }

  async verifyAllAccuracy() {
    console.log('🔍 Starting comprehensive data accuracy verification...\n')
    
    await Promise.all([
      this.verifyTeamAccuracy(),
      this.verifyPlayerAccuracy(),
      this.verifyGameDataAccuracy(),
      this.verifyAnalyticsAccuracy(),
      this.verifyESPNIntegration()
    ])
    
    this.calculateAccuracyScore()
    this.generateDetailedReport()
    
    return this.results
  }

  async verifyTeamAccuracy() {
    console.log('📊 Verifying team data accuracy...')
    
    try {
      // Verify team ratings
      const ratingsPath = 'nfl_data/team_ratings.csv'
      const content = fs.readFileSync(ratingsPath, 'utf8')
      const lines = content.trim().split('\n')
      const teams = lines.slice(1).map(line => {
        const [team, rating] = line.split(',')
        return { team, rating: parseFloat(rating) }
      })
      
      // Check for exactly 32 teams
      if (teams.length !== 32) {
        this.results.teamData.accurate = false
        this.results.teamData.issues.push(`Expected 32 teams, found ${teams.length}`)
      }
      
      // Verify all expected teams are present
      const expectedTeams = [
        'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
        'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
        'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
        'TEN', 'WAS'
      ]
      
      const actualTeams = teams.map(t => t.team)
      const missingTeams = expectedTeams.filter(team => !actualTeams.includes(team))
      const extraTeams = actualTeams.filter(team => !expectedTeams.includes(team))
      
      if (missingTeams.length > 0) {
        this.results.teamData.accurate = false
        this.results.teamData.issues.push(`Missing teams: ${missingTeams.join(', ')}`)
      }
      
      if (extraTeams.length > 0) {
        this.results.teamData.accurate = false
        this.results.teamData.issues.push(`Extra teams: ${extraTeams.join(', ')}`)
      }
      
      // Verify rating ranges (should be between 40-70 for realistic NFL ratings)
      const invalidRatings = teams.filter(t => t.rating < 40 || t.rating > 70)
      if (invalidRatings.length > 0) {
        this.results.teamData.accurate = false
        this.results.teamData.issues.push(`Invalid ratings: ${invalidRatings.map(t => `${t.team}:${t.rating}`).join(', ')}`)
      }
      
      // Verify defensive rankings
      const defensePath = 'nfl_data/real_defensive_rankings_2024.csv'
      if (fs.existsSync(defensePath)) {
        const defenseContent = fs.readFileSync(defensePath, 'utf8')
        const defenseLines = defenseContent.trim().split('\n')
        
        if (defenseLines.length !== 33) { // Header + 32 teams
          this.results.teamData.accurate = false
          this.results.teamData.issues.push(`Defensive rankings: expected 33 lines, found ${defenseLines.length}`)
        }
      }
      
    } catch (error) {
      this.results.teamData.accurate = false
      this.results.teamData.issues.push(`Team verification error: ${error.message}`)
    }
  }

  async verifyPlayerAccuracy() {
    console.log('👥 Verifying player data accuracy...')
    
    try {
      // Verify enhanced rosters structure
      const rostersPath = 'nfl_data/enhanced_rosters.csv'
      const content = fs.readFileSync(rostersPath, 'utf8')
      const lines = content.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',')
      
      // Check required columns
      const requiredColumns = ['name', 'team', 'position', 'overall_score']
      const missingColumns = requiredColumns.filter(col => !headers.includes(col))
      
      if (missingColumns.length > 0) {
        this.results.playerData.accurate = false
        this.results.playerData.issues.push(`Missing required columns: ${missingColumns.join(', ')}`)
      }
      
      // Sample data quality check
      const sampleSize = Math.min(50, lines.length - 1)
      const sampleLines = lines.slice(1, sampleSize + 1)
      let validRows = 0
      let invalidTeams = 0
      
      const validTeams = [
        'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
        'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
        'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
        'TEN', 'WAS'
      ]
      
      sampleLines.forEach(line => {
        const values = line.split(',')
        if (values.length === headers.length) {
          validRows++
          
          // Check team validity
          const teamIndex = headers.indexOf('team')
          if (teamIndex !== -1 && !validTeams.includes(values[teamIndex])) {
            invalidTeams++
          }
        }
      })
      
      const validityRate = validRows / sampleLines.length
      if (validityRate < 0.95) {
        this.results.playerData.accurate = false
        this.results.playerData.issues.push(`Low data validity: ${Math.round(validityRate * 100)}% valid rows`)
      }
      
      if (invalidTeams > 0) {
        this.results.playerData.accurate = false
        this.results.playerData.issues.push(`${invalidTeams} players with invalid team codes`)
      }
      
    } catch (error) {
      this.results.playerData.accurate = false
      this.results.playerData.issues.push(`Player verification error: ${error.message}`)
    }
  }

  async verifyGameDataAccuracy() {
    console.log('🏈 Verifying game data accuracy...')
    
    try {
      // Verify position matchup analysis
      const matchupPath = 'nfl_data/position_matchup_analysis_2024.csv'
      const content = fs.readFileSync(matchupPath, 'utf8')
      const lines = content.trim().split('\n')
      const headers = lines[0].split(',')
      
      // Check for required game data columns
      const requiredColumns = ['position', 'team', 'week']
      const missingColumns = requiredColumns.filter(col => 
        !headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
      )
      
      if (missingColumns.length > 0) {
        this.results.gameData.accurate = false
        this.results.gameData.issues.push(`Missing game data columns: ${missingColumns.join(', ')}`)
      }
      
             // Verify data ranges
       const sampleLines = lines.slice(1, 21) // Check first 20 records
       let validWeeks = 0
       let validPositionCount = 0
       
       const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
      
      sampleLines.forEach(line => {
        const values = line.split(',')
        const weekIndex = headers.findIndex(h => h.toLowerCase().includes('week'))
        const positionIndex = headers.findIndex(h => h.toLowerCase().includes('position'))
        
        if (weekIndex !== -1) {
          const week = parseInt(values[weekIndex])
          if (week >= 1 && week <= 18) validWeeks++
        }
        
                 if (positionIndex !== -1) {
           const position = values[positionIndex]
           if (validPositions.includes(position)) validPositionCount++
         }
      })
      
      if (validWeeks < sampleLines.length * 0.9) {
        this.results.gameData.accurate = false
        this.results.gameData.issues.push(`Invalid week values in game data`)
      }
      
      // Verify other game files exist and have data
      const gameFiles = [
        'nfl_data/target_depth_analysis_2024.csv',
        'nfl_data/game_script_analysis_2024.csv'
      ]
      
      gameFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          this.results.gameData.accurate = false
          this.results.gameData.issues.push(`Missing file: ${path.basename(file)}`)
        } else {
          const fileContent = fs.readFileSync(file, 'utf8')
          const fileLines = fileContent.trim().split('\n')
          if (fileLines.length < 2) {
            this.results.gameData.accurate = false
            this.results.gameData.issues.push(`Empty or invalid file: ${path.basename(file)}`)
          }
        }
      })
      
    } catch (error) {
      this.results.gameData.accurate = false
      this.results.gameData.issues.push(`Game data verification error: ${error.message}`)
    }
  }

  async verifyAnalyticsAccuracy() {
    console.log('📈 Verifying analytics data accuracy...')
    
    try {
      const analyticsFiles = [
        { file: 'nfl_data/real_defensive_rankings_2024.csv', minRows: 32 },
        { file: 'nfl_data/coaching_intelligence.csv', minRows: 1 },
        { file: 'nfl_data/current_injuries.csv', minRows: 0 },
        { file: 'nfl_data/weather_week_22_2024.csv', minRows: 0 }
      ]
      
      for (const { file, minRows } of analyticsFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8')
          const lines = content.trim().split('\n')
          const actualRows = lines.length - 1 // Subtract header
          
          if (actualRows < minRows) {
            this.results.analyticsData.accurate = false
            this.results.analyticsData.issues.push(`${path.basename(file)}: insufficient data (${actualRows} < ${minRows})`)
          }
        } else if (minRows > 0) {
          this.results.analyticsData.accurate = false
          this.results.analyticsData.issues.push(`Missing required file: ${path.basename(file)}`)
        }
      }
      
    } catch (error) {
      this.results.analyticsData.accurate = false
      this.results.analyticsData.issues.push(`Analytics verification error: ${error.message}`)
    }
  }

  async verifyESPNIntegration() {
    console.log('🔄 Verifying ESPN integration...')
    
    try {
      // Check if ESPN service exists
      const espnServicePath = 'src/services/espnService.js'
      if (fs.existsSync(espnServicePath)) {
        this.results.espnIntegration.active = true
        
        // Verify ESPN service content
        const content = fs.readFileSync(espnServicePath, 'utf8')
        if (!content.includes('fetchCurrentRosters')) {
          this.results.espnIntegration.issues.push('ESPN service missing roster fetch functionality')
        }
        
        if (!content.includes('espn_id')) {
          this.results.espnIntegration.issues.push('ESPN service missing ID mapping')
        }
      } else {
        this.results.espnIntegration.issues.push('ESPN service file not found')
      }
      
      // Check if main service integrates ESPN
      const nflServicePath = 'src/services/nflDataService.js'
      if (fs.existsSync(nflServicePath)) {
        const content = fs.readFileSync(nflServicePath, 'utf8')
        if (!content.includes('ESPNService')) {
          this.results.espnIntegration.issues.push('Main service not integrated with ESPN')
        }
      }
      
      // Verify roster data has ESPN IDs
      const rosterDir = 'nfl_data/rosters'
      if (fs.existsSync(rosterDir)) {
        const files = fs.readdirSync(rosterDir)
        const csvFiles = files.filter(f => f.endsWith('.csv'))
        
        if (csvFiles.length > 0) {
          const sampleFile = path.join(rosterDir, csvFiles[0])
          const content = fs.readFileSync(sampleFile, 'utf8')
          const headers = content.split('\n')[0].toLowerCase()
          
          if (!headers.includes('espn_id') && !headers.includes('espn')) {
            this.results.espnIntegration.issues.push('Roster data missing ESPN IDs')
          }
        }
      }
      
    } catch (error) {
      this.results.espnIntegration.issues.push(`ESPN verification error: ${error.message}`)
    }
  }

  calculateAccuracyScore() {
    let totalScore = 0
    let maxScore = 0
    
    const categories = ['teamData', 'playerData', 'gameData', 'analyticsData']
    
    categories.forEach(category => {
      maxScore += 25
      if (this.results[category].accurate && this.results[category].issues.length === 0) {
        totalScore += 25
      } else if (this.results[category].issues.length <= 2) {
        totalScore += 15 // Partial credit for minor issues
      } else if (this.results[category].issues.length <= 5) {
        totalScore += 10
      }
    })
    
    // ESPN integration bonus
    if (this.results.espnIntegration.active && this.results.espnIntegration.issues.length === 0) {
      totalScore += 10
      maxScore += 10
    } else {
      maxScore += 10
    }
    
    this.results.overall.score = Math.round((totalScore / maxScore) * 100)
    
    if (this.results.overall.score >= 95) {
      this.results.overall.status = 'excellent'
    } else if (this.results.overall.score >= 85) {
      this.results.overall.status = 'very_good'
    } else if (this.results.overall.score >= 75) {
      this.results.overall.status = 'good'
    } else if (this.results.overall.score >= 60) {
      this.results.overall.status = 'needs_improvement'
    } else {
      this.results.overall.status = 'poor'
    }
  }

  generateDetailedReport() {
    console.log('\n' + '='.repeat(70))
    console.log('🔍 COMPREHENSIVE DATA ACCURACY REPORT')
    console.log('='.repeat(70))
    
    console.log(`\n🎯 Overall Accuracy Score: ${this.results.overall.score}/100 (${this.results.overall.status.toUpperCase().replace('_', ' ')})`)
    
    const categories = [
      { key: 'teamData', name: 'Team Data', icon: '📊' },
      { key: 'playerData', name: 'Player Data', icon: '👥' },
      { key: 'gameData', name: 'Game Data', icon: '🏈' },
      { key: 'analyticsData', name: 'Analytics Data', icon: '📈' },
      { key: 'espnIntegration', name: 'ESPN Integration', icon: '🔄' }
    ]
    
    categories.forEach(({ key, name, icon }) => {
      const data = this.results[key]
      const status = key === 'espnIntegration' 
        ? (data.active && data.issues.length === 0 ? 'ACTIVE' : 'ISSUES')
        : (data.accurate && data.issues.length === 0 ? 'ACCURATE' : 'ISSUES')
      
      const statusIcon = status === 'ACCURATE' || status === 'ACTIVE' ? '✅' : '⚠️'
      
      console.log(`\n${icon} ${statusIcon} ${name}: ${status}`)
      
      if (data.issues.length > 0) {
        console.log('   Issues:')
        data.issues.forEach(issue => {
          console.log(`     • ${issue}`)
        })
      }
    })
    
    console.log('\n' + '='.repeat(70))
    
    if (this.results.overall.score >= 95) {
      console.log('🌟 EXCELLENT! Your data engine is highly accurate and reliable.')
    } else if (this.results.overall.score >= 85) {
      console.log('✅ VERY GOOD! Minor issues but overall excellent data quality.')
    } else if (this.results.overall.score >= 75) {
      console.log('👍 GOOD! Some issues to address but solid foundation.')
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT! Address the issues above for better accuracy.')
    }
    
    console.log('='.repeat(70))
  }
}

async function main() {
  const verifier = new DataAccuracyVerifier()
  const results = await verifier.verifyAllAccuracy()
  
  // Save detailed results
  fs.writeFileSync('data-accuracy-report.json', JSON.stringify(results, null, 2))
  console.log('\n💾 Detailed accuracy report saved to: data-accuracy-report.json')
}

main().catch(console.error) 