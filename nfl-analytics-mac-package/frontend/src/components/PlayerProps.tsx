'use client'

import { useState, useEffect } from 'react';
import { User, TrendingUp, Target, AlertTriangle, Loader } from 'lucide-react';

interface PlayerProp {
  id: number;
  player: string;
  team: string;
  position: string;
  stat: string;
  line: number;
  confidence: number;
  recommendation: string; // 'STRONG PLAY' | 'MODERATE PLAY' | 'PASS'
  reasoning?: string;
  injuryStatus?: string;
  gameScript?: string;
  seasonBaseline?: string;
  keyFactors?: string[];
}

export default function PlayerProps() {
  const [props, setProps] = useState<PlayerProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedWeek, setSelectedWeek] = useState('1');

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE'];

  useEffect(() => {
    fetchPlayerProps();
  }, [selectedWeek]);

  const fetchPlayerProps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/predictions/player-props?week=${selectedWeek}`);
      const data = await response.json();
      console.log('Props data:', data); // Debug log
      setProps(data.props || []);
    } catch (error) {
      console.error('Error fetching player props:', error);
      setProps([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProps = props.filter(prop => 
    selectedPosition === 'ALL' || prop.position === selectedPosition
  );

  const propStats = [
    { 
      label: 'Total Props', 
      value: filteredProps.length.toString(), 
      icon: Target 
    },
    { 
      label: 'High Confidence', 
      value: filteredProps.filter(p => p.confidence >= 80).length.toString(), 
      icon: TrendingUp 
    },
    { 
      label: 'Injury Concerns', 
      value: filteredProps.filter(p => p.injuryStatus && p.injuryStatus !== 'Healthy').length.toString(), 
      icon: AlertTriangle 
    },
    { 
      label: 'Avg Confidence', 
      value: filteredProps.length > 0 ? Math.round(filteredProps.reduce((sum, p) => sum + p.confidence, 0) / filteredProps.length) + '%' : '0%', 
      icon: User 
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400 bg-green-500/10';
    if (confidence >= 80) return 'text-blue-400 bg-blue-500/10';
    if (confidence >= 70) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG PLAY': return 'bg-green-500/20 text-green-400';
      case 'MODERATE PLAY': return 'bg-blue-500/20 text-blue-400';
      case 'PASS': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getInjuryColor = (status?: string) => {
    if (!status || status === 'Healthy') return '';
    switch (status) {
      case 'LOW': return 'bg-yellow-500/20 text-yellow-400';
      case 'MEDIUM': return 'bg-orange-500/20 text-orange-400';
      case 'HIGH': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading player props...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Player Props</h1>
        <p className="text-xl text-slate-300">AI-powered player prop predictions and analysis</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Week Selector */}
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

        {/* Position Filter */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 flex space-x-1">
          {positions.map((position) => (
            <button
              key={position}
              onClick={() => setSelectedPosition(position)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPosition === position
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {position}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {propStats.map((stat, index) => {
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

      {/* Player Props Grid */}
      {filteredProps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProps.map((prop) => (
            <div key={prop.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{prop.player}</h3>
                    <p className="text-sm text-slate-400">{prop.team} • {prop.position}</p>
                    {prop.injuryStatus && prop.injuryStatus !== 'Healthy' && (
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${getInjuryColor(prop.injuryStatus)}`}>
                        {prop.injuryStatus} Injury Risk
                      </span>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(prop.confidence)}`}>
                    {prop.confidence}%
                  </div>
                </div>

                {/* Prop Details */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">{prop.stat}</span>
                    <span className="text-white font-bold">{prop.line}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs">Recommendation</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationColor(prop.recommendation)}`}>
                      {prop.recommendation}
                    </span>
                  </div>
                  {prop.seasonBaseline && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">2024 Baseline</span>
                      <span className="text-slate-300 text-xs">{prop.seasonBaseline}</span>
                    </div>
                  )}
                </div>

                {/* Game Script & Key Factors */}
                {prop.gameScript && (
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 text-sm font-medium">Game Script:</span>
                      <span className="text-blue-300 text-sm">{prop.gameScript}</span>
                    </div>
                  </div>
                )}

                {/* Key Factors */}
                {prop.keyFactors && prop.keyFactors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-slate-400 mb-2">Key Factors:</h4>
                    <div className="flex flex-wrap gap-1">
                      {prop.keyFactors.slice(0, 3).map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-600/30 text-slate-300 rounded text-xs">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {prop.reasoning && (
                  <div>
                    <p className="text-slate-300 text-sm">{prop.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Props Available</h3>
          <p className="text-slate-400">No player props found for the selected filters. Try a different week or position.</p>
          <button 
            onClick={fetchPlayerProps}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
} 