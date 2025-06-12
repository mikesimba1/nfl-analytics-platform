'use client'

import { useState } from 'react'
import { 
  Home as HomeIcon, 
  BarChart3, 
  User, 
  FileText, 
  Users
} from 'lucide-react'

import Dashboard from '@/components/Dashboard'
import GameAnalysis from '@/components/GameAnalysis'
import PlayerProps from '@/components/PlayerProps'
import CheatSheets from '@/components/CheatSheets'
import Matchups from '@/components/Matchups'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', name: 'Home', icon: HomeIcon, component: Dashboard },
    { id: 'games', name: 'Game Analysis', icon: BarChart3, component: GameAnalysis },
    { id: 'props', name: 'Player Props', icon: User, component: PlayerProps },
    { id: 'cheatsheets', name: 'Cheat Sheets', icon: FileText, component: CheatSheets },
    { id: 'matchups', name: 'Matchups', icon: Users, component: Matchups },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏈</span>
              </div>
              <h1 className="text-2xl font-bold text-white">NFL Analytics Pro</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </main>
    </div>
  )
} 