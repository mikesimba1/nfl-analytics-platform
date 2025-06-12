const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

// Cache for 2 hours since rosters don't change that frequently (offseason)
const rosterCache = new NodeCache({ stdTTL: 7200 });

class ModernRosterService {
  constructor() {
    this.espnBaseUrl = 'http://site.api.espn.com/apis/site/v2/sports/football/nfl';
    this.savedDataPath = path.join(__dirname, '../../data/saved-rosters-2025.json');
    
    // Known 2025 roster updates (post-draft, post-free agency)
    this.rosterUpdates2025 = {
      // Major moves that ESPN might not have updated yet
      'Stefon Diggs': { team: 'NE', position: 'WR', previousTeam: 'HOU' },
      'Joe Flacco': { team: 'CLE', position: 'QB', previousTeam: 'FA' },
      'Aaron Rodgers': { team: 'PIT', position: 'QB', previousTeam: 'NYJ' },
      'George Pickens': { team: 'DAL', position: 'WR', previousTeam: 'PIT' },
      'Nick Chubb': { team: 'HOU', position: 'RB', previousTeam: 'CLE' },
      'Davante Adams': { team: 'LAR', position: 'WR', previousTeam: 'LV' },
      'Najee Harris': { team: 'LAC', position: 'RB', previousTeam: 'PIT' },
      'Caleb Williams': { team: 'CHI', position: 'QB', previousTeam: 'USC', type: 'draftPick' },
      'Travis Hunter': { team: 'JAX', position: 'WR', previousTeam: 'Colorado', type: 'draftPick' },
      'Luther Burden III': { team: 'CHI', position: 'WR', previousTeam: 'Missouri', type: 'draftPick' },
      'Colston Loveland': { team: 'CHI', position: 'TE', previousTeam: 'Michigan', type: 'draftPick' },
      'Kaleb Johnson': { team: 'PIT', position: 'RB', previousTeam: 'Iowa', type: 'draftPick' },
      'Omarion Hampton': { team: 'LAC', position: 'RB', previousTeam: 'UNC', type: 'draftPick' },
      'Matthew Golden': { team: 'GB', position: 'WR', previousTeam: 'Texas', type: 'draftPick' },
      'Tre Harris': { team: 'LAC', position: 'WR', previousTeam: 'Ole Miss', type: 'draftPick' }
    };

    // NFL team ID mapping for ESPN API
    this.teamIds = {
      'ARI': 22, 'ATL': 1, 'BAL': 33, 'BUF': 2, 'CAR': 29, 'CHI': 3,
      'CIN': 4, 'CLE': 5, 'DAL': 6, 'DEN': 7, 'DET': 8, 'GB': 9,
      'HOU': 34, 'IND': 11, 'JAX': 30, 'KC': 12, 'LV': 13, 'LAC': 24,
      'LAR': 14, 'MIA': 15, 'MIN': 16, 'NE': 17, 'NO': 18, 'NYG': 19,
      'NYJ': 20, 'PHI': 21, 'PIT': 23, 'SF': 25, 'SEA': 26, 'TB': 27,
      'TEN': 10, 'WAS': 28
    };

    this.idToTeam = Object.fromEntries(
      Object.entries(this.teamIds).map(([team, id]) => [id, team])
    );
  }

  /**
   * Load roster data from local storage first, fallback to ESPN API
   */
  async getCurrentRosters() {
    const cacheKey = 'modern_rosters_2025';
    
    // Check memory cache first
    let rosters = rosterCache.get(cacheKey);
    if (rosters) {
      console.log('📋 Returning cached modern roster data');
      return rosters;
    }

    try {
      // Try to load from saved local data first
      if (fs.existsSync(this.savedDataPath)) {
        console.log('💾 Loading saved roster data from local storage...');
        const savedData = JSON.parse(fs.readFileSync(this.savedDataPath, 'utf8'));
        
        if (savedData.rosters && savedData.rosters.length > 0) {
          console.log(`✅ Loaded ${savedData.rosters.length} players from local storage (${savedData.teams} teams)`);
          console.log(`📅 Data last updated: ${new Date(savedData.lastUpdated).toLocaleString()}`);
          
          // Cache the loaded data
          rosterCache.set(cacheKey, savedData.rosters);
          
          return savedData.rosters;
        }
      }

      // Fallback to live ESPN API if local data doesn't exist or is invalid
      console.log('🔄 Local data not found, fetching from ESPN API...');
      return await this.fetchFromESPN();
      
    } catch (error) {
      console.error('❌ Error loading roster data:', error.message);
      
      // Final fallback to minimal data
      return this.getFallbackRosters();
    }
  }

