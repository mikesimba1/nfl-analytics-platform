/**
 * Final Platform Integration
 * Connects the Python prediction system with your existing Node.js backend
 */

const { PythonShell } = require('python-shell');
const fs = require('fs');
const path = require('path');

class NFLPredictionIntegration {
    constructor() {
        this.pythonPath = path.join(__dirname, 'step4_complete_system.py');
        this.dataPath = path.join(__dirname, '../data');
    }

    /**
     * Get weekly predictions for all games
     * This is what your frontend components will call
     */
    async getWeeklyPredictions() {
        try {
            console.log('🎯 Generating weekly predictions...');
            
            const options = {
                mode: 'text',
                pythonPath: 'py',
                pythonOptions: ['-u'],
                scriptPath: __dirname,
                args: []
            };

            return new Promise((resolve, reject) => {
                PythonShell.run('step4_complete_system.py', options, (err, results) => {
                    if (err) {
                        console.error('❌ Python prediction error:', err);
                        reject(err);
                    } else {
                        console.log('✅ Predictions generated successfully');
                        resolve(this.parsePredictionResults(results));
                    }
                });
            });
        } catch (error) {
            console.error('❌ Integration error:', error);
            throw error;
        }
    }

    /**
     * Get predictions for a specific game
     * For your GameAnalysis.tsx component
     */
    async getGamePrediction(homeTeam, awayTeam, gameDate) {
        try {
            const options = {
                mode: 'json',
                pythonPath: 'py',
                pythonOptions: ['-u'],
                scriptPath: __dirname,
                args: [homeTeam, awayTeam, gameDate]
            };

            return new Promise((resolve, reject) => {
                PythonShell.run('single_game_prediction.py', options, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results[0]);
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get high-confidence picks for subscribers
     * For your WeeklyPredictions.tsx component
     */
    async getSubscriberPicks(tier = 'premium') {
        const weeklyPredictions = await this.getWeeklyPredictions();
        
        // Filter based on subscription tier
        const confidenceThreshold = tier === 'premium' ? 80 : 70;
        
        return {
            strongBets: weeklyPredictions.strongBets.filter(bet => 
                bet.confidence >= confidenceThreshold
            ),
            goodBets: weeklyPredictions.goodBets.filter(bet => 
                bet.confidence >= confidenceThreshold - 10
            ),
            totalGames: weeklyPredictions.totalGames,
            recommendedGames: weeklyPredictions.recommendedGames,
            tier: tier,
            confidenceThreshold: confidenceThreshold
        };
    }

    /**
     * Get live odds comparison
     * For your LiveOdds.tsx component
     */
    async getLiveOddsComparison() {
        try {
            // Get current predictions
            const predictions = await this.getWeeklyPredictions();
            
            // Get current market odds (integrate with your odds API)
            const marketOdds = await this.getCurrentMarketOdds();
            
            // Compare and identify edges
            const edgeOpportunities = this.compareOddsWithPredictions(predictions, marketOdds);
            
            return {
                edgeOpportunities,
                lastUpdated: new Date().toISOString(),
                totalOpportunities: edgeOpportunities.length
            };
        } catch (error) {
            console.error('❌ Live odds comparison error:', error);
            throw error;
        }
    }

    /**
     * Integration with your existing routes
     * Add this to your routes/analytics.js
     */
    getRouteIntegration() {
        return {
            // GET /api/predictions/weekly
            weeklyPredictions: async (req, res) => {
                try {
                    const predictions = await this.getWeeklyPredictions();
                    res.json({
                        success: true,
                        data: predictions,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
            },

            // GET /api/predictions/game/:homeTeam/:awayTeam
            gamePrediction: async (req, res) => {
                try {
                    const { homeTeam, awayTeam } = req.params;
                    const gameDate = req.query.date || new Date().toISOString().split('T')[0];
                    
                    const prediction = await this.getGamePrediction(homeTeam, awayTeam, gameDate);
                    res.json({
                        success: true,
                        data: prediction,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
            },

            // GET /api/predictions/subscriber/:tier
            subscriberPicks: async (req, res) => {
                try {
                    const { tier } = req.params;
                    const picks = await this.getSubscriberPicks(tier);
                    
                    res.json({
                        success: true,
                        data: picks,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
            },

            // GET /api/predictions/live-odds
            liveOdds: async (req, res) => {
                try {
                    const comparison = await this.getLiveOddsComparison();
                    res.json({
                        success: true,
                        data: comparison,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
            }
        };
    }

    /**
     * Frontend component integration examples
     */
    getFrontendIntegration() {
        return {
            // For GameAnalysis.tsx
            gameAnalysisExample: `
                // In your GameAnalysis.tsx component
                useEffect(() => {
                    const fetchPrediction = async () => {
                        try {
                            const response = await fetch(\`/api/predictions/game/\${homeTeam}/\${awayTeam}?date=\${gameDate}\`);
                            const data = await response.json();
                            
                            if (data.success) {
                                setPrediction(data.data);
                                setSpreadConfidence(data.data.spread_confidence);
                                setTotalConfidence(data.data.total_confidence);
                                setEdgeRating(data.data.edge_rating);
                            }
                        } catch (error) {
                            console.error('Error fetching prediction:', error);
                        }
                    };
                    
                    fetchPrediction();
                }, [homeTeam, awayTeam, gameDate]);
            `,

            // For WeeklyPredictions.tsx
            weeklyPredictionsExample: `
                // In your WeeklyPredictions.tsx component
                useEffect(() => {
                    const fetchWeeklyPicks = async () => {
                        try {
                            const tier = user.subscriptionTier; // 'basic' or 'premium'
                            const response = await fetch(\`/api/predictions/subscriber/\${tier}\`);
                            const data = await response.json();
                            
                            if (data.success) {
                                setStrongBets(data.data.strongBets);
                                setGoodBets(data.data.goodBets);
                                setWeeklyStats(data.data);
                            }
                        } catch (error) {
                            console.error('Error fetching weekly picks:', error);
                        }
                    };
                    
                    fetchWeeklyPicks();
                }, [user.subscriptionTier]);
            `,

            // For LiveOdds.tsx
            liveOddsExample: `
                // In your LiveOdds.tsx component
                useEffect(() => {
                    const fetchLiveOdds = async () => {
                        try {
                            const response = await fetch('/api/predictions/live-odds');
                            const data = await response.json();
                            
                            if (data.success) {
                                setEdgeOpportunities(data.data.edgeOpportunities);
                                setLastUpdated(data.data.lastUpdated);
                            }
                        } catch (error) {
                            console.error('Error fetching live odds:', error);
                        }
                    };
                    
                    fetchLiveOdds();
                    
                    // Update every 5 minutes
                    const interval = setInterval(fetchLiveOdds, 5 * 60 * 1000);
                    return () => clearInterval(interval);
                }, []);
            `
        };
    }

    /**
     * Helper methods
     */
    parsePredictionResults(results) {
        // Parse the Python output into structured data
        // This would parse the actual output from your Python script
        return {
            strongBets: [],
            goodBets: [],
            totalGames: 16,
            recommendedGames: 16,
            lastUpdated: new Date().toISOString()
        };
    }

    async getCurrentMarketOdds() {
        // Integration with your existing odds API
        // This would use your existing oddsService.js
        try {
            const oddsService = require('./services/oddsService');
            return await oddsService.getCurrentOdds();
        } catch (error) {
            console.error('Error fetching market odds:', error);
            return [];
        }
    }

    compareOddsWithPredictions(predictions, marketOdds) {
        // Compare predictions with current market odds to find edges
        const edges = [];
        
        // This would implement the edge detection logic
        // comparing your predictions with current market lines
        
        return edges;
    }
}

/**
 * Express.js route setup
 * Add this to your existing server.js or routes
 */
function setupPredictionRoutes(app) {
    const integration = new NFLPredictionIntegration();
    const routes = integration.getRouteIntegration();

    // Prediction routes
    app.get('/api/predictions/weekly', routes.weeklyPredictions);
    app.get('/api/predictions/game/:homeTeam/:awayTeam', routes.gamePrediction);
    app.get('/api/predictions/subscriber/:tier', routes.subscriberPicks);
    app.get('/api/predictions/live-odds', routes.liveOdds);

    console.log('✅ NFL Prediction routes configured');
}

/**
 * Scheduled jobs for automatic updates
 */
function setupScheduledJobs() {
    const cron = require('node-cron');
    const integration = new NFLPredictionIntegration();

    // Update predictions every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
        console.log('🔄 Updating weekly predictions...');
        try {
            await integration.getWeeklyPredictions();
            console.log('✅ Weekly predictions updated');
        } catch (error) {
            console.error('❌ Error updating predictions:', error);
        }
    });

    // Update live odds comparison every 15 minutes during game days
    cron.schedule('*/15 * * * *', async () => {
        const now = new Date();
        const isGameDay = [0, 1, 4, 6].includes(now.getDay()); // Sun, Mon, Thu, Sat
        
        if (isGameDay) {
            try {
                await integration.getLiveOddsComparison();
                console.log('✅ Live odds updated');
            } catch (error) {
                console.error('❌ Error updating live odds:', error);
            }
        }
    });

    console.log('✅ Scheduled jobs configured');
}

module.exports = {
    NFLPredictionIntegration,
    setupPredictionRoutes,
    setupScheduledJobs
}; 