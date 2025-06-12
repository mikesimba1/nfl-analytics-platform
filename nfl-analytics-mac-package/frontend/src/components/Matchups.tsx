'use client';

import { useState } from 'react';
import { Users, TrendingUp, Shield, Zap, Clock, Target } from 'lucide-react';

export default function Matchups() {
  const [selectedWeek, setSelectedWeek] = useState('1');

  const matchups = [
    {
      id: 1,
      away: { team: 'Buffalo Bills', record: '13-4', logo: '🏈' },
      home: { team: 'New England Patriots', record: '4-13', logo: '🏈' },
      spread: -2.5,
      total: 43.5,
      confidence: 89,
      keyPoints: ['Bills need win to secure #2 seed', 'Patriots eliminated from playoffs', 'Cold weather expected'],
      advantage: 'away'
    },
    {
      id: 2,
      away: { team: 'Detroit Lions', record: '14-3', logo: '🏈' },
      home: { team: 'Minnesota Vikings', record: '14-3', logo: '🏈' },
      spread: -1,
      total: 56.5,
      confidence: 95,
      keyPoints: ['Winner takes NFC North', 'Both teams playoff bound', 'High-scoring affair expected'],
      advantage: 'even'
    },
    {
      id: 3,
      away: { team: 'Atlanta Falcons', record: '8-9', logo: '🏈' },
      home: { team: 'Carolina Panthers', record: '4-13', logo: '🏈' },
      spread: -7,
      total: 47.5,
      confidence: 76,
      keyPoints: ['Falcons need win + help for playoffs', 'Panthers playing for draft position', 'Revenge game motivation'],
      advantage: 'away'
    },
    {
      id: 4,
      away: { team: 'Cincinnati Bengals', record: '8-9', logo: '🏈' },
      home: { team: 'Pittsburgh Steelers', record: '10-7', logo: '🏈' },
      spread: -3,
      total: 48,
      confidence: 82,
      keyPoints: ['Steelers clinch playoff spot with win', 'Bengals eliminated with loss', 'Division rivalry intensity'],
      advantage: 'home'
    }
  ];

  const weeklyInsights = [
    { label: 'Total Games', value: '16', icon: Users },
    { label: 'Playoff Implications', value: '12', icon: Target },
    { label: 'Division Games', value: '8', icon: Shield },
    { label: 'Avg Total', value: '48.2', icon: TrendingUp }
  ];

  const getAdvantageColor = (advantage: string) => {
    switch (advantage) {
      case 'away': return 'text-blue-400 bg-blue-500/10';
      case 'home': return 'text-green-400 bg-green-500/10';
      case 'even': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getAdvantageText = (advantage: string) => {
    switch (advantage) {
      case 'away': return 'Away Edge';
      case 'home': return 'Home Edge';
      case 'even': return 'Even Matchup';
      default: return 'Neutral';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-blue-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">NFL Matchups</h1>
        <p className="text-xl text-slate-300">Comprehensive game analysis and predictions</p>
      </div>

      {/* Week Selector */}
      <div className="flex justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 flex space-x-1">
          {['1', '2', '3', '4', '5'].map((week) => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedWeek === week
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Week {week}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {weeklyInsights.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-400" />
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

      {/* Matchups Grid */}
      <div className="space-y-6">
        {matchups.map((matchup) => (
          <div key={matchup.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <div className="space-y-4">
              {/* Teams Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Away Team */}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{matchup.away.logo}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{matchup.away.team}</h3>
                      <p className="text-sm text-slate-400">{matchup.away.record}</p>
                    </div>
                  </div>
                  
                  <div className="text-slate-400 text-xl font-bold">@</div>
                  
                  {/* Home Team */}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{matchup.home.logo}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{matchup.home.team}</h3>
                      <p className="text-sm text-slate-400">{matchup.home.record}</p>
                    </div>
                  </div>
                </div>

                {/* Confidence Badge */}
                <div className={`px-3 py-1 rounded-lg font-medium ${getConfidenceColor(matchup.confidence)} bg-slate-700/50`}>
                  {matchup.confidence}% Confidence
                </div>
              </div>

              {/* Betting Lines */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-700/50">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Spread</p>
                  <p className="text-xl font-bold text-white">
                    {matchup.spread > 0 ? '+' : ''}{matchup.spread}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-xl font-bold text-white">{matchup.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Edge</p>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getAdvantageColor(matchup.advantage)}`}>
                    {getAdvantageText(matchup.advantage)}
                  </span>
                </div>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Key Factors:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {matchup.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Detailed Analysis</span>
                  </button>
                  <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Team Stats</span>
                  </button>
                </div>
                <div className="text-sm text-slate-400 flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated 1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Playoff Picture */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-500/20">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Week {selectedWeek} Playoff Implications</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-300 mb-2">Win and In:</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Detroit Lions (NFC North)</li>
                <li>• Minnesota Vikings (NFC North)</li>
                <li>• Pittsburgh Steelers (Playoff Spot)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-300 mb-2">Need Help:</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Atlanta Falcons (NFC South)</li>
                <li>• Cincinnati Bengals (Wild Card)</li>
                <li>• Miami Dolphins (Wild Card)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 