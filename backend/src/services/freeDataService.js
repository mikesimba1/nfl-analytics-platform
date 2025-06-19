/**
 * FREE NFL DATA SERVICE
 * Integrates all free APIs for comprehensive NFL analytics
 * No paid subscriptions required!
 */

const axios = require('axios');

class FreeDataService {
    constructor() {
        this.APIs = {
            espn: {
                base: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
                core: 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl'
            },
            weather: {
                base: 'https://api.openweathermap.org/data/2.5',
                key: process.env.OPENWEATHER_API_KEY || 'demo_key' // 1000 free calls/day
            },
            theOddsApi: {
                base: 'https://api.the-odds-api.com/v4',
                key: process.env.ODDS_API_KEY || 'demo_key' // 500 free calls/month
            }
        };
        
        // NFL Stadium coordinates for weather data
        this.stadiumCoordinates = {
            'BUF': { lat: 42.7737, lon: -78.7870, name: 'Highmark Stadium' },
            'MIA': { lat: 25.9580, lon: -80.2389, name: 'Hard Rock Stadium' },
            'NE': { lat: 42.0909, lon: -71.2643, name: 'Gillette Stadium' },
            'NYJ': { lat: 40.8135, lon: -74.0745, name: 'MetLife Stadium' },
            'BAL': { lat: 39.2780, lon: -76.6227, name: 'M&T Bank Stadium' },
            'CIN': { lat: 39.0955, lon: -84.5161, name: 'Paycor Stadium' },
            'CLE': { lat: 41.5061, lon: -81.6995, name: 'FirstEnergy Stadium' },
            'PIT': { lat: 40.4468, lon: -80.0158, name: 'Acrisure Stadium' },
            'HOU': { lat: 29.6847, lon: -95.4107, name: 'NRG Stadium' },
            'IND': { lat: 39.7601, lon: -86.1639, name: 'Lucas Oil Stadium' },
            'JAX': { lat: 30.3240, lon: -81.6374, name: 'TIAA Bank Field' },
            'TEN': { lat: 36.1665, lon: -86.7713, name: 'Nissan Stadium' },
            'DEN': { lat: 39.7439, lon: -105.0201, name: 'Empower Field' },
            'KC': { lat: 39.0489, lon: -94.4839, name: 'Arrowhead Stadium' },
            'LV': { lat: 36.0909, lon: -115.1833, name: 'Allegiant Stadium' },
            'LAC': { lat: 33.8634, lon: -118.2611, name: 'SoFi Stadium' },
            'DAL': { lat: 32.7473, lon: -97.0945, name: 'AT&T Stadium' },
            'NYG': { lat: 40.8135, lon: -74.0745, name: 'MetLife Stadium' },
            'PHI': { lat: 39.9008, lon: -75.1675, name: 'Lincoln Financial Field' },
            'WAS': { lat: 38.9076, lon: -76.8645, name: 'FedExField' },
            'CHI': { lat: 41.8623, lon: -87.6167, name: 'Soldier Field' },
            'DET': { lat: 42.3400, lon: -83.0456, name: 'Ford Field' },
            'GB': { lat: 44.5013, lon: -88.0622, name: 'Lambeau Field' },
            'MIN': { lat: 44.9737, lon: -93.2581, name: 'U.S. Bank Stadium' },
            'ATL': { lat: 33.7553, lon: -84.4006, name: 'Mercedes-Benz Stadium' },
            'CAR': { lat: 35.2258, lon: -80.8528, name: 'Bank of America Stadium' },
            'NO': { lat: 29.9511, lon: -90.0812, name: 'Caesars Superdome' },
            'TB': { lat: 27.9759, lon: -82.5033, name: 'Raymond James Stadium' },
            'ARI': { lat: 33.5276, lon: -112.2626, name: 'State Farm Stadium' },
            'LAR': { lat: 33.8634, lon: -118.2611, name: 'SoFi Stadium' },
            'SF': { lat: 37.4032, lon: -121.9698, name: "Levi's Stadium" },
            'SEA': { lat: 47.5952, lon: -122.3316, name: 'Lumen Field' }
        };

        this.cache = {
            injuries: new Map(),
            weather: new Map(),
            odds: new Map(),
            lastUpdate: new Map()
        };
    }

