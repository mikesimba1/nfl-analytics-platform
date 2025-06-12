const axios = require('axios');
const csv = require('csv-parser');
const NodeCache = require('node-cache');
const winston = require('winston');

// Cache for 6 hours (rosters don't change that frequently)
const rosterCache = new NodeCache({ stdTTL: 21600 });

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

class NFLverseRosterService {
  constructor() {
    this.baseUrl = 'https://github.com/nflverse/nflverse-data/releases/download';
    this.endpoints = {
      seasonalRosters: `${this.baseUrl}/rosters/rosters.csv`,
      weeklyRosters: `${this.baseUrl}/weekly_rosters/weekly_rosters.csv`, 
      depthCharts: `${this.baseUrl}/depth_charts/depth_charts.csv`,
      injuries: `${this.baseUrl}/injuries/injuries.csv`
    };
  }

  /**
   * Parse CSV data from URL
   */
  async parseCSVFromUrl(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 30000
      });

      return new Promise((resolve, reject) => {
        const results = [];
        response.data
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      logger.error(`Failed to parse CSV from ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Get current season rosters (most recent data)
   */
  async getCurrentRosters() {
    const cacheKey = 'current_rosters';
    let cached = rosterCache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached roster data');
      return cached;
    }

    try {
      logger.info('Fetching current rosters from NFLverse...');
      const rosters = await this.parseCSVFromUrl(this.endpoints.seasonalRosters);
      
      // Get the most recent season data
      const currentSeason = Math.max(...rosters.map(r => parseInt(r.season) || 0));
      const currentRosters = rosters.filter(r => parseInt(r.season) === currentSeason);

      // Process and clean the data
      const processedRosters = currentRosters.map(player => ({
        player_id: player.player_id,
        player_name: player.player_name || player.full_name,
        first_name: player.first_name,
        last_name: player.last_name,
        position: player.position,
        position_group: player.position_group,
        team: player.team,
        season: parseInt(player.season),
        jersey_number: player.jersey_number,
        status: player.status,
        depth_chart_position: player.depth_chart_position,
        birth_date: player.birth_date,
        height: player.height,
        weight: player.weight,
        college: player.college,
        years_exp: parseInt(player.years_exp) || 0,
        headshot_url: player.headshot_url
      }));

      logger.info(`Loaded ${processedRosters.length} players from ${currentSeason} season`);
      
      rosterCache.set(cacheKey, processedRosters);
      return processedRosters;
    } catch (error) {
      logger.error('Failed to fetch current rosters:', error.message);
      throw error;
    }
  }

  /**
   * Get depth charts (current starting lineups and depth)
   */
  async getDepthCharts() {
    const cacheKey = 'depth_charts';
    let cached = rosterCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      logger.info('Fetching depth charts from NFLverse...');
      const depthCharts = await this.parseCSVFromUrl(this.endpoints.depthCharts);
      
      // Get most recent week
      const currentWeek = Math.max(...depthCharts.map(d => parseInt(d.week) || 0));
      const currentDepthCharts = depthCharts.filter(d => parseInt(d.week) === currentWeek);

      const processedDepthCharts = currentDepthCharts.map(entry => ({
        player_id: entry.player_id,
        player_name: entry.player_name,
        team: entry.team,
        position: entry.position,
        depth_team: entry.depth_team,
        depth_position: entry.depth_position,
        week: parseInt(entry.week),
        season: parseInt(entry.season),
        game_type: entry.game_type
      }));

      logger.info(`Loaded ${processedDepthCharts.length} depth chart entries`);
      
      rosterCache.set(cacheKey, processedDepthCharts);
      return processedDepthCharts;
    } catch (error) {
      logger.error('Failed to fetch depth charts:', error.message);
      throw error;
    }
  }

  /**
   * Get current injury reports
   */
  async getInjuries() {
    const cacheKey = 'current_injuries';
    let cached = rosterCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      logger.info('Fetching injury reports from NFLverse...');
      const injuries = await this.parseCSVFromUrl(this.endpoints.injuries);
      
      // Get most recent week
      const currentWeek = Math.max(...injuries.map(i => parseInt(i.week) || 0));
      const currentInjuries = injuries.filter(i => parseInt(i.week) === currentWeek);

      const processedInjuries = currentInjuries.map(injury => ({
        player_id: injury.player_id,
        player_name: injury.player_name,
        team: injury.team,
        position: injury.position,
        injury_status: injury.injury_status,
        injury_designation: injury.injury_designation,
        injury_return_date: injury.injury_return_date,
        week: parseInt(injury.week),
        season: parseInt(injury.season),
        report_primary_injury: injury.report_primary_injury,
        report_secondary_injury: injury.report_secondary_injury
      }));

      logger.info(`Loaded ${processedInjuries.length} injury reports`);
      
      rosterCache.set(cacheKey, processedInjuries);
      return processedInjuries;
    } catch (error) {
      logger.error('Failed to fetch injury reports:', error.message);
      throw error;
    }
  }

  /**
   * Get player by ID with current team info
   */
  async getPlayerById(playerId) {
    const rosters = await this.getCurrentRosters();
    return rosters.find(player => player.player_id === playerId);
  }

  /**
   * Get players by team
   */
  async getPlayersByTeam(team) {
    const rosters = await this.getCurrentRosters();
    return rosters.filter(player => player.team === team);
  }

  /**
   * Get players by position
   */
  async getPlayersByPosition(position) {
    const rosters = await this.getCurrentRosters();
    return rosters.filter(player => player.position === position);
  }

  /**
   * Get starters by team and position from depth charts
   */
  async getStartersByTeamAndPosition(team, position) {
    const depthCharts = await this.getDepthCharts();
    return depthCharts.filter(entry => 
      entry.team === team && 
      entry.position === position && 
      entry.depth_position === '1'
    );
  }

  /**
   * Validate roster data and flag major changes
   */
  async validateRosterChanges() {
    try {
      const rosters = await this.getCurrentRosters();
      const majorMoves = [];

      // Key players to monitor (example list)
      const keyPlayers = [
        { id: 'stefon-diggs', name: 'Stefon Diggs', lastKnownTeam: 'BUF' },
        { id: 'calvin-ridley', name: 'Calvin Ridley', lastKnownTeam: 'JAX' },
        { id: 'saquon-barkley', name: 'Saquon Barkley', lastKnownTeam: 'NYG' },
        { id: 'caleb-williams', name: 'Caleb Williams', lastKnownTeam: 'CHI' }
      ];

      for (const keyPlayer of keyPlayers) {
        const currentPlayer = rosters.find(p => 
          p.player_name.toLowerCase().includes(keyPlayer.name.toLowerCase())
        );

        if (currentPlayer && currentPlayer.team !== keyPlayer.lastKnownTeam) {
          majorMoves.push({
            player: currentPlayer.player_name,
            from: keyPlayer.lastKnownTeam,
            to: currentPlayer.team,
            position: currentPlayer.position,
            detected: new Date().toISOString()
          });
        }
      }

      if (majorMoves.length > 0) {
        logger.info('Major roster moves detected:', majorMoves);
      }

      return {
        totalPlayers: rosters.length,
        majorMoves,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to validate roster changes:', error.message);
      throw error;
    }
  }

  /**
   * Force refresh all cached data
   */
  async refreshAllData() {
    logger.info('Force refreshing all roster data...');
    rosterCache.flushAll();
    
    const [rosters, depthCharts, injuries] = await Promise.all([
      this.getCurrentRosters(),
      this.getDepthCharts(),
      this.getInjuries()
    ]);

    return {
      rosters: rosters.length,
      depthCharts: depthCharts.length,
      injuries: injuries.length,
      refreshed: new Date().toISOString()
    };
  }
}

module.exports = new NFLverseRosterService(); 