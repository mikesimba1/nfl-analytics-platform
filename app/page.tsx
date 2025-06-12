'use client'

import { useState, useEffect } from 'react'
import { Activity, Target, BarChart3, Clock, AlertCircle, CheckCircle, Wifi } from 'lucide-react'
import nflDataService from '../src/services/nflDataService'

// Simplified components
import Dashboard from './components/Dashboard'
import GameAnalysis from './components/GameAnalysis'
import PlayerProps from './components/PlayerProps'

export default function NFLAnalyticsPlatform() {
  const [activeTab, setActiveTab] = useState('home')
  const [systemStatus, setSystemStatus] = useState({
    dataQuality: 'LOADING',
    apiConnections: 0,
    lastUpdate: 'Initializing...',
    scheduleValid: false,
    oddsValid: false
  })

  useEffect(() => {
    initializeSystem()
    
    // Update system status every 30 seconds
    const interval = setInterval(updateSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const initializeSystem = async () => {
    try {
      // Test the automated data service
      const [schedule, odds, playerProps] = await Promise.all([
        nflDataService.fetchLiveSchedule(),
        nflDataService.fetchLiveOdds(),
        nflDataService.fetchPlayerProps()
      ])

      setSystemStatus({
        dataQuality: 'EXCELLENT',
        apiConnections: 3,
        lastUpdate: new Date().toLocaleTimeString(),
        scheduleValid: schedule.length > 0,
        oddsValid: odds.length > 0
      })
    } catch (error) {
      console.error('System initialization error:', error)
      setSystemStatus({
        dataQuality: 'ERROR',
        apiConnections: 0,
        lastUpdate: 'Failed to initialize',
        scheduleValid: false,
        oddsValid: false
      })
    }
  }

  const updateSystemStatus = async () => {
    try {
      // Clear cache and fetch fresh data
      nflDataService.clearCache()
      const [schedule, odds] = await Promise.all([
        nflDataService.fetchLiveSchedule(),
        nflDataService.fetchLiveOdds()
      ])

      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString(),
        scheduleValid: schedule.length > 0,
        oddsValid: odds.length > 0,
        apiConnections: schedule.length > 0 && odds.length > 0 ? 3 : 1
      }))
    } catch (error) {
      console.error('Status update error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50'
      case 'GOOD': return 'text-blue-600 bg-blue-50'
      case 'WARNING': return 'text-yellow-600 bg-yellow-50'
      case 'ERROR': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const tabs = [
    { id: 'home', name: 'Home', icon: Activity },
    { id: 'analysis', name: 'Game Analysis', icon: BarChart3 },
    { id: 'props', name: 'Player Props', icon: Target }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />
      case 'analysis':
        return <GameAnalysis />
      case 'props':
        return <PlayerProps />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NFL Analytics Platform</h1>
                <p className="text-gray-600">Automated Data • Real-Time Updates • 2025 Season</p>
              </div>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(systemStatus.dataQuality)}`}>
                <div className="flex items-center space-x-2">
                  {systemStatus.dataQuality === 'EXCELLENT' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : systemStatus.dataQuality === 'ERROR' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Wifi className="h-4 w-4" />
                  )}
                  <span>Data Quality: {systemStatus.dataQuality}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {systemStatus.lastUpdate}</span>
                </div>
                <div className="text-xs mt-1">
                  APIs: {systemStatus.apiConnections}/3 • 
                  Schedule: {systemStatus.scheduleValid ? '✓' : '✗'} • 
                  Odds: {systemStatus.oddsValid ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>NFL Analytics Platform • Automated Data System • 2025 Season</p>
              <p className="mt-1">
                Live data from ESPN API • Odds from team strength calculations • 
                Cache: {nflDataService.getCacheStats().size} items
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <button 
                onClick={() => {
                  nflDataService.clearCache()
                  initializeSystem()
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 