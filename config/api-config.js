// NFL Analytics Platform - API Configuration
// Centralized configuration for all data sources to prevent future data issues

export const API_CONFIG = {
  // DATA SOURCE PRIORITIES (1 = highest priority)
  dataSources: {
    schedule: [
      { name: 'NFL.com', priority: 1, endpoint: 'https://www.nfl.com/schedules/2025/', reliable: true },
      { name: 'ESPN', priority: 2, endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', reliable: true },
      { name: 'SportsData.io', priority: 3, endpoint: 'https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2025', reliable: true }
    ],
    
    odds: [
      { name: 'The Odds API', priority: 1, endpoint: 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds', reliable: true },
      { name: 'SportsData.io', priority: 2, endpoint: 'https://api.sportsdata.io/v3/nfl/odds/json/GameOddsByWeek', reliable: true },
      { name: 'ESPN', priority: 3, endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', reliable: false }
    ],
    
    playerProps: [
      { name: 'DraftKings', priority: 1, endpoint: 'https://sportsbook-us-nh.draftkings.com/sites/US-NH-SB/api/v5/eventgroups/88808/categories/1000/subcategories/4511', reliable: true },
      { name: 'FanDuel', priority: 2, endpoint: 'https://sbapi.nj.fanduel.com/api/content-managed-cms/query', reliable: true },
      { name: 'BetMGM', priority: 3, endpoint: 'https://sports.nj.betmgm.com/en/sports/api/widget/widgetdata', reliable: true }
    ],
    
    injuries: [
      { name: 'ESPN', priority: 1, endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news', reliable: true },
      { name: 'NFL.com', priority: 2, endpoint: 'https://www.nfl.com/news/injuries/', reliable: true },
      { name: 'SportsData.io', priority: 3, endpoint: 'https://api.sportsdata.io/v3/nfl/scores/json/InjuriesByWeek', reliable: true }
    ],
    
    weather: [
      { name: 'OpenWeatherMap', priority: 1, endpoint: 'https://api.openweathermap.org/data/2.5/weather', reliable: true },
      { name: 'WeatherAPI', priority: 2, endpoint: 'https://api.weatherapi.com/v1/current.json', reliable: true }
    ]
  },

  // UPDATE INTERVALS (in milliseconds)
  updateIntervals: {
    schedule: 86400000,    // 24 hours (schedule doesn't change often)
    odds: 30000,           // 30 seconds (odds change frequently)
    playerProps: 60000,    // 1 minute (props change moderately)
    injuries: 300000,      // 5 minutes (injury status updates)
    weather: 600000,       // 10 minutes (weather updates)
    liveScores: 10000      // 10 seconds (during games)
  },

  // DATA VALIDATION RULES
  validation: {
    schedule: {
      requiredFields: ['homeTeam', 'awayTeam', 'gameTime', 'week', 'season'],
      teamFormat: /^[A-Z]{2,3}$/,  // 2-3 letter team codes
      seasonRange: [2024, 2030],
      weekRange: [1, 18]
    },
    
    odds: {
      requiredFields: ['spread', 'total', 'moneyline'],
      spreadRange: [-30, 30],
      totalRange: [30, 80],
      moneylineRange: [-2000, 2000]
    },
    
    playerProps: {
      requiredFields: ['player', 'stat', 'line', 'odds'],
      statTypes: ['passing_yards', 'rushing_yards', 'receiving_yards', 'touchdowns', 'receptions', 'completions'],
      oddsRange: [-500, 500]
    }
  },

  // ERROR HANDLING & FALLBACKS
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackToCache: true,
    cacheExpiry: {
      schedule: 86400000,  // 24 hours
      odds: 300000,        // 5 minutes
      playerProps: 600000, // 10 minutes
      injuries: 1800000    // 30 minutes
    }
  },

  // QUALITY THRESHOLDS
  qualityThresholds: {
    minimumSources: 2,           // Require at least 2 sources for high confidence
    dataFreshnessMinutes: 30,    // Data older than 30 minutes is stale
    consensusThreshold: 0.8,     // 80% agreement between sources
    confidenceMinimum: 0.6       // Minimum confidence for recommendations
  }
}

// TEAM STANDARDIZATION
export const TEAM_STANDARDIZATION = {
  // Map various team name formats to standard abbreviations
  nameMap: {
    // Full names
    'Arizona Cardinals': 'ARI',
    'Atlanta Falcons': 'ATL',
    'Baltimore Ravens': 'BAL',
    'Buffalo Bills': 'BUF',
    'Carolina Panthers': 'CAR',
    'Chicago Bears': 'CHI',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Dallas Cowboys': 'DAL',
    'Denver Broncos': 'DEN',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Miami Dolphins': 'MIA',
    'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE',
    'New Orleans Saints': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Philadelphia Eagles': 'PHI',
    'Pittsburgh Steelers': 'PIT',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
    'Tampa Bay Buccaneers': 'TB',
    'Tennessee Titans': 'TEN',
    'Washington Commanders': 'WAS',
    
    // Alternative formats
    'Cardinals': 'ARI',
    'Falcons': 'ATL',
    'Ravens': 'BAL',
    'Bills': 'BUF',
    'Panthers': 'CAR',
    'Bears': 'CHI',
    'Bengals': 'CIN',
    'Browns': 'CLE',
    'Cowboys': 'DAL',
    'Broncos': 'DEN',
    'Lions': 'DET',
    'Packers': 'GB',
    'Texans': 'HOU',
    'Colts': 'IND',
    'Jaguars': 'JAX',
    'Chiefs': 'KC',
    'Raiders': 'LV',
    'Chargers': 'LAC',
    'Rams': 'LAR',
    'Dolphins': 'MIA',
    'Vikings': 'MIN',
    'Patriots': 'NE',
    'Saints': 'NO',
    'Giants': 'NYG',
    'Jets': 'NYJ',
    'Eagles': 'PHI',
    'Steelers': 'PIT',
    '49ers': 'SF',
    'Seahawks': 'SEA',
    'Buccaneers': 'TB',
    'Titans': 'TEN',
    'Commanders': 'WAS'
  }
}

// SCHEDULE VERIFICATION SYSTEM
export const SCHEDULE_VERIFICATION = {
  // Known 2025 NFL facts for verification
  knownFacts: {
    kickoffGame: {
      date: '2025-09-04',
      homeTeam: 'PHI',
      awayTeam: 'DAL',
      network: 'NBC',
      gameType: 'KICKOFF_GAME'
    },
    
    internationalGames: [
      {
        date: '2025-09-05',
        homeTeam: 'LAC',
        awayTeam: 'KC',
        location: 'São Paulo, Brazil',
        stadium: 'Arena Corinthians',
        network: 'Prime Video'
      }
    ],
    
    seasonStructure: {
      regularSeasonWeeks: 18,
      gamesPerWeek: 16,
      totalRegularSeasonGames: 272,
      playoffStart: '2026-01-10',
      superBowl: {
        date: '2026-02-08',
        location: 'Santa Clara, CA',
        stadium: 'Levi\'s Stadium'
      }
    }
  },

  // Validation functions
  validateWeek1Schedule: (games) => {
    const kickoffGame = games.find(g => g.gameType === 'KICKOFF_GAME')
    if (!kickoffGame || kickoffGame.homeTeam !== 'PHI' || kickoffGame.awayTeam !== 'DAL') {
      return { valid: false, error: 'Invalid Week 1 kickoff game' }
    }
    
    const brazilGame = games.find(g => g.location?.includes('Brazil'))
    if (!brazilGame || brazilGame.homeTeam !== 'LAC' || brazilGame.awayTeam !== 'KC') {
      return { valid: false, error: 'Invalid Brazil international game' }
    }
    
    return { valid: true }
  }
}

// AUTOMATED UPDATE SYSTEM
export const UPDATE_SYSTEM = {
  // Schedule for automatic data updates
  updateSchedule: {
    // Daily schedule verification (in case of changes)
    scheduleCheck: {
      time: '06:00',  // 6 AM daily
      timezone: 'America/New_York',
      action: 'verifySchedule'
    },
    
    // Odds updates (frequent during game weeks)
    oddsUpdate: {
      interval: 30000,  // 30 seconds
      activeHours: [9, 23],  // 9 AM to 11 PM
      action: 'updateOdds'
    },
    
    // Player props updates
    propsUpdate: {
      interval: 60000,  // 1 minute
      activeHours: [10, 22],  // 10 AM to 10 PM
      action: 'updatePlayerProps'
    },
    
    // Injury reports (multiple times daily)
    injuryUpdate: {
      times: ['09:00', '15:00', '21:00'],  // 9 AM, 3 PM, 9 PM
      timezone: 'America/New_York',
      action: 'updateInjuries'
    }
  }
}

export default API_CONFIG 