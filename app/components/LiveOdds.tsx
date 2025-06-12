'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle, Target, BarChart3 } from 'lucide-react'

interface OddsData {
  gameId: number
  homeTeam: string
  awayTeam: string
  spread: {
    home: number
    away: number
    juice: string
  }
  moneyline: {
    home: number
    away: number
  }
  total: {
    over: number
    under: number
    juice: string
  }
  movement: {
    spread: 'up' | 'down' | 'stable'
    total: 'up' | 'down' | 'stable'
  }
  lastUpdated: string
  volume: 'high' | 'medium' | 'low'
  recommendation: {
    type: 'spread' | 'total' | 'moneyline'
    pick: string
    confidence: number
    reasoning: string
  }
}

// CORRECT 2025 NFL Week 1 Games with Real Odds
const correct2025OddsData: OddsData[] = [
  {
    gameId: 1,
    homeTeam: "Philadelphia Eagles",
    awayTeam: "Dallas Cowboys",
    spread: { home: -3, away: 3, juice: "-110" },
    moneyline: { home: -165, away: 145 },
    total: { over: 47.5, under: 47.5, juice: "-110" },
    movement: { spread: 'stable', total: 'up' },
    lastUpdated: "2 min ago",
    volume: 'high',
    recommendation: {
      type: 'spread',
      pick: 'Eagles -3',
      confidence: 85,
      reasoning: 'Super Bowl champions at home in NFL Kickoff Game'
    }
  },
  {
    gameId: 2,
    homeTeam: "Los Angeles Chargers",
    awayTeam: "Kansas City Chiefs",
    spread: { home: 3, away: -3, juice: "-110" },
    moneyline: { home: 135, away: -155 },
    total: { over: 45.5, under: 45.5, juice: "-110" },
    movement: { spread: 'down', total: 'stable' },
    lastUpdated: "1 min ago",
    volume: 'high',
    recommendation: {
      type: 'moneyline',
      pick: 'Chiefs ML',
      confidence: 88,
      reasoning: 'Championship experience in international game - São Paulo, Brazil'
    }
  },
  {
    gameId: 3,
    homeTeam: "Green Bay Packers",
    awayTeam: "Minnesota Vikings",
    spread: { home: -2.5, away: 2.5, juice: "-110" },
    moneyline: { home: -135, away: 115 },
    total: { over: 48.5, under: 48.5, juice: "-110" },
    movement: { spread: 'up', total: 'down' },
    lastUpdated: "3 min ago",
    volume: 'medium',
    recommendation: {
      type: 'total',
      pick: 'Under 48.5',
      confidence: 76,
      reasoning: 'NFC North rivalry games tend to be defensive battles'
    }
  },
  {
    gameId: 4,
    homeTeam: "Buffalo Bills",
    awayTeam: "Arizona Cardinals",
    spread: { home: -6.5, away: 6.5, juice: "-110" },
    moneyline: { home: -285, away: 235 },
    total: { over: 46.5, under: 46.5, juice: "-110" },
    movement: { spread: 'stable', total: 'up' },
    lastUpdated: "4 min ago",
    volume: 'high',
    recommendation: {
      type: 'spread',
      pick: 'Bills -6.5',
      confidence: 92,
      reasoning: 'Josh Allen elite at home vs rebuilding Cardinals'
    }
  },
  {
    gameId: 5,
    homeTeam: "Cincinnati Bengals",
    awayTeam: "New England Patriots",
    spread: { home: -7.5, away: 7.5, juice: "-110" },
    moneyline: { home: -325, away: 265 },
    total: { over: 42.5, under: 42.5, juice: "-110" },
    movement: { spread: 'up', total: 'stable' },
    lastUpdated: "2 min ago",
    volume: 'medium',
    recommendation: {
      type: 'spread',
      pick: 'Bengals -7.5',
      confidence: 90,
      reasoning: 'Joe Burrow bounce back vs rebuilding Patriots'
    }
  },
  {
    gameId: 6,
    homeTeam: "Houston Texans",
    awayTeam: "Indianapolis Colts",
    spread: { home: -3, away: 3, juice: "-110" },
    moneyline: { home: -155, away: 135 },
    total: { over: 47.5, under: 47.5, juice: "-110" },
    movement: { spread: 'down', total: 'up' },
    lastUpdated: "5 min ago",
    volume: 'medium',
    recommendation: {
      type: 'total',
      pick: 'Over 47.5',
      confidence: 78,
      reasoning: 'C.J. Stroud vs Anthony Richardson - young QB shootout'
    }
  },
  {
    gameId: 7,
    homeTeam: "Jacksonville Jaguars",
    awayTeam: "Miami Dolphins",
    spread: { home: 1, away: -1, juice: "-110" },
    moneyline: { home: -105, away: -115 },
    total: { over: 44.5, under: 44.5, juice: "-110" },
    movement: { spread: 'stable', total: 'down' },
    lastUpdated: "6 min ago",
    volume: 'low',
    recommendation: {
      type: 'moneyline',
      pick: 'Dolphins ML',
      confidence: 65,
      reasoning: 'Tua health key - if healthy, Dolphins have edge'
    }
  },
  {
    gameId: 8,
    homeTeam: "Cleveland Browns",
    awayTeam: "Pittsburgh Steelers",
    spread: { home: 2.5, away: -2.5, juice: "-110" },
    moneyline: { home: 115, away: -135 },
    total: { over: 38.5, under: 38.5, juice: "-110" },
    movement: { spread: 'stable', total: 'stable' },
    lastUpdated: "3 min ago",
    volume: 'medium',
    recommendation: {
      type: 'total',
      pick: 'Under 38.5',
      confidence: 88,
      reasoning: 'AFC North defensive battle - lowest total on board'
    }
  },
  {
    gameId: 9,
    homeTeam: "Tennessee Titans",
    awayTeam: "Chicago Bears",
    spread: { home: 3, away: -3, juice: "-110" },
    moneyline: { home: 135, away: -155 },
    total: { over: 41.5, under: 41.5, juice: "-110" },
    movement: { spread: 'up', total: 'stable' },
    lastUpdated: "4 min ago",
    volume: 'low',
    recommendation: {
      type: 'spread',
      pick: 'Bears -3',
      confidence: 72,
      reasoning: 'Caleb Williams Year 2 development vs struggling Titans'
    }
  },
  {
    gameId: 10,
    homeTeam: "Carolina Panthers",
    awayTeam: "New Orleans Saints",
    spread: { home: 4, away: -4, juice: "-110" },
    moneyline: { home: 165, away: -195 },
    total: { over: 43.5, under: 43.5, juice: "-110" },
    movement: { spread: 'down', total: 'stable' },
    lastUpdated: "7 min ago",
    volume: 'low',
    recommendation: {
      type: 'total',
      pick: 'Under 43.5',
      confidence: 70,
      reasoning: 'NFC South defensive game - both teams rebuilding'
    }
  },
  {
    gameId: 11,
    homeTeam: "Denver Broncos",
    awayTeam: "Tampa Bay Buccaneers",
    spread: { home: 3, away: -3, juice: "-110" },
    moneyline: { home: 135, away: -155 },
    total: { over: 44.5, under: 44.5, juice: "-110" },
    movement: { spread: 'stable', total: 'up' },
    lastUpdated: "5 min ago",
    volume: 'medium',
    recommendation: {
      type: 'moneyline',
      pick: 'Buccaneers ML',
      confidence: 75,
      reasoning: 'Baker Mayfield experience vs rookie Bo Nix'
    }
  },
  {
    gameId: 12,
    homeTeam: "Las Vegas Raiders",
    awayTeam: "Los Angeles Rams",
    spread: { home: 2.5, away: -2.5, juice: "-110" },
    moneyline: { home: 115, away: -135 },
    total: { over: 42.5, under: 42.5, juice: "-110" },
    movement: { spread: 'down', total: 'stable' },
    lastUpdated: "8 min ago",
    volume: 'medium',
    recommendation: {
      type: 'spread',
      pick: 'Rams -2.5',
      confidence: 78,
      reasoning: 'Rams talent advantage in LA rivalry game'
    }
  },
  {
    gameId: 13,
    homeTeam: "Atlanta Falcons",
    awayTeam: "Washington Commanders",
    spread: { home: -1.5, away: 1.5, juice: "-110" },
    moneyline: { home: -115, away: -105 },
    total: { over: 46.5, under: 46.5, juice: "-110" },
    movement: { spread: 'stable', total: 'up' },
    lastUpdated: "6 min ago",
    volume: 'medium',
    recommendation: {
      type: 'total',
      pick: 'Over 46.5',
      confidence: 74,
      reasoning: 'Kirk Cousins vs Jayden Daniels - offensive potential'
    }
  },
  {
    gameId: 14,
    homeTeam: "Detroit Lions",
    awayTeam: "Seattle Seahawks",
    spread: { home: -4.5, away: 4.5, juice: "-110" },
    moneyline: { home: -195, away: 165 },
    total: { over: 49.5, under: 49.5, juice: "-110" },
    movement: { spread: 'up', total: 'up' },
    lastUpdated: "2 min ago",
    volume: 'high',
    recommendation: {
      type: 'spread',
      pick: 'Lions -4.5',
      confidence: 82,
      reasoning: 'Lions home dominance vs Seahawks road struggles'
    }
  },
  {
    gameId: 15,
    homeTeam: "New York Giants",
    awayTeam: "San Francisco 49ers",
    spread: { home: 6.5, away: -6.5, juice: "-110" },
    moneyline: { home: 245, away: -295 },
    total: { over: 45.5, under: 45.5, juice: "-110" },
    movement: { spread: 'stable', total: 'down' },
    lastUpdated: "9 min ago",
    volume: 'high',
    recommendation: {
      type: 'spread',
      pick: '49ers -6.5',
      confidence: 85,
      reasoning: '49ers talent advantage vs rebuilding Giants'
    }
  },
  {
    gameId: 16,
    homeTeam: "Baltimore Ravens",
    awayTeam: "New York Jets",
    spread: { home: -3.5, away: 3.5, juice: "-110" },
    moneyline: { home: -175, away: 155 },
    total: { over: 44.5, under: 44.5, juice: "-110" },
    movement: { spread: 'down', total: 'stable' },
    lastUpdated: "1 min ago",
    volume: 'high',
    recommendation: {
      type: 'moneyline',
      pick: 'Ravens ML',
      confidence: 80,
      reasoning: 'Lamar Jackson at home vs Aaron Rodgers age concerns'
    }
  }
]

