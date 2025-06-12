const oddsService = require('./src/services/oddsService');

async function testOddsAPI() {
    console.log('🧪 Testing NFL Odds Service with Real API and GitHub Scrapers\n');
    
    try {
        // Test API status
        console.log('📊 Current API Status:');
        const status = oddsService.getApiStatus();
        console.log(JSON.stringify(status, null, 2));
        console.log('');
        
        // Test getting current odds
        console.log('🔄 Testing getCurrentOdds()...');
        const odds = await oddsService.getCurrentOdds();
        console.log(`✅ Retrieved ${odds.length} games`);
        console.log('First game:', JSON.stringify(odds[0], null, 2));
        console.log('');
        
        // Test getting best odds
        console.log('🔄 Testing getBestOdds()...');
        const bestOdds = await oddsService.getBestOdds();
        console.log('Best odds for first game:', JSON.stringify(bestOdds[0], null, 2));
        console.log('');
        
        // Test getting specific game odds
        console.log('🔄 Testing getGameOdds()...');
        const gameOdds = await oddsService.getGameOdds('Eagles', 'Cowboys');
        if (gameOdds) {
            console.log('Cowboys @ Eagles odds:', JSON.stringify(gameOdds, null, 2));
        } else {
            console.log('Game not found');
        }
        console.log('');
        
        // Test line movements
        console.log('🔄 Testing getLineMovements()...');
        const movements = await oddsService.getLineMovements();
        console.log('Line movements for first game:', JSON.stringify(movements[0], null, 2));
        console.log('');
        
        // Final API status
        console.log('📊 Final API Status:');
        const finalStatus = oddsService.getApiStatus();
        console.log(JSON.stringify(finalStatus, null, 2));
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testOddsAPI(); 