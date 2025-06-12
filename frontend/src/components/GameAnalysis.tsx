'use client'

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Shield, Zap, Clock, AlertTriangle, Loader } from 'lucide-react';

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
    windSpeed: number;
    precipitationChance: number;
  };
  bettingEdge?: {
    recommendation: string;
    expectedValue: number;
  };
  analysis?: string;
  motivationFactors?: string[];
}

export default function GameAnalysis() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('1');

  useEffect(() => {
    fetchGames();
  }, [selectedWeek]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/nfl/games/2024?week=${selectedWeek}`);
      const data = await response.json();
      console.log('Games data:', data); // Debug log
      setGames(data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const gameStats = [
    { 
      label: 'Total Games', 
      value: games.length.toString(), 
      icon: BarChart3 
    },
    { 
      label: 'High Confidence', 
      value: games.filter(g => g.confidence && g.confidence >= 80).length.toString(), 
      icon: TrendingUp 
    },
    { 
      label: 'Weather Alerts', 
      value: games.filter(g => g.weather && g.weather.conditions && 
        (g.weather.conditions.toLowerCase().includes('rain') || 
         g.weather.conditions.toLowerCase().includes('snow') ||
         g.weather.impact === 'HIGH')).length.toString(), 
      icon: AlertTriangle 
    },
    { 
      label: 'Strong Bets', 
      value: games.filter(g => g.bettingEdge && g.bettingEdge.recommendation === 'STRONG BET').length.toString(), 
      icon: Shield 
    }
  ];

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-slate-400 bg-slate-500/10';
    if (confidence >= 90) return 'text-green-400 bg-green-500/10';
    if (confidence >= 80) return 'text-blue-400 bg-blue-500/10';
    if (confidence >= 70) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getBettingEdgeColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'STRONG BET': return 'bg-green-500/20 text-green-400';
      case 'MODERATE BET': return 'bg-blue-500/20 text-blue-400';
      case 'PASS': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getWeatherIcon = (conditions?: string, impact?: string) => {
    if (!conditions) return '☀️';
    const lower = conditions.toLowerCase();
    if (lower.includes('rain')) return '🌧️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('cloud')) return '☁️';
    if (impact === 'HIGH') return '⚠️';
    return '☀️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading game analysis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Game Analysis</h1>
        <p className="text-xl text-slate-300">Comprehensive NFL game breakdowns and predictions</p>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gameStats.map((stat, index) => {
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

      {/* Games Grid */}
      {games.length > 0 ? (
        <div className="space-y-6">
          {games.map((game) => (
            <div key={game.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="space-y-4">
                {/* Teams Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">{game.away_team}</h3>
                      <p className="text-sm text-slate-400">
                        Rating: {game.awayTeamRating}/100 • ELO: {game.awayEloRating}
                      </p>
                    </div>
                    
                    <div className="text-slate-400 text-xl font-bold">@</div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white">{game.home_team}</h3>
                      <p className="text-sm text-slate-400">
                        Rating: {game.homeTeamRating}/100 • ELO: {game.homeEloRating}
                      </p>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  {game.confidence && (
                    <div className={`px-3 py-1 rounded-lg font-medium ${getConfidenceColor(game.confidence)}`}>
                      {game.confidence}% Confidence
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-y border-slate-700/50">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Week</p>
                    <p className="text-lg font-bold text-white">{game.week}</p>
                  </div>
                  {game.spread && (
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Spread</p>
                      <p className="text-lg font-bold text-white">
                        {game.spread > 0 ? '+' : ''}{game.spread}
                      </p>
                    </div>
                  )}
                  {game.total && (
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="text-lg font-bold text-white">{game.total}</p>
                    </div>
                  )}
                  {game.weather && (
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Weather</p>
                      <p className="text-sm text-white flex items-center justify-center space-x-1">
                        <span>{getWeatherIcon(game.weather.conditions, game.weather.impact)}</span>
                        <span>{game.weather.conditions}</span>
                      </p>
                      <p className="text-xs text-slate-400">{game.weather.temperature}°F</p>
                    </div>
                  )}
                  {game.bettingEdge && (
                    <div className="text-center">
                      <p className="text-sm text-slate-400">Betting Edge</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getBettingEdgeColor(game.bettingEdge.recommendation)}`}>
                        {game.bettingEdge.recommendation}
                      </span>
                    </div>
                  )}
                </div>

                {/* Motivation Factors */}
                {game.motivationFactors && game.motivationFactors.length > 0 && (
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Motivation Factors:</h4>
                    <div className="flex flex-wrap gap-2">
                      {game.motivationFactors.map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis */}
                {game.analysis && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Analysis:</h4>
                    <p className="text-slate-300 text-sm">{game.analysis}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Games Available</h3>
          <p className="text-slate-400">No games found for Week {selectedWeek}. Try selecting a different week.</p>
          <button 
            onClick={fetchGames}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
} 