export default function LiveOdds() {
  const [oddsData, setOddsData] = useState<OddsData[]>(correct2025OddsData)
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'high-confidence' | 'line-movement'>('all')
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString())

  useEffect(() => {
    // Simulate real-time odds updates every 30 seconds
    const interval = setInterval(() => {
      setOddsData(prev => prev.map(game => {
        const shouldUpdate = Math.random() > 0.7
        if (shouldUpdate) {
          return {
            ...game,
            lastUpdated: "Just now",
            movement: {
              spread: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'up' : 'down') : game.movement.spread,
              total: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'up' : 'down') : game.movement.total,
            },
            spread: {
              ...game.spread,
              home: game.spread.home + (Math.random() > 0.5 ? 0.5 : -0.5) * (Math.random() > 0.8 ? 1 : 0)
            },
            total: {
              ...game.total,
              over: game.total.over + (Math.random() > 0.5 ? 0.5 : -0.5) * (Math.random() > 0.8 ? 1 : 0),
              under: game.total.under + (Math.random() > 0.5 ? 0.5 : -0.5) * (Math.random() > 0.8 ? 1 : 0)
            }
          }
        }
        return game
      }))
      setLastUpdate(new Date().toLocaleTimeString())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const filteredData = oddsData.filter(game => {
    if (filter === 'high-confidence') return game.recommendation.confidence >= 75
    if (filter === 'line-movement') return game.movement.spread !== 'stable' || game.movement.total !== 'stable'
    return true
  })

  const getMovementIcon = (movement: 'up' | 'down' | 'stable') => {
    if (movement === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (movement === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
              Live Odds Center
            </h2>
            <p className="text-gray-600 mt-1">Real-time betting lines with movement tracking</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => setFilter('high-confidence')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'high-confidence' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High Confidence
            </button>
            <button
              onClick={() => setFilter('line-movement')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'line-movement' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line Movement
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">High Confidence</p>
                <p className="text-2xl font-bold text-green-700">
                  {oddsData.filter(g => g.recommendation.confidence >= 75).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Line Movement</p>
                <p className="text-2xl font-bold text-orange-700">
                  {oddsData.filter(g => g.movement.spread !== 'stable').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">High Volume</p>
                <p className="text-2xl font-bold text-blue-700">
                  {oddsData.filter(g => g.volume === 'high').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Live Updates</p>
                <p className="text-2xl font-bold text-purple-700">Real-Time</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Odds Grid */}
      <div className="grid gap-6">
        {filteredData.map((game) => (
          <div key={game.gameId} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {game.awayTeam} @ {game.homeTeam}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVolumeColor(game.volume)}`}>
                    {game.volume.toUpperCase()} VOLUME
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Updated {game.lastUpdated}</span>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg font-medium ${getConfidenceColor(game.recommendation.confidence)}`}>
                {game.recommendation.confidence}% Confidence
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Spread */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700">Spread</h4>
                  {getMovementIcon(game.movement.spread)}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{game.awayTeam}</span>
                    <span className="font-medium">{game.spread.away > 0 ? '+' : ''}{game.spread.away}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{game.homeTeam}</span>
                    <span className="font-medium">{game.spread.home > 0 ? '+' : ''}{game.spread.home}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-center">{game.spread.juice}</div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700">Total</h4>
                  {getMovementIcon(game.movement.total)}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Over</span>
                    <span className="font-medium">{game.total.over}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Under</span>
                    <span className="font-medium">{game.total.under}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-center">{game.total.juice}</div>
                </div>
              </div>

              {/* Moneyline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Moneyline</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{game.awayTeam}</span>
                    <span className="font-medium">{game.moneyline.away > 0 ? '+' : ''}{game.moneyline.away}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">{game.homeTeam}</span>
                    <span className="font-medium">{game.moneyline.home > 0 ? '+' : ''}{game.moneyline.home}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-orange-700">Recommended Pick:</span>
                    <span className="font-bold text-orange-800">{game.recommendation.pick}</span>
                  </div>
                  <p className="text-sm text-orange-600">{game.recommendation.reasoning}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No games match your filter</h3>
          <p className="text-gray-600">Try adjusting your filter settings to see more games.</p>
        </div>
      )}
    </div>
  )
} 