  /**
   * Fetch fresh data from ESPN API and save locally
   */
  async fetchFromESPN() {
    try {
      console.log('🔄 Fetching current NFL rosters from ESPN (2025 season)...');
      let rosters = [];

      // Get all teams first
      const teamsResponse = await axios.get(`${this.espnBaseUrl}/teams`, {
        timeout: 15000,
        headers: { 'User-Agent': 'NFL-Analytics-Platform/2.0' }
      });

      const teams = teamsResponse.data.sports[0].leagues[0].teams;
      console.log(`📊 Found ${teams.length} NFL teams`);

      // Fetch rosters for each team
      for (const teamData of teams) {
        const team = teamData.team;
        
        try {
          const rosterResponse = await axios.get(
            `${this.espnBaseUrl}/teams/${team.id}/roster`, 
            { 
              timeout: 10000,
              headers: { 'User-Agent': 'NFL-Analytics-Platform/2.0' }
            }
          );

          let playersAdded = 0;

          if (rosterResponse.data.athletes) {
            for (const athleteGroup of rosterResponse.data.athletes) {
              // Handle ESPN's nested structure - check if this is a position group or individual player
              if (athleteGroup.items && Array.isArray(athleteGroup.items)) {
                // This is a position group with players inside
                const positionName = athleteGroup.position || 'Unknown Position';
                
                for (const athlete of athleteGroup.items) {
                  const playerName = this.extractPlayerName(athlete);
                  const position = this.extractPosition(athlete) || positionName;
                  
                  if (playerName && playerName.trim().length > 0) {
                    rosters.push({
                      gsis_id: athlete.id || `espn_${team.abbreviation}_${Date.now()}_${Math.random()}`,
                      player_name: playerName,
                      team: team.abbreviation,
                      position: position,
                      jersey_number: athlete.jersey || null,
                      status: this.extractStatus(athlete),
                      height: athlete.height || null,
                      weight: athlete.weight || null,
                      age: athlete.age || null,
                      experience: athlete.experience?.years || 0,
                      college: athlete.college?.name || null,
                      season: 2025,
                      source: 'ESPN_Modern',
                      updated: new Date().toISOString()
                    });
                    playersAdded++;
                  }
                }
              } else if (athleteGroup.id) {
                // This is an individual player object
                const playerName = this.extractPlayerName(athleteGroup);
                const position = this.extractPosition(athleteGroup);
                
                if (playerName && playerName.trim().length > 0) {
                  rosters.push({
                    gsis_id: athleteGroup.id || `espn_${team.abbreviation}_${Date.now()}_${Math.random()}`,
                    player_name: playerName,
                    team: team.abbreviation,
                    position: position,
                    jersey_number: athleteGroup.jersey || null,
                    status: this.extractStatus(athleteGroup),
                    height: athleteGroup.height || null,
                    weight: athleteGroup.weight || null,
                    age: athleteGroup.age || null,
                    experience: athleteGroup.experience?.years || 0,
                    college: athleteGroup.college?.name || null,
                    season: 2025,
                    source: 'ESPN_Modern',
                    updated: new Date().toISOString()
                  });
                  playersAdded++;
                }
              }
            }
          }
          
          console.log(`✅ Loaded ${playersAdded} players from ${team.displayName}`);

          // Rate limiting - be respectful
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
          console.warn(`⚠️ Failed to fetch ${team.displayName} roster: ${error.message}`);
        }
      }

      // Apply 2025 roster updates
      rosters = this.apply2025Updates(rosters);
      
      console.log(`✅ Successfully loaded ${rosters.length} players from ${teams.length} teams`);
      
      // Save to local storage for next time
      await this.saveRostersLocally(rosters);
      
      // Cache for 2 hours
      rosterCache.set('modern_rosters_2025', rosters);
      
      return rosters;
    } catch (error) {
      console.error('❌ Failed to fetch from ESPN:', error.message);
      throw error;
    }
  }

  /**
   * Save roster data locally
   */
  async saveRostersLocally(rosters) {
    try {
      const savedData = {
        rosters: rosters,
        lastUpdated: new Date().toISOString(),
        source: 'ESPN_API',
        totalPlayers: rosters.length,
        teams: [...new Set(rosters.map(p => p.team))].length,
        version: '2025.1'
      };

      // Ensure data directory exists
      const dataDir = path.dirname(this.savedDataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.savedDataPath, JSON.stringify(savedData, null, 2));
      console.log('💾 Roster data saved locally for future use');
    } catch (error) {
      console.warn('⚠️ Failed to save roster data locally:', error.message);
    }
  }

