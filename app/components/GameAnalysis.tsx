'use client'

import { useState, useEffect } from 'react'
import { Activity, Target, BarChart3, Clock, TrendingUp, Shield } from 'lucide-react'
import nflDataService from '../../src/services/nflDataService'

interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  homeTeamName: string
  awayTeamName: string
  time: string
  week: number
  status: string
  venue: string
  network: string
}

interface GameOdds {
  gameId: string
  homeTeam: string
  awayTeam: string
  spread: {
    home: number
    away: number
    juice: string
  }
  total: {
    over: number
    under: number
    juice: string
  }
  moneyline: {
    home: number
    away: number
  }
  lastUpdated: string
  source: string
}

interface GameAnalysis {
  gameId: string
  homeTeam: string
  awayTeam: string
  prediction: {
    homeScore: number
    awayScore: number
    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  }
  keyFactors: string[]
  recommendation: string
  analysis: string
}

export default function GameAnalysis() {
  const [games, setGames] = useState<Game[]>([])
  const [odds, setOdds] = useState<GameOdds[]>([])
  const [analyses, setAnalyses] = useState<GameAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    loadGameData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadGameData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadGameData = async () => {
    try {
      const [scheduleData, oddsData] = await Promise.all([
        nflDataService.fetchLiveSchedule(),
        nflDataService.fetchLiveOdds()
      ])

      setGames(scheduleData)
      setOdds(oddsData)
      
      // Generate analyses for each game
      const gameAnalyses = generateGameAnalyses(scheduleData, oddsData)
      setAnalyses(gameAnalyses)
      
      setLastUpdate(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (error) {
      console.error('Error loading game analysis data:', error)
      setLoading(false)
    }
  }

  const generateGameAnalyses = (games: Game[], odds: GameOdds[]): GameAnalysis[] => {
    const teamStrength = {
      'KC': 95, 'BUF': 92, 'PHI': 90, 'SF': 89, 'BAL': 88,
      'CIN': 85, 'DET': 84, 'MIA': 82, 'LAC': 81, 'DAL': 80,
      'GB': 79, 'MIN': 78, 'HOU': 77, 'NYJ': 76, 'LV': 75,
      'ATL': 74, 'TB': 73, 'SEA': 72, 'LAR': 71, 'IND': 70,
      'PIT': 69, 'CLE': 68, 'JAX': 67, 'TEN': 66, 'WAS': 65,
      'NO': 64, 'DEN': 63, 'CHI': 62, 'NYG': 61, 'ARI': 60,
      'CAR': 59, 'NE': 58
    }

    return games.map(game => {
      const gameOdds = odds.find(o => o.gameId === game.id)
      const homeStrength = teamStrength[game.homeTeam] || 70
      const awayStrength = teamStrength[game.awayTeam] || 70
      
      // Calculate predicted scores
      const baseScore = 21
      const homeScore = Math.round(baseScore + (homeStrength - 70) / 5 + 3) // Home field advantage
      const awayScore = Math.round(baseScore + (awayStrength - 70) / 5)
      
      // Determine confidence based on strength difference
      const strengthDiff = Math.abs(homeStrength - awayStrength)
      const confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 
        strengthDiff > 15 ? 'HIGH' : strengthDiff > 8 ? 'MEDIUM' : 'LOW'

      // Generate key factors
      const keyFactors = []
      if (homeStrength > awayStrength + 10) {
        keyFactors.push(`${game.homeTeam} significant talent advantage`)
      } else if (awayStrength > homeStrength + 10) {
        keyFactors.push(`${game.awayTeam} significant talent advantage`)
      }
      keyFactors.push('Home field advantage (+3 points)')
      keyFactors.push('Week 1 - Fresh legs, new schemes')
      
      // Special game notes
      if (game.homeTeam === 'PHI' && game.awayTeam === 'DAL') {
        keyFactors.push('NFL Kickoff Game - National spotlight')
      }
      if (game.homeTeam === 'LAC' && game.awayTeam === 'KC') {
        keyFactors.push('International game in Brazil - Neutral site')
      }

      // Generate recommendation
      let recommendation = ''
      if (gameOdds) {
        const predictedSpread = homeScore - awayScore
        const actualSpread = gameOdds.spread.home
        if (Math.abs(predictedSpread - actualSpread) > 2) {
          recommendation = `Value on ${predictedSpread > actualSpread ? game.homeTeam : game.awayTeam} spread`
        } else {
          recommendation = `Total ${homeScore + awayScore > gameOdds.total.over ? 'Over' : 'Under'} ${gameOdds.total.over}`
        }
      }

      return {
        gameId: game.id,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        prediction: {
          homeScore,
          awayScore,
          confidence
        },
        keyFactors,
        recommendation: recommendation || 'Monitor line movement',
        analysis: `${game.homeTeamName} (${homeStrength}/100) hosts ${game.awayTeamName} (${awayStrength}/100). ${
          homeStrength > awayStrength ? game.homeTeam : game.awayTeam
        } has the talent edge, but Week 1 can be unpredictable with new schemes and rust.`
      }
    })
  }

  const getGameOdds = (gameId: string) => {
    return odds.find(o => o.gameId === gameId)
  }

  const getGameAnalysis = (gameId: string) => {
    return analyses.find(a => a.gameId === gameId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Analyzing Week 1 Games...</p>
          <p className="text-gray-500">Generating predictions and recommendations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-500 mr-3" />
              Week 1 Game Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Automated analysis of all {games.length} Week 1 games • Updated: {lastUpdate}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{games.length}</div>
            <div className="text-sm text-gray-500">Games Analyzed</div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid gap-6">
        {games.map((game) => {
          const gameOdds = getGameOdds(game.id)
          const analysis = getGameAnalysis(game.id)
          const isSelected = selectedGame === game.id

          return (
            <div key={game.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedGame(isSelected ? null : game.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Game Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">{game.awayTeamName}</div>
                        <div className="text-sm text-gray-500">{game.awayTeam}</div>
                        {analysis && (
                          <div className="text-lg font-semibold text-blue-600 mt-1">
                            {analysis.prediction.awayScore}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center px-4">
                        <div className="text-gray-400 font-bold text-xl">@</div>
                        <div className="text-xs text-gray-500 mt-1">vs</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">{game.homeTeamName}</div>
                        <div className="text-sm text-gray-500">{game.homeTeam}</div>
                        {analysis && (
                          <div className="text-lg font-semibold text-blue-600 mt-1">
                            {analysis.prediction.homeScore}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {game.time}
                      </span>
                      <span>•</span>
                      <span>{game.network}</span>
                      <span>•</span>
                      <span>{game.venue}</span>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center space-x-6">
                      {gameOdds && (
                        <>
                          <div className="text-sm">
                            <span className="text-gray-500">Spread:</span>
                            <span className="font-medium ml-1">
                              {game.homeTeam} {gameOdds.spread.home > 0 ? '+' : ''}{gameOdds.spread.home}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium ml-1">{gameOdds.total.over}</span>
                          </div>
                        </>
                      )}
                      {analysis && (
                        <div className="text-sm">
                          <span className="text-gray-500">Confidence:</span>
                          <span className={`font-medium ml-1 ${
                            analysis.prediction.confidence === 'HIGH' ? 'text-green-600' :
                            analysis.prediction.confidence === 'MEDIUM' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {analysis.prediction.confidence}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand Button */}
                  <div className="ml-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg 
                        className={`h-6 w-6 transform transition-transform ${isSelected ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Analysis */}
              {isSelected && analysis && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Analysis */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Target className="h-5 w-5 text-orange-500 mr-2" />
                        Game Analysis
                      </h4>
                      <p className="text-gray-700 mb-4">{analysis.analysis}</p>
                      
                      <h5 className="font-medium text-gray-900 mb-2">Key Factors:</h5>
                      <ul className="space-y-1">
                        {analysis.keyFactors.map((factor, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        Betting Recommendation
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="font-medium text-green-700 mb-2">
                          {analysis.recommendation}
                        </div>
                        <div className="text-sm text-gray-600">
                          Prediction: {game.homeTeam} {analysis.prediction.homeScore} - {game.awayTeam} {analysis.prediction.awayScore}
                        </div>
                        {gameOdds && (
                          <div className="text-xs text-gray-500 mt-2">
                            Current odds updated: {gameOdds.lastUpdated}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Analysis Summary</h3>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-orange-700 font-medium">High Confidence</div>
                <div className="text-orange-600">
                  {analyses.filter(a => a.prediction.confidence === 'HIGH').length} games
                </div>
              </div>
              <div>
                <div className="text-orange-700 font-medium">Medium Confidence</div>
                <div className="text-orange-600">
                  {analyses.filter(a => a.prediction.confidence === 'MEDIUM').length} games
                </div>
              </div>
              <div>
                <div className="text-orange-700 font-medium">Low Confidence</div>
                <div className="text-orange-600">
                  {analyses.filter(a => a.prediction.confidence === 'LOW').length} games
                </div>
              </div>
            </div>
          </div>
          <div className="text-orange-500">
            <Shield className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
} 