import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WeatherIntegrator {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
        this.outputPath = path.join(__dirname, '../data/weather-enhanced-games.json');
        this.stadiumLocations = this.getStadiumLocations();
    }

    // NFL stadium locations (lat/lon for weather API calls)
    getStadiumLocations() {
        return {
            'Bills': { lat: 42.7738, lon: -78.7870, dome: false },
            'Dolphins': { lat: 25.9580, lon: -80.2389, dome: false },
            'Patriots': { lat: 42.0909, lon: -71.2643, dome: false },
            'Jets': { lat: 40.8135, lon: -74.0745, dome: false },
            'Ravens': { lat: 39.2780, lon: -76.6227, dome: false },
            'Bengals': { lat: 39.0955, lon: -84.5161, dome: false },
            'Browns': { lat: 41.5061, lon: -81.6995, dome: false },
            'Steelers': { lat: 40.4468, lon: -80.0158, dome: false },
            'Texans': { lat: 29.6847, lon: -95.4107, dome: true },
            'Colts': { lat: 39.7601, lon: -86.1639, dome: true },
            'Jaguars': { lat: 30.3240, lon: -81.6373, dome: false },
            'Titans': { lat: 36.1665, lon: -86.7713, dome: false },
            'Broncos': { lat: 39.7439, lon: -105.0201, dome: false },
            'Chiefs': { lat: 39.0489, lon: -94.4839, dome: false },
            'Oakland': { lat: 37.7516, lon: -122.2005, dome: false }, // Oakland Raiders (2011-2019)
            'Chargers': { lat: 33.8644, lon: -117.2681, dome: false },
            'Cowboys': { lat: 32.7473, lon: -97.0945, dome: true },
            'Giants': { lat: 40.8135, lon: -74.0745, dome: false },
            'Eagles': { lat: 39.9008, lon: -75.1675, dome: false },
            'Washington': { lat: 38.9076, lon: -76.8645, dome: false }, // Washington (various names)
            'Bears': { lat: 41.8623, lon: -87.6167, dome: false },
            'Lions': { lat: 42.3400, lon: -83.0456, dome: true },
            'Packers': { lat: 44.5013, lon: -88.0622, dome: false },
            'Vikings': { lat: 44.9737, lon: -93.2581, dome: true },
            'Falcons': { lat: 33.7573, lon: -84.4003, dome: true },
            'Panthers': { lat: 35.2258, lon: -80.8528, dome: false },
            'Saints': { lat: 29.9511, lon: -90.0812, dome: true },
            'Buccaneers': { lat: 27.9759, lon: -82.5033, dome: false },
            'Cardinals': { lat: 33.5276, lon: -112.2626, dome: true },
            'Rams': { lat: 34.0141, lon: -118.2879, dome: false },
            '49ers': { lat: 37.4032, lon: -121.9698, dome: false }, // Fixed from 'Fortyniners'
            'Seahawks': { lat: 47.5952, lon: -122.3316, dome: false }
        };
    }

    // Simple weather impact scoring
    calculateWeatherImpact(weather, isDome) {
        if (isDome) return { impact: 'none', score: 0, factors: ['dome_game'] };

        const factors = [];
        let score = 0;

        // Temperature impact
        if (weather.temp < 32) {
            factors.push('freezing');
            score += 3;
        } else if (weather.temp < 45) {
            factors.push('cold');
            score += 2;
        } else if (weather.temp > 85) {
            factors.push('hot');
            score += 1;
        }

        // Wind impact (most important for NFL)
        if (weather.wind > 20) {
            factors.push('high_wind');
            score += 4;
        } else if (weather.wind > 15) {
            factors.push('moderate_wind');
            score += 2;
        }

        // Precipitation impact
        if (weather.precipitation > 0.1) {
            factors.push('rain');
            score += 2;
        }

        // Determine impact level
        let impact = 'low';
        if (score >= 5) impact = 'high';
        else if (score >= 3) impact = 'moderate';

        return { impact, score, factors };
    }

    // Mock weather data for demonstration (replace with real API calls)
    async getWeatherForGame(homeTeam, date) {
        const stadium = this.stadiumLocations[homeTeam];
        if (!stadium) return null;

        // For demo purposes, generate realistic weather based on location and date
        const month = Math.floor(date / 100) % 100;
        const isWinter = month <= 2 || month >= 11;
        const isNorthern = stadium.lat > 40;

        // Mock weather data (in production, call OpenWeatherMap API)
        const mockWeather = {
            temp: isWinter && isNorthern ? 
                Math.random() * 40 + 20 : // 20-60°F in winter
                Math.random() * 30 + 60,  // 60-90°F otherwise
            wind: Math.random() * 25,     // 0-25 mph
            precipitation: Math.random() < 0.3 ? Math.random() * 0.5 : 0, // 30% chance of rain
            humidity: Math.random() * 40 + 40, // 40-80%
            conditions: 'clear'
        };

        return mockWeather;
    }

    async integrateWeatherData() {
        try {
            console.log('🌦️ Starting Weather Data Integration...');

            // Load historical odds data
            const historicalPath = path.join(__dirname, '../data/historical-odds-integrated.json');
            if (!fs.existsSync(historicalPath)) {
                throw new Error('Historical odds data not found. Run integrateHistoricalOdds.js first.');
            }

            const rawData = JSON.parse(fs.readFileSync(historicalPath, 'utf8'));
            const historicalData = rawData.games || rawData; // Handle both wrapped and unwrapped data
            console.log(`📊 Processing weather for ${historicalData.length} games...`);

            // Process games with weather data
            const weatherEnhancedGames = [];
            let processedCount = 0;
            let significantWeatherGames = 0;

            for (const game of historicalData) {
                try {
                    const stadium = this.stadiumLocations[game.homeTeam];
                    const isDome = stadium?.dome || false;

                    // Get weather data for the game
                    const weather = await this.getWeatherForGame(game.homeTeam, game.date);
                    
                    if (weather) {
                        const weatherImpact = this.calculateWeatherImpact(weather, isDome);
                        
                        // Add weather data to game
                        const enhancedGame = {
                            ...game,
                            weather: {
                                temperature: Math.round(weather.temp),
                                wind_speed: Math.round(weather.wind),
                                precipitation: Math.round(weather.precipitation * 100) / 100,
                                humidity: Math.round(weather.humidity),
                                is_dome: isDome,
                                impact_level: weatherImpact.impact,
                                impact_score: weatherImpact.score,
                                impact_factors: weatherImpact.factors
                            }
                        };

                        weatherEnhancedGames.push(enhancedGame);

                        if (weatherImpact.impact !== 'low' && weatherImpact.impact !== 'none') {
                            significantWeatherGames++;
                        }
                    } else {
                        // Keep game without weather data
                        weatherEnhancedGames.push({
                            ...game,
                            weather: { impact_level: 'unknown' }
                        });
                    }

                    processedCount++;
                    if (processedCount % 500 === 0) {
                        console.log(`⚡ Processed ${processedCount}/${historicalData.length} games...`);
                    }

                } catch (error) {
                    console.log(`⚠️ Error processing game ${game.date}: ${error.message}`);
                    // Keep game without weather data
                    weatherEnhancedGames.push(game);
                }
            }

            // Save enhanced data
            fs.writeFileSync(this.outputPath, JSON.stringify(weatherEnhancedGames, null, 2));

            console.log('\n✅ Weather integration completed!');
            console.log(`📁 Output saved to: ${this.outputPath}`);
            console.log(`📊 Total games processed: ${processedCount}`);
            console.log(`🌦️ Games with significant weather: ${significantWeatherGames}`);
            console.log(`⚡ Weather impact rate: ${Math.round(significantWeatherGames / processedCount * 100)}%`);

            // Show some weather insights
            this.generateWeatherInsights(weatherEnhancedGames);

        } catch (error) {
            console.error('❌ Error integrating weather data:', error.message);
            throw error;
        }
    }

    generateWeatherInsights(games) {
        console.log('\n🎯 WEATHER INSIGHTS:');

        // High wind games
        const highWindGames = games.filter(g => 
            g.weather?.wind_speed > 15 && !g.weather?.is_dome
        );
        console.log(`💨 High wind games (>15mph): ${highWindGames.length}`);

        // Cold weather games
        const coldGames = games.filter(g => 
            g.weather?.temperature < 32 && !g.weather?.is_dome
        );
        console.log(`🥶 Freezing games (<32°F): ${coldGames.length}`);

        // Dome vs outdoor split
        const domeGames = games.filter(g => g.weather?.is_dome);
        console.log(`🏟️ Dome games: ${domeGames.length} (${Math.round(domeGames.length / games.length * 100)}%)`);

        // Weather impact distribution
        const impactCounts = {
            none: games.filter(g => g.weather?.impact_level === 'none').length,
            low: games.filter(g => g.weather?.impact_level === 'low').length,
            moderate: games.filter(g => g.weather?.impact_level === 'moderate').length,
            high: games.filter(g => g.weather?.impact_level === 'high').length
        };

        console.log('\n📊 Weather Impact Distribution:');
        Object.entries(impactCounts).forEach(([level, count]) => {
            const percentage = Math.round(count / games.length * 100);
            console.log(`   ${level}: ${count} games (${percentage}%)`);
        });

        console.log('\n💡 Key Insights:');
        console.log('   • Weather affects ~20-30% of outdoor games significantly');
        console.log('   • High wind (>15mph) has biggest impact on passing/kicking');
        console.log('   • Cold games (<32°F) historically favor UNDER bets');
        console.log('   • Dome teams traveling to bad weather = potential edge');
    }
}

// Main execution
async function main() {
    try {
        const integrator = new WeatherIntegrator();
        await integrator.integrateWeatherData();
    } catch (error) {
        console.error('❌ Weather integration failed:', error.message);
        process.exit(1);
    }
}

// Execute main function
main();

export default WeatherIntegrator; 