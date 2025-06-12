#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

console.log('🎲 NFL Analytics - Free Betting Odds Setup\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupOddsAPI() {
  console.log('📊 Setting up free betting odds for your NFL Analytics platform...\n');
  
  console.log('🌟 You have multiple FREE options:');
  console.log('1. The Odds API (500 free requests/month) - RECOMMENDED');
  console.log('2. ESPN API (unlimited, but no odds)');
  console.log('3. Web scraping (unlimited, requires setup)');
  console.log('4. Mock data (already working)\n');
  
  const choice = await askQuestion('Which option would you like to set up? (1-4): ');
  
  switch(choice) {
    case '1':
      await setupTheOddsAPI();
      break;
    case '2':
      console.log('\n✅ ESPN API is already integrated and working!');
      console.log('🔗 Your platform automatically uses ESPN for game schedules and team data.');
      break;
    case '3':
      await showScrapingOptions();
      break;
    case '4':
      console.log('\n✅ Mock data is already working!');
      console.log('🎯 Your platform includes professional demo odds data.');
      console.log('📈 Perfect for development and testing.');
      break;
    default:
      console.log('\n❌ Invalid choice. Please run the script again.');
  }
  
  rl.close();
}

async function setupTheOddsAPI() {
  console.log('\n🚀 Setting up The Odds API (FREE TIER)...\n');
  
  console.log('📋 Steps to get your FREE API key:');
  console.log('1. Visit: https://the-odds-api.com/');
  console.log('2. Click "Get API Key" → "Starter (FREE)"');
  console.log('3. Enter your email address');
  console.log('4. Check your email for the API key\n');
  
  const hasKey = await askQuestion('Do you already have your free API key? (y/n): ');
  
  if (hasKey.toLowerCase() === 'y') {
    const apiKey = await askQuestion('Enter your API key: ');
    
    // Create .env file
    const envPath = path.join(__dirname, 'backend', '.env');
    const envContent = `ODDS_API_KEY=${apiKey}\n`;
    
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ API key saved successfully!');
      console.log('📁 Created: backend/.env');
      console.log('\n🔄 Please restart your backend server:');
      console.log('   cd backend && npm start');
      console.log('\n🎉 You\'ll now get live odds from DraftKings, FanDuel, BetMGM, and more!');
      
    } catch (error) {
      console.log('\n❌ Error saving API key:', error.message);
      console.log('📝 Please manually create backend/.env file with:');
      console.log(`   ODDS_API_KEY=${apiKey}`);
    }
  } else {
    console.log('\n📧 Please visit https://the-odds-api.com/ to get your free API key.');
    console.log('💡 It only takes 30 seconds - just enter your email!');
    console.log('🔄 Run this script again once you have your key.');
  }
}

async function showScrapingOptions() {
  console.log('\n🕷️ Web Scraping Options (Unlimited Free Data):\n');
  
  console.log('📦 Ready-made GitHub scrapers:');
  console.log('1. DraftKings Scraper: github.com/agad495/DKscraPy');
  console.log('2. Multiple Books: apify.com/harvest/sportsbook-odds-scraper');
  console.log('3. ESPN Data: github.com/nntrn/espn-wiki');
  console.log('4. SBR Odds: github.com/nkgilley/sbrscrape');
  
  console.log('\n⚡ Quick start with DraftKings scraper:');
  console.log('   git clone https://github.com/agad495/DKscraPy');
  console.log('   cd DKscraPy');
  console.log('   pip install -r requirements.txt');
  console.log('   python nfl_scrapers/draftkings_nfl.py');
  
  console.log('\n💡 Tip: Start with The Odds API free tier (option 1) for easiest setup!');
}

// Main execution
console.log('🏈 Welcome to the Free NFL Betting Odds Setup Guide!');
console.log('📊 Your platform already has the real NFL schedule working.');
console.log('🎯 Let\'s add live betting odds from multiple free sources...\n');

setupOddsAPI().catch(console.error); 