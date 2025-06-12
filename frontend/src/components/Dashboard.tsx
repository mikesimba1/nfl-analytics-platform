'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Activity, AlertCircle, CheckCircle, Clock, BarChart3, Target, AlertTriangle } from 'lucide-react'

interface DashboardStats {
  totalGames2024: number
  totalPlayers: number
  activePredictions: number
  accuracyRate: number
  lastUpdate: string
}

interface TopPick {
  id: string
  type: 'game' | 'prop' | 'total'
  description: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  odds: string
  reasoning: string
}

interface Game {
  id: string;
  away_team: string;
  home_team: string;
  week: number;
  spread?: number;
  total?: number;
  confidence?: number;
  awayTeamRating?: number;
  homeTeamRating?: number;
  awayEloRating?: number;
  homeEloRating?: number;
  weather?: {
    conditions: string;
    impact: string;
    temperature: number;
  };
  bettingEdge?: {
    recommendation: string;
    expectedValue: number;
  };
  analysis?: string;
}

interface PlayerProp {
  id: number;
  player: string;
  team: string;
  position: string;
  stat: string;
  line: number;
  confidence: number;
  recommendation: string;
  reasoning?: string;
  injuryStatus?: string;
  gameScript?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGames2024: 272,
    totalPlayers: 1696,
    activePredictions: 45,
    accuracyRate: 74.2,
    lastUpdate: new Date().toLocaleTimeString()
  })

  const [topPicks, setTopPicks] = useState<TopPick[]>([
    {
      id: '1',
      type: 'prop',
      description: 'Josh Allen - Over 2.5 Passing TDs',
      confidence: 'HIGH',
      odds: '+110',
      reasoning: 'Allen averages 2.8 TDs at home in cold weather. Dolphins defense allows 3rd most passing TDs.'
    },
    {
      id: '2', 
      type: 'game',
      description: 'Bills -6.5 vs Dolphins',
      confidence: 'HIGH',
      odds: '-110',
      reasoning: 'Bills 8-1 at home in December. Miami struggles in cold weather (2-6 in games under 45°F).'
    },
    {
      id: '3',
      type: 'total',
      description: 'Chiefs vs Chargers Under 42.5',
      confidence: 'MEDIUM',
      odds: '-105',
      reasoning: 'Both teams avg 20.1 and 18.7 points in last 6 games. Weather forecast shows 15+ mph winds.'
    }
  ])

  const [games, setGames] = useState<Game[]>([])
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([])
  const [bettingOdds, setBettingOdds] = useState<any[]>([])
  const [oddsStatus, setOddsStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch Week 1 2025 predictions from backend
      const gamesResponse = await fetch('http://localhost:3001/api/nfl/games/2024?week=1')
      const gamesData = await gamesResponse.json()
      
      // Fetch player props predictions from backend
      const propsResponse = await fetch('http://localhost:3001/api/predictions/player-props?week=1')
      const propsData = await propsResponse.json()
      
      // Fetch betting odds from backend
      const oddsResponse = await fetch('http://localhost:3001/api/odds/current')
      const oddsData = await oddsResponse.json()
      
      // Fetch odds status
      const statusResponse = await fetch('http://localhost:3001/api/odds/status')
      const statusData = await statusResponse.json()
      
      console.log('Games data:', gamesData) // Debug log
      console.log('Props data:', propsData) // Debug log
      console.log('Odds data:', oddsData) // Debug log
      console.log('Status data:', statusData) // Debug log
      
      setGames(gamesData.games || [])
      setPlayerProps(propsData.props || [])
      setBettingOdds(oddsData.data || [])
      setOddsStatus(statusData)
      setLastUpdate(new Date().toLocaleTimeString())
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set empty arrays on error
      setGames([])
      setPlayerProps([])
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'confidence-high'
      case 'MEDIUM': return 'confidence-medium'
      case 'LOW': return 'confidence-low'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return <CheckCircle className="h-4 w-4" />
      case 'MEDIUM': return <Clock className="h-4 w-4" />
      case 'LOW': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG PLAY': return 'bg-green-500/20 text-green-400'
      case 'MODERATE PLAY': return 'bg-blue-500/20 text-blue-400'
      case 'PASS': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const weeklyStats = [
    { 
      label: 'Week 1 Games', 
      value: loading ? '...' : games.length.toString(), 
      icon: Activity,
      color: 'text-blue-400'
    },
    { 
      label: 'High Confidence Props', 
      value: loading ? '...' : playerProps.filter(p => p.confidence >= 80).length.toString(), 
      icon: Target,
      color: 'text-green-400'
    },
    { 
      label: 'Strong Bets', 
      value: loading ? '...' : games.filter(g => g.bettingEdge?.recommendation === 'STRONG BET').length.toString(), 
      icon: Users,
      color: 'text-purple-400'
    },
    { 
      label: 'Last Updated', 
      value: loading ? 'Loading...' : lastUpdate, 
      icon: Clock,
      color: 'text-yellow-400'
    }
  ]

  const topProps = playerProps
    .filter(prop => prop.confidence >= 80)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  const upcomingGames = games.slice(0, 4)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">2025 NFL Season - Week 1 Predictions</h1>
        <p className="text-xl text-slate-300">AI-powered predictions for the 2025 season opener based on 2024 data analysis</p>
        <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
          <span className="text-sm font-medium">🔮 Predictive Mode: 2025 Week 1 Forecasts</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {weeklyStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Player Props */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-400" />
            <span>Top Week 1 Player Props</span>
          </h2>
          
          {topProps.length > 0 ? (
            <div className="space-y-4">
              {topProps.map((prop, index) => (
                <div key={prop.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{prop.player}</p>
                    <p className="text-sm text-slate-400">{prop.team} • {prop.stat} {prop.line}</p>
                    {prop.reasoning && (
                      <p className="text-xs text-slate-500 mt-1">{prop.reasoning.substring(0, 60)}...</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      prop.confidence >= 90 ? 'bg-green-500/20 text-green-400' :
                      prop.confidence >= 80 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {prop.confidence}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationColor(prop.recommendation)}`}>
                      {prop.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-slate-400">No high confidence props available</p>
            </div>
          )}
        </div>

        {/* Week 1 Games */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span>2025 Week 1 Season Openers</span>
          </h2>
          
          {upcomingGames.length > 0 ? (
            <div className="space-y-4">
              {upcomingGames.map((game, index) => (
                <div key={game.id} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">
                        {game.away_team} @ {game.home_team}
                      </p>
                      <p className="text-sm text-slate-400">
                        Away: {game.awayTeamRating}/100 • Home: {game.homeTeamRating}/100
                      </p>
                    </div>
                    <div className="text-right">
                      {game.spread && (
                        <p className="text-sm text-slate-300">Spread: {game.spread > 0 ? '+' : ''}{game.spread}</p>
                      )}
                      {game.total && (
                        <p className="text-sm text-slate-300">O/U: {game.total}</p>
                      )}
                      {game.confidence && (
                        <p className="text-xs text-slate-400">Confidence: {game.confidence}%</p>
                      )}
                    </div>
                  </div>
                  
                  {game.weather && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Weather: {game.weather.conditions} ({game.weather.temperature}°F)</span>
                      {game.bettingEdge && (
                        <span className={`px-2 py-1 rounded ${getRecommendationColor(game.bettingEdge.recommendation)}`}>
                          {game.bettingEdge.recommendation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-slate-400">No Week 1 predictions available</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Betting Odds Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <span>Live Betting Odds</span>
          </h2>
          {oddsStatus && oddsStatus.data && (
            <div className="text-sm text-slate-400 flex items-center space-x-2">
              <span>API Usage: {oddsStatus.data.daily?.used || 0}/{oddsStatus.data.daily?.limit || 16} today</span>
              <div className={`w-2 h-2 rounded-full ${
                oddsStatus.data.status === 'green' ? 'bg-green-400' : 
                oddsStatus.data.status === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          )}
        </div>

        {/* API Status */}
        {oddsStatus && oddsStatus.data && (
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">
                  Status: <span className={
                    oddsStatus.data.status === 'green' ? 'text-green-400' : 
                    oddsStatus.data.status === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {oddsStatus.data.canMakeCall ? 'Live API Active' : 'Using GitHub Scrapers'}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  Daily: {oddsStatus.data.daily?.used || 0}/{oddsStatus.data.daily?.limit || 16} • 
                  Monthly: {oddsStatus.data.monthly?.used || 0}/{oddsStatus.data.monthly?.limit || 500}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Source: {oddsStatus.data.current_source || 'GitHub Scrapers'}</p>
                <div className={`inline-block w-2 h-2 rounded-full ml-2 ${
                  oddsStatus.data.status === 'green' ? 'bg-green-400' : 
                  oddsStatus.data.status === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
            </div>
            
            {/* Available Sources */}
            <div className="mt-2 pt-2 border-t border-slate-600/50">
              <p className="text-xs text-slate-500 mb-1">Available Sources:</p>
              <div className="flex flex-wrap gap-1">
                {oddsStatus.data.available_sources?.map((source: string, index: number) => (
                  <span key={index} className="text-xs bg-slate-600/50 text-slate-300 px-2 py-1 rounded">
                    {source.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Betting Odds Display */}
        {bettingOdds.length > 0 ? (
          <div className="space-y-4">
            {bettingOdds.slice(0, 4).map((game, index) => (
              <div key={game.id || index} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">
                      {game.away_team} @ {game.home_team}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(game.commence_time).toLocaleDateString()} • 
                      <span className="ml-1 text-green-400">{game.source}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {game.bookmakers?.length || 0} sportsbooks
                    </p>
                  </div>
                </div>

                {/* Multiple Sportsbooks Display */}
                {game.bookmakers && game.bookmakers.length > 0 && (
                  <div className="space-y-2">
                    {game.bookmakers.slice(0, 3).map((bookmaker: any, bookIndex: number) => (
                      <div key={bookIndex} className="bg-slate-600/30 rounded p-3">
                        <p className="text-xs text-slate-400 mb-2 font-medium">{bookmaker.name}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Moneyline */}
                          {bookmaker.markets?.find((m: any) => m.key === 'h2h') && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Moneyline</p>
                              <div className="flex justify-between text-sm">
                                {bookmaker.markets.find((m: any) => m.key === 'h2h')?.outcomes?.map((outcome: any, i: number) => (
                                  <span key={i} className={`${
                                    outcome.price < 0 ? 'text-green-400' : 'text-blue-400'
                                  } font-medium`}>
                                    {outcome.name.split(' ').slice(-1)[0]}: {outcome.price > 0 ? '+' : ''}{outcome.price}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Spread */}
                          {bookmaker.markets?.find((m: any) => m.key === 'spreads') && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Spread</p>
                              <div className="flex justify-between text-sm">
                                {bookmaker.markets.find((m: any) => m.key === 'spreads')?.outcomes?.map((outcome: any, i: number) => (
                                  <span key={i} className="text-white font-medium">
                                    {outcome.name.split(' ').slice(-1)[0]} {outcome.point > 0 ? '+' : ''}{outcome.point} ({outcome.price > 0 ? '+' : ''}{outcome.price})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Show if more bookmakers available */}
                    {game.bookmakers.length > 3 && (
                      <p className="text-xs text-slate-500 text-center">
                        +{game.bookmakers.length - 3} more sportsbooks available
                      </p>
                    )}
                  </div>
                )}

                {/* Data Source Indicator */}
                <div className="mt-3 pt-2 border-t border-slate-600/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Updated: {new Date(game.cached_at || Date.now()).toLocaleTimeString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    game.source?.includes('Live') ? 'bg-green-500/20 text-green-400' : 
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {game.source?.includes('Live') ? '🔴 Live' : '📊 Scraped'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-slate-400">Loading betting odds...</p>
            <p className="text-xs text-slate-500 mt-1">
              Fetching from {oddsStatus?.data?.current_source || 'GitHub scrapers'}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh Predictions</span>
        </button>
      </div>
    </div>
  )
} 