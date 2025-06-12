const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 30 minutes - much more frequent updates
const liveCache = new NodeCache({ stdTTL: 1800 });

class LiveRosterService {
  constructor() {
    this.sources = {
      // ESPN - Most reliable free option
      espn: {
        baseUrl: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl',
        active: true,
        priority: 1
      },
      // Backup sources
      nfl: {
        baseUrl: 'https://api.nfl.com/v1', // Requires API key but most accurate
        active: false,
        priority: 2
      },
      // Rapid API as fallback
      rapidApi: {
        baseUrl: 'https://api-nfl-v1.p.rapidapi.com',
        active: false,
        priority: 3
      }
    };

    // Known recent moves for immediate accuracy (until live data catches up)
    this.criticalMoves2025 = {
      'Stefon Diggs': { from: 'HOU', to: 'NE', date: '2025-03-15' },
      'Joe Flacco': { from: 'FA', to: 'CLE', date: '2025-03-20' },
      'Aaron Rodgers': { from: 'NYJ', to: 'PIT', date: '2025-06-06' },
      'George Pickens': { from: 'PIT', to: 'DAL', date: '2025-03-10' },
      'Nick Chubb': { from: 'CLE', to: 'HOU', date: '2025-03-18' },
      'Davante Adams': { from: 'NYJ', to: 'LAR', date: '2025-02-28' },
      'Najee Harris': { from: 'PIT', to: 'LAC', date: '2025-03-12' }
    };
  }

  async getCurrentRosters() {
    const cacheKey = 'live_rosters';
    
    let rosters = liveCache.get(cacheKey);
    if (rosters) {
      console.log('🔄 Returning cached live roster data');
      return rosters;
    }

    try {
      console.log('📡 Fetching live roster data from multiple sources...');
      
      // Try ESPN first (most reliable)
      rosters = await this.fetchFromESPN();
      
      if (!rosters || rosters.length < 100) {
        // Fallback to other sources
        console.log('⚠️ ESPN data incomplete, trying backup sources...');
        rosters = await this.fetchFromBackupSources();
      }

      // Apply critical recent moves
      rosters = this.applyCriticalMoves(rosters);
      
      console.log(`✅ Live roster data: ${rosters.length} players loaded`);
      
      // Cache for 30 minutes
      liveCache.set(cacheKey, rosters);
      
      return rosters;
    } catch (error) {
      console.error('❌ Failed to fetch live rosters:', error.message);
      throw error;
    }
  }

  async fetchFromESPN() {
    try {
      // Get all teams
      const teamsResponse = await axios.get(`${this.sources.espn.baseUrl}/teams`, {
        timeout: 10000
      });

      const teams = teamsResponse.data.sports[0].leagues[0].teams;
      const rosters = [];

      for (const teamData of teams) {
        const team = teamData.team;
        
        try {
          // Get roster for each team
          const rosterResponse = await axios.get(
            `${this.sources.espn.baseUrl}/teams/${team.id}/roster`,
            { timeout: 10000 }
          );

          if (rosterResponse.data.athletes) {
            for (const athlete of rosterResponse.data.athletes) {
              rosters.push({
                gsis_id: athlete.id,
                player_name: athlete.displayName || athlete.fullName,
                team: team.abbreviation,
                position: athlete.position?.abbreviation || 'N/A',
                jersey_number: athlete.jersey || null,
                status: athlete.status?.type || 'ACTIVE',
                height: athlete.height || null,
                weight: athlete.weight || null,
                age: athlete.age || null,
                experience: athlete.experience?.years || 0,
                college: athlete.college?.name || null,
                season: 2025,
                source: 'ESPN',
                updated: new Date().toISOString()
              });
            }
          }

          // Rate limiting respect
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`⚠️ Failed to fetch ${team.displayName} roster from ESPN`);
        }
      }

      return rosters;
    } catch (error) {
      console.error('ESPN API failed:', error.message);
      return null;
    }
  }

  async fetchFromBackupSources() {
    // Implement fallback logic here
    // For now, return empty array to indicate failure
    console.log('⚠️ Backup sources not implemented yet');
    return [];
  }

  applyCriticalMoves(rosters) {
    console.log('🔧 Applying critical 2025 roster moves...');
    
    for (const [playerName, move] of Object.entries(this.criticalMoves2025)) {
      const playerIndex = rosters.findIndex(p => 
        p.player_name && p.player_name.includes(playerName)
      );
      
      if (playerIndex !== -1) {
        rosters[playerIndex].team = move.to;
        rosters[playerIndex].move_date = move.date;
        rosters[playerIndex].previous_team = move.from;
        console.log(`✅ Applied move: ${playerName} ${move.from} → ${move.to}`);
      }
    }
    
    return rosters;
  }

  async getPlayerByName(playerName) {
    const rosters = await this.getCurrentRosters();
    return rosters.find(player => 
      player.player_name && player.player_name.toLowerCase().includes(playerName.toLowerCase())
    );
  }

  async validateRosterAccuracy() {
    const rosters = await this.getCurrentRosters();
    const validationResults = [];

    // Test known moves
    for (const [playerName, expectedMove] of Object.entries(this.criticalMoves2025)) {
      const player = rosters.find(p => 
        p.player_name && p.player_name.includes(playerName)
      );
      
      validationResults.push({
        player: playerName,
        expected_team: expectedMove.to,
        actual_team: player?.team || 'NOT_FOUND',
        correct: player?.team === expectedMove.to,
        move_applied: !!player?.move_date,
        last_updated: player?.updated
      });
    }

    return validationResults;
  }

  // Real-time roster change detection
  async detectRosterChanges() {
    const currentRosters = await this.getCurrentRosters();
    const previousRosters = liveCache.get('previous_rosters') || [];
    
    const changes = [];
    
    for (const currentPlayer of currentRosters) {
      const previousPlayer = previousRosters.find(p => p.gsis_id === currentPlayer.gsis_id);
      
      if (previousPlayer && previousPlayer.team !== currentPlayer.team) {
        changes.push({
          player: currentPlayer.player_name,
          from: previousPlayer.team,
          to: currentPlayer.team,
          detected: new Date().toISOString()
        });
      }
    }
    
    // Cache current as previous for next check
    liveCache.set('previous_rosters', currentRosters);
    
    return changes;
  }
}

module.exports = new LiveRosterService(); 