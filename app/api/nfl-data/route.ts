import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'nfl_data')
    
    // Load defensive rankings
    const defenseFile = path.join(dataDir, 'real_defensive_rankings_2024.csv')
    const defenseData = fs.readFileSync(defenseFile, 'utf-8')
    const defenseRecords = parse(defenseData, { 
      columns: true, 
      skip_empty_lines: true 
    }).map((record: any) => ({
      ...record,
      games_analyzed: parseFloat(record.games_analyzed),
      passing_yards_allowed_per_game: parseFloat(record.passing_yards_allowed_per_game),
      passing_tds_allowed_per_game: parseFloat(record.passing_tds_allowed_per_game),
      completions_allowed_per_game: parseFloat(record.completions_allowed_per_game),
      attempts_allowed_per_game: parseFloat(record.attempts_allowed_per_game),
      receiving_yards_allowed_per_game: parseFloat(record.receiving_yards_allowed_per_game),
      receptions_allowed_per_game: parseFloat(record.receptions_allowed_per_game),
      targets_allowed_per_game: parseFloat(record.targets_allowed_per_game),
      receiving_tds_allowed_per_game: parseFloat(record.receiving_tds_allowed_per_game),
      air_yards_allowed_per_game: parseFloat(record.air_yards_allowed_per_game),
      yac_allowed_per_game: parseFloat(record.yac_allowed_per_game),
      fantasy_points_allowed_per_game: parseFloat(record.fantasy_points_allowed_per_game),
      passing_yards_rank: parseFloat(record.passing_yards_rank),
      receiving_yards_rank: parseFloat(record.receiving_yards_rank),
      fantasy_points_rank: parseFloat(record.fantasy_points_rank),
      targets_allowed_rank: parseFloat(record.targets_allowed_rank),
      completions_rank: parseFloat(record.completions_rank),
      overall_defense_rank: parseFloat(record.overall_defense_rank)
    }))

    // Load target depth analysis
    const targetFile = path.join(dataDir, 'target_depth_analysis_2024.csv')
    const targetData = fs.readFileSync(targetFile, 'utf-8')
    const targetRecords = parse(targetData, { 
      columns: true, 
      skip_empty_lines: true 
    }).map((record: any) => ({
      ...record,
      targets: parseFloat(record.targets),
      receptions: parseFloat(record.receptions),
      receiving_yards: parseFloat(record.receiving_yards),
      receiving_tds: parseFloat(record.receiving_tds),
      avg_depth_per_target: parseFloat(record.avg_depth_per_target),
      catch_rate: parseFloat(record.catch_rate),
      target_share: parseFloat(record.target_share),
      air_yards_share: parseFloat(record.air_yards_share),
      yards_per_target: parseFloat(record.yards_per_target)
    }))

    // Load game script analysis
    const gameScriptFile = path.join(dataDir, 'game_script_analysis_2024.csv')
    const gameScriptData = fs.readFileSync(gameScriptFile, 'utf-8')
    const gameScriptRecords = parse(gameScriptData, { 
      columns: true, 
      skip_empty_lines: true 
    }).map((record: any) => ({
      ...record,
      total_plays: parseFloat(record.total_plays),
      total_yards: parseFloat(record.total_yards),
      yards_per_play: parseFloat(record.yards_per_play),
      pass_rate: parseFloat(record.pass_rate),
      completion_rate: parseFloat(record.completion_rate)
    }))

    return NextResponse.json({
      defense: defenseRecords,
      players: targetRecords,
      gameScript: gameScriptRecords,
      status: 'success',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error loading NFL data:', error)
    return NextResponse.json(
      { error: 'Failed to load NFL data', status: 'error' },
      { status: 500 }
    )
  }
} 