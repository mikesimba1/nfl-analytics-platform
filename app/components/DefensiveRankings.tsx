'use client'

import { useState, useEffect } from 'react'

// Real NFL defensive data interface based on CSV structure
interface DefensiveRanking {
  team: string
  games_analyzed: number
  passing_yards_allowed_per_game: number
  passing_tds_allowed_per_game: number
  completions_allowed_per_game: number
  attempts_allowed_per_game: number
  receiving_yards_allowed_per_game: number
  receptions_allowed_per_game: number
  targets_allowed_per_game: number
  receiving_tds_allowed_per_game: number
  air_yards_allowed_per_game: number
  yac_allowed_per_game: number
  fantasy_points_allowed_per_game: number
  passing_yards_rank: number
  receiving_yards_rank: number
  fantasy_points_rank: number
  targets_allowed_rank: number
  completions_rank: number
  overall_defense_rank: number
}

export default function DefensiveRankings() {
  const [defensiveData, setDefensiveData] = useState<DefensiveRanking[]>([])
  const [sortBy, setSortBy] = useState<string>('overall_defense_rank')
  const [filterBy, setFilterBy] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDefensiveData()
  }, [])

  const loadDefensiveData = async () => {
    try {
      // Complete 32-team defensive rankings from real CSV data
      const allTeamDefenseData: DefensiveRanking[] = [
        { team: 'TEN', games_analyzed: 17, passing_yards_allowed_per_game: 189.18, passing_tds_allowed_per_game: 1.59, completions_allowed_per_game: 18.47, attempts_allowed_per_game: 27.82, receiving_yards_allowed_per_game: 189.06, receptions_allowed_per_game: 18.41, targets_allowed_per_game: 26.82, receiving_tds_allowed_per_game: 1.53, air_yards_allowed_per_game: 192.35, yac_allowed_per_game: 100.41, fantasy_points_allowed_per_game: 61.51, passing_yards_rank: 1, receiving_yards_rank: 1, fantasy_points_rank: 14, targets_allowed_rank: 1, completions_rank: 2, overall_defense_rank: 5.33 },
        { team: 'SF', games_analyzed: 17, passing_yards_allowed_per_game: 204.47, passing_tds_allowed_per_game: 1.47, completions_allowed_per_game: 19.88, attempts_allowed_per_game: 30.29, receiving_yards_allowed_per_game: 204.06, receptions_allowed_per_game: 19.88, targets_allowed_per_game: 29.06, receiving_tds_allowed_per_game: 1.41, air_yards_allowed_per_game: 218.47, yac_allowed_per_game: 108.06, fantasy_points_allowed_per_game: 62.66, passing_yards_rank: 2, receiving_yards_rank: 2, fantasy_points_rank: 17, targets_allowed_rank: 8, completions_rank: 7, overall_defense_rank: 7.0 },
        { team: 'PHI', games_analyzed: 21, passing_yards_allowed_per_game: 205.43, passing_tds_allowed_per_game: 1.33, completions_allowed_per_game: 20.62, attempts_allowed_per_game: 33.24, receiving_yards_allowed_per_game: 206.48, receptions_allowed_per_game: 20.62, targets_allowed_per_game: 32.29, receiving_tds_allowed_per_game: 1.33, air_yards_allowed_per_game: 249.52, yac_allowed_per_game: 95.86, fantasy_points_allowed_per_game: 53.28, passing_yards_rank: 3, receiving_yards_rank: 3, fantasy_points_rank: 1, targets_allowed_rank: 25, completions_rank: 11, overall_defense_rank: 2.33 },
        { team: 'NYJ', games_analyzed: 17, passing_yards_allowed_per_game: 211.06, passing_tds_allowed_per_game: 1.06, completions_allowed_per_game: 19.24, attempts_allowed_per_game: 30.59, receiving_yards_allowed_per_game: 207.29, receptions_allowed_per_game: 18.94, targets_allowed_per_game: 28.65, receiving_tds_allowed_per_game: 1.06, air_yards_allowed_per_game: 243.82, yac_allowed_per_game: 97.88, fantasy_points_allowed_per_game: 57.91, passing_yards_rank: 4, receiving_yards_rank: 4, fantasy_points_rank: 5, targets_allowed_rank: 6, completions_rank: 6, overall_defense_rank: 4.33 },
        { team: 'WAS', games_analyzed: 20, passing_yards_allowed_per_game: 212.95, passing_tds_allowed_per_game: 1.45, completions_allowed_per_game: 18.35, attempts_allowed_per_game: 29.15, receiving_yards_allowed_per_game: 212.45, receptions_allowed_per_game: 18.25, targets_allowed_per_game: 27.6, receiving_tds_allowed_per_game: 1.45, air_yards_allowed_per_game: 236.1, yac_allowed_per_game: 97.6, fantasy_points_allowed_per_game: 65.33, passing_yards_rank: 5, receiving_yards_rank: 5, fantasy_points_rank: 23, targets_allowed_rank: 2, completions_rank: 1, overall_defense_rank: 11.0 },
        { team: 'HOU', games_analyzed: 19, passing_yards_allowed_per_game: 219.37, passing_tds_allowed_per_game: 1.74, completions_allowed_per_game: 18.68, attempts_allowed_per_game: 32.05, receiving_yards_allowed_per_game: 219.63, receptions_allowed_per_game: 18.68, targets_allowed_per_game: 30.95, receiving_tds_allowed_per_game: 1.74, air_yards_allowed_per_game: 283.74, yac_allowed_per_game: 116.0, fantasy_points_allowed_per_game: 60.02, passing_yards_rank: 6, receiving_yards_rank: 6, fantasy_points_rank: 7, targets_allowed_rank: 15, completions_rank: 4, overall_defense_rank: 6.33 },
        { team: 'NE', games_analyzed: 17, passing_yards_allowed_per_game: 220.53, passing_tds_allowed_per_game: 1.59, completions_allowed_per_game: 20.35, attempts_allowed_per_game: 31.18, receiving_yards_allowed_per_game: 219.82, receptions_allowed_per_game: 20.29, targets_allowed_per_game: 30.06, receiving_tds_allowed_per_game: 1.59, air_yards_allowed_per_game: 261.41, yac_allowed_per_game: 98.76, fantasy_points_allowed_per_game: 64.37, passing_yards_rank: 7, receiving_yards_rank: 7, fantasy_points_rank: 19, targets_allowed_rank: 11, completions_rank: 8, overall_defense_rank: 11.0 },
        { team: 'LAC', games_analyzed: 18, passing_yards_allowed_per_game: 224.67, passing_tds_allowed_per_game: 1.39, completions_allowed_per_game: 21.61, attempts_allowed_per_game: 33.22, receiving_yards_allowed_per_game: 223.61, receptions_allowed_per_game: 21.44, targets_allowed_per_game: 31.78, receiving_tds_allowed_per_game: 1.33, air_yards_allowed_per_game: 241.83, yac_allowed_per_game: 100.72, fantasy_points_allowed_per_game: 56.93, passing_yards_rank: 8, receiving_yards_rank: 8, fantasy_points_rank: 2, targets_allowed_rank: 21, completions_rank: 16, overall_defense_rank: 6.0 },
        { team: 'MIA', games_analyzed: 17, passing_yards_allowed_per_game: 225.24, passing_tds_allowed_per_game: 1.29, completions_allowed_per_game: 21.47, attempts_allowed_per_game: 33.53, receiving_yards_allowed_per_game: 224.06, receptions_allowed_per_game: 21.41, targets_allowed_per_game: 31.35, receiving_tds_allowed_per_game: 1.29, air_yards_allowed_per_game: 205.35, yac_allowed_per_game: 115.0, fantasy_points_allowed_per_game: 57.63, passing_yards_rank: 9, receiving_yards_rank: 9, fantasy_points_rank: 4, targets_allowed_rank: 19, completions_rank: 14, overall_defense_rank: 7.33 },
        { team: 'GB', games_analyzed: 18, passing_yards_allowed_per_game: 227.22, passing_tds_allowed_per_game: 1.39, completions_allowed_per_game: 21.89, attempts_allowed_per_game: 32.5, receiving_yards_allowed_per_game: 224.78, receptions_allowed_per_game: 21.61, targets_allowed_per_game: 30.39, receiving_tds_allowed_per_game: 1.39, air_yards_allowed_per_game: 222.28, yac_allowed_per_game: 107.11, fantasy_points_allowed_per_game: 57.11, passing_yards_rank: 10, receiving_yards_rank: 10, fantasy_points_rank: 3, targets_allowed_rank: 13, completions_rank: 22, overall_defense_rank: 7.67 },
        { team: 'NYG', games_analyzed: 17, passing_yards_allowed_per_game: 227.59, passing_tds_allowed_per_game: 1.35, completions_allowed_per_game: 20.53, attempts_allowed_per_game: 29.53, receiving_yards_allowed_per_game: 226.12, receptions_allowed_per_game: 20.29, targets_allowed_per_game: 28.29, receiving_tds_allowed_per_game: 1.35, air_yards_allowed_per_game: 207.53, yac_allowed_per_game: 102.29, fantasy_points_allowed_per_game: 64.44, passing_yards_rank: 11, receiving_yards_rank: 12, fantasy_points_rank: 20, targets_allowed_rank: 5, completions_rank: 9, overall_defense_rank: 14.33 },
        { team: 'CLE', games_analyzed: 17, passing_yards_allowed_per_game: 228.12, passing_tds_allowed_per_game: 1.53, completions_allowed_per_game: 18.59, attempts_allowed_per_game: 29.94, receiving_yards_allowed_per_game: 226.24, receptions_allowed_per_game: 18.41, targets_allowed_per_game: 28.0, receiving_tds_allowed_per_game: 1.53, air_yards_allowed_per_game: 265.18, yac_allowed_per_game: 107.94, fantasy_points_allowed_per_game: 66.83, passing_yards_rank: 12, receiving_yards_rank: 13, fantasy_points_rank: 26, targets_allowed_rank: 4, completions_rank: 3, overall_defense_rank: 17.0 },
        { team: 'SEA', games_analyzed: 17, passing_yards_allowed_per_game: 231.18, passing_tds_allowed_per_game: 1.53, completions_allowed_per_game: 21.82, attempts_allowed_per_game: 33.47, receiving_yards_allowed_per_game: 228.24, receptions_allowed_per_game: 21.24, targets_allowed_per_game: 31.65, receiving_tds_allowed_per_game: 1.53, air_yards_allowed_per_game: 213.41, yac_allowed_per_game: 124.82, fantasy_points_allowed_per_game: 61.42, passing_yards_rank: 13, receiving_yards_rank: 14, fantasy_points_rank: 13, targets_allowed_rank: 20, completions_rank: 20, overall_defense_rank: 13.33 },
        { team: 'ARI', games_analyzed: 17, passing_yards_allowed_per_game: 231.18, passing_tds_allowed_per_game: 1.18, completions_allowed_per_game: 21.76, attempts_allowed_per_game: 31.71, receiving_yards_allowed_per_game: 224.94, receptions_allowed_per_game: 21.41, targets_allowed_per_game: 29.71, receiving_tds_allowed_per_game: 1.06, air_yards_allowed_per_game: 209.82, yac_allowed_per_game: 110.53, fantasy_points_allowed_per_game: 60.13, passing_yards_rank: 13, receiving_yards_rank: 11, fantasy_points_rank: 8, targets_allowed_rank: 9, completions_rank: 18, overall_defense_rank: 10.67 },
        { team: 'CHI', games_analyzed: 17, passing_yards_allowed_per_game: 232.88, passing_tds_allowed_per_game: 1.0, completions_allowed_per_game: 19.12, attempts_allowed_per_game: 29.53, receiving_yards_allowed_per_game: 232.71, receptions_allowed_per_game: 19.06, targets_allowed_per_game: 27.71, receiving_tds_allowed_per_game: 1.0, air_yards_allowed_per_game: 223.29, yac_allowed_per_game: 112.59, fantasy_points_allowed_per_game: 60.45, passing_yards_rank: 15, receiving_yards_rank: 15, fantasy_points_rank: 9, targets_allowed_rank: 3, completions_rank: 5, overall_defense_rank: 13.0 },
        { team: 'KC', games_analyzed: 20, passing_yards_allowed_per_game: 233.65, passing_tds_allowed_per_game: 1.4, completions_allowed_per_game: 21.65, attempts_allowed_per_game: 32.65, receiving_yards_allowed_per_game: 233.3, receptions_allowed_per_game: 21.6, targets_allowed_per_game: 31.05, receiving_tds_allowed_per_game: 1.4, air_yards_allowed_per_game: 244.15, yac_allowed_per_game: 114.15, fantasy_points_allowed_per_game: 60.6, passing_yards_rank: 16, receiving_yards_rank: 17, fantasy_points_rank: 10, targets_allowed_rank: 17, completions_rank: 17, overall_defense_rank: 14.33 },
        { team: 'LV', games_analyzed: 17, passing_yards_allowed_per_game: 234.65, passing_tds_allowed_per_game: 1.71, completions_allowed_per_game: 21.76, attempts_allowed_per_game: 33.0, receiving_yards_allowed_per_game: 233.88, receptions_allowed_per_game: 21.65, targets_allowed_per_game: 31.18, receiving_tds_allowed_per_game: 1.71, air_yards_allowed_per_game: 216.65, yac_allowed_per_game: 117.12, fantasy_points_allowed_per_game: 65.15, passing_yards_rank: 17, receiving_yards_rank: 18, fantasy_points_rank: 22, targets_allowed_rank: 18, completions_rank: 18, overall_defense_rank: 19.0 },
        { team: 'LA', games_analyzed: 19, passing_yards_allowed_per_game: 235.47, passing_tds_allowed_per_game: 1.58, completions_allowed_per_game: 20.74, attempts_allowed_per_game: 31.68, receiving_yards_allowed_per_game: 232.89, receptions_allowed_per_game: 20.58, targets_allowed_per_game: 30.26, receiving_tds_allowed_per_game: 1.53, air_yards_allowed_per_game: 249.68, yac_allowed_per_game: 115.37, fantasy_points_allowed_per_game: 64.9, passing_yards_rank: 19, receiving_yards_rank: 16, fantasy_points_rank: 21, targets_allowed_rank: 12, completions_rank: 12, overall_defense_rank: 18.67 },
        { team: 'ATL', games_analyzed: 17, passing_yards_allowed_per_game: 235.35, passing_tds_allowed_per_game: 2.0, completions_allowed_per_game: 23.71, attempts_allowed_per_game: 33.88, receiving_yards_allowed_per_game: 235.29, receptions_allowed_per_game: 23.53, targets_allowed_per_game: 32.18, receiving_tds_allowed_per_game: 2.0, air_yards_allowed_per_game: 227.35, yac_allowed_per_game: 114.41, fantasy_points_allowed_per_game: 67.45, passing_yards_rank: 18, receiving_yards_rank: 19, fantasy_points_rank: 28, targets_allowed_rank: 24, completions_rank: 30, overall_defense_rank: 21.67 },
        { team: 'CIN', games_analyzed: 17, passing_yards_allowed_per_game: 236.24, passing_tds_allowed_per_game: 1.76, completions_allowed_per_game: 21.88, attempts_allowed_per_game: 33.65, receiving_yards_allowed_per_game: 235.82, receptions_allowed_per_game: 21.71, targets_allowed_per_game: 31.88, receiving_tds_allowed_per_game: 1.65, air_yards_allowed_per_game: 240.35, yac_allowed_per_game: 118.41, fantasy_points_allowed_per_game: 67.16, passing_yards_rank: 20, receiving_yards_rank: 20, fantasy_points_rank: 27, targets_allowed_rank: 22, completions_rank: 21, overall_defense_rank: 22.33 },
        { team: 'CAR', games_analyzed: 17, passing_yards_allowed_per_game: 237.65, passing_tds_allowed_per_game: 2.06, completions_allowed_per_game: 21.12, attempts_allowed_per_game: 31.0, receiving_yards_allowed_per_game: 236.18, receptions_allowed_per_game: 21.12, targets_allowed_per_game: 29.71, receiving_tds_allowed_per_game: 2.06, air_yards_allowed_per_game: 227.18, yac_allowed_per_game: 110.71, fantasy_points_allowed_per_game: 78.69, passing_yards_rank: 22, receiving_yards_rank: 21, fantasy_points_rank: 32, targets_allowed_rank: 9, completions_rank: 13, overall_defense_rank: 25.0 },
        { team: 'BUF', games_analyzed: 20, passing_yards_allowed_per_game: 237.15, passing_tds_allowed_per_game: 1.6, completions_allowed_per_game: 22.25, attempts_allowed_per_game: 32.5, receiving_yards_allowed_per_game: 237.2, receptions_allowed_per_game: 22.2, targets_allowed_per_game: 30.95, receiving_tds_allowed_per_game: 1.55, air_yards_allowed_per_game: 224.4, yac_allowed_per_game: 114.9, fantasy_points_allowed_per_game: 63.56, passing_yards_rank: 21, receiving_yards_rank: 22, fantasy_points_rank: 18, targets_allowed_rank: 16, completions_rank: 26, overall_defense_rank: 20.33 },
        { team: 'DAL', games_analyzed: 17, passing_yards_allowed_per_game: 237.94, passing_tds_allowed_per_game: 1.65, completions_allowed_per_game: 20.53, attempts_allowed_per_game: 30.06, receiving_yards_allowed_per_game: 237.71, receptions_allowed_per_game: 20.47, targets_allowed_per_game: 28.82, receiving_tds_allowed_per_game: 1.65, air_yards_allowed_per_game: 237.53, yac_allowed_per_game: 124.12, fantasy_points_allowed_per_game: 69.94, passing_yards_rank: 23, receiving_yards_rank: 23, fantasy_points_rank: 30, targets_allowed_rank: 7, completions_rank: 9, overall_defense_rank: 25.33 },
        { team: 'PIT', games_analyzed: 18, passing_yards_allowed_per_game: 240.33, passing_tds_allowed_per_game: 1.39, completions_allowed_per_game: 22.11, attempts_allowed_per_game: 33.5, receiving_yards_allowed_per_game: 239.0, receptions_allowed_per_game: 21.94, targets_allowed_per_game: 31.94, receiving_tds_allowed_per_game: 1.39, air_yards_allowed_per_game: 231.83, yac_allowed_per_game: 112.39, fantasy_points_allowed_per_game: 61.02, passing_yards_rank: 24, receiving_yards_rank: 24, fantasy_points_rank: 11, targets_allowed_rank: 23, completions_rank: 24, overall_defense_rank: 19.67 },
        { team: 'DEN', games_analyzed: 18, passing_yards_allowed_per_game: 241.67, passing_tds_allowed_per_game: 1.33, completions_allowed_per_game: 22.89, attempts_allowed_per_game: 35.0, receiving_yards_allowed_per_game: 240.94, receptions_allowed_per_game: 22.78, targets_allowed_per_game: 33.39, receiving_tds_allowed_per_game: 1.28, air_yards_allowed_per_game: 243.5, yac_allowed_per_game: 115.22, fantasy_points_allowed_per_game: 58.92, passing_yards_rank: 25, receiving_yards_rank: 25, fantasy_points_rank: 6, targets_allowed_rank: 28, completions_rank: 29, overall_defense_rank: 18.67 },
        { team: 'IND', games_analyzed: 17, passing_yards_allowed_per_game: 243.65, passing_tds_allowed_per_game: 1.59, completions_allowed_per_game: 22.24, attempts_allowed_per_game: 32.06, receiving_yards_allowed_per_game: 242.18, receptions_allowed_per_game: 22.18, targets_allowed_per_game: 30.59, receiving_tds_allowed_per_game: 1.59, air_yards_allowed_per_game: 225.29, yac_allowed_per_game: 117.29, fantasy_points_allowed_per_game: 67.5, passing_yards_rank: 26, receiving_yards_rank: 26, fantasy_points_rank: 29, targets_allowed_rank: 14, completions_rank: 25, overall_defense_rank: 27.0 },
        { team: 'NO', games_analyzed: 17, passing_yards_allowed_per_game: 252.65, passing_tds_allowed_per_game: 1.12, completions_allowed_per_game: 21.53, attempts_allowed_per_game: 34.65, receiving_yards_allowed_per_game: 251.59, receptions_allowed_per_game: 21.47, targets_allowed_per_game: 33.12, receiving_tds_allowed_per_game: 1.12, air_yards_allowed_per_game: 280.12, yac_allowed_per_game: 126.18, fantasy_points_allowed_per_game: 66.58, passing_yards_rank: 27, receiving_yards_rank: 27, fantasy_points_rank: 25, targets_allowed_rank: 27, completions_rank: 15, overall_defense_rank: 26.33 },
        { team: 'BAL', games_analyzed: 19, passing_yards_allowed_per_game: 256.05, passing_tds_allowed_per_game: 1.53, completions_allowed_per_game: 22.74, attempts_allowed_per_game: 35.58, receiving_yards_allowed_per_game: 253.89, receptions_allowed_per_game: 22.58, targets_allowed_per_game: 33.53, receiving_tds_allowed_per_game: 1.53, air_yards_allowed_per_game: 274.89, yac_allowed_per_game: 111.47, fantasy_points_allowed_per_game: 62.25, passing_yards_rank: 28, receiving_yards_rank: 28, fantasy_points_rank: 16, targets_allowed_rank: 29, completions_rank: 27, overall_defense_rank: 24.0 },
        { team: 'MIN', games_analyzed: 18, passing_yards_allowed_per_game: 259.33, passing_tds_allowed_per_game: 1.44, completions_allowed_per_game: 24.11, attempts_allowed_per_game: 36.83, receiving_yards_allowed_per_game: 258.28, receptions_allowed_per_game: 23.94, targets_allowed_per_game: 35.56, receiving_tds_allowed_per_game: 1.44, air_yards_allowed_per_game: 277.72, yac_allowed_per_game: 118.33, fantasy_points_allowed_per_game: 61.28, passing_yards_rank: 29, receiving_yards_rank: 29, fantasy_points_rank: 12, targets_allowed_rank: 32, completions_rank: 31, overall_defense_rank: 23.33 },
        { team: 'DET', games_analyzed: 18, passing_yards_allowed_per_game: 261.28, passing_tds_allowed_per_game: 1.11, completions_allowed_per_game: 21.94, attempts_allowed_per_game: 35.56, receiving_yards_allowed_per_game: 260.78, receptions_allowed_per_game: 21.89, targets_allowed_per_game: 33.78, receiving_tds_allowed_per_game: 1.06, air_yards_allowed_per_game: 303.61, yac_allowed_per_game: 117.89, fantasy_points_allowed_per_game: 62.16, passing_yards_rank: 30, receiving_yards_rank: 30, fantasy_points_rank: 15, targets_allowed_rank: 30, completions_rank: 23, overall_defense_rank: 25.0 },
        { team: 'TB', games_analyzed: 18, passing_yards_allowed_per_game: 261.94, passing_tds_allowed_per_game: 1.61, completions_allowed_per_game: 24.5, attempts_allowed_per_game: 36.83, receiving_yards_allowed_per_game: 262.89, receptions_allowed_per_game: 24.56, targets_allowed_per_game: 34.33, receiving_tds_allowed_per_game: 1.61, air_yards_allowed_per_game: 265.22, yac_allowed_per_game: 123.56, fantasy_points_allowed_per_game: 65.46, passing_yards_rank: 31, receiving_yards_rank: 31, fantasy_points_rank: 24, targets_allowed_rank: 31, completions_rank: 32, overall_defense_rank: 28.67 },
        { team: 'JAX', games_analyzed: 17, passing_yards_allowed_per_game: 270.88, passing_tds_allowed_per_game: 1.71, completions_allowed_per_game: 22.88, attempts_allowed_per_game: 34.12, receiving_yards_allowed_per_game: 270.88, receptions_allowed_per_game: 22.82, targets_allowed_per_game: 32.94, receiving_tds_allowed_per_game: 1.71, air_yards_allowed_per_game: 260.65, yac_allowed_per_game: 135.06, fantasy_points_allowed_per_game: 74.42, passing_yards_rank: 32, receiving_yards_rank: 32, fantasy_points_rank: 31, targets_allowed_rank: 26, completions_rank: 28, overall_defense_rank: 31.67 }
      ]

      setDefensiveData(allTeamDefenseData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading defensive data:', error)
      setLoading(false)
    }
  }

  const sortedData = [...defensiveData].sort((a, b) => {
    if (sortBy === 'overall_defense_rank') {
      return a.overall_defense_rank - b.overall_defense_rank
    }
    return a[sortBy as keyof DefensiveRanking] - b[sortBy as keyof DefensiveRanking]
  })

  const filteredData = sortedData.filter(team => {
    if (filterBy === 'ALL') return true
    if (filterBy === 'TOP_10') return team.overall_defense_rank <= 10
    if (filterBy === 'BOTTOM_10') return team.overall_defense_rank > 22
    return true
  })

  const getRankColor = (rank: number) => {
    if (rank <= 5) return 'text-green-600 font-bold'
    if (rank <= 15) return 'text-yellow-600 font-semibold'
    if (rank <= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const getDefenseGrade = (rank: number) => {
    if (rank <= 5) return 'A'
    if (rank <= 10) return 'B'
    if (rank <= 20) return 'C'
    if (rank <= 25) return 'D'
    return 'F'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-orange-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">🛡️ NFL Defensive Rankings</h1>
          <p className="text-xl opacity-90">Complete 2024 defensive analysis for all 32 teams</p>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm opacity-75">Teams:</span>
              <span className="ml-2 font-bold">All 32 Teams</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm opacity-75">Metrics:</span>
              <span className="ml-2 font-bold">10+ Categories</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm opacity-75">Data:</span>
              <span className="ml-2 font-bold">2024 Season</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Filter & Sort</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="overall_defense_rank">Overall Defense Rank</option>
                <option value="passing_yards_rank">Pass Defense Rank</option>
                <option value="receiving_yards_rank">Receiving Defense Rank</option>
                <option value="fantasy_points_rank">Fantasy Points Allowed</option>
                <option value="targets_allowed_rank">Targets Allowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="ALL">All Teams</option>
                <option value="TOP_10">Top 10 Defenses</option>
                <option value="BOTTOM_10">Bottom 10 Defenses</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="bg-red-50 p-3 rounded-lg w-full">
                <div className="text-sm text-red-600">Showing</div>
                <div className="text-2xl font-bold text-red-800">{filteredData.length}</div>
                <div className="text-sm text-red-600">Teams</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Elite Defenses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🏆 Elite Defenses (Top 5)</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {sortedData.slice(0, 5).map((team, index) => (
              <div key={team.team} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">#{index + 1}</div>
                <div className="text-xl font-bold mb-2">{team.team}</div>
                <div className="text-sm text-gray-600 mb-3">
                  {team.receiving_yards_allowed_per_game.toFixed(1)} yds/game
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Grade: {getDefenseGrade(team.overall_defense_rank)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Rankings Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">📊 Complete Defensive Rankings</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass Yds/G</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rec Yds/G</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Targets/G</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TDs/G</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fantasy/G</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">YAC/G</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((team, index) => (
                    <tr key={team.team} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          team.overall_defense_rank <= 5 ? 'bg-green-100 text-green-800' :
                          team.overall_defense_rank <= 15 ? 'bg-yellow-100 text-yellow-800' :
                          team.overall_defense_rank <= 25 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(team.overall_defense_rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-lg">{team.team}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          team.overall_defense_rank <= 5 ? 'bg-green-100 text-green-800' :
                          team.overall_defense_rank <= 10 ? 'bg-blue-100 text-blue-800' :
                          team.overall_defense_rank <= 20 ? 'bg-yellow-100 text-yellow-800' :
                          team.overall_defense_rank <= 25 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getDefenseGrade(team.overall_defense_rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{team.passing_yards_allowed_per_game.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">{team.receiving_yards_allowed_per_game.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{team.targets_allowed_per_game.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{team.receiving_tds_allowed_per_game.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{team.fantasy_points_allowed_per_game.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{team.yac_allowed_per_game.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Defensive Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              🎯 Target These Defenses
            </h3>
            <div className="space-y-3">
              {sortedData.slice(-5).reverse().map((team, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-semibold">{team.team}</span>
                  <span className="text-red-600 text-sm">
                    {team.receiving_yards_allowed_per_game.toFixed(0)} yds/g
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Weakest pass defenses - target all skill positions
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              🛡️ Avoid These Defenses
            </h3>
            <div className="space-y-3">
              {sortedData.slice(0, 5).map((team, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-semibold">{team.team}</span>
                  <span className="text-green-600 text-sm">
                    {team.receiving_yards_allowed_per_game.toFixed(0)} yds/g
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Elite defenses - proceed with caution
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              📈 Key Insights
            </h3>
            <div className="space-y-3 text-sm">
              <p><strong>Best Pass Defense:</strong> {sortedData[0]?.team} ({sortedData[0]?.passing_yards_allowed_per_game.toFixed(1)} yds/g)</p>
              <p><strong>Worst Pass Defense:</strong> {sortedData[sortedData.length-1]?.team} ({sortedData[sortedData.length-1]?.passing_yards_allowed_per_game.toFixed(1)} yds/g)</p>
              <p><strong>Avg Targets Allowed:</strong> {(defensiveData.reduce((sum, team) => sum + team.targets_allowed_per_game, 0) / defensiveData.length).toFixed(1)}/game</p>
              <p><strong>Range:</strong> {(sortedData[sortedData.length-1]?.receiving_yards_allowed_per_game - sortedData[0]?.receiving_yards_allowed_per_game).toFixed(0)} yard difference</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 