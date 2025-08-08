#!/usr/bin/env node

/**
 * Historical Data Collector
 * Fills the gap for 2022-2023 NFL seasons using free ESPN APIs
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HistoricalDataCollector {
    constructor() {
        this.APIs = {
            espn: {
                core: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
                players: 'https://site.api.espn.com/apis/common/v3/sports/football/nfl'
            }
        };
        this.delay = 100; // Rate limiting
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get historical season data for 2022-2023
     */
    async collectHistoricalSeasons() {
        console.log('🏈 Collecting Historical NFL Data (2022-2023)...');
        console.log('==================================================');
        
        const seasons = [2022, 2023];
        const allData = {
            seasons: {},
            summary: {
                totalGames: 0,
                totalPlayers: 0,
                seasonsCollected: [],
                collectedAt: new Date().toISOString()
            }
        };

        for (const season of seasons) {
            console.log(`\n📅 Collecting ${season} season data...`);
            
            try {
                // Get schedule for the season
                const schedule = await this.getSeasonSchedule(season);
                await this.sleep(this.delay);

                // Get team stats for the season
                const teamStats = await this.getSeasonTeamStats(season);
                await this.sleep(this.delay);

                // Get player stats for the season
                const playerStats = await this.getSeasonPlayerStats(season);
                await this.sleep(this.delay);

                allData.seasons[season] = {
                    schedule: schedule,
                    teamStats: teamStats,
                    playerStats: playerStats,
                    games: schedule.length,
                    players: playerStats.length
                };

                allData.summary.totalGames += schedule.length;
                allData.summary.totalPlayers += playerStats.length;
                allData.summary.seasonsCollected.push(season);

                console.log(`✅ ${season}: ${schedule.length} games, ${playerStats.length} players`);

            } catch (error) {
                console.error(`❌ Failed to collect ${season} data:`, error.message);
                allData.seasons[season] = {
                    error: error.message,
                    games: 0,
                    players: 0
                };
            }
        }

        // Save the collected data
        const outputPath = path.join(__dirname, '..', 'data', 'historical-seasons-2022-2023.json');
        fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));

        console.log('\n📊 COLLECTION SUMMARY');
        console.log('==================================================');
        console.log(`✅ Seasons collected: ${allData.summary.seasonsCollected.join(', ')}`);
        console.log(`✅ Total games: ${allData.summary.totalGames}`);
        console.log(`✅ Total players: ${allData.summary.totalPlayers}`);
        console.log(`✅ Saved to: ${outputPath}`);

        return allData;
    }

    /**
     * Get schedule for a specific season
     */
    async getSeasonSchedule(season) {
        try {
            const url = `${this.APIs.espn.core}/scoreboard?dates=${season}&seasontype=2&limit=300`;
            const response = await axios.get(url, { timeout: 10000 });
            
            const games = [];
            if (response.data.events) {
                for (const event of response.data.events) {
                    games.push({
                        gameId: event.id,
                        date: event.date,
                        season: season,
                        week: event.week?.number || null,
                        homeTeam: event.competitions[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.abbreviation,
                        awayTeam: event.competitions[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.abbreviation,
                        homeScore: event.competitions[0]?.competitors?.find(c => c.homeAway === 'home')?.score,
                        awayScore: event.competitions[0]?.competitors?.find(c => c.homeAway === 'away')?.score,
                        status: event.status?.type?.name,
                        completed: event.status?.type?.completed || false
                    });
                }
            }

            return games;
        } catch (error) {
            console.warn(`⚠️ Could not fetch ${season} schedule:`, error.message);
            return [];
        }
    }

    /**
     * Get team stats for a specific season
     */
    async getSeasonTeamStats(season) {
        try {
            const url = `${this.APIs.espn.core}/teams`;
            const response = await axios.get(url, { timeout: 10000 });
            
            const teamStats = [];
            if (response.data.sports?.[0]?.leagues?.[0]?.teams) {
                for (const teamData of response.data.sports[0].leagues[0].teams) {
                    const team = teamData.team;
                    
                    // Try to get team statistics for the season
                    try {
                        await this.sleep(50); // Extra careful with rate limiting
                        const statsUrl = `${this.APIs.espn.core}/teams/${team.id}/statistics?season=${season}`;
                        const statsResponse = await axios.get(statsUrl, { timeout: 10000 });
                        
                        teamStats.push({
                            teamId: team.id,
                            team: team.abbreviation,
                            name: team.displayName,
                            season: season,
                            statistics: statsResponse.data.statistics || {},
                            record: statsResponse.data.record || {}
                        });
                    } catch (statsError) {
                        // If individual team stats fail, just add basic info
                        teamStats.push({
                            teamId: team.id,
                            team: team.abbreviation,
                            name: team.displayName,
                            season: season,
                            statistics: {},
                            record: {},
                            error: 'Stats unavailable'
                        });
                    }
                }
            }

            return teamStats;
        } catch (error) {
            console.warn(`⚠️ Could not fetch ${season} team stats:`, error.message);
            return [];
        }
    }

    /**
     * Get player stats for a specific season
     */
    async getSeasonPlayerStats(season) {
        try {
            // ESPN's player endpoint for historical seasons
            const url = `${this.APIs.espn.players}/athletes?limit=1000&season=${season}`;
            const response = await axios.get(url, { timeout: 15000 });
            
            const players = [];
            if (response.data.items) {
                for (const player of response.data.items) {
                    players.push({
                        playerId: player.id,
                        name: player.displayName || player.fullName,
                        team: player.team?.abbreviation,
                        position: player.position?.abbreviation,
                        season: season,
                        statistics: player.statistics || {},
                        active: player.active || false
                    });
                }
            }

            return players;
        } catch (error) {
            console.warn(`⚠️ Could not fetch ${season} player stats:`, error.message);
            
            // Fallback: Try to get current players and mark them for the season
            try {
                const fallbackUrl = `${this.APIs.espn.core}/athletes?limit=1000`;
                const fallbackResponse = await axios.get(fallbackUrl, { timeout: 10000 });
                
                const fallbackPlayers = [];
                if (fallbackResponse.data.items) {
                    for (const player of fallbackResponse.data.items) {
                        fallbackPlayers.push({
                            playerId: player.id,
                            name: player.displayName || player.fullName,
                            team: player.team?.abbreviation,
                            position: player.position?.abbreviation,
                            season: season,
                            statistics: {},
                            active: false,
                            note: 'Fallback data - stats may be incomplete'
                        });
                    }
                }
                
                return fallbackPlayers;
            } catch (fallbackError) {
                return [];
            }
        }
    }

    /**
     * Check what data we currently have
     */
    async auditCurrentData() {
        console.log('📋 CURRENT DATA AUDIT');
        console.log('==================================================');
        
        const dataDir = path.join(__dirname, '..', 'nfl_data');
        const seasons = {
            2021: { games: false, playerStats: false, teamStats: false },
            2022: { games: false, playerStats: false, teamStats: false },
            2023: { games: false, playerStats: false, teamStats: false },
            2024: { games: false, playerStats: false, teamStats: false }
        };

        // Check for game files
        const gamesDir = path.join(dataDir, 'games');
        if (fs.existsSync(gamesDir)) {
            const gameFiles = fs.readdirSync(gamesDir);
            for (const file of gameFiles) {
                const match = file.match(/(\d{4})_schedule\.csv/);
                if (match) {
                    const year = parseInt(match[1]);
                    if (seasons[year]) seasons[year].games = true;
                }
            }
        }

        // Check for player stats
        const playerStatsDir = path.join(dataDir, 'player_stats');
        if (fs.existsSync(playerStatsDir)) {
            const playerFiles = fs.readdirSync(playerStatsDir);
            for (const file of playerFiles) {
                const match = file.match(/(\d{4})_weekly_stats\.csv/);
                if (match) {
                    const year = parseInt(match[1]);
                    if (seasons[year]) seasons[year].playerStats = true;
                }
            }
        }

        // Display results
        for (const [year, data] of Object.entries(seasons)) {
            const status = data.games && data.playerStats ? '✅ COMPLETE' : 
                          data.games || data.playerStats ? '⚠️ PARTIAL' : '❌ MISSING';
            console.log(`${year}: ${status} (Games: ${data.games ? '✅' : '❌'}, Players: ${data.playerStats ? '✅' : '❌'})`);
        }

        return seasons;
    }
}

// Run the audit
async function main() {
    const collector = new HistoricalDataCollector();
    
    console.log('🏈 NFL DATA AUDIT');
    console.log('==================================================');
    
    await collector.auditCurrentData();
}

main().catch(console.error); 