    /**
     * GET COMPREHENSIVE INJURY DATA (FREE)
     * Uses ESPN's free injury API
     */
    async getInjuryData(teamCode = null) {
        try {
            const cacheKey = teamCode || 'all';
            const cached = this.cache.injuries.get(cacheKey);
            
            // Use cache if less than 1 hour old
            if (cached && Date.now() - cached.timestamp < 3600000) {
                return cached.data;
            }

            let url = `${this.APIs.espn.base}/injuries`;
            if (teamCode) {
                url += `?team=${teamCode}`;
            }

            console.log('🏥 Fetching injury data from ESPN (FREE)...');
            const response = await axios.get(url);
            
            const injuryData = response.data.injuries?.map(injury => ({
                playerId: injury.athlete?.id,
                playerName: injury.athlete?.displayName,
                position: injury.athlete?.position?.abbreviation,
                team: injury.athlete?.team?.abbreviation,
                injuryStatus: injury.status,
                injuryType: injury.type,
                details: injury.details,
                dateInjured: injury.date,
                expectedReturn: injury.expectedReturn,
                impact: this.calculateInjuryImpact(injury.status)
            })) || [];

            // Cache the result
            this.cache.injuries.set(cacheKey, {
                data: injuryData,
                timestamp: Date.now()
            });

            return injuryData;

        } catch (error) {
            console.error('Error fetching injury data:', error.message);
            return [];
        }
    }

    /**
     * GET GAME WEATHER DATA (FREE)
     * Uses OpenWeatherMap free tier (1000 calls/day)
     */
    async getGameWeather(homeTeam, gameDate = null) {
        try {
            const stadium = this.stadiumCoordinates[homeTeam];
            if (!stadium) {
                console.warn(`No stadium data for team: ${homeTeam}`);
                return null;
            }

            const cacheKey = `${homeTeam}_${gameDate || 'current'}`;
            const cached = this.cache.weather.get(cacheKey);
            
            // Use cache if less than 30 minutes old
            if (cached && Date.now() - cached.timestamp < 1800000) {
                return cached.data;
            }

            console.log(`🌤️ Fetching weather for ${stadium.name} (FREE)...`);
            
            let weatherUrl;
            if (gameDate && new Date(gameDate) > new Date()) {
                // Future game - get forecast
                weatherUrl = `${this.APIs.weather.base}/forecast?lat=${stadium.lat}&lon=${stadium.lon}&appid=${this.APIs.weather.key}&units=imperial`;
            } else {
                // Current/past game - get current weather
                weatherUrl = `${this.APIs.weather.base}/weather?lat=${stadium.lat}&lon=${stadium.lon}&appid=${this.APIs.weather.key}&units=imperial`;
            }

            const response = await axios.get(weatherUrl);
            
            const weatherData = {
                stadium: stadium.name,
                temperature: Math.round(response.data.main?.temp || response.data.list?.[0]?.main?.temp),
                feelsLike: Math.round(response.data.main?.feels_like || response.data.list?.[0]?.main?.feels_like),
                humidity: response.data.main?.humidity || response.data.list?.[0]?.main?.humidity,
                windSpeed: Math.round(response.data.wind?.speed || response.data.list?.[0]?.wind?.speed || 0),
                windDirection: response.data.wind?.deg || response.data.list?.[0]?.wind?.deg,
                conditions: response.data.weather?.[0]?.description || response.data.list?.[0]?.weather?.[0]?.description,
                precipitation: response.data.rain?.['1h'] || response.data.list?.[0]?.rain?.['3h'] || 0,
                visibility: response.data.visibility || 10000,
                gameImpact: this.calculateWeatherImpact({
                    temp: response.data.main?.temp || response.data.list?.[0]?.main?.temp,
                    wind: response.data.wind?.speed || response.data.list?.[0]?.wind?.speed || 0,
                    rain: response.data.rain?.['1h'] || response.data.list?.[0]?.rain?.['3h'] || 0
                })
            };

            // Cache the result
            this.cache.weather.set(cacheKey, {
                data: weatherData,
                timestamp: Date.now()
            });

            return weatherData;

        } catch (error) {
            console.error('Error fetching weather data:', error.message);
            return null;
        }
    }

