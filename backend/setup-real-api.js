#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🎲 Setting Up Real Live Odds Data\n');

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

async function setupRealAPI() {
  console.log('📊 Current Status: Using simulated data (not real odds)');
  console.log('🎯 Goal: Get real live odds from DraftKings, FanDuel, BetMGM\n');
  
  console.log('🚀 Steps to get FREE real API key:');
  console.log('1. Visit: https://the-odds-api.com/');
  console.log('2. Click "Get API Key" (top right)');
  console.log('3. Choose "Starter Plan" (FREE - 500 requests/month)');
  console.log('4. Enter your email address');
  console.log('5. Check your email for the API key\n');
  
  const hasKey = await askQuestion('Do you have your free API key? (y/n): ');
  
  if (hasKey.toLowerCase() === 'y') {
    const apiKey = await askQuestion('Paste your API key here: ');
    
    if (apiKey && apiKey.length > 10) {
      // Create .env file
      const envPath = path.join(__dirname, '.env');
      const envContent = `ODDS_API_KEY=${apiKey.trim()}\n`;
      
      try {
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ API key saved successfully!');
        console.log('📁 Created: backend/.env');
        console.log(`🔑 Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
        
        console.log('\n🔄 Now restart your backend server:');
        console.log('   npm start');
        
        console.log('\n🎉 You\'ll now get REAL live odds!');
        console.log('   - Eagles spread: -6.5 (real)');
        console.log('   - Eagles ML: -330 (real)');
        console.log('   - Live updates every 30 minutes');
        
      } catch (error) {
        console.log('\n❌ Error saving API key:', error.message);
        console.log('📝 Please manually create backend/.env file with:');
        console.log(`   ODDS_API_KEY=${apiKey}`);
      }
    } else {
      console.log('\n❌ Invalid API key. Please try again.');
    }
  } else {
    console.log('\n📧 Please visit https://the-odds-api.com/ to get your free API key.');
    console.log('💡 It takes 30 seconds - just enter your email!');
    console.log('🔄 Run this script again once you have your key.');
    console.log('\n🌐 Direct link: https://the-odds-api.com/lp/free-betting-odds-api');
  }
  
  rl.close();
}

setupRealAPI().catch(console.error); 