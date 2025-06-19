/**
 * FREE API TEST SUITE
 * Tests all free APIs to ensure they work for NFL analytics
 */

const FreeDataService = require('./src/services/freeDataService');

async function testAllFreeAPIs() {
    console.log('🚀 TESTING ALL FREE NFL APIs');
    console.log('=====================================\n');

    const dataService = new FreeDataService();

    // Test 1: ESPN Injury Data (FREE)
    console.log('1️⃣ TESTING ESPN INJURY DATA (FREE)');
    console.log('-----------------------------------');
    try {
        const injuries = await dataService.getInjuryData();
        console.log(`✅ Found ${injuries.length} injury reports`);
        if (injuries.length > 0) {
            console.log('Sample injury:', {
                player: injuries[0].playerName,
                team: injuries[0].team,
                status: injuries[0].injuryStatus,
                impact: injuries[0].impact
            });
        }
    } catch (error) {
        console.log('❌ ESPN Injury API failed:', error.message);
    }
    console.log('');

    // Test 2: Weather Data (FREE)
    console.log('2️⃣ TESTING WEATHER DATA (FREE)');
    console.log('-------------------------------');
    try {
        const weather = await dataService.getGameWeather('BUF'); // Buffalo Bills
        console.log('✅ Weather data retrieved for Highmark Stadium');
        console.log('Sample weather:', {
            stadium: weather.stadium,
            temperature: weather.temperature,
            windSpeed: weather.windSpeed,
            conditions: weather.conditions,
            gameImpact: weather.gameImpact
        });
    } catch (error) {
        console.log('❌ Weather API failed:', error.message);
    }
    console.log('');

    // Test 3: Betting Odds (FREE TIER)
    console.log('3️⃣ TESTING BETTING ODDS (FREE TIER)');
    console.log('------------------------------------');
    try {
        const odds = await dataService.getBettingOdds();
        console.log(`✅ Found ${odds.length} games with odds`);
        if (odds.length > 0) {
            console.log('Sample game:', {
                matchup: `${odds[0].awayTeam} @ ${odds[0].homeTeam}`,
                gameDate: odds[0].gameDate,
                bookmakers: odds[0].bookmakers.length
            });
        }
    } catch (error) {
        console.log('❌ Odds API failed:', error.message);
    }
    console.log('');

    // Test 4: Player Data (FREE)
    console.log('4️⃣ TESTING PLAYER DATA (FREE)');
    console.log('------------------------------');
    try {
        const players = await dataService.getPlayerData();
        console.log(`✅ Found ${players.length} active players`);
        if (players.length > 0) {
            console.log('Sample player:', {
                name: players[0].name,
                team: players[0].team,
                position: players[0].position
            });
        }
    } catch (error) {
        console.log('❌ Player API failed:', error.message);
    }
    console.log('');

    // Test 5: Team Schedule (FREE)
    console.log('5️⃣ TESTING TEAM SCHEDULE (FREE)');
    console.log('--------------------------------');
    try {
        const schedule = await dataService.getTeamSchedule('BUF');
        console.log(`✅ Found ${schedule.length} games for Buffalo Bills`);
        if (schedule.length > 0) {
            console.log('Sample game:', {
                opponent: schedule[0].opponent,
                isHome: schedule[0].isHome,
                week: schedule[0].week
            });
        }
    } catch (error) {
        console.log('❌ Schedule API failed:', error.message);
    }
    console.log('');

    // API Status Summary
    console.log('📊 API STATUS SUMMARY');
    console.log('=====================');
    const status = dataService.getApiStatus();
    Object.entries(status).forEach(([api, stat]) => {
        console.log(`${api.toUpperCase()}: ${stat}`);
    });
    console.log('');

    console.log('🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Sign up for OpenWeatherMap API key (FREE)');
    console.log('2. Verify your Odds API key is working');
    console.log('3. All ESPN APIs work without any keys!');
    console.log('4. Start integrating with your predictive engine');
    console.log('');
    console.log('💡 TIP: Run this with your API keys in .env file for full testing');
}

// Run the tests
if (require.main === module) {
    testAllFreeAPIs().catch(console.error);
}

module.exports = { testAllFreeAPIs }; 