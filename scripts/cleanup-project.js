#!/usr/bin/env node

/**
 * NFL Analytics Pro - Project Cleanup Script
 * Automatically removes redundant files and organizes project structure
 */

const fs = require('fs');
const path = require('path');

// Files to delete (redundant/outdated)
const filesToDelete = [
  // Python Scripts (Keep only nfl_unified_platform_final.py)
  'nfl_complete_week1_enhanced.py',
  'nfl_analytics.py',
  'simple_nfl_app.py',
  'nfl_app.py',
  'nfl_player_props_platform.py',
  'analytics_app.py',
  'espn_data_explorer.py',
  'nfl_data_execution.py',
  'nfl_data_refinement_comprehensive.py',
  'data_refinement_plan.py',
  'free_odds_scraper.py',
  'live_odds_integration.py',
  'data_collection_engine.py',
  'defensive_ranking_function.py',
  'data_enhancer.py',
  'nfl_game_simulator.py',
  'coverage_analysis_2024.py',
  'nfl_prediction_engine.py',
  'nfl_2025_schedule.py',
  'matchup_predictor.py',
  'data_verification.py',
  'football_features.py',
  'nfl_queries.py',
  'data_organizer.py',
  
  // Launch Scripts
  'launch_unified_platform.py',
  'launch_react_app.py',
  'execute_project_cleanup.py',
  
  // Documentation Files
  'README-SOLUTION.md',
  'README_REACT_PLATFORM.md',
  'README_UNIFIED_PLATFORM.md',
  'NFL_PLATFORM_CONTEXT.md',
  'SOLUTION-SUMMARY.md',
  'EXECUTION_COMPLETE.md',
  'PROJECT_STATUS_FINAL.md',
  'UNIFIED_PLATFORM_COMPLETE.md',
  'NFL_UNIFIED_PLATFORM_README.md',
  'FINAL_NFL_COVERAGE_SYSTEM.md',
  'NFL_COVERAGE_WEB_APP_README.md',
  'NFL_2025_PREDICTION_PLATFORM_COMPLETE.md',
  'WORLD_CLASS_PLATFORM_COMPLETE.md',
  'BALLPARK_PAL_REBUILD_COMPLETE.md',
  'REDESIGN_COMPLETE.md',
  'QUICK_FIX_SUMMARY.md',
  'NFL_PLATFORM_COMPLETELY_FIXED.md',
  'SUBSCRIPTION_READY_SOLUTION.md',
  '2025-NFL-DATA-UPDATE-SUMMARY.md',
  'CURRENT_STATUS.md',
  'nfl_data_summary_report.md',
  
  // Data Files
  'test-data-service.js',
  'data-refresh.js',
  'update-2025-data.js',
  'nfl_data_integration.py',
  'espn_data_integration_plan.json',
  'sample_depth_chart_data.json',
  'sample_roster_data.json',
  'sample_injury_data.json',
  
  // Component Stubs
  'app/components/GameScript.tsx',
  'app/components/InjuryReports.tsx',
  'app/components/TargetDepth.tsx',
  'app/components/TeamAnalysis.tsx'
];

// Directories to delete
const directoriesToDelete = [
  'archive',
  '__pycache__',
  'backend/__pycache__'
];

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${filePath}:`, error.message);
    return false;
  }
}

function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Deleted directory: ${dirPath}`);
      return true;
    } else {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting directory ${dirPath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🧹 Starting NFL Analytics Pro cleanup...\n');
  
  let deletedFiles = 0;
  let deletedDirs = 0;
  
  // Delete files
  console.log('📄 Deleting redundant files...');
  filesToDelete.forEach(file => {
    if (deleteFile(file)) {
      deletedFiles++;
    }
  });
  
  console.log('\n📁 Deleting redundant directories...');
  directoriesToDelete.forEach(dir => {
    if (deleteDirectory(dir)) {
      deletedDirs++;
    }
  });
  
  // Clean up Next.js build artifacts
  console.log('\n🏗️  Cleaning build artifacts...');
  if (deleteDirectory('.next')) {
    deletedDirs++;
  }
  if (deleteDirectory('node_modules')) {
    console.log('📦 Deleted node_modules (will need npm install)');
    deletedDirs++;
  }
  
  console.log('\n✨ Cleanup Summary:');
  console.log(`📄 Files deleted: ${deletedFiles}`);
  console.log(`📁 Directories deleted: ${deletedDirs}`);
  console.log('\n🎯 Next steps:');
  console.log('1. Run: npm install');
  console.log('2. Review IMPROVEMENT_PLAN.md');
  console.log('3. Start restructuring with new architecture');
  
  console.log('\n🏈 NFL Analytics Pro is now clean and ready to restructure!');
}

// Run the cleanup
main(); 