const express = require('express');
const router = express.Router();
const AdvancedAnalyticsService = require('../services/advancedAnalyticsService');

const advancedAnalytics = new AdvancedAnalyticsService();

// Get comprehensive advanced analytics
router.get('/advanced', async (req, res) => {
  try {
    const analytics = await advancedAnalytics.getAdvancedAnalytics();
    res.json({
      success: true,
      data: analytics,
      message: 'Advanced analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting advanced analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve advanced analytics'
    });
  }
});

// Get volume intelligence analysis
router.get('/volume-intelligence', async (req, res) => {
  try {
    const volumeData = await advancedAnalytics.getVolumeIntelligence();
    res.json({
      success: true,
      data: volumeData,
      message: 'Volume intelligence analysis retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting volume intelligence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve volume intelligence'
    });
  }
});

// Get game script analysis
router.get('/game-script', async (req, res) => {
  try {
    const gameScriptData = await advancedAnalytics.getGameScriptAnalysis();
    res.json({
      success: true,
      data: gameScriptData,
      message: 'Game script analysis retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting game script analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve game script analysis'
    });
  }
});

// Get garbage time analysis
router.get('/garbage-time', async (req, res) => {
  try {
    const garbageTimeData = await advancedAnalytics.getGarbageTimeAnalysis();
    res.json({
      success: true,
      data: garbageTimeData,
      message: 'Garbage time analysis retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting garbage time analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve garbage time analysis'
    });
  }
});

// Get field position analysis
router.get('/field-position', async (req, res) => {
  try {
    const fieldPositionData = await advancedAnalytics.getFieldPositionAnalysis();
    res.json({
      success: true,
      data: fieldPositionData,
      message: 'Field position analysis retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting field position analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve field position analysis'
    });
  }
});

// Get actionable insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await advancedAnalytics.getActionableInsights();
    res.json({
      success: true,
      data: insights,
      message: 'Actionable insights retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting actionable insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve actionable insights'
    });
  }
});

// Generate fresh analytics (force refresh)
router.post('/generate', async (req, res) => {
  try {
    const analytics = await advancedAnalytics.generateAdvancedAnalytics();
    res.json({
      success: true,
      data: analytics,
      message: 'Fresh advanced analytics generated successfully'
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics'
    });
  }
});

module.exports = router; 