const express = require('express')
const router = express.Router()
const oddsService = require('../services/oddsService')

// Get current odds for NFL games
router.get('/current', async (req, res) => {
  try {
    const { sport = 'americanfootball_nfl', region = 'us', market = 'h2h', refresh } = req.query
    const forceRefresh = refresh === 'true'
    
    const odds = await oddsService.getCurrentOdds(sport, region, market, forceRefresh)
    
    res.json({
      success: true,
      data: odds,
      count: odds.length,
      source: odds[0]?.source || 'Unknown',
      cached_at: odds[0]?.cached_at || new Date().toISOString(),
      api_status: oddsService.getApiStatus()
    })
  } catch (error) {
    console.error('Error fetching current odds:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: oddsService.getApiStatus()
    })
  }
})

// Get best odds across all bookmakers
router.get('/best', async (req, res) => {
  try {
    const { sport = 'americanfootball_nfl' } = req.query
    const bestOdds = await oddsService.getBestOdds(sport)
    
    res.json({
      success: true,
      data: bestOdds,
      count: bestOdds.length,
      api_status: oddsService.getApiStatus()
    })
  } catch (error) {
    console.error('Error fetching best odds:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: oddsService.getApiStatus()
    })
  }
})

// Get line movements
router.get('/movements', async (req, res) => {
  try {
    const { sport = 'americanfootball_nfl' } = req.query
    const movements = await oddsService.getLineMovements(sport)
    
    res.json({
      success: true,
      data: movements,
      count: movements.length,
      api_status: oddsService.getApiStatus()
    })
  } catch (error) {
    console.error('Error fetching line movements:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: oddsService.getApiStatus()
    })
  }
})

// Get odds for a specific game
router.get('/game/:home/:away', async (req, res) => {
  try {
    const { home, away } = req.params
    const gameOdds = await oddsService.getGameOdds(home, away)
    
    if (!gameOdds) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
        api_status: oddsService.getApiStatus()
      })
    }
    
    res.json({
      success: true,
      data: gameOdds,
      api_status: oddsService.getApiStatus()
    })
  } catch (error) {
    console.error('Error fetching game odds:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: oddsService.getApiStatus()
    })
  }
})

// Get API status and usage information
router.get('/status', async (req, res) => {
  try {
    const status = oddsService.getApiStatus()
    
    res.json({
      success: true,
      data: {
        ...status,
        available_sources: [
          'The Odds API (500 free requests/month)',
          'GitHub Scrapers (Unlimited)',
          'sbrscrape (Free)',
          'DraftKings Scraper (Free)',
          'Sportsbook Scraper (Free)'
        ],
        current_source: status.source,
              cache_info: {
        enabled: true,
        duration: '4 hours',
        auto_refresh: true
      }
      }
    })
  } catch (error) {
    console.error('Error fetching API status:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Force refresh odds (clears cache)
router.post('/refresh', async (req, res) => {
  try {
    const { sport = 'americanfootball_nfl', region = 'us', market = 'h2h' } = req.body
    
    console.log('🔄 Force refreshing odds data...')
    const odds = await oddsService.getCurrentOdds(sport, region, market, true)
    
    res.json({
      success: true,
      message: 'Odds data refreshed successfully',
      data: odds,
      count: odds.length,
      source: odds[0]?.source || 'Unknown',
      refreshed_at: new Date().toISOString(),
      api_status: oddsService.getApiStatus()
    })
  } catch (error) {
    console.error('Error refreshing odds:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      api_status: oddsService.getApiStatus()
    })
  }
})

// Test endpoint for API functionality
router.get('/test', async (req, res) => {
  try {
    const status = oddsService.getApiStatus()
    const testResults = {
      api_status: status,
      can_make_api_calls: status.canMakeCall,
      current_source: status.source,
      test_timestamp: new Date().toISOString()
    }
    
    // Try to get a small sample of odds
    try {
      const sampleOdds = await oddsService.getCurrentOdds('americanfootball_nfl', 'us', 'h2h')
      testResults.sample_data = {
        games_available: sampleOdds.length,
        first_game: sampleOdds[0] ? {
          matchup: `${sampleOdds[0].away_team} @ ${sampleOdds[0].home_team}`,
          bookmakers: sampleOdds[0].bookmakers.length,
          source: sampleOdds[0].source
        } : null
      }
      testResults.test_status = 'success'
    } catch (testError) {
      testResults.test_status = 'failed'
      testResults.test_error = testError.message
    }
    
    res.json({
      success: true,
      data: testResults
    })
  } catch (error) {
    console.error('Error running test:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router 