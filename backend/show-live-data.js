#!/usr/bin/env node

const oddsService = require('./src/services/oddsService');

async function showLiveData() {
  console.log('🏈 NFL Analytics - Live Odds Data\n');
  
  try {
    // Set the API key directly
    process.env.ODDS_API_KEY = 'acfb5df269abb6f9772b8bc47727df9f';
    
    console.log('🔑 Using real API key: ...f9f');
    console.log('⚡ Cache: 4 hours (conservative usage)\n');
    
    // Get live odds (this will make ONE API call)
    console.log('🔄 Fetching live odds data...');
    const odds = await oddsService.getCurrentOdds('americanfootball_nfl', 'us', 'h2h', true);
    
    console.log(`✅ Retrieved ${odds.length} live games\n`);
    
    // Show Eagles game specifically
    const eaglesGame = odds.find(game => 
      game.home_team === 'Philadelphia Eagles' || 
      game.away_team === 'Philadelphia Eagles'
    );
    
    if (eaglesGame) {
      console.log('🦅 PHILADELPHIA EAGLES - LIVE ODDS:');
      console.log(`📅 Game: ${eaglesGame.away_team} @ ${eaglesGame.home_team}`);
      console.log(`🕐 Time: ${new Date(eaglesGame.commence_time).toLocaleString()}\n`);
      
      console.log('💰 LIVE MONEYLINES:');
      eaglesGame.bookmakers.forEach(book => {
        const moneyline = book.markets.find(m => m.key === 'h2h');
        if (moneyline) {
          const eagles = moneyline.outcomes.find(o => o.name.includes('Eagles'));
          const opponent = moneyline.outcomes.find(o => !o.name.includes('Eagles'));
          if (eagles && opponent) {
            console.log(`📊 ${book.name}: Eagles ${eagles.price > 0 ? '+' : ''}${eagles.price}, ${opponent.name.split(' ').slice(-1)} ${opponent.price > 0 ? '+' : ''}${opponent.price}`);
          }
        }
      });
      
      console.log('\n📈 API Usage Status:');
      const status = oddsService.getApiStatus();
      console.log(`   Daily: ${status.daily.used}/${status.daily.limit}`);
      console.log(`   Monthly: ${status.monthly.used}/${status.monthly.limit}`);
      console.log(`   Source: ${status.source}`);
      
    } else {
      console.log('❌ Eagles game not found in current data');
      console.log('\n📋 Available games:');
      odds.slice(0, 3).forEach(game => {
        console.log(`   🏈 ${game.away_team} @ ${game.home_team}`);
      });
    }
    
    console.log('\n🎯 This data will be cached for 4 hours to save API calls');
    console.log('🔄 Your frontend will show this exact live data');
    
  } catch (error) {
    console.error('❌ Error fetching live data:', error.message);
    console.log('\n🔄 Falling back to demo data...');
  }
}

showLiveData().catch(console.error); 