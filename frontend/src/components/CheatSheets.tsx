'use client';

import { useState } from 'react';
import { FileText, Download, Star, TrendingUp, Users, Target } from 'lucide-react';

export default function CheatSheets() {
  const [selectedWeek, setSelectedWeek] = useState('1');

  const cheatSheets = [
    {
      id: 1,
      title: 'QB Start/Sit Rankings',
      description: 'Complete quarterback rankings with matchup analysis',
      confidence: 92,
      category: 'Rankings',
      tags: ['QB', 'Fantasy', 'DFS'],
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'RB Workload Report',
      description: 'Running back usage trends and red zone targets',
      confidence: 88,
      category: 'Analysis',
      tags: ['RB', 'Touches', 'Red Zone'],
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'WR/TE Target Share',
      description: 'Receiver target distribution and air yards analysis',
      confidence: 85,
      category: 'Analysis',
      tags: ['WR', 'TE', 'Targets'],
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Defense vs Position',
      description: 'Defensive rankings against each offensive position',
      confidence: 90,
      category: 'Matchups',
      tags: ['Defense', 'Matchups', 'Allow'],
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'Weather Impact Report',
      description: 'Game weather conditions and historical performance',
      confidence: 78,
      category: 'Weather',
      tags: ['Weather', 'Wind', 'Rain'],
      downloadUrl: '#'
    },
    {
      id: 6,
      title: 'Vegas Lines Analysis',
      description: 'Betting line movements and sharp money indicators',
      confidence: 82,
      category: 'Betting',
      tags: ['Lines', 'Sharp', 'Public'],
      downloadUrl: '#'
    }
  ];

  const quickStats = [
    { label: 'Cheat Sheets', value: '12', icon: FileText },
    { label: 'Data Points', value: '2,847', icon: Target },
    { label: 'Avg Confidence', value: '87%', icon: TrendingUp },
    { label: 'Updated', value: '2 hrs ago', icon: Star }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400 bg-green-500/10';
    if (confidence >= 80) return 'text-blue-400 bg-blue-500/10';
    if (confidence >= 70) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Rankings': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Analysis': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Matchups': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Weather': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'Betting': 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">NFL Cheat Sheets</h1>
        <p className="text-xl text-slate-300">Comprehensive analysis sheets for fantasy and betting decisions</p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
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

      {/* Cheat Sheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cheatSheets.map((sheet) => (
          <div key={sheet.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">{sheet.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(sheet.category)}`}>
                    {sheet.category}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(sheet.confidence)}`}>
                  {sheet.confidence}%
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm">{sheet.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {sheet.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">View Details</span>
                </button>
                <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white">More Cheat Sheets Coming Soon</h3>
          <p className="text-slate-300">
            We're constantly adding new analysis sheets based on the latest NFL trends and data insights.
          </p>
        </div>
      </div>
    </div>
  );
} 