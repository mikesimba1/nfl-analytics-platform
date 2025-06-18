// Enhanced ESPN API Service for Real-time Data
class ESPNService {
  constructor() {
    this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'
    this.cache = new Map()
    this.cacheTimeout = 10 * 60 * 1000 // 10 minutes
  }

  async fetchCurrentRosters() {
    const cacheKey = 'current_rosters'
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/teams`)
      if (!response.ok) throw new Error(`ESPN API error: ${response.status}`)
      
      const data = await response.json()
      const rosters = await this.processTeamRosters(data.sports[0].leagues[0].teams)
      
      this.cache.set(cacheKey, {
        data: rosters,
        timestamp: Date.now()
      })
      
      return rosters
    } catch (error) {
      console.error('ESPN roster fetch error:', error)
      return null
    }
  }

  async processTeamRosters(teams) {
    const rosters = []
    
    for (const teamData of teams) {
      const team = teamData.team
      try {
        const rosterResponse = await fetch(`${this.baseUrl}/teams/${team.id}/roster`)
        if (rosterResponse.ok) {
          const rosterData = await rosterResponse.json()
          const players = this.parseRosterData(rosterData, team.abbreviation)
          rosters.push(...players)
        }
      } catch (error) {
        console.error(`Error fetching roster for ${team.abbreviation}:`, error)
      }
    }
    
    return rosters
  }

  parseRosterData(data, teamAbbr) {
    if (!data.athletes) return []
    
    return data.athletes.map(athlete => ({
      espn_id: athlete.id,
      name: athlete.displayName,
      team: teamAbbr,
      position: athlete.position?.abbreviation || 'N/A',
      jersey: athlete.jersey || null,
      height: athlete.height || null,
      weight: athlete.weight || null,
      age: athlete.age || null,
      experience: athlete.experience?.years || 0,
      status: athlete.status?.type || 'active',
      lastUpdated: new Date().toISOString()
    }))
  }

  async fetchInjuryReport() {
    try {
      // ESPN doesn't have a direct injury endpoint, but we can check player status
      const rosters = await this.fetchCurrentRosters()
      return rosters.filter(player => player.status !== 'active')
    } catch (error) {
      console.error('Injury report fetch error:', error)
      return []
    }
  }
}

export default ESPNService