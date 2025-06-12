'use client'

import { useState, useEffect } from 'react'
import { Activity, Target, BarChart3, Clock, TrendingUp, Users, Calendar } from 'lucide-react'
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

interface Odds {
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
}

interface PlayerProp {
  name: string
  team: string
  position: string
  passYards?: number
  passTDs?: number
  rushYards?: number
  recYards?: number
  receptions?: number
  recTDs?: number
  confidence: string
}

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([])
  const [odds, setOdds] = useState<Odds[]>([])
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    loadAllData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    try {
      const [scheduleData, oddsData, propsData] = await Promise.all([
        nflDataService.fetchLiveSchedule(),
        nflDataService.fetchLiveOdds(),
        nflDataService.fetchPlayerProps()
      ])

      setGames(scheduleData)
      setOdds(oddsData)
      setPlayerProps(propsData)
      setLastUpdate(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const getGameOdds = (gameId: string) => {
    return odds.find(o => o.gameId === gameId)
  }

  const getTopProps = () => {
    return playerProps.filter(p => p.confidence === 'HIGH').slice(0, 6)
  }

  const getUpcomingGames = () => {
    return games.slice(0, 6)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Loading Live NFL Data...</p>
          <p className="text-gray-500">Fetching schedule, odds, and player props</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Week 1 Games</p>
              <p className="text-3xl font-bold text-gray-900">{games.length}</p>
              <p className="text-green-600 text-sm mt-1">Live Schedule</p>
            </div>
            <Calendar className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Live Odds</p>
              <p className="text-3xl font-bold text-gray-900">{odds.length}</p>
              <p className="text-blue-600 text-sm mt-1">Real-time Updates</p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Player Props</p>
              <p className="text-3xl font-bold text-gray-900">{playerProps.length}</p>
              <p className="text-purple-600 text-sm mt-1">High Confidence</p>
            </div>
            <Target className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Last Update</p>
              <p className="text-lg font-bold text-gray-900">{lastUpdate}</p>
              <p className="text-green-600 text-sm mt-1">Auto-refresh: 30s</p>
            </div>
            <Clock className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="h-6 w-6 text-orange-500 mr-2" />
            Week 1 Featured Games
          </h2>
          <span className="text-sm text-gray-500">Live from ESPN API</span>
        </div>

        <div className="grid gap-4">
          {getUpcomingGames().map((game) => {
            const gameOdds = getGameOdds(game.id)
            return (
              <div key={game.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{game.awayTeamName}</div>
                        <div className="text-sm text-gray-500">{game.awayTeam}</div>
                      </div>
                      <div className="text-gray-400 font-bold">@</div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{game.homeTeamName}</div>
                        <div className="text-sm text-gray-500">{game.homeTeam}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span>{game.time}</span>
                      <span>•</span>
                      <span>{game.network}</span>
                      <span>•</span>
                      <span>{game.venue}</span>
                    </div>
                  </div>
                  
                  {gameOdds && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Spread: {game.homeTeam} {gameOdds.spread.home > 0 ? '+' : ''}{gameOdds.spread.home}
                      </div>
                      <div className="text-sm text-gray-600">
                        O/U: {gameOdds.total.over}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Updated: {gameOdds.lastUpdated}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Player Props */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 text-purple-500 mr-2" />
            High Confidence Player Props
          </h2>
          <span className="text-sm text-gray-500">Automated Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopProps().map((prop, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">{prop.name}</div>
                <div className="text-sm text-gray-600">{prop.team}</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">{prop.position}</div>
              
              <div className="space-y-1 text-sm">
                {prop.passYards && (
                  <div className="flex justify-between">
                    <span>Pass Yards:</span>
                    <span className="font-medium">{prop.passYards}</span>
                  </div>
                )}
                {prop.passTDs && (
                  <div className="flex justify-between">
                    <span>Pass TDs:</span>
                    <span className="font-medium">{prop.passTDs}</span>
                  </div>
                )}
                {prop.rushYards && (
                  <div className="flex justify-between">
                    <span>Rush Yards:</span>
                    <span className="font-medium">{prop.rushYards}</span>
                  </div>
                )}
                {prop.recYards && (
                  <div className="flex justify-between">
                    <span>Rec Yards:</span>
                    <span className="font-medium">{prop.recYards}</span>
                  </div>
                )}
                {prop.receptions && (
                  <div className="flex justify-between">
                    <span>Receptions:</span>
                    <span className="font-medium">{prop.receptions}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  prop.confidence === 'HIGH' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {prop.confidence}
                </span>
                <span className="text-xs text-gray-500">Live Prop</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Automated Data System</h3>
            <p className="text-orange-700">
              Live data automatically fetched from ESPN API • Odds calculated from team strength ratings • 
              Player props generated from performance analytics
            </p>
            <p className="text-orange-600 text-sm mt-2">
              Cache: {nflDataService.getCacheStats().size} items • 
              Auto-refresh: Every 30 seconds • 
              Last update: {lastUpdate}
            </p>
          </div>
          <div className="text-orange-500">
            <BarChart3 className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
} 