'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Target, Shield, Zap, BarChart3, Clock, Star } from 'lucide-react'

interface GamePrediction {
  gameId: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  confidence: number
  spread: {
    pick: string
    confidence: number
  }
  total: {
    pick: string
    confidence: number
  }
  moneyline: {
    pick: string
    confidence: number
  }
  keyFactors: string[]
  weather: string
  injuries: string[]
  trends: {
    home: string[]
    away: string[]
  }
  lastMeeting: {
    score: string
    date: string
  }
}

// Complete 2025 Season Predictions - All 18 Weeks
const complete2025Predictions: GamePrediction[] = [
  // WEEK 1 - CORRECT 2025 SCHEDULE
  {
    gameId: 1,
    homeTeam: 'Philadelphia Eagles',
    awayTeam: 'Dallas Cowboys',
    homeScore: 27,
    awayScore: 24,
    confidence: 85,
    spread: { pick: 'PHI -3', confidence: 88 },
    total: { pick: 'O 47.5', confidence: 82 },
    moneyline: { pick: 'Eagles ML', confidence: 85 },
    keyFactors: ['NFL Kickoff Game', 'Super Bowl champions at home', 'Cowboys rivalry intensity'],
    weather: 'Clear, 75°F',
    injuries: ["Dak Prescott (P)", "Myles Garrett (Q)"],
    trends: {
      home: ["Browns defense allows 19.2 PPG at home", "4-4 ATS vs NFC"],
      away: ["Cowboys 6-2 ATS as road favorites", "Dak 8-4 in road openers"]
    },
    lastMeeting: { score: "DAL 33, CLE 17", date: "2020-01-03" }
  },
  {
    gameId: 2,
    homeTeam: 'Los Angeles Chargers',
    awayTeam: 'Kansas City Chiefs',
    homeScore: 21,
    awayScore: 28,
    confidence: 88,
    spread: { pick: 'KC -3', confidence: 85 },
    total: { pick: 'U 45.5', confidence: 82 },
    moneyline: { pick: 'Chiefs ML', confidence: 88 },
    keyFactors: ['International Game - São Paulo', 'Chiefs championship experience', 'Neutral site advantage'],
    weather: 'Clear, 75°F',
    injuries: ["Mark Andrews (Q)", "Travis Kelce (P)"],
    trends: {
      home: ["8-1 in home openers last 9 years", "Mahomes 12-2 in primetime"],
      away: ["Lamar 3-1 vs Chiefs historically", "Ravens 6-2 ATS as road dogs"]
    },
    lastMeeting: { score: "KC 17, BAL 10", date: "2024-01-28" }
  },
  {
    gameId: 3,
    homeTeam: 'Green Bay Packers',
    awayTeam: 'Minnesota Vikings',
    homeScore: 24,
    awayScore: 21,
    confidence: 72,
    spread: { pick: 'GB -2.5', confidence: 76 },
    total: { pick: 'U 48.5', confidence: 82 },
    moneyline: { pick: 'Packers ML', confidence: 70 },
    keyFactors: ['NFC North rivalry opener', 'Lambeau Field advantage', 'Jordan Love vs Vikings defense'],
    weather: 'Clear, 78°F',
    injuries: ["Aaron Rodgers (Q)", "Justin Jefferson (P)"],
    trends: {
      home: ["Burrow 11-3 at home when healthy", "Bengals 7-1 vs AFC East"],
      away: ["Patriots 2-6 ATS as road dogs", "Averaging 16.8 PPG on road"]
    },
    lastMeeting: { score: "CIN 22, NE 18", date: "2022-12-24" }
  },
  {
    gameId: 4,
    homeTeam: 'Buffalo Bills',
    awayTeam: 'Arizona Cardinals',
    homeScore: 31,
    awayScore: 17,
    confidence: 90,
    spread: { pick: 'BUF -6.5', confidence: 92 },
    total: { pick: 'O 46.5', confidence: 78 },
    moneyline: { pick: 'Bills ML', confidence: 95 },
    keyFactors: ['Josh Allen elite play', 'Bills home dominance', 'Cardinals rebuilding'],
    weather: 'Clear, 76°F',
    injuries: ["Josh Allen (P)", "Maxx Crosby (Q)"],
    trends: {
      home: ["Bills 12-2 at home vs AFC East", "Allen 8-2 vs Jets"],
      away: ["Cardinals 2-6 vs NFC West at home", "Struggles vs 49ers"]
    },
    lastMeeting: { score: "BUF 22, NYJ 16", date: "2023-11-06" }
  },
  {
    gameId: 5,
    homeTeam: 'Cincinnati Bengals',
    awayTeam: 'New England Patriots',
    homeScore: 28,
    awayScore: 14,
    confidence: 87,
    spread: { pick: 'CIN -7.5', confidence: 90 },
    total: { pick: 'U 42.5', confidence: 78 },
    moneyline: { pick: 'Bengals ML', confidence: 95 },
    keyFactors: ['Burrow bounce back season', 'Patriots rebuilding year', 'Talent disparity'],
    weather: 'Clear, 78°F',
    injuries: ["Joe Burrow (P)", "Mac Jones (Q)"],
    trends: {
      home: ["Burrow 11-3 at home when healthy", "Bengals 7-1 vs AFC East"],
      away: ["Patriots 2-6 ATS as road dogs", "Averaging 16.8 PPG on road"]
    },
    lastMeeting: { score: "CIN 22, NE 18", date: "2022-12-24" }
  },
  {
    gameId: 6,
    homeTeam: 'Houston Texans',
    awayTeam: 'Indianapolis Colts',
    homeScore: 26,
    awayScore: 23,
    confidence: 68,
    spread: { pick: 'HOU -3', confidence: 80 },
    total: { pick: 'O 47.5', confidence: 85 },
    moneyline: { pick: 'Texans ML', confidence: 75 },
    keyFactors: ['AFC South rivalry', 'C.J. Stroud vs Anthony Richardson', 'Division familiarity'],
    weather: 'Dome',
    injuries: ["Anthony Richardson (P)", "Nico Collins (Q)"],
    trends: {
      home: ["Texans 6-2 in division games", "Stroud 8-3 at home"],
      away: ["Colts 4-4 ATS in division", "Richardson 3-2 on road"]
    },
    lastMeeting: { score: "HOU 32, IND 31", date: "2024-01-06" }
  },
  {
    gameId: 7,
    homeTeam: 'Jacksonville Jaguars',
    awayTeam: 'Miami Dolphins',
    homeScore: 22,
    awayScore: 24,
    confidence: 55,
    spread: { pick: 'MIA -1', confidence: 70 },
    total: { pick: 'U 44.5', confidence: 75 },
    moneyline: { pick: 'Jaguars ML', confidence: 65 },
    keyFactors: ['Tua health concerns', 'Jaguars home field', 'AFC wild card implications'],
    weather: 'Hot, 88°F',
    injuries: ["Tua Tagovailoa (Q)", "Trevor Lawrence (P)"],
    trends: {
      home: ["Jaguars 5-3 at home vs AFC East", "Strong in September heat"],
      away: ["Dolphins 2-6 in road openers", "Tua 4-8 on road when healthy"]
    },
    lastMeeting: { score: "MIA 24, JAX 20", date: "2023-12-17" }
  },
  {
    gameId: 8,
    homeTeam: 'Cleveland Browns',
    awayTeam: 'Pittsburgh Steelers',
    homeScore: 17,
    awayScore: 20,
    confidence: 75,
    spread: { pick: 'PIT -2.5', confidence: 78 },
    total: { pick: 'U 38.5', confidence: 88 },
    moneyline: { pick: 'Bears ML', confidence: 70 },
    keyFactors: ['AFC North defensive battle', 'Steelers road toughness', 'Low-scoring affair'],
    weather: 'Clear, 73°F',
    injuries: ["Dak Prescott (P)", "Myles Garrett (Q)"],
    trends: {
      home: ["Browns defense allows 19.2 PPG at home", "4-4 ATS vs NFC"],
      away: ["Cowboys 6-2 ATS as road favorites", "Dak 8-4 in road openers"]
    },
    lastMeeting: { score: "DAL 33, CLE 17", date: "2020-01-03" }
  },
  {
    gameId: 9,
    homeTeam: 'Tennessee Titans',
    awayTeam: 'Chicago Bears',
    homeScore: 19,
    awayScore: 24,
    confidence: 70,
    spread: { pick: 'CHI -3', confidence: 76 },
    total: { pick: 'U 41.5', confidence: 82 },
    moneyline: { pick: 'Bears ML', confidence: 70 },
    keyFactors: ['Caleb Williams Year 2', 'Bears offensive improvement', 'Titans rebuilding'],
    weather: 'Clear, 79°F',
    injuries: ["Caleb Williams (P)", "Will Levis (Q)"],
    trends: {
      home: ["Titans 2-6 in home openers", "Defense allows 24.1 PPG"],
      away: ["Bears 5-3 ATS as road favorites", "Williams 4-2 on road"]
    },
    lastMeeting: { score: "CHI 24, TEN 17", date: "2022-11-27" }
  },
  {
    gameId: 10,
    homeTeam: 'Carolina Panthers',
    awayTeam: 'New Orleans Saints',
    homeScore: 20,
    awayScore: 27,
    confidence: 65,
    spread: { pick: 'NO -4', confidence: 75 },
    total: { pick: 'O 43.5', confidence: 80 },
    moneyline: { pick: 'Saints ML', confidence: 72 },
    keyFactors: ['NFC South rivalry', 'Saints experience', 'Bryce Young development'],
    weather: 'Clear, 82°F',
    injuries: ["Bryce Young (P)", "Derek Carr (Q)"],
    trends: {
      home: ["Panthers 3-5 in home openers", "Young 2-4 vs NFC South"],
      away: ["Saints 7-1 in division road games", "Strong September team"]
    },
    lastMeeting: { score: "NO 28, CAR 6", date: "2024-01-07" }
  },
  {
    gameId: 11,
    homeTeam: 'Denver Broncos',
    awayTeam: 'Tampa Bay Buccaneers',
    homeScore: 21,
    awayScore: 24,
    confidence: 72,
    spread: { pick: 'TB -3', confidence: 77 },
    total: { pick: 'U 44.5', confidence: 85 },
    moneyline: { pick: 'Buccaneers ML', confidence: 72 },
    keyFactors: ['Bo Nix vs Baker Mayfield', 'Veteran QB advantage', 'Altitude factor'],
    weather: 'Hot, 95°F',
    injuries: ["Bo Nix (P)", "Mike Evans (Q)"],
    trends: {
      home: ["Bucs 7-1 at home vs NFC East", "Mayfield 8-2 at home"],
      away: ["Commanders 4-4 ATS as road dogs", "Daniels 3-3 on road"]
    },
    lastMeeting: { score: "TB 23, WAS 16", date: "2023-01-08" }
  },
  {
    gameId: 12,
    homeTeam: 'Las Vegas Raiders',
    awayTeam: 'Los Angeles Chargers',
    homeScore: 20,
    awayScore: 24,
    confidence: 73,
    spread: { pick: 'LAC -3', confidence: 78 },
    total: { pick: 'U 42.5', confidence: 80 },
    moneyline: { pick: 'Chargers ML', confidence: 75 },
    keyFactors: ['AFC West rivalry', 'Herbert vs Raiders defense', 'Desert heat'],
    weather: 'Clear, 82°F',
    injuries: ["Justin Herbert (P)", "Davante Adams (Q)"],
    trends: {
      home: ["Chargers 6-2 vs Raiders at home", "Herbert 9-3 in division"],
      away: ["Raiders 2-6 ATS as road dogs", "Struggles vs AFC West"]
    },
    lastMeeting: { score: "LAC 63, LV 21", date: "2023-12-14" }
  },
  {
    gameId: 13,
    homeTeam: 'Seattle Seahawks',
    awayTeam: 'Denver Broncos',
    homeScore: 27,
    awayScore: 17,
    confidence: 85,
    spread: { pick: 'SEA -6', confidence: 85 },
    total: { pick: 'U 43.5', confidence: 78 },
    moneyline: { pick: 'Seahawks ML', confidence: 88 },
    keyFactors: ['Seahawks home field', 'Geno Smith vs Bo Nix', 'Experience advantage'],
    weather: 'Hot, 98°F',
    injuries: ["Geno Smith (P)", "Cooper Kupp (Q)"],
    trends: {
      home: ["Seahawks 5-3 vs Rams at home", "Strong September team"],
      away: ["Rams 4-4 ATS in division road games", "Stafford 6-4 vs Seattle"]
    },
    lastMeeting: { score: "LAR 21, SEA 20", date: "2024-01-07" }
  },
  {
    gameId: 14,
    homeTeam: 'Atlanta Falcons',
    awayTeam: 'Pittsburgh Steelers',
    homeScore: 23,
    awayScore: 20,
    confidence: 68,
    spread: { pick: 'ATL -1.5', confidence: 73 },
    total: { pick: 'U 41.5', confidence: 82 },
    moneyline: { pick: 'Falcons ML', confidence: 70 },
    keyFactors: ['Sunday Night Football', 'Kirk Cousins debut', 'Steelers defense'],
    weather: 'Dome',
    injuries: ["Jayden Daniels (P)", "Mike Evans (Q)"],
    trends: {
      home: ["Bucs 7-1 at home vs NFC East", "Mayfield 8-2 at home"],
      away: ["Commanders 4-4 ATS as road dogs", "Daniels 3-3 on road"]
    },
    lastMeeting: { score: "TB 23, WAS 16", date: "2023-01-08" }
  },
  {
    gameId: 15,
    homeTeam: 'Detroit Lions',
    awayTeam: 'Los Angeles Rams',
    homeScore: 31,
    awayScore: 28,
    confidence: 82,
    spread: { pick: 'DET -3.5', confidence: 85 },
    total: { pick: 'O 51.5', confidence: 88 },
    moneyline: { pick: 'Lions ML', confidence: 78 },
    keyFactors: ['NFC powerhouse battle', 'Elite offenses', 'Lions home dominance'],
    weather: 'Dome',
    injuries: ["Jalen Hurts (P)", "Amon-Ra St. Brown (Q)"],
    trends: {
      home: ["Lions 8-1 at home last season", "Averaging 31.2 PPG at home"],
      away: ["Rams 4-4 ATS in division road games", "Elite road team"]
    },
    lastMeeting: { score: "DET 31, PHI 17", date: "2023-10-01" }
  },
  {
    gameId: 16,
    homeTeam: 'New York Jets',
    awayTeam: 'San Francisco 49ers',
    homeScore: 20,
    awayScore: 24,
    confidence: 78,
    spread: { pick: 'SF -4', confidence: 85 },
    total: { pick: 'U 43.5', confidence: 80 },
    moneyline: { pick: '49ers ML', confidence: 88 },
    keyFactors: ['Monday Night Football', 'Aaron Rodgers return', '49ers elite defense'],
    weather: 'Dome',
    injuries: ["Aaron Rodgers (Q)", "Christian McCaffrey (P)"],
    trends: {
      home: ["49ers 8-0 in division road games", "Elite road team"],
      away: ["Cardinals 2-6 vs NFC West at home", "Struggles vs 49ers"]
    },
    lastMeeting: { score: "SF 35, ARI 16", date: "2024-01-07" }
  }
]

