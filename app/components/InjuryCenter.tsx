'use client'

import { useState, useEffect } from 'react'
import { Users, AlertTriangle, Activity, Clock, TrendingDown, Shield, Target } from 'lucide-react'

interface InjuryReport {
  playerId: string
  playerName: string
  team: string
  position: string
  injury: string
  status: 'Out' | 'Doubtful' | 'Questionable' | 'Probable' | 'IR'
  lastUpdate: string
  impactLevel: 'High' | 'Medium' | 'Low'
  fantasyImpact: number // 1-10 scale
  replacement: {
    name: string
    projectedStats: string
  }
  weeklyTrend: 'improving' | 'worsening' | 'stable'
  returnTimeline: string
}

const mockInjuryData: InjuryReport[] = [
  {
    playerId: '1',
    playerName: 'Aaron Rodgers',
    team: 'NYJ',
    position: 'QB',
    injury: 'Achilles',
    status: 'Questionable',
    lastUpdate: '2 hours ago',
    impactLevel: 'High',
    fantasyImpact: 9,
    replacement: { name: 'Zach Wilson', projectedStats: '220 yds, 1 TD' },
    weeklyTrend: 'improving',
    returnTimeline: 'Week 1 possible'
  },
  {
    playerId: '2',
    playerName: 'Christian McCaffrey',
    team: 'SF',
    position: 'RB',
    injury: 'Calf strain',
    status: 'Doubtful',
    lastUpdate: '4 hours ago',
    impactLevel: 'High',
    fantasyImpact: 8,
    replacement: { name: 'Jordan Mason', projectedStats: '85 yds, 1 TD' },
    weeklyTrend: 'stable',
    returnTimeline: 'Week 2-3'
  },
  {
    playerId: '3',
    playerName: 'Stefon Diggs',
    team: 'NE',
    position: 'WR',
    injury: 'Hamstring',
    status: 'Questionable',
    lastUpdate: '1 hour ago',
    impactLevel: 'Medium',
    fantasyImpact: 7,
    replacement: { name: 'Kendrick Bourne', projectedStats: '65 yds, 0.5 TD' },
    weeklyTrend: 'improving',
    returnTimeline: 'Week 1 likely'
  },
  {
    playerId: '4',
    playerName: 'Nick Chubb',
    team: 'CLE',
    position: 'RB',
    injury: 'Knee',
    status: 'Out',
    lastUpdate: '6 hours ago',
    impactLevel: 'High',
    fantasyImpact: 9,
    replacement: { name: 'Jerome Ford', projectedStats: '75 yds, 0.5 TD' },
    weeklyTrend: 'stable',
    returnTimeline: 'Week 4-6'
  },
  {
    playerId: '5',
    playerName: 'Tua Tagovailoa',
    team: 'MIA',
    position: 'QB',
    injury: 'Concussion protocol',
    status: 'Questionable',
    lastUpdate: '3 hours ago',
    impactLevel: 'High',
    fantasyImpact: 8,
    replacement: { name: 'Tyler Huntley', projectedStats: '200 yds, 1 TD' },
    weeklyTrend: 'improving',
    returnTimeline: 'Week 1 possible'
  }
]

export default function InjuryCenter() {
  const [injuryData, setInjuryData] = useState<InjuryReport[]>(mockInjuryData)
  const [filter, setFilter] = useState<'all' | 'high-impact' | 'questionable' | 'out'>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')

  const teams = ['all', ...Array.from(new Set(injuryData.map(injury => injury.team)))]

  const filteredData = injuryData.filter(injury => {
    const teamMatch = selectedTeam === 'all' || injury.team === selectedTeam
    
    switch (filter) {
      case 'high-impact':
        return teamMatch && injury.impactLevel === 'High'
      case 'questionable':
        return teamMatch && injury.status === 'Questionable'
      case 'out':
        return teamMatch && (injury.status === 'Out' || injury.status === 'IR')
      default:
        return teamMatch
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Out': return 'bg-red-100 text-red-800 border-red-200'
      case 'Doubtful': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Questionable': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Probable': return 'bg-green-100 text-green-800 border-green-200'
      case 'IR': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-500 rotate-180" />
      case 'worsening': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Activity className="h-4 w-4 text-yellow-500" />
      default: return null
    }
  }

  const getFantasyImpactBars = (impact: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-3 rounded-sm ${
          i < impact ? 'bg-red-500' : 'bg-gray-200'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 text-yellow-500 mr-2" />
              Injury Center
            </h2>
            <p className="text-gray-600 mt-1">Real-time injury reports and fantasy impact analysis</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {teams.map(team => (
                <option key={team} value={team}>
                  {team === 'all' ? 'All Teams' : team}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Injuries
          </button>
          <button
            onClick={() => setFilter('high-impact')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'high-impact' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            High Impact
          </button>
          <button
            onClick={() => setFilter('questionable')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'questionable' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Questionable
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'out' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Out/IR
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">High Impact</p>
                <p className="text-2xl font-bold text-red-700">
                  {injuryData.filter(i => i.impactLevel === 'High').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Questionable</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {injuryData.filter(i => i.status === 'Questionable').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Out/Doubtful</p>
                <p className="text-2xl font-bold text-orange-700">
                  {injuryData.filter(i => i.status === 'Out' || i.status === 'Doubtful').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Improving</p>
                <p className="text-2xl font-bold text-green-700">
                  {injuryData.filter(i => i.weeklyTrend === 'improving').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Injury Reports */}
      <div className="grid gap-4">
        {filteredData.map((injury) => (
          <div key={injury.playerId} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {injury.playerName}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {injury.team} {injury.position}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(injury.status)}`}>
                    {injury.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {injury.lastUpdate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(injury.weeklyTrend)}
                    <span className="capitalize">{injury.weeklyTrend}</span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg font-medium ${getImpactColor(injury.impactLevel)}`}>
                {injury.impactLevel} Impact
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Injury Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Injury Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{injury.injury}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Return Timeline:</span>
                    <span className="ml-2 font-medium">{injury.returnTimeline}</span>
                  </div>
                </div>
              </div>

              {/* Fantasy Impact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Fantasy Impact</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Impact Level:</span>
                    <div className="flex space-x-1">
                      {getFantasyImpactBars(injury.fantasyImpact)}
                    </div>
                    <span className="text-sm font-medium">{injury.fantasyImpact}/10</span>
                  </div>
                </div>
              </div>

              {/* Replacement Player */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Replacement</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Player:</span>
                    <span className="ml-2 font-medium">{injury.replacement.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Projection:</span>
                    <span className="ml-2 font-medium">{injury.replacement.projectedStats}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No injuries match your filter</h3>
          <p className="text-gray-600">Try adjusting your filter settings to see more injury reports.</p>
        </div>
      )}
    </div>
  )
} 