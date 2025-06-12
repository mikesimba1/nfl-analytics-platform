const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 12 hours since rosters don't change frequently
const rosterCache = new NodeCache({ stdTTL: 43200 });

class SimpleRosterService {
  constructor() {
    // Using a working ESPN API endpoint for current roster data
    this.espnRosterUrl = 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams';
  }

  async getCurrentRosters() {
    const cacheKey = 'current_rosters';
    
    // Check cache first
    let rosters = rosterCache.get(cacheKey);
    if (rosters) {
      console.log('📋 Returning cached roster data');
      return rosters;
    }

    try {
      console.log('🔄 Fetching fresh roster data from ESPN...');
      
      // Get team data from ESPN
      const response = await axios.get(this.espnRosterUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'NFL-Analytics-Platform/1.0'
        }
      });

      const teams = response.data.sports[0].leagues[0].teams;
      rosters = [];

      // Process each team's roster
      for (const teamData of teams) {
        const team = teamData.team;
        
        try {
          // Get detailed roster for each team
          const rosterResponse = await axios.get(`http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team.id}/roster`, {
            timeout: 10000,
            headers: {
              'User-Agent': 'NFL-Analytics-Platform/1.0'
            }
          });

          if (rosterResponse.data.athletes) {
            for (const athlete of rosterResponse.data.athletes) {
              const playerName = athlete.displayName || athlete.fullName || athlete.name || 'Unknown Player';
              const position = athlete.position?.abbreviation || athlete.position?.name || 'N/A';
              
              rosters.push({
                gsis_id: athlete.id || `espn_${team.abbreviation}_${playerName.replace(/\s+/g, '_')}`,
                player_name: playerName,
                team: team.abbreviation || team.name,
                position: position,
                jersey_number: athlete.jersey || null,
                status: athlete.status?.type || 'ACTIVE',
                height: athlete.height || null,
                weight: athlete.weight || null,
                age: athlete.age || null,
                experience: athlete.experience?.years || 0,
                college: athlete.college?.name || null,
                season: 2025,
                updated: new Date().toISOString()
              });
            }
          }

          // Small delay to be respectful to ESPN's API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`⚠️ Failed to fetch roster for ${team.displayName}: ${error.message}`);
        }
      }

      console.log(`✅ Successfully fetched ${rosters.length} players from ${teams.length} teams`);
      
      // Cache the results
      rosterCache.set(cacheKey, rosters);
      
      return rosters;
    } catch (error) {
      console.error('❌ Failed to fetch rosters:', error.message);
      throw error;
    }
  }

  async getPlayerByName(playerName) {
    const rosters = await this.getCurrentRosters();
    return rosters.find(player => 
      player.player_name && player.player_name.toLowerCase().includes(playerName.toLowerCase())
    );
  }

  async getPlayersByTeam(teamAbbr) {
    const rosters = await this.getCurrentRosters();
    return rosters.filter(player => 
      player.team && player.team.toLowerCase() === teamAbbr.toLowerCase()
    );
  }

  async getPlayersByPosition(position) {
    const rosters = await this.getCurrentRosters();
    return rosters.filter(player => 
      player.position && player.position.toLowerCase() === position.toLowerCase()
    );
  }

  async searchPlayers(query) {
    const rosters = await this.getCurrentRosters();
    const searchTerm = query.toLowerCase();
    
    return rosters.filter(player => 
      (player.player_name && player.player_name.toLowerCase().includes(searchTerm)) ||
      (player.team && player.team.toLowerCase().includes(searchTerm)) ||
      (player.position && player.position.toLowerCase().includes(searchTerm))
    );
  }

  // Test specific player moves mentioned by user
  async testRecentMoves() {
    const rosters = await this.getCurrentRosters();
    
    const testCases = [
      { name: 'Caleb Williams', expectedTeam: 'CHI', description: 'Caleb Williams should be on Bears' },
      { name: 'Joe Flacco', expectedTeam: 'CLE', description: 'Joe Flacco should be on Browns' },
      { name: 'Stefon Diggs', expectedTeam: 'NE', description: 'Stefon Diggs should be on Patriots' }
    ];
    
    const results = [];
    
    for (const test of testCases) {
      const player = rosters.find(p => 
        p.player_name && p.player_name.toLowerCase().includes(test.name.toLowerCase())
      );
      
      results.push({
        ...test,
        found: !!player,
        actualTeam: player?.team || 'NOT_FOUND',
        correct: player?.team === test.expectedTeam
      });
    }
    
    return results;
  }
}

module.exports = new SimpleRosterService(); 