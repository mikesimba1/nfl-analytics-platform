#!/usr/bin/env python3
"""
ANALYZE REAL GAMES - Real analysis for every upcoming game
NO FAKE DATA - Only real analysis
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime
import os

class RealGameAnalyzer:
    """
    Analyzes EVERY upcoming game using ONLY real data
    NO FAKE OR SAMPLE DATA
    """
    
    def __init__(self):
        self.load_real_data()
        print("🎯 REAL GAME ANALYZER - NO FAKE DATA")
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
    
    def calculate_real_team_power_ratings(self):
        """Calculate power ratings from REAL team statistics"""
        print("\n📊 Calculating REAL team power ratings...")
        
        power_ratings = {}
        
        for team in self.teams:
            team_abbr = team.get('abbreviation', '')
            stats = team.get('stats', {})
            
            # Initialize ratings
            offensive_rating = 50.0  # Base rating
            defensive_rating = 50.0  # Base rating
            
            # Extract real offensive stats if available
            if 'splits' in stats:
                splits = stats['splits']
                for split in splits:
                    categories = split.get('categories', [])
                    for category in categories:
                        cat_name = category.get('name', '')
                        stats_list = category.get('stats', [])
                        
                        for stat in stats_list:
                            stat_name = stat.get('name', '')
                            stat_value = stat.get('value', 0)
                            
                            # Offensive stats
                            if 'Yards Per Game' in stat_name and 'Offense' in cat_name:
                                offensive_rating += (float(stat_value) - 300) / 10  # Scale around 300 yards
                            elif 'Points Per Game' in stat_name and 'Offense' in cat_name:
                                offensive_rating += (float(stat_value) - 20) * 2  # Scale around 20 points
                            
                            # Defensive stats (lower is better)
                            elif 'Yards Per Game' in stat_name and 'Defense' in cat_name:
                                defensive_rating += (320 - float(stat_value)) / 10  # Scale around 320 yards allowed
                            elif 'Points Per Game' in stat_name and 'Defense' in cat_name:
                                defensive_rating += (22 - float(stat_value)) * 2  # Scale around 22 points allowed
            
            # Ensure ratings are reasonable
            offensive_rating = max(20, min(80, offensive_rating))
            defensive_rating = max(20, min(80, defensive_rating))
            
            power_ratings[team_abbr] = {
                'offensive_rating': round(offensive_rating, 1),
                'defensive_rating': round(defensive_rating, 1),
                'overall_rating': round((offensive_rating + defensive_rating) / 2, 1)
            }
            
            print(f"   {team_abbr}: Off={offensive_rating:.1f}, Def={defensive_rating:.1f}, Overall={power_ratings[team_abbr]['overall_rating']}")
        
        return power_ratings
    
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
                    
                    # Position impact weights (how much each position affects team performance)
                    position_weights = {
                        'QB': 8.0, 'RB': 3.0, 'WR': 2.5, 'TE': 1.5,
                        'OL': 2.0, 'DL': 1.5, 'LB': 1.5, 'CB': 1.2, 'S': 1.0,
                        'K': 0.5, 'P': 0.3
                    }
                    
                    base_impact = position_weights.get(position, 1.0)
                    
                    # Status multipliers (how likely they are to miss the game)
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
    
    def analyze_single_game(self, game, power_ratings):
        """Analyze a single game with REAL data"""
        home_team = game.get('home_team', '')
        away_team = game.get('away_team', '')
        
        print(f"\n🎯 Analyzing {away_team} @ {home_team}")
        
        # Get real power ratings
        home_rating = power_ratings.get(home_team, {}).get('overall_rating', 50.0)
        away_rating = power_ratings.get(away_team, {}).get('overall_rating', 50.0)
        
        # Get real injury impacts
        home_injury_impact, home_injuries = self.calculate_injury_impact(home_team)
        away_injury_impact, away_injuries = self.calculate_injury_impact(away_team)
        
        # Get real betting lines
        home_spread = game.get('home_spread', 0)
        total = game.get('total', 0)
        home_moneyline = game.get('home_moneyline', 0)
        away_moneyline = game.get('away_moneyline', 0)
        
        # Calculate our prediction
        power_differential = home_rating - away_rating
        injury_advantage = away_injury_impact - home_injury_impact  # Higher injury impact hurts team
        home_field_advantage = 2.8  # Standard NFL home field advantage
        
        our_spread = power_differential + injury_advantage + home_field_advantage
        
        # Calculate edge vs betting line
        if home_spread != 0:
            spread_edge = our_spread - home_spread
            edge_percentage = abs(spread_edge) / abs(home_spread) * 100 if home_spread != 0 else 0
        else:
            spread_edge = our_spread
            edge_percentage = 0
        
        # Determine confidence based on data quality and edge size
        confidence = 60  # Base confidence
        if abs(spread_edge) > 3: confidence += 15
        elif abs(spread_edge) > 1.5: confidence += 10
        elif abs(spread_edge) > 0.5: confidence += 5
        
        if len(home_injuries) > 0 or len(away_injuries) > 0: confidence += 5
        if total > 0: confidence += 5  # We have betting data
        
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
            
            # Our predictions
            'our_spread': round(our_spread, 1),
            'confidence': confidence,
            'recommendation': recommendation,
            
            # Market data
            'market_spread': home_spread,
            'market_total': total,
            'home_moneyline': home_moneyline,
            'away_moneyline': away_moneyline,
            
            # Edge analysis
            'spread_edge': round(spread_edge, 1),
            'edge_percentage': round(edge_percentage, 1),
            'bet_direction': 'HOME' if spread_edge > 0 else 'AWAY',
            
            # Team analysis
            'home_power_rating': home_rating,
            'away_power_rating': away_rating,
            'power_differential': round(power_differential, 1),
            
            # Injury analysis
            'home_injury_impact': home_injury_impact,
            'away_injury_impact': away_injury_impact,
            'home_key_injuries': home_injuries[:3],  # Top 3 injuries
            'away_key_injuries': away_injuries[:3],  # Top 3 injuries
            
            # Weather (if available)
            'weather': game.get('weather', {}),
            
            # Data sources
            'analysis_timestamp': datetime.now().isoformat(),
            'data_sources': 'ESPN API, The Odds API, Real Injury Data'
        }
        
        # Print analysis
        print(f"   📊 Our Spread: {home_team} {our_spread:+.1f}")
        print(f"   💰 Market Spread: {home_team} {home_spread:+.1f}")
        print(f"   🎯 Edge: {spread_edge:+.1f} ({edge_percentage:.1f}%)")
        print(f"   ⭐ Confidence: {confidence}%")
        print(f"   🎲 Recommendation: {recommendation}")
        
        if len(home_injuries) > 0:
            print(f"   🏥 {home_team} Injuries: {len(home_injuries)} (Impact: {home_injury_impact})")
        if len(away_injuries) > 0:
            print(f"   🏥 {away_team} Injuries: {len(away_injuries)} (Impact: {away_injury_impact})")
        
        return analysis
    
    def analyze_all_games(self):
        """Analyze EVERY upcoming game"""
        print("\n🚀 ANALYZING ALL UPCOMING GAMES")
        print("=" * 60)
        print("Using ONLY real data - no fake or sample data")
        print("=" * 60)
        
        if not self.games:
            print("❌ No games to analyze")
            return []
        
        # Calculate real power ratings
        power_ratings = self.calculate_real_team_power_ratings()
        
        # Analyze each game
        all_analyses = []
        strong_bets = []
        good_bets = []
        
        for i, game in enumerate(self.games, 1):
            print(f"\n{'='*20} GAME {i}/{len(self.games)} {'='*20}")
            
            try:
                analysis = self.analyze_single_game(game, power_ratings)
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
        print(f"\n🎯 ANALYSIS COMPLETE")
        print("=" * 60)
        print(f"✅ Analyzed {len(all_analyses)} games")
        print(f"🔥 Strong Bets: {len(strong_bets)}")
        print(f"✅ Good Bets: {len(good_bets)}")
        print(f"⏸️ Pass: {len(all_analyses) - len(strong_bets) - len(good_bets)}")
        
        # Show top opportunities
        if strong_bets:
            print(f"\n🔥 TOP OPPORTUNITIES:")
            for bet in strong_bets[:5]:
                print(f"   {bet['matchup']}: {bet['bet_direction']} {abs(bet['spread_edge']):.1f} edge ({bet['confidence']}%)")
        
        return all_analyses
    
    def save_analysis_results(self, analyses):
        """Save analysis results"""
        print(f"\n💾 Saving analysis results...")
        
        # Create output directory
        os.makedirs("data/real-current", exist_ok=True)
        
        # Save full analysis
        analysis_file = "data/real-current/game-analyses.json"
        with open(analysis_file, 'w') as f:
            json.dump(analyses, f, indent=2, default=str)
        print(f"✅ Saved full analysis to {analysis_file}")
        
        # Create subscriber-ready format
        subscriber_data = []
        for analysis in analyses:
            subscriber_data.append({
                'matchup': analysis['matchup'],
                'game_date': analysis['game_date'],
                'recommendation': analysis['recommendation'],
                'confidence': analysis['confidence'],
                'our_spread': analysis['our_spread'],
                'market_spread': analysis['market_spread'],
                'edge': analysis['spread_edge'],
                'bet_direction': analysis['bet_direction']
            })
        
        subscriber_file = "data/real-current/subscriber-picks.json"
        with open(subscriber_file, 'w') as f:
            json.dump(subscriber_data, f, indent=2)
        print(f"✅ Saved subscriber picks to {subscriber_file}")

def main():
    """Main execution"""
    analyzer = RealGameAnalyzer()
    analyses = analyzer.analyze_all_games()
    
    print(f"\n🎯 REAL ANALYSIS COMPLETE")
    print(f"✅ {len(analyses)} games analyzed with REAL data")
    print(f"📁 Results saved to data/real-current/")

if __name__ == "__main__":
    main()
 