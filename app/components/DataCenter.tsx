'use client'

import { useState, useEffect } from 'react'
import { Database, RefreshCw, CheckCircle, AlertCircle, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react'

interface DataSource {
  id: string
  name: string
  description: string
  status: 'active' | 'updating' | 'error' | 'stale'
  lastUpdated: string
  nextUpdate: string
  recordCount: number
  accuracy: number
  apiEndpoint?: string
  updateFrequency: string
}

interface DataMetrics {
  totalRecords: number
  activeConnections: number
  updateSuccess: number
  avgResponseTime: number
  dataFreshness: number
}

const mockDataSources: DataSource[] = [
  {
    id: 'espn-api',
    name: 'ESPN API',
    description: 'Player injuries, roster updates, and team news',
    status: 'active',
    lastUpdated: '2 minutes ago',
    nextUpdate: 'In 28 minutes',
    recordCount: 1247,
    accuracy: 98.5,
    apiEndpoint: 'site.api.espn.com/apis/site/v2/sports/football/nfl',
    updateFrequency: 'Every 30 minutes'
  },
  {
    id: 'fivethirtyeight',
    name: 'FiveThirtyEight',
    description: 'ELO ratings and team efficiency metrics',
    status: 'active',
    lastUpdated: '1 hour ago',
    nextUpdate: 'In 23 hours',
    recordCount: 896,
    accuracy: 96.8,
    apiEndpoint: 'projects.fivethirtyeight.com/nfl-api',
    updateFrequency: 'Daily'
  },
  {
    id: 'pro-football-ref',
    name: 'Pro Football Reference',
    description: 'Defensive rankings and coaching tendencies',
    status: 'updating',
    lastUpdated: '3 hours ago',
    nextUpdate: 'In progress',
    recordCount: 2156,
    accuracy: 94.2,
    updateFrequency: 'Every 6 hours'
  },
  {
    id: 'odds-api',
    name: 'Live Odds Feed',
    description: 'Real-time betting lines and market movements',
    status: 'active',
    lastUpdated: '30 seconds ago',
    nextUpdate: 'In 30 seconds',
    recordCount: 456,
    accuracy: 99.1,
    apiEndpoint: 'api.the-odds-api.com/v4/sports/americanfootball_nfl',
    updateFrequency: 'Every minute'
  },
  {
    id: 'weather-api',
    name: 'Weather Data',
    description: 'Game day weather conditions and forecasts',
    status: 'active',
    lastUpdated: '15 minutes ago',
    nextUpdate: 'In 45 minutes',
    recordCount: 128,
    accuracy: 97.3,
    updateFrequency: 'Hourly'
  },
  {
    id: 'player-props',
    name: 'Player Props Engine',
    description: 'Advanced player performance predictions',
    status: 'stale',
    lastUpdated: '6 hours ago',
    nextUpdate: 'Manual refresh needed',
    recordCount: 3421,
    accuracy: 89.7,
    updateFrequency: 'Every 4 hours'
  }
]

const mockMetrics: DataMetrics = {
  totalRecords: 8304,
  activeConnections: 5,
  updateSuccess: 97.8,
  avgResponseTime: 245,
  dataFreshness: 94.2
}

export default function DataCenter() {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)
  const [metrics, setMetrics] = useState<DataMetrics>(mockMetrics)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'updating': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'stale': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'updating': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'stale': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600'
    if (accuracy >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleRefresh = async (sourceId: string) => {
    setIsRefreshing(sourceId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setDataSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, status: 'active', lastUpdated: 'Just now' }
        : source
    ))
    setIsRefreshing(null)
  }

  const refreshAllSources = async () => {
    setIsRefreshing('all')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setDataSources(prev => prev.map(source => ({
      ...source,
      status: 'active',
      lastUpdated: 'Just now'
    })))
    setIsRefreshing(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="h-6 w-6 text-gray-500 mr-2" />
              Data Center
            </h2>
            <p className="text-gray-600 mt-1">Monitor all data sources and system health</p>
          </div>
          <button
            onClick={refreshAllSources}
            disabled={isRefreshing === 'all'}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing === 'all' ? 'animate-spin' : ''}`} />
            <span>{isRefreshing === 'all' ? 'Refreshing All...' : 'Refresh All'}</span>
          </button>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-700">
                  {metrics.totalRecords.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Sources</p>
                <p className="text-2xl font-bold text-green-700">{metrics.activeConnections}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-purple-700">{metrics.updateSuccess}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg Response</p>
                <p className="text-2xl font-bold text-orange-700">{metrics.avgResponseTime}ms</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Data Freshness</p>
                <p className="text-2xl font-bold text-indigo-700">{metrics.dataFreshness}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid gap-6">
        {dataSources.map((source) => (
          <div key={source.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{source.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(source.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(source.status)}
                      <span className="capitalize">{source.status}</span>
                    </div>
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{source.description}</p>
                {source.apiEndpoint && (
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {source.apiEndpoint}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRefresh(source.id)}
                disabled={isRefreshing === source.id}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing === source.id ? 'animate-spin' : ''}`} />
                <span>{isRefreshing === source.id ? 'Updating...' : 'Refresh'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Last Updated</h4>
                <p className="text-sm text-gray-600">{source.lastUpdated}</p>
                <p className="text-xs text-gray-500 mt-1">Next: {source.nextUpdate}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Records</h4>
                <p className="text-lg font-bold text-gray-900">{source.recordCount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total entries</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Accuracy</h4>
                <p className={`text-lg font-bold ${getAccuracyColor(source.accuracy)}`}>
                  {source.accuracy}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Data quality</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Frequency</h4>
                <p className="text-sm text-gray-600">{source.updateFrequency}</p>
                <p className="text-xs text-gray-500 mt-1">Update schedule</p>
              </div>
            </div>

            {/* Detailed View */}
            {selectedSource === source.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3">Recent Activity</h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Data refresh completed successfully</span>
                        <span className="text-gray-400">2 min ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Connection established</span>
                        <span className="text-gray-400">32 min ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">Scheduled update initiated</span>
                        <span className="text-gray-400">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3">Configuration</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeout:</span>
                        <span className="font-medium">30 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retry attempts:</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cache duration:</span>
                        <span className="font-medium">5 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedSource(selectedSource === source.id ? null : source.id)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {selectedSource === source.id ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Data Sources Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Active</span>
                <span className="font-medium">{dataSources.filter(s => s.status === 'active').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Updating</span>
                <span className="font-medium">{dataSources.filter(s => s.status === 'updating').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Stale</span>
                <span className="font-medium">{dataSources.filter(s => s.status === 'stale').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Error</span>
                <span className="font-medium">{dataSources.filter(s => s.status === 'error').length}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium text-green-600">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error rate:</span>
                <span className="font-medium text-green-600">0.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg latency:</span>
                <span className="font-medium">{metrics.avgResponseTime}ms</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Data Quality</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Overall accuracy:</span>
                <span className="font-medium text-green-600">95.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completeness:</span>
                <span className="font-medium text-green-600">98.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Freshness:</span>
                <span className="font-medium text-green-600">{metrics.dataFreshness}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 