  extractPlayerName(athlete) {
    // Try multiple name fields
    return athlete.displayName || 
           athlete.fullName || 
           athlete.name ||
           (athlete.firstName && athlete.lastName ? `${athlete.firstName} ${athlete.lastName}` : null) ||
           'Unknown Player';
  }

  extractPosition(athlete) {
    return athlete.position?.abbreviation || 
           athlete.position?.name || 
           athlete.position || 
           'N/A';
  }

  extractStatus(athlete) {
    if (athlete.status?.type) {
      return athlete.status.type;
    }
    if (athlete.active === false) {
      return 'INACTIVE';
    }
    return 'ACTIVE';
  }

  apply2025Updates(rosters) {
    console.log('🔧 Applying 2025 roster updates...');
    let updatesApplied = 0;

    for (const [playerName, update] of Object.entries(this.rosterUpdates2025)) {
      // Find existing player and update team
      const playerIndex = rosters.findIndex(p => 
        p.player_name && p.player_name.toLowerCase().includes(playerName.toLowerCase())
      );
      
      if (playerIndex !== -1) {
        rosters[playerIndex].team = update.team;
        rosters[playerIndex].position = update.position;
        rosters[playerIndex].previous_team = update.previousTeam;
        rosters[playerIndex].update_type = update.type || 'trade';
        rosters[playerIndex].updated_2025 = true;
        updatesApplied++;
        console.log(`✅ Updated: ${playerName} → ${update.team} (${update.position})`);
      } else {
        // Add new player if not found (draft picks, etc.)
        rosters.push({
          gsis_id: `modern_2025_${playerName.replace(/[^a-zA-Z0-9]/g, '_')}`,
          player_name: playerName,
          team: update.team,
          position: update.position,
          status: 'ACTIVE',
          season: 2025,
          source: 'Modern_Update_2025',
          update_type: update.type || 'addition',
          updated_2025: true,
          updated: new Date().toISOString()
        });
        updatesApplied++;
        console.log(`➕ Added: ${playerName} → ${update.team} (${update.position})`);
      }
    }

    console.log(`🎯 Applied ${updatesApplied} roster updates for 2025`);
    return rosters;
  }

  getFallbackRosters() {
    console.log('⚠️ Using fallback roster data');
    
    // Return essential players for testing
    const fallbackRosters = [];
    const essentialPlayers = [
      { name: 'Caleb Williams', team: 'CHI', position: 'QB' },
      { name: 'Joe Flacco', team: 'CLE', position: 'QB' },
      { name: 'Stefon Diggs', team: 'NE', position: 'WR' },
      { name: 'Aaron Rodgers', team: 'PIT', position: 'QB' },
      { name: 'George Pickens', team: 'DAL', position: 'WR' },
      { name: 'Travis Hunter', team: 'JAX', position: 'WR' },
      { name: 'Josh Allen', team: 'BUF', position: 'QB' },
      { name: 'Patrick Mahomes', team: 'KC', position: 'QB' },
      { name: 'Christian McCaffrey', team: 'SF', position: 'RB' },
      { name: 'Tyreek Hill', team: 'MIA', position: 'WR' }
    ];

    for (const player of essentialPlayers) {
      fallbackRosters.push({
        gsis_id: `fallback_${player.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
        player_name: player.name,
        team: player.team,
        position: player.position,
        status: 'ACTIVE',
        season: 2025,
        source: 'Fallback_2025',
        updated: new Date().toISOString()
      });
    }

    return fallbackRosters;
  }

  async forceRefresh() {
    console.log('🔄 Force refreshing modern roster cache...');
    rosterCache.del('modern_rosters_2025');
    // Always fetch fresh data from ESPN when forcing refresh
    return await this.fetchFromESPN();
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
    return rosters.filter(player => 
      player.player_name && player.player_name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async validateRosterUpdates() {
    const rosters = await this.getCurrentRosters();
    const validationResults = [];

    for (const [playerName, expectedUpdate] of Object.entries(this.rosterUpdates2025)) {
      const player = rosters.find(p => 
        p.player_name && p.player_name.toLowerCase().includes(playerName.toLowerCase())
      );
      
      validationResults.push({
        player: playerName,
        expected_team: expectedUpdate.team,
        actual_team: player?.team || 'NOT_FOUND',
        correct: player?.team === expectedUpdate.team,
        update_applied: !!player?.updated_2025,
        source: player?.source || 'MISSING'
      });
    }

    return validationResults;
  }
}

module.exports = new ModernRosterService(); 