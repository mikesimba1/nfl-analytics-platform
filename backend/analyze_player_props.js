/**
 * PLAYER PROPS ANALYZER
 * Find and analyze recent player props data (2023-2024)
 */

require('dotenv').config();
const FreeDataService = require('./src/services/freeDataService');
const fs = require('fs').promises;
const path = require('path');

class PlayerPropsAnalyzer {
    constructor() {
        this.freeDataService = new FreeDataService();
        this.dataDir = path.join(__dirname, 'data/player-props');
        this.nflDataDir = path.join(__dirname, '../nfl_data');
    }

    async analyzePlayerProps() {
        console.log('🎯 ANALYZING PLAYER PROPS DATA (2023-2024)');
        console.log('==========================================\n');

        try {
            await this.ensureDirectoryExists(this.dataDir);

            // 1. Check current odds API for available props
            console.log('1️⃣ CHECKING CURRENT ODDS API FOR PROPS');
            console.log('--------------------------------------');
            const currentProps = await this.getCurrentPlayerProps();
            await this.saveData('current-player-props.json', currentProps);
            console.log(`✅ Found ${currentProps.totalProps} current player props\n`);

            // 2. Reverse-engineer props from 2024 stats
            console.log('2️⃣ REVERSE-ENGINEERING 2024 PLAYER PROPS');
            console.log('-----------------------------------------');
            const reversedProps2024 = await this.reverseEngineer2024Props();
            await this.saveData('2024-reverse-engineered-props.json', reversedProps2024);
            console.log(`✅ Created ${reversedProps2024.totalProps} estimated 2024 props\n`);

            // 3. Create prop performance analysis
            console.log('3️⃣ CREATING PROP PERFORMANCE ANALYSIS');
            console.log('-------------------------------------');
            const propAnalysis = await this.createPropAnalysis(reversedProps2024);
            await this.saveData('prop-performance-analysis.json', propAnalysis);

            console.log('\n🎯 PLAYER PROPS ANALYSIS COMPLETE');
            console.log('=================================');
            console.log('✅ Current props identified');
            console.log('✅ 2024 props reverse-engineered');
            console.log('✅ Performance analysis created');

            return {
                current: currentProps,
                props2024: reversedProps2024,
                analysis: propAnalysis
            };

        } catch (error) {
            console.error('❌ Error analyzing player props:', error.message);
            return null;
        }
    }

    async getCurrentPlayerProps() {
        try {
            const oddsData = await this.freeDataService.getBettingOdds();
            
            let totalProps = 0;
            const propsByType = {};

            oddsData.forEach(game => {
                if (game.bookmakers) {
                    game.bookmakers.forEach(bookmaker => {
                        if (bookmaker.markets) {
                            bookmaker.markets.forEach(market => {
                                if (this.isPlayerPropMarket(market.key)) {
                                    totalProps++;
                                    if (!propsByType[market.key]) {
                                        propsByType[market.key] = 0;
                                    }
                                    propsByType[market.key]++;
                                }
                            });
                        }
                    });
                }
            });

            return {
                totalProps: totalProps,
                propTypes: propsByType,
                availableTypes: Object.keys(propsByType),
                collected: new Date().toISOString(),
                source: 'Current_Odds_API'
            };

        } catch (error) {
            console.warn('Could not get current player props:', error.message);
            return {
                totalProps: 0,
                propTypes: {},
                error: error.message
            };
        }
    }

    async reverseEngineer2024Props() {
        try {
            const statsFile = path.join(this.nflDataDir, 'player_stats/2024_seasonal_stats.csv');
            const statsData = await this.loadCSVData(statsFile);
            
            const props = {
                passingYards: [],
                rushingYards: [],
                receivingYards: []
            };

            statsData.forEach(player => {
                if (player.passing_yards && player.passing_yards > 1000) {
                    props.passingYards.push({
                        player: player.player_display_name,
                        team: player.recent_team,
                        actualYards: parseInt(player.passing_yards),
                        estimatedLine: Math.round(player.passing_yards / 17),
                        season: 2024
                    });
                }

                if (player.rushing_yards && player.rushing_yards > 200) {
                    props.rushingYards.push({
                        player: player.player_display_name,
                        team: player.recent_team,
                        actualYards: parseInt(player.rushing_yards),
                        estimatedLine: Math.round(player.rushing_yards / 17),
                        season: 2024
                    });
                }

                if (player.receiving_yards && player.receiving_yards > 300) {
                    props.receivingYards.push({
                        player: player.player_display_name,
                        team: player.recent_team,
                        actualYards: parseInt(player.receiving_yards),
                        estimatedLine: Math.round(player.receiving_yards / 17),
                        season: 2024
                    });
                }
            });

            const totalProps = Object.values(props).reduce((sum, propArray) => sum + propArray.length, 0);

            return {
                season: 2024,
                totalProps: totalProps,
                props: props,
                method: 'Reverse_Engineered_From_Stats',
                created: new Date().toISOString()
            };

        } catch (error) {
            console.warn('Could not reverse-engineer 2024 props:', error.message);
            return { totalProps: 0, props: {}, error: error.message };
        }
    }

    async createPropAnalysis(props2024) {
        const analysis = {
            topPerformers: {},
            propLines: {},
            insights: []
        };

        Object.entries(props2024.props || {}).forEach(([propType, props]) => {
            analysis.topPerformers[propType] = props
                .sort((a, b) => b.actualYards - a.actualYards)
                .slice(0, 10);
                
            analysis.propLines[propType] = {
                average: props.reduce((sum, p) => sum + p.estimatedLine, 0) / props.length,
                highest: Math.max(...props.map(p => p.estimatedLine)),
                lowest: Math.min(...props.map(p => p.estimatedLine))
            };
        });

        return analysis;
    }

    isPlayerPropMarket(marketKey) {
        const propMarkets = [
            'player_pass_tds', 'player_pass_yds', 'player_rush_yds', 
            'player_receiving_yds', 'player_receptions', 'player_anytime_td'
        ];
        return propMarkets.some(prop => marketKey.includes(prop));
    }

    async loadCSVData(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const lines = data.split('\n');
            const headers = lines[0].split(',');
            
            return lines.slice(1).map(line => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index]?.trim();
                });
                return obj;
            }).filter(obj => Object.keys(obj).length > 1);
        } catch (error) {
            console.warn(`Could not load CSV data from ${filePath}:`, error.message);
            return [];
        }
    }

    async ensureDirectoryExists(dir) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async saveData(filename, data) {
        const filePath = path.join(this.dataDir, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }
}

// Run the analysis
const analyzer = new PlayerPropsAnalyzer();
analyzer.analyzePlayerProps(); 