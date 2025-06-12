const express = require('express')
const router = express.Router()
const nflDataService = require('../services/nflDataService')
const { validateQuery } = require('../middleware/validation')

// Get 2025 season predictions based on 2024 data
router.get('/season/2025', async (req, res) => {
  try {
    const seasonData = await nflDataService.get2025Predictions()
    res.json({
      success: true,
      data: seasonData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Get 2025 Week 1 game predictions (this is what frontend calls)
router.get('/games/2024', validateQuery, async (req, res) => {
  try {
    const { week } = req.query
    const games = await nflDataService.getAdvancedGamePredictions(week || '1')
    
    res.json({
      success: true,
      games: games, // Frontend expects 'games' property
      meta: {
        totalGames: games.length,
        season: 2025,
        week: week || '1',
        predictionType: 'Week 1 2025 Predictions'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Get team analysis based on 2024 performance for 2025 predictions
router.get('/teams/2025/:team?', async (req, res) => {
  try {
    const { team } = req.params
    const teamStats = await nflDataService.getTeamStats(team)
    
    res.json({
      success: true,
      data: teamStats,
      meta: {
        season: 2025,
        team: team || 'all',
        basedOn: '2024 performance data'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Get current roster data - simplified since we don't have CSV files
router.get('/rosters/current', async (req, res) => {
  try {
    const { team } = req.query
    
    res.json({
      success: true,
      data: {
        message: 'Roster data integrated into game predictions',
        availableTeams: Object.keys(nflDataService.teamData),
        team: team || 'all'
      },
      meta: {
        team: team || 'all',
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Get system status
router.get('/status', async (req, res) => {
  try {
    const status = await nflDataService.getSystemStatus()
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router 