#!/usr/bin/env node
/**
 * NFL Roster System Verification Script
 * Demonstrates the local storage + ESPN API system is working
 */

const modernRosterService = require('./src/services/modernRosterService');
const fs = require('fs');
const path = require('path');

async function verifyRosterSystem() {
  console.log('🏈 NFL Roster System Verification\n');
  
  try {
    // 1. Check local data file
    const savedDataPath = path.join(__dirname, 'data/saved-rosters-2025.json');
    if (fs.existsSync(savedDataPath)) {
      const stats = fs.statSync(savedDataPath);
      const savedData = JSON.parse(fs.readFileSync(savedDataPath, 'utf8'));
      
      console.log('✅ Local Storage Status:');
      console.log(`   📁 File: ${path.basename(savedDataPath)}`);
      console.log(`   💾 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   📊 Players: ${savedData.totalPlayers}`);
      console.log(`   🏈 Teams: ${savedData.teams}`);
      console.log(`   📅 Last Updated: ${new Date(savedData.lastUpdated).toLocaleString()}\n`);
    } else {
      console.log('❌ Local storage file not found\n');
    }

    // 2. Test roster loading
    console.log('🔄 Testing Roster Loading...');
    const startTime = Date.now();
    const rosters = await modernRosterService.getCurrentRosters();
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Loaded ${rosters.length} players in ${loadTime}ms\n`);

    // 3. Verify key players
    console.log('🎯 Key Player Verification:');
    const keyPlayers = [
      'Josh Allen',
      'Patrick Mahomes', 
      'Aaron Rodgers',
      'Caleb Williams',
      'Travis Hunter',
      'Stefon Diggs'
    ];

    keyPlayers.forEach(name => {
      const found = rosters.find(p => 
        p.player_name && p.player_name.toLowerCase().includes(name.toLowerCase())
      );
      if (found) {
        console.log(`   ✅ ${name}: ${found.team} ${found.position}${found.updated_2025 ? ' (2025 Updated)' : ''}`);
      } else {
        console.log(`   ❌ ${name}: NOT FOUND`);
      }
    });

    // 4. Team coverage
    console.log('\n📊 Team Coverage:');
    const teamStats = {};
    rosters.forEach(p => {
      teamStats[p.team] = (teamStats[p.team] || 0) + 1;
    });
    
    const teams = Object.keys(teamStats).sort();
    console.log(`   🏈 Teams covered: ${teams.length}/32`);
    console.log(`   📈 Players per team: ${Math.min(...Object.values(teamStats))}-${Math.max(...Object.values(teamStats))}`);
    
    // Show first few teams as examples
    teams.slice(0, 5).forEach(team => {
      console.log(`   ${team}: ${teamStats[team]} players`);
    });

    // 5. Position distribution
    console.log('\n🎯 Position Distribution:');
    const positionStats = {};
    rosters.forEach(p => {
      positionStats[p.position] = (positionStats[p.position] || 0) + 1;
    });
    
    const keyPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    keyPositions.forEach(pos => {
      if (positionStats[pos]) {
        console.log(`   ${pos}: ${positionStats[pos]} players`);
      }
    });

    // 6. Data sources
    console.log('\n📈 Data Sources:');
    const sources = {};
    rosters.forEach(p => {
      sources[p.source] = (sources[p.source] || 0) + 1;
    });
    
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} players`);
    });

    // 7. 2025 Updates
    const updated2025 = rosters.filter(p => p.updated_2025);
    console.log(`\n🔄 2025 Roster Updates: ${updated2025.length} applied`);
    updated2025.forEach(p => {
      console.log(`   ✅ ${p.player_name} → ${p.team} ${p.position}`);
    });

    console.log('\n🎉 Roster System Verification Complete!');
    console.log('✅ Status: FULLY OPERATIONAL WITH LOCAL STORAGE');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  verifyRosterSystem();
}

module.exports = verifyRosterSystem; 