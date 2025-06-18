import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HistoricalOddsIntegrator {
    constructor() {
        this.historicalDataPath = path.join(__dirname, '../historical-odds-scraper/data/nfl_archive_10Y_fixed.json');
        this.outputPath = path.join(__dirname, '../data/historical-odds-integrated.json');
    }

    async integrateHistoricalOdds() {
        try {
            console.log('🏈 Starting Historical NFL Odds Integration...');
            console.log(`📁 Looking for data at: ${this.historicalDataPath}`);
            
            // Check if file exists
            if (!fs.existsSync(this.historicalDataPath)) {
                throw new Error(`Historical data file not found at: ${this.historicalDataPath}`);
            }
            
            // Load historical data
            console.log('📖 Reading file...');
            const rawData = fs.readFileSync(this.historicalDataPath, 'utf8');
            console.log(`📄 File size: ${rawData.length} characters`);
            
            console.log('🔄 Parsing JSON...');
            const historicalData = JSON.parse(rawData);
            console.log(`📊 Loaded ${historicalData.length} historical games (2011-2021)`);
            
            // Process and standardize data
            const processedData = this.processHistoricalData(historicalData);
            
            // Generate analytics
            const analytics = this.generateAnalytics(processedData);
            
            // Save integrated data
            const integratedData = {
                metadata: {
                    source: 'SportsbookReview Historical Archive',
                    dateRange: '2011-2021',
                    totalGames: processedData.length,
                    lastUpdated: new Date().toISOString(),
                    dataFields: [
                        'season', 'date', 'teams', 'scores', 'moneylines', 
                        'spreads', 'totals', 'secondHalfLines'
                    ]
                },
                analytics: analytics,
                games: processedData
            };
            
            fs.writeFileSync(this.outputPath, JSON.stringify(integratedData, null, 2));
            console.log(`✅ Historical odds integrated successfully!`);
            console.log(`📁 Output saved to: ${this.outputPath}`);
            
            return integratedData;
            
        } catch (error) {
            console.error('❌ Error integrating historical odds:', error);
            throw error;
        }
    }

    processHistoricalData(rawData) {
        return rawData.map(game => ({
            // Game identification
            season: game.season,
            date: this.formatDate(game.date),
            gameId: `${game.season}_${game.date}_${game.away_team}_${game.home_team}`,
            
            // Teams
            homeTeam: this.standardizeTeamName(game.home_team),
            awayTeam: this.standardizeTeamName(game.away_team),
            
            // Final scores
            homeScore: parseInt(game.home_final),
            awayScore: parseInt(game.away_final),
            
            // Quarter scores
            quarterScores: {
                home: [
                    parseInt(game.home_1stQtr || 0),
                    parseInt(game.home_2ndQtr || 0),
                    parseInt(game.home_3rdQtr || 0),
                    parseInt(game.home_4thQtr || 0)
                ],
                away: [
                    parseInt(game.away_1stQtr || 0),
                    parseInt(game.away_2ndQtr || 0),
                    parseInt(game.away_3rdQtr || 0),
                    parseInt(game.away_4thQtr || 0)
                ]
            },
            
            // Betting lines
            moneylines: {
                home: {
                    close: game.home_close_ml
                },
                away: {
                    close: game.away_close_ml
                }
            },
            
            spreads: {
                home: {
                    open: game.home_open_spread,
                    close: game.home_close_spread
                },
                away: {
                    open: game.away_open_spread,
                    close: game.away_close_spread
                }
            },
            
            totals: {
                open: game.open_over_under,
                close: game.close_over_under
            },
            
            secondHalf: {
                spreads: {
                    home: game.home_2H_spread,
                    away: game.away_2H_spread
                },
                total: game['2H_total']
            },
            
            // Derived metrics
            totalPoints: parseInt(game.home_final) + parseInt(game.away_final),
            margin: parseInt(game.home_final) - parseInt(game.away_final),
            winner: parseInt(game.home_final) > parseInt(game.away_final) ? 'home' : 'away'
        }));
    }

    generateAnalytics(games) {
        const analytics = {
            overview: {
                totalGames: games.length,
                seasons: [...new Set(games.map(g => g.season))].sort(),
                teams: [...new Set([...games.map(g => g.homeTeam), ...games.map(g => g.awayTeam)])].sort()
            },
            
            scoring: {
                averageTotal: this.calculateAverage(games.map(g => g.totalPoints)),
                averageMargin: this.calculateAverage(games.map(g => Math.abs(g.margin))),
                highestScoringGame: games.reduce((max, game) => 
                    game.totalPoints > max.totalPoints ? game : max),
                lowestScoringGame: games.reduce((min, game) => 
                    game.totalPoints < min.totalPoints ? game : min)
            },
            
            betting: {
                averageSpread: this.calculateAverage(games
                    .filter(g => g.spreads.home.close !== null)
                    .map(g => Math.abs(g.spreads.home.close))),
                averageTotal: this.calculateAverage(games
                    .filter(g => g.totals.close !== null)
                    .map(g => g.totals.close)),
                homeWinPercentage: (games.filter(g => g.winner === 'home').length / games.length * 100).toFixed(1)
            },
            
            seasonBreakdown: this.generateSeasonBreakdown(games)
        };
        
        return analytics;
    }

    generateSeasonBreakdown(games) {
        const seasons = {};
        
        games.forEach(game => {
            if (!seasons[game.season]) {
                seasons[game.season] = {
                    games: 0,
                    totalPoints: 0,
                    homeWins: 0
                };
            }
            
            seasons[game.season].games++;
            seasons[game.season].totalPoints += game.totalPoints;
            if (game.winner === 'home') seasons[game.season].homeWins++;
        });
        
        // Calculate averages
        Object.keys(seasons).forEach(season => {
            const data = seasons[season];
            data.averageTotal = (data.totalPoints / data.games).toFixed(1);
            data.homeWinPercentage = (data.homeWins / data.games * 100).toFixed(1);
        });
        
        return seasons;
    }

    standardizeTeamName(teamName) {
        const teamMappings = {
            'Fortyniners': '49ers',
            'SanDiego': 'Chargers',
            'St.Louis': 'Rams',
            'Commanders': 'Washington'
        };
        
        return teamMappings[teamName] || teamName;
    }

    formatDate(dateNum) {
        const dateStr = dateNum.toString();
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
    }

    calculateAverage(numbers) {
        return numbers.length > 0 ? 
            (numbers.reduce((sum, num) => sum + num, 0) / numbers.length).toFixed(1) : 0;
    }
}

// Execute integration
async function main() {
    const integrator = new HistoricalOddsIntegrator();
    
    try {
        const result = await integrator.integrateHistoricalOdds();
        
        console.log('\n📈 INTEGRATION SUMMARY:');
        console.log(`📊 Total Games: ${result.analytics.overview.totalGames}`);
        console.log(`🏈 Seasons: ${result.analytics.overview.seasons.join(', ')}`);
        console.log(`🏟️  Teams: ${result.analytics.overview.teams.length}`);
        console.log(`⚡ Average Total Points: ${result.analytics.scoring.averageTotal}`);
        console.log(`📏 Average Spread: ${result.analytics.betting.averageSpread}`);
        console.log(`🏠 Home Win %: ${result.analytics.betting.homeWinPercentage}%`);
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. ✅ Historical odds data (2011-2021) integrated');
        console.log('2. 🔄 Continue using Odds API for current season');
        console.log('3. 📊 Build predictive models with 10+ years of data');
        console.log('4. 🚀 Create comprehensive analytics dashboard');
        
    } catch (error) {
        console.error('❌ Integration failed:', error.message);
        process.exit(1);
    }
}

// Execute main function
main();

export default HistoricalOddsIntegrator; 