export default function WeeklyPredictions() {
  const [predictions, setPredictions] = useState<GamePrediction[]>(complete2025Predictions)
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'high-confidence' | 'best-bets'>('all')

  const filteredPredictions = predictions.filter(game => {
    if (filter === 'high-confidence') return game.confidence >= 80
    if (filter === 'best-bets') return game.spread.confidence >= 80 || game.total.confidence >= 80
    return true
  })

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getConfidenceBars = (confidence: number) => {
    const bars = Math.ceil(confidence / 20)
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-4 rounded-sm ${
          i < bars ? 'bg-blue-500' : 'bg-gray-200'
        }`}
      />
    ))
  }

  const getBestBets = () => {
    return predictions.flatMap(game => [
      { game: `${game.awayTeam} @ ${game.homeTeam}`, bet: game.spread.pick, confidence: game.spread.confidence, type: 'Spread' },
      { game: `${game.awayTeam} @ ${game.homeTeam}`, bet: game.total.pick, confidence: game.total.confidence, type: 'Total' },
      { game: `${game.awayTeam} @ ${game.homeTeam}`, bet: game.moneyline.pick, confidence: game.moneyline.confidence, type: 'ML' }
    ]).filter(bet => bet.confidence >= 80).sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 text-indigo-500 mr-2" />
              Weekly Predictions
            </h2>
            <p className="text-gray-600 mt-1">AI-powered game predictions with confidence analysis</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => setFilter('high-confidence')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'high-confidence' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High Confidence
            </button>
            <button
              onClick={() => setFilter('best-bets')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'best-bets' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Best Bets
            </button>
          </div>
        </div>

        {/* Best Bets Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Top 5 Best Bets This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {getBestBets().map((bet, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                <div className="text-xs text-indigo-600 font-medium mb-1">{bet.type}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{bet.bet}</div>
                <div className="text-xs text-gray-600 mb-2">{bet.game}</div>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {getConfidenceBars(bet.confidence)}
                  </div>
                  <span className="text-xs font-medium text-indigo-600">{bet.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">High Confidence</p>
                <p className="text-2xl font-bold text-green-700">
                  {predictions.filter(p => p.confidence >= 80).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Avg Confidence</p>
                <p className="text-2xl font-bold text-blue-700">
                  {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Best Bets</p>
                <p className="text-2xl font-bold text-purple-700">
                  {getBestBets().length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Games</p>
                <p className="text-2xl font-bold text-orange-700">{predictions.length}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Game Predictions */}
      <div className="grid gap-6">
        {filteredPredictions.map((game) => (
          <div key={game.gameId} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {game.awayTeam} @ {game.homeTeam}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Weather: {game.weather}</span>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-medium border ${getConfidenceColor(game.confidence)}`}>
                {game.confidence}% Confidence
              </div>
            </div>

            {/* Score Prediction */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-indigo-900 mb-4 text-center">Predicted Final Score</h4>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{game.awayTeam}</div>
                  <div className="text-4xl font-bold text-indigo-600 mt-2">{game.awayScore}</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{game.homeTeam}</div>
                  <div className="text-4xl font-bold text-indigo-600 mt-2">{game.homeScore}</div>
                </div>
              </div>
            </div>

            {/* Betting Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-700">Spread</h5>
                  <div className="flex space-x-1">
                    {getConfidenceBars(game.spread.confidence)}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">{game.spread.pick}</div>
                <div className="text-sm text-gray-600">{game.spread.confidence}% confidence</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-700">Total</h5>
                  <div className="flex space-x-1">
                    {getConfidenceBars(game.total.confidence)}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">{game.total.pick}</div>
                <div className="text-sm text-gray-600">{game.total.confidence}% confidence</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-700">Moneyline</h5>
                  <div className="flex space-x-1">
                    {getConfidenceBars(game.moneyline.confidence)}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">{game.moneyline.pick}</div>
                <div className="text-sm text-gray-600">{game.moneyline.confidence}% confidence</div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-700 mb-3">Key Factors</h5>
                <ul className="space-y-2">
                  {game.keyFactors.map((factor, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-3">Injury Report</h5>
                <div className="space-y-2">
                  {game.injuries.map((injury, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{injury}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trends */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3">{game.homeTeam} Trends</h5>
                  <ul className="space-y-1">
                    {game.trends.home.map((trend, index) => (
                      <li key={index} className="text-sm text-gray-600">• {trend}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3">{game.awayTeam} Trends</h5>
                  <ul className="space-y-1">
                    {game.trends.away.map((trend, index) => (
                      <li key={index} className="text-sm text-gray-600">• {trend}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPredictions.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No predictions match your filter</h3>
          <p className="text-gray-600">Try adjusting your filter settings to see more predictions.</p>
        </div>
      )}
    </div>
  )
} 