    /**
     * GET BETTING ODDS (FREE TIER)
     * Uses The Odds API free tier (500 calls/month)
     */
    async getBettingOdds(sport = 'americanfootball_nfl') {
        try {
            const cacheKey = sport;
            const cached = this.cache.odds.get(cacheKey);
            
            // Use cache if less than 15 minutes old
            if (cached && Date.now() - cached.timestamp < 900000) {
                return cached.data;
            }

            console.log('💰 Fetching betting odds (FREE TIER)...');
            
            const url = `${this.APIs.theOddsApi.base}/sports/${sport}/odds?apiKey=${this.APIs.theOddsApi.key}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
            
            const response = await axios.get(url);
            
            const oddsData = response.data.map(game => ({
                gameId: game.id,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                gameDate: game.commence_time,
                bookmakers: game.bookmakers?.map(book => ({
                    name: book.title,
                    markets: book.markets?.map(market => ({
                        type: market.key,
                        outcomes: market.outcomes
                    }))
                })) || []
            }));

            // Cache the result
            this.cache.odds.set(cacheKey, {
                data: oddsData,
                timestamp: Date.now()
            });

            return oddsData;

        } catch (error) {
            console.error('Error fetching odds data:', error.message);
            return [];
        }
    }

    /**
     * GET PLAYER DATA (FREE)
     * Uses ESPN's comprehensive player API
     */
    async getPlayerData(playerId = null, active = true) {
        try {
            console.log('🏈 Fetching player data from ESPN (FREE)...');
            
            let url = `${this.APIs.espn.core}/athletes?limit=1000`;
            if (active) url += '&active=true';
            if (playerId) url = `${this.APIs.espn.core}/athletes/${playerId}`;

            const response = await axios.get(url);
            
            if (playerId) {
                return this.formatPlayerData(response.data);
            } else {
                return response.data.items?.map(player => this.formatPlayerData(player)) || [];
            }

        } catch (error) {
            console.error('Error fetching player data:', error.message);
            return playerId ? null : [];
        }
    }

    /**
     * GET TEAM SCHEDULE (FREE)
     * Uses ESPN's team schedule API
     */
    async getTeamSchedule(teamId, season = 2024) {
        try {
            console.log(`📅 Fetching schedule for team ${teamId} (FREE)...`);
            
            const url = `${this.APIs.espn.base}/teams/${teamId}/schedule?season=${season}`;
            const response = await axios.get(url);
            
            return response.data.events?.map(event => ({
                gameId: event.id,
                date: event.date,
                opponent: event.competitions?.[0]?.competitors?.find(comp => comp.team.id !== teamId)?.team?.abbreviation,
                isHome: event.competitions?.[0]?.competitors?.find(comp => comp.team.id === teamId)?.homeAway === 'home',
                week: event.week?.number
            })) || [];

        } catch (error) {
            console.error('Error fetching team schedule:', error.message);
            return [];
        }
    }

    /**
     * HELPER METHODS
     */
    calculateInjuryImpact(status) {
        const impacts = {
            'Out': { severity: 1.0, description: 'Will not play' },
            'Doubtful': { severity: 0.8, description: 'Unlikely to play' },
            'Questionable': { severity: 0.4, description: 'Game-time decision' },
            'Probable': { severity: 0.1, description: 'Expected to play' },
            'Active': { severity: 0.0, description: 'Available' }
        };
        return impacts[status] || { severity: 0.0, description: 'Unknown' };
    }

    calculateWeatherImpact(weather) {
        let impact = 'Minimal';
        let factors = [];

        if (weather.temp < 32) {
            impact = 'Moderate';
            factors.push('Cold weather affects passing');
        }
        if (weather.wind > 15) {
            impact = 'High';
            factors.push('High winds affect kicking/passing');
        }
        if (weather.rain > 0.1) {
            impact = 'Moderate';
            factors.push('Rain affects ball handling');
        }

        return { level: impact, factors };
    }

    formatPlayerData(player) {
        return {
            id: player.id,
            name: player.displayName,
            position: player.position?.abbreviation,
            team: player.team?.abbreviation,
            jersey: player.jersey,
            age: player.age,
            height: player.height,
            weight: player.weight,
            experience: player.experience?.years
        };
    }

    /**
     * GET API STATUS
     */
    getApiStatus() {
        return {
            espn: 'Active (FREE - Unlimited)',
            weather: 'Active (FREE - 1000/day)',
            odds: 'Active (FREE - 500/month)',
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * CLEAR CACHE
     */
    clearCache() {
        this.cache.injuries.clear();
        this.cache.weather.clear();
        this.cache.odds.clear();
        this.cache.lastUpdate.clear();
        console.log('✅ Cache cleared');
    }
}

module.exports = FreeDataService; 