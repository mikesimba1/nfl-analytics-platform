const express = require('express')
const router = express.Router()
const nflDataService = require('../services/nflDataService')

// Get comprehensive player props with advanced analysis
router.get('/player-props', async (req, res) => {
  try {
    const { week = '1' } = req.query
    const props = await nflDataService.getPlayerProps(week)
    
    res.json({
      success: true,
      props: props,
      meta: {
        totalProps: props.length,
        week: week,
        season: 2025,
        analysisFactors: [
          '2024 Performance Baselines',
          'Injury Impact Analysis', 
          'Matchup Context',
          'Game Script Predictions',
          'Weather Considerations',
          'Defensive Rankings'
        ]
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

// Get comprehensive game predictions with advanced metrics
router.get('/games', async (req, res) => {
  try {
    const { week = '1' } = req.query
    const games = await nflDataService.getAdvancedGamePredictions(week)
    
    res.json({
      success: true,
      games: games,
      meta: {
        totalGames: games.length,
        week: week,
        season: 2025,
        analysisIncludes: [
          'Team Strength Analysis (0-100 scale)',
          'ELO Ratings (1450-1650 range)',
          'DVOA Metrics (Total, Offensive, Defensive)',
          'Weather Impact Analysis',
          'Injury Analysis with replacement quality',
          'Motivational Factors',
          'Betting Edge Calculations',
          'Confidence Ratings'
        ]
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

// Get current predictions overview
router.get('/current', async (req, res) => {
  try {
    const overview = await nflDataService.getPredictionOverview()
    
    res.json({
      success: true,
      data: overview,
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

// Get betting edge analysis
router.get('/betting-edge', async (req, res) => {
  try {
    const { week = '1' } = req.query
    const bettingAnalysis = await nflDataService.getBettingEdgeAnalysis(week)
    
    res.json({
      success: true,
      data: bettingAnalysis,
      analysisFactors: {
        spreadEdge: 'Value in point spread bets',
        totalEdge: 'Over/Under value opportunities', 
        moneylineEdge: 'Straight win bet value',
        expectedValue: 'Mathematical edge percentage',
        confidenceLevels: 'HIGH/MEDIUM/LOW ratings'
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

// Get enhanced cheat sheets with multi-source data integration
router.get('/cheat-sheets', async (req, res) => {
  try {
    const { week = '1' } = req.query
    const cheatSheets = await nflDataService.getCheatSheets(week)
    
    res.json({
      success: true,
      data: cheatSheets,
      enhancementInfo: {
        dataSources: cheatSheets.meta?.dataSources || ['Multi-source integration'],
        confidence: cheatSheets.meta?.confidence || 'High',
        version: cheatSheets.meta?.version || '2.0 Enhanced',
        validation: cheatSheets.validation || 'Active'
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

module.exports = router 