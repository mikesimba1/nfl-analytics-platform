#!/usr/bin/env python3
"""
ANALYZE REAL GAMES - FIXED SPREAD INTERPRETATION
Real analysis for every upcoming game with CORRECT spreads
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime
import os

class RealGameAnalyzerFixed:
    """
    Analyzes EVERY upcoming game using ONLY real data
    WITH CORRECT SPREAD INTERPRETATION
    """
    
    def __init__(self):
        self.load_real_data()
        print("🎯 REAL GAME ANALYZER - FIXED SPREADS")
        print("=" * 50)
    
    def load_real_data(self):
        """Load the real data we collected"""
        try:
            # Load real upcoming games
            with open("data/real-current/upcoming-games.json", 'r') as f:
                self.games = json.load(f)
            print(f"✅ Loaded {len(self.games)} REAL upcoming games")
            
            # Load real team stats
            with open("data/real-current/team-stats.json", 'r') as f:
                self.teams = json.load(f)
            print(f"✅ Loaded {len(self.teams)} REAL team stats")
            
            # Load your existing injury data
            with open("../data/current-season/injury-reports.json", 'r') as f:
                self.injuries = json.load(f)
            print(f"✅ Loaded {len(self.injuries)} REAL injury reports")
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            self.games = []
            self.teams = []
            self.injuries = []
    
    def calculate_injury_impact(self, team_abbr):
        """Calculate injury impact from REAL injury data"""
        total_impact = 0.0
        injury_details = []
        
        for team_injuries in self.injuries:
            if team_injuries.get('abbreviation') == team_abbr:
                for injury in team_injuries.get('injuries', []):
                    position = injury.get('position', '')
                    status = injury.get('status', 'Questionable')
                    player_name = injury.get('playerName', 'Unknown')
                    injury_type = injury.get('injury', 'Unknown')
                    
                    # Position impact weights
                    position_weights = {
                        'QB': 8.0, 'RB': 3.0, 'WR': 2.5, 'TE': 1.5,
                        'OL': 2.0, 'DL': 1.5, 'LB': 1.5, 'CB': 1.2, 'S': 1.0,
                        'K': 0.5, 'P': 0.3
                    }
                    
                    base_impact = position_weights.get(position, 1.0)
                    
                    # Status multipliers
                    if status in ['Out', 'IR', 'Suspended']:
                        multiplier = 1.0
                    elif status == 'Doubtful':
                        multiplier = 0.8
                    elif status == 'Questionable':
                        multiplier = 0.4
                    elif status == 'Probable':
                        multiplier = 0.1
                    else:
                        multiplier = 0.2
                    
                    impact = base_impact * multiplier
                    total_impact += impact
                    
                    injury_details.append({
                        'player': player_name,
                        'position': position,
                        'status': status,
                        'injury': injury_type,
                        'impact': round(impact, 1)
                    })
        
        return round(total_impact, 1), injury_details
    
    def analyze_single_game(self, game):
        """Analyze a single game with CORRECT spread interpretation"""
        home_team = game.get('home_team', '')
        away_team = game.get('away_team', '')
        
        print(f"\n🎯 Analyzing {away_team} @ {home_team}")
        
        # Get real injury impacts
        home_injury_impact, home_injuries = self.calculate_injury_impact(home_team)
        away_injury_impact, away_injuries = self.calculate_injury_impact(away_team)
        
        # Get REAL betting lines - CORRECTLY INTERPRETED
        home_spread = game.get('home_spread', 0)  # HOME team's spread from market
        away_spread = game.get('away_spread', 0)  # AWAY team's spread from market
        total = game.get('total', 0)
        home_moneyline = game.get('home_moneyline', 0)
        away_moneyline = game.get('away_moneyline', 0)
        
        # Calculate our prediction for HOME team spread
        base_home_advantage = 2.8  # Standard NFL home field advantage
        injury_adjustment = away_injury_impact - home_injury_impact  # Positive if home team has advantage
        
        # Our prediction: what we think the HOME team spread should be
        our_home_spread = base_home_advantage + injury_adjustment
        
        # Calculate edge CORRECTLY
        # Market says home team should be at 'home_spread'
        # We think home team should be at 'our_home_spread'
        spread_edge = our_home_spread - home_spread
        
        # Determine bet direction
        if spread_edge > 0:
            # We think home team should be MORE favored than market does
            # Bet the HOME team
            bet_direction = "HOME"
            bet_team = home_team
            recommended_bet = f"{home_team} {home_spread:+.1f}"
        else:
            # We think home team should be LESS favored than market does
            # Bet the AWAY team  
            bet_direction = "AWAY"
            bet_team = away_team
            recommended_bet = f"{away_team} {away_spread:+.1f}"
        
        # Calculate confidence
        confidence = 60  # Base confidence
        if abs(spread_edge) > 3: confidence += 15
        elif abs(spread_edge) > 1.5: confidence += 10
        elif abs(spread_edge) > 0.5: confidence += 5
        
        if len(home_injuries) > 0 or len(away_injuries) > 0: confidence += 5
        if total > 0: confidence += 5
        
        confidence = min(95, confidence)
        
        # Determine recommendation
        if abs(spread_edge) > 2.5 and confidence > 75:
            recommendation = "STRONG BET"
        elif abs(spread_edge) > 1.0 and confidence > 65:
            recommendation = "GOOD BET"
        else:
            recommendation = "PASS"
        
        # Build analysis result
        analysis = {
            'matchup': f"{away_team} @ {home_team}",
            'game_date': game.get('date', ''),
            'venue': game.get('venue', ''),
            'city': game.get('city', ''),
            
            # Market data (CORRECTLY INTERPRETED)
            'market_home_spread': home_spread,
            'market_away_spread': away_spread,
            'market_total': total,
            'home_moneyline': home_moneyline,
            'away_moneyline': away_moneyline,
            
            # Our prediction
            'our_home_spread': round(our_home_spread, 1),
            'confidence': confidence,
            'recommendation': recommendation,
            
            # Edge analysis
            'spread_edge': round(spread_edge, 1),
            'edge_percentage': round(abs(spread_edge) / max(abs(home_spread), 1) * 100, 1),
            'bet_direction': bet_direction,
            'bet_team': bet_team,
            'recommended_bet': recommended_bet,
            
            # Injury analysis
            'home_injury_impact': home_injury_impact,
            'away_injury_impact': away_injury_impact,
            'home_key_injuries': home_injuries[:3],
            'away_key_injuries': away_injuries[:3],
            
            # Data sources
            'analysis_timestamp': datetime.now().isoformat(),
            'data_sources': 'ESPN API, The Odds API, Real Injury Data'
        }
        
        # Print analysis
        print(f"   💰 Market: {home_team} {home_spread:+.1f}")
        print(f"   📊 Our Pred: {home_team} {our_home_spread:+.1f}")
        print(f"   🎯 Edge: {spread_edge:+.1f}")
        print(f"   🎲 Bet: {recommended_bet}")
        print(f"   ⭐ Confidence: {confidence}%")
        print(f"   📋 Recommendation: {recommendation}")
        
        if len(home_injuries) > 0:
            print(f"   🏥 {home_team} Injuries: {len(home_injuries)} (Impact: {home_injury_impact})")
        if len(away_injuries) > 0:
            print(f"   🏥 {away_team} Injuries: {len(away_injuries)} (Impact: {away_injury_impact})")
        
        return analysis
    
    def analyze_all_games(self):
        """Analyze EVERY upcoming game with CORRECT spreads"""
        print("\n🚀 ANALYZING ALL UPCOMING GAMES - FIXED SPREADS")
        print("=" * 70)
        print("Using ONLY real data with CORRECT spread interpretation")
        print("=" * 70)
        
        if not self.games:
            print("❌ No games to analyze")
            return []
        
        # Analyze each game
        all_analyses = []
        strong_bets = []
        good_bets = []
        
        for i, game in enumerate(self.games, 1):
            print(f"\n{'='*20} GAME {i}/{len(self.games)} {'='*20}")
            
            try:
                analysis = self.analyze_single_game(game)
                all_analyses.append(analysis)
                
                if analysis['recommendation'] == 'STRONG BET':
                    strong_bets.append(analysis)
                elif analysis['recommendation'] == 'GOOD BET':
                    good_bets.append(analysis)
                    
            except Exception as e:
                print(f"❌ Error analyzing game: {e}")
                continue
        
        # Save results
        self.save_analysis_results(all_analyses)
        
        # Print summary
        print(f"\n🎯 CORRECTED ANALYSIS COMPLETE")
        print("=" * 70)
        print(f"✅ Analyzed {len(all_analyses)} games")
        print(f"🔥 Strong Bets: {len(strong_bets)}")
        print(f"✅ Good Bets: {len(good_bets)}")
        print(f"⏸️ Pass: {len(all_analyses) - len(strong_bets) - len(good_bets)}")
        
        # Show top opportunities
        if strong_bets:
            print(f"\n🔥 TOP OPPORTUNITIES (CORRECTED):")
            for bet in strong_bets[:5]:
                print(f"   {bet['matchup']}: {bet['recommended_bet']} ({bet['confidence']}%)")
        
        return all_analyses
    
    def save_analysis_results(self, analyses):
        """Save corrected analysis results"""
        print(f"\n💾 Saving CORRECTED analysis results...")
        
        # Create output directory
        os.makedirs("data/real-current", exist_ok=True)
        
        # Save full analysis
        analysis_file = "data/real-current/game-analyses-FIXED.json"
        with open(analysis_file, 'w') as f:
            json.dump(analyses, f, indent=2, default=str)
        print(f"✅ Saved corrected analysis to {analysis_file}")
        
        # Create subscriber-ready format
        subscriber_data = []
        for analysis in analyses:
            subscriber_data.append({
                'matchup': analysis['matchup'],
                'game_date': analysis['game_date'],
                'recommendation': analysis['recommendation'],
                'confidence': analysis['confidence'],
                'recommended_bet': analysis['recommended_bet'],
                'market_home_spread': analysis['market_home_spread'],
                'our_home_spread': analysis['our_home_spread'],
                'edge': analysis['spread_edge'],
                'bet_team': analysis['bet_team']
            })
        
        subscriber_file = "data/real-current/subscriber-picks-FIXED.json"
        with open(subscriber_file, 'w') as f:
            json.dump(subscriber_data, f, indent=2)
        print(f"✅ Saved corrected subscriber picks to {subscriber_file}")

def main():
    """Main execution"""
    analyzer = RealGameAnalyzerFixed()
    analyses = analyzer.analyze_all_games()
    
    print(f"\n🎯 CORRECTED ANALYSIS COMPLETE")
    print(f"✅ {len(analyses)} games analyzed with CORRECTED spreads")
    print(f"📁 Results saved to data/real-current/")

if __name__ == "__main__":
    main() 