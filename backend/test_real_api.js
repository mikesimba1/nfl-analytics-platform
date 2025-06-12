const oddsService = require('./src/services/oddsService');

async function testRealAPI() {
    console.log('🧪 Testing Real Odds API\n');
    
    // Check if API key is provided
    if (!process.env.ODDS_API_KEY || process.env.ODDS_API_KEY === 'your_odds_api_key_here') {
        console.log('❌ No real API key provided.');
        console.log('📝 To test with real API:');
        console.log('   1. Get free API key at: https://the-odds-api.com/');
        console.log('   2. Set environment variable: ODDS_API_KEY=your_key_here');
        console.log('   3. Run: ODDS_API_KEY=your_key_here node test_real_api.js');
        console.log('\n🔄 Using GitHub scrapers instead...\n');
        
        // Test with GitHub scrapers
        const odds = await oddsService.getCurrentOdds();
        console.log(`✅ GitHub scrapers retrieved ${odds.length} games`);
        console.log('📊 API Status:', oddsService.getApiStatus());
        return;
    }
    
    try {
        console.log('🔑 Real API key detected!');
        console.log('📊 Initial API Status:');
        console.log(JSON.stringify(oddsService.getApiStatus(), null, 2));
        console.log('');
        
        // Force refresh to test real API
        console.log('🔄 Testing real API call...');
        const odds = await oddsService.getCurrentOdds('americanfootball_nfl', 'us', 'h2h', true);
        
        console.log(`✅ Real API successful! Retrieved ${odds.length} games`);
        console.log('📊 Updated API Status:');
        console.log(JSON.stringify(oddsService.getApiStatus(), null, 2));
        
        if (odds.length > 0) {
            console.log('\n📋 Sample game data:');
            console.log(JSON.stringify(odds[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ Real API test failed:', error.message);
        console.log('🔄 Falling back to GitHub scrapers...');
        
        const backupOdds = await oddsService.getCurrentOdds();
        console.log(`✅ Backup successful! Retrieved ${backupOdds.length} games`);
    }
}

// Run the test
testRealAPI(); 