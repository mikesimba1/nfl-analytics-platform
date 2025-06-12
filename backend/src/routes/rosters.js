const express = require('express');
const router = express.Router();

// Use the modern roster service with current 2025 data
const modernRosterService = require('../services/modernRosterService');

// Original services as fallbacks
const hybridRosterService = require('../services/hybridRosterService');
const simpleRosterService = require('../services/simpleRosterService');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/rosters/current
 * Get all current season rosters
 */
router.get('/current', async (req, res) => {
  try {
    console.log('📋 Fetching current NFL rosters...');
    
    // Try modern service first (most current data)
    try {
      const rosters = await modernRosterService.getCurrentRosters();
      res.json({
        success: true,
        data: rosters,
        count: rosters.length,
        source: 'ESPN_Modern_2025',
        lastUpdated: new Date().toISOString(),
        meta: {
          totalPlayers: rosters.length,
          espnPlayers: rosters.filter(p => p.source === 'ESPN_Modern').length,
          updated2025: rosters.filter(p => p.updated_2025).length,
          cacheStatus: 'active'
        }
      });
    } catch (modernError) {
      console.warn('⚠️ Modern service failed, using fallback:', modernError.message);
      
      // Fallback to hybrid service
      const rosters = await hybridRosterService.getCurrentRosters();
      res.json({
        success: true,
        data: rosters,
        count: rosters.length,
        source: 'Hybrid_Fallback',
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Roster fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/rosters/team/:teamAbbr
 * Get roster for specific team
 */
router.get('/team/:teamAbbr', [
  param('teamAbbr').isLength({ min: 2, max: 3 }).withMessage('Team abbreviation must be 2-3 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { teamAbbr } = req.params;
    console.log(`🔍 Fetching ${teamAbbr} roster...`);
    
    const teamRoster = await modernRosterService.getPlayersByTeam(teamAbbr);
    
    res.json({
      success: true,
      data: teamRoster,
      count: teamRoster.length,
      team: teamAbbr.toUpperCase(),
      positions: [...new Set(teamRoster.map(p => p.position))],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Team roster error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rosters/position/:position
 * Get all players by position
 */
router.get('/position/:position', [
  param('position').isAlpha().withMessage('Position must contain only letters')
], handleValidationErrors, async (req, res) => {
  try {
    const { position } = req.params;
    console.log(`🎯 Fetching ${position} players...`);
    
    const positionPlayers = await modernRosterService.getPlayersByPosition(position);
    
    res.json({
      success: true,
      data: positionPlayers,
      count: positionPlayers.length,
      position: position.toUpperCase(),
      teams: [...new Set(positionPlayers.map(p => p.team))],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Position roster error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rosters/player/:playerName
 * Search for specific player
 */
router.get('/player/:playerName', [
  param('playerName').isLength({ min: 2 }).withMessage('Player name must be at least 2 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { playerName } = req.params;
    console.log(`👤 Finding player: ${playerName}`);
    
    const searchResults = await modernRosterService.searchPlayers(playerName);
    const exactMatch = searchResults.find(p => 
      p.player_name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (exactMatch) {
      res.json({
        success: true,
        data: exactMatch,
        exactMatch: true,
        lastUpdated: new Date().toISOString()
      });
    } else if (searchResults.length > 0) {
      res.json({
        success: true,
        data: searchResults[0],
        exactMatch: false,
        suggestions: searchResults.slice(0, 5),
        lastUpdated: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Player '${playerName}' not found`,
        suggestions: []
      });
    }
  } catch (error) {
    console.error('❌ Player lookup error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rosters/search
 * Search players by query
 */
router.get('/search', [
  query('q').isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    console.log(`🔍 Searching for: ${q}`);
    const searchResults = await modernRosterService.searchPlayers(q);
    
    res.json({
      success: true,
      data: searchResults,
      count: searchResults.length,
      query: q,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Player search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rosters/correlations
 * Get QB/receiver correlation combos for stack analysis
 */
router.get('/correlations', async (req, res) => {
  try {
    const rosters = await modernRosterService.getCurrentRosters();
    
    // Find QB/receiver combinations by team
    const qbs = rosters.filter(p => p.position === 'QB');
    const receivers = rosters.filter(p => ['WR', 'TE'].includes(p.position));
    
    const correlations = [];
    for (const qb of qbs) {
      const teamReceivers = receivers.filter(r => r.team === qb.team);
      for (const receiver of teamReceivers) {
        correlations.push({
          qb: qb.player_name,
          receiver: receiver.player_name,
          team: qb.team,
          combo: `${qb.player_name} + ${receiver.player_name}`,
          score: 85 + Math.random() * 15 // Mock correlation score
        });
      }
    }
    
    res.json({
      success: true,
      data: correlations.slice(0, 50), // Return top 50
      count: correlations.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rosters/test-moves
 * Test recent player moves for validation
 */
router.get('/test-moves', async (req, res) => {
  try {
    const validation = await modernRosterService.validateRosterUpdates();
    res.json({
      success: true,
      data: validation.slice(0, 5), // Return first 5 for testing
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rosters/validate-2025
 * Validate 2025 roster updates
 */
router.get('/validate-2025', async (req, res) => {
  try {
    console.log('🔍 Validating 2025 roster updates...');
    
    const validation = await modernRosterService.validateRosterUpdates();
    const correct = validation.filter(v => v.correct).length;
    const total = validation.length;
    
    res.json({
      success: true,
      data: validation,
      summary: {
        correct: correct,
        total: total,
        accuracy: `${Math.round((correct / total) * 100)}%`
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/rosters/refresh
 * Force refresh roster cache
 */
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔄 Force refreshing roster cache...');
    
    const rosters = await modernRosterService.forceRefresh();
    
    res.json({
      success: true,
      message: 'Roster cache refreshed successfully',
      count: rosters.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cache refresh error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 