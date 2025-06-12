'use client'

import { useState, useEffect } from 'react'
import { Target, TrendingUp, Users, Clock, Star, BarChart3 } from 'lucide-react'
import nflDataService from '../../src/services/nflDataService'

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
  lastUpdated: string
}

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

export default function PlayerProps() {
  const [playerProps, setPlayerProps] = useState<PlayerProp[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL')
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    loadPlayerData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadPlayerData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadPlayerData = async () => {
    try {
      const [propsData, scheduleData] = await Promise.all([
        nflDataService.fetchPlayerProps(),
        nflDataService.fetchLiveSchedule()
      ])

      setPlayerProps(propsData)
      setGames(scheduleData)
      setLastUpdate(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (error) {
      console.error('Error loading player props data:', error)
      setLoading(false)
    }
  }

  const getTeamMatchup = (team: string) => {
    const game = games.find(g => g.homeTeam === team || g.awayTeam === team)
    if (!game) return 'BYE'
    
    if (game.homeTeam === team) {
      return `vs ${game.awayTeam}`
    } else {
      return `@ ${game.homeTeam}`
    }
  }

  const getGameTime = (team: string) => {
    const game = games.find(g => g.homeTeam === team || g.awayTeam === team)
    return game?.time || 'TBD'
  }

  const filteredProps = playerProps.filter(prop => {
    const positionMatch = selectedPosition === 'ALL' || prop.position === selectedPosition
    const teamMatch = selectedTeam === 'ALL' || prop.team === selectedTeam
    return positionMatch && teamMatch
  })

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE']
  const teams = ['ALL', ...Array.from(new Set(playerProps.map(p => p.team))).sort()]

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'QB': return '🎯'
      case 'RB': return '🏃'
      case 'WR': return '⚡'
      case 'TE': return '🎪'
      default: return '🏈'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Loading Player Props...</p>
          <p className="text-gray-500">Analyzing performance data and matchups</p>
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
              <Target className="h-8 w-8 text-purple-500 mr-3" />
              Week 1 Player Props
            </h1>
            <p className="text-gray-600 mt-2">
              Automated analysis of {playerProps.length} top players • Updated: {lastUpdate}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{filteredProps.length}</div>
            <div className="text-sm text-gray-500">Props Available</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Position</label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={loadPlayerData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">High Confidence</p>
              <p className="text-3xl font-bold text-green-600">
                {playerProps.filter(p => p.confidence === 'HIGH').length}
              </p>
            </div>
            <Star className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Medium Confidence</p>
              <p className="text-3xl font-bold text-yellow-600">
                {playerProps.filter(p => p.confidence === 'MEDIUM').length}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Quarterbacks</p>
              <p className="text-3xl font-bold text-blue-600">
                {playerProps.filter(p => p.position === 'QB').length}
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Skill Players</p>
              <p className="text-3xl font-bold text-purple-600">
                {playerProps.filter(p => ['RB', 'WR', 'TE'].includes(p.position)).length}
              </p>
            </div>
            <BarChart3 className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Player Props Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProps.map((prop, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            {/* Player Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getPositionIcon(prop.position)}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{prop.name}</h3>
                  <p className="text-sm text-gray-600">{prop.position} - {prop.team}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prop.confidence)}`}>
                {prop.confidence}
              </span>
            </div>

            {/* Matchup Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Matchup:</span>
                <span className="font-medium">{getTeamMatchup(prop.team)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Game Time:</span>
                <span className="font-medium">{getGameTime(prop.team)}</span>
              </div>
            </div>

            {/* Props */}
            <div className="space-y-3">
              {prop.passYards && (
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium text-blue-800">Passing Yards</span>
                  <span className="font-bold text-blue-900">{prop.passYards}</span>
                </div>
              )}
              
              {prop.passTDs && (
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium text-blue-800">Passing TDs</span>
                  <span className="font-bold text-blue-900">{prop.passTDs}</span>
                </div>
              )}

              {prop.rushYards && (
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium text-green-800">Rushing Yards</span>
                  <span className="font-bold text-green-900">{prop.rushYards}</span>
                </div>
              )}

              {prop.recYards && (
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm font-medium text-purple-800">Receiving Yards</span>
                  <span className="font-bold text-purple-900">{prop.recYards}</span>
                </div>
              )}

              {prop.receptions && (
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm font-medium text-purple-800">Receptions</span>
                  <span className="font-bold text-purple-900">{prop.receptions}</span>
                </div>
              )}

              {prop.recTDs && (
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm font-medium text-purple-800">Receiving TDs</span>
                  <span className="font-bold text-purple-900">{prop.recTDs}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
              <span>Updated: {prop.lastUpdated}</span>
              <span>Week 1</span>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProps.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No props found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* System Info */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Automated Player Analysis</h3>
            <p className="text-purple-700">
              Props generated from performance analytics and team strength calculations • 
              Confidence levels based on historical accuracy and matchup analysis
            </p>
            <p className="text-purple-600 text-sm mt-2">
              Data refreshes every 60 seconds • 
              Last update: {lastUpdate} • 
              Cache: {nflDataService.getCacheStats().size} items
            </p>
          </div>
          <div className="text-purple-500">
            <Target className="h-12 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
} 