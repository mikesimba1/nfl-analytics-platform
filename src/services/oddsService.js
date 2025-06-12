// Real-Time Odds Service - Live Data Integration
// Fetches odds from multiple sources: DraftKings, FanDuel, BetMGM, Caesars
// Updates every 30 seconds during game weeks

class OddsService {
  constructor() {
    this.apiKeys = {
      theOddsApi: process.env.NEXT_PUBLIC_ODDS_API_KEY,
      sportsDataIO: process.env.NEXT_PUBLIC_SPORTSDATA_API_KEY,
      rapidApi: process.env.NEXT_PUBLIC_RAPIDAPI_KEY
    }
    
    this.endpoints = {
      theOddsApi: 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds',
      sportsDataIO: 'https://api.sportsdata.io/v3/nfl/odds/json/GameOddsByWeek',
      espnApi: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
    }
    
    this.cache = new Map()
    this.lastUpdate = null
    this.updateInterval = 30000 // 30 seconds
  }

  async fetchLiveOdds(week = 1, season = 2025) {
    try {
      // Check cache first
      const cacheKey = `odds_${season}_${week}`
      if (this.cache.has(cacheKey) && this.isDataFresh(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      // Fetch from multiple sources in parallel
      const [theOddsData, sportsDataIOData, espnData] = await Promise.allSettled([
        this.fetchFromTheOddsApi(),
        this.fetchFromSportsDataIO(week, season),
        this.fetchFromESPN()
      ])

      // Combine and normalize data
      const combinedOdds = this.combineOddsData({
        theOdds: theOddsData.status === 'fulfilled' ? theOddsData.value : null,
        sportsDataIO: sportsDataIOData.status === 'fulfilled' ? sportsDataIOData.value : null,
        espn: espnData.status === 'fulfilled' ? espnData.value : null
      })

      // Cache the result
      this.cache.set(cacheKey, {
        data: combinedOdds,
        timestamp: Date.now(),
        source: 'multiple_apis',
        confidence: this.calculateConfidence(combinedOdds)
      })

      return combinedOdds

    } catch (error) {
      console.error('Error fetching live odds:', error)
      return this.getFallbackOdds(week, season)
    }
  }

  async fetchFromTheOddsApi() {
    if (!this.apiKeys.theOddsApi) {
      throw new Error('The Odds API key not configured')
    }

    const response = await fetch(
      `${this.endpoints.theOddsApi}?apiKey=${this.apiKeys.theOddsApi}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`
    )

    if (!response.ok) {
      throw new Error(`The Odds API error: ${response.status}`)
    }

    return await response.json()
  }

  async fetchFromSportsDataIO(week, season) {
    if (!this.apiKeys.sportsDataIO) {
      throw new Error('SportsData.io API key not configured')
    }

    const response = await fetch(
      `${this.endpoints.sportsDataIO}/${season}/${week}?key=${this.apiKeys.sportsDataIO}`
    )

    if (!response.ok) {
      throw new Error(`SportsData.io API error: ${response.status}`)
    }

    return await response.json()
  }

  async fetchFromESPN() {
    const response = await fetch(this.endpoints.espnApi)
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`)
    }

    return await response.json()
  }

  combineOddsData({ theOdds, sportsDataIO, espn }) {
    const combinedData = []

    // Process The Odds API data
    if (theOdds && Array.isArray(theOdds)) {
      theOdds.forEach(game => {
        const gameData = this.normalizeTheOddsData(game)
        if (gameData) combinedData.push(gameData)
      })
    }

    // Process SportsData.io data
    if (sportsDataIO && Array.isArray(sportsDataIO)) {
      sportsDataIO.forEach(game => {
        const gameData = this.normalizeSportsDataIOData(game)
        if (gameData) {
          const existingGame = combinedData.find(g => g.gameId === gameData.gameId)
          if (existingGame) {
            this.mergeOddsData(existingGame, gameData)
          } else {
            combinedData.push(gameData)
          }
        }
      })
    }

    // Process ESPN data
    if (espn && espn.events) {
      espn.events.forEach(event => {
        const gameData = this.normalizeESPNData(event)
        if (gameData) {
          const existingGame = combinedData.find(g => g.gameId === gameData.gameId)
          if (existingGame) {
            this.mergeOddsData(existingGame, gameData)
          } else {
            combinedData.push(gameData)
          }
        }
      })
    }

    return combinedData.map(game => ({
      ...game,
      lastUpdated: new Date().toISOString(),
      dataQuality: this.assessDataQuality(game)
    }))
  }

  normalizeTheOddsData(game) {
    if (!game.bookmakers || game.bookmakers.length === 0) return null

    const homeTeam = game.home_team
    const awayTeam = game.away_team
    const gameTime = game.commence_time

    // Extract odds from multiple bookmakers
    const odds = {
      spread: this.extractSpreadOdds(game.bookmakers),
      total: this.extractTotalOdds(game.bookmakers),
      moneyline: this.extractMoneylineOdds(game.bookmakers)
    }

    return {
      gameId: `${awayTeam}_${homeTeam}_${new Date(gameTime).getTime()}`,
      homeTeam: this.normalizeTeamName(homeTeam),
      awayTeam: this.normalizeTeamName(awayTeam),
      gameTime,
      odds,
      source: 'the_odds_api'
    }
  }

  extractSpreadOdds(bookmakers) {
    const spreads = []
    
    bookmakers.forEach(bookmaker => {
      const spreadMarket = bookmaker.markets?.find(m => m.key === 'spreads')
      if (spreadMarket && spreadMarket.outcomes) {
        spreadMarket.outcomes.forEach(outcome => {
          spreads.push({
            sportsbook: bookmaker.title,
            team: this.normalizeTeamName(outcome.name),
            spread: outcome.point,
            odds: outcome.price,
            lastUpdate: spreadMarket.last_update
          })
        })
      }
    })

    return spreads
  }

  extractTotalOdds(bookmakers) {
    const totals = []
    
    bookmakers.forEach(bookmaker => {
      const totalMarket = bookmaker.markets?.find(m => m.key === 'totals')
      if (totalMarket && totalMarket.outcomes) {
        totalMarket.outcomes.forEach(outcome => {
          totals.push({
            sportsbook: bookmaker.title,
            type: outcome.name, // 'Over' or 'Under'
            total: outcome.point,
            odds: outcome.price,
            lastUpdate: totalMarket.last_update
          })
        })
      }
    })

    return totals
  }

  extractMoneylineOdds(bookmakers) {
    const moneylines = []
    
    bookmakers.forEach(bookmaker => {
      const moneylineMarket = bookmaker.markets?.find(m => m.key === 'h2h')
      if (moneylineMarket && moneylineMarket.outcomes) {
        moneylineMarket.outcomes.forEach(outcome => {
          moneylines.push({
            sportsbook: bookmaker.title,
            team: this.normalizeTeamName(outcome.name),
            odds: outcome.price,
            lastUpdate: moneylineMarket.last_update
          })
        })
      }
    })

    return moneylines
  }

  normalizeTeamName(teamName) {
    // Convert full team names to abbreviations
    const teamMap = {
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
      'Washington Commanders': 'WAS'
    }

    return teamMap[teamName] || teamName
  }

  isDataFresh(cacheKey) {
    const cached = this.cache.get(cacheKey)
    if (!cached) return false
    
    const age = Date.now() - cached.timestamp
    return age < this.updateInterval
  }

  calculateConfidence(oddsData) {
    if (!oddsData || oddsData.length === 0) return 0
    
    let totalSources = 0
    let gamesWithMultipleSources = 0
    
    oddsData.forEach(game => {
      const spreadSources = game.odds?.spread?.length || 0
      const totalSources = game.odds?.total?.length || 0
      const mlSources = game.odds?.moneyline?.length || 0
      
      if (spreadSources > 1 || totalSources > 1 || mlSources > 1) {
        gamesWithMultipleSources++
      }
      totalSources++
    })
    
    return totalSources > 0 ? (gamesWithMultipleSources / totalSources) * 100 : 0
  }

  getFallbackOdds(week, season) {
    // Return mock data structure when APIs fail
    return [{
      gameId: 'fallback_data',
      homeTeam: 'TBD',
      awayTeam: 'TBD',
      gameTime: new Date().toISOString(),
      odds: {
        spread: [],
        total: [],
        moneyline: []
      },
      source: 'fallback',
      dataQuality: 'low',
      lastUpdated: new Date().toISOString()
    }]
  }

  assessDataQuality(game) {
    const spreadCount = game.odds?.spread?.length || 0
    const totalCount = game.odds?.total?.length || 0
    const mlCount = game.odds?.moneyline?.length || 0
    
    const totalSources = spreadCount + totalCount + mlCount
    
    if (totalSources >= 9) return 'excellent' // 3+ sources for each market
    if (totalSources >= 6) return 'good'      // 2+ sources for each market
    if (totalSources >= 3) return 'fair'     // 1+ source for each market
    return 'poor'
  }
}

export default new OddsService() 