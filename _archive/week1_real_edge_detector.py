#!/usr/bin/env python3
"""
Week 1 2025 NFL Edge Detection System - REAL ODDS VERSION
Uses real betting lines from The Odds API and our XGBoost predictions
"""

import sys
sys.path.append('xgboost_model')
from prediction_engine import NFLPredictionEngine
import json
from datetime import datetime
import os

# Add src directory to PYTHONPATH for relative imports if running from repo root
root_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(root_dir, "src")
if src_dir not in sys.path:
    sys.path.append(src_dir)

# Edge-calculation utilities (vig removal, conversions)
from scoring.edge_engine import (
    american_to_prob,
    remove_vig_two_way,
    compute_edge,
    within_guardrail,
)

class Week1RealEdgeDetector:
    def __init__(self):
        self.engine = NFLPredictionEngine()
        
        # Team name mappings for odds API
        self.team_mappings = {
            'Philadelphia Eagles': 'PHI',
            'Dallas Cowboys': 'DAL',
            'Kansas City Chiefs': 'KC',
            'Los Angeles Chargers': 'LAC',
            'Tampa Bay Buccaneers': 'TB',
            'Atlanta Falcons': 'ATL',
            'Cincinnati Bengals': 'CIN',
            'Cleveland Browns': 'CLE',
            'Miami Dolphins': 'MIA',
            'Indianapolis Colts': 'IND',
            'Carolina Panthers': 'CAR',
            'Jacksonville Jaguars': 'JAX',
            'Las Vegas Raiders': 'LV',
            'New England Patriots': 'NE',
            'Arizona Cardinals': 'ARI',
            'New Orleans Saints': 'NO',
            'Pittsburgh Steelers': 'PIT',
            'New York Jets': 'NYJ',
            'New York Giants': 'NYG',
            'Washington Commanders': 'WSH',
            'Tennessee Titans': 'TEN',
            'Denver Broncos': 'DEN',
            'San Francisco 49ers': 'SF',
            'Seattle Seahawks': 'SEA',
            'Detroit Lions': 'DET',
            'Green Bay Packers': 'GB',
            'Houston Texans': 'HOU',
            'Los Angeles Rams': 'LAR',
            'Baltimore Ravens': 'BAL',
            'Buffalo Bills': 'BUF',
            'Minnesota Vikings': 'MIN',
            'Chicago Bears': 'CHI'
        }
        
        # Load real odds data
        self.odds_data = self.load_real_odds()

    def load_real_odds(self):
        """Load real odds from The Odds API data"""
        try:
            with open('data/current/current_odds.json', 'r') as f:
                odds_raw = json.load(f)
            
            print(f"📊 Loaded {len(odds_raw)} games from The Odds API")
            
            # Process odds data
            processed_odds = {}
            for game in odds_raw:
                home_team = self.team_mappings.get(game['home_team'])
                away_team = self.team_mappings.get(game['away_team'])
                
                if not home_team or not away_team:
                    continue
                
                game_id = f"2025_W1_{away_team}_{home_team}"
                
                # Get best lines from multiple sportsbooks
                spreads = []
                spread_prices_home = []
                spread_prices_away = []
                totals = []
                moneyline_prices_home = []
                moneyline_prices_away = []
                
                for bookmaker in game['bookmakers']:
                    for market in bookmaker['markets']:
                        if market['key'] == 'spreads':
                            for outcome in market['outcomes']:
                                if outcome['name'] == game['home_team']:
                                    spreads.append(outcome['point'])
                                    spread_prices_home.append(outcome.get('price', -110))
                                elif outcome['name'] == game['away_team']:
                                    spread_prices_away.append(outcome.get('price', -110))
                        elif market['key'] == 'totals':
                            for outcome in market['outcomes']:
                                if outcome['name'] == 'Over':
                                    totals.append(outcome['point'])
                        elif market['key'] == 'h2h':  # Moneyline odds
                            for outcome in market['outcomes']:
                                if outcome['name'] == game['home_team']:
                                    moneyline_prices_home.append(outcome['price'])
                                elif outcome['name'] == game['away_team']:
                                    moneyline_prices_away.append(outcome['price'])
                
                if spreads and totals and moneyline_prices_home and moneyline_prices_away:
                    # Use average of available lines
                    avg_spread = sum(spreads) / len(spreads)
                    avg_total = sum(totals) / len(totals)

                    avg_spread_price_home = sum(spread_prices_home) / len(spread_prices_home) if spread_prices_home else -110
                    avg_spread_price_away = sum(spread_prices_away) / len(spread_prices_away) if spread_prices_away else -110

                    avg_moneyline_home = sum(moneyline_prices_home) / len(moneyline_prices_home)
                    avg_moneyline_away = sum(moneyline_prices_away) / len(moneyline_prices_away)
                    
                    processed_odds[game_id] = {
                        'home_team': home_team,
                        'away_team': away_team,
                        'spread': avg_spread,  # Negative = home favored
                        'total': avg_total,
                        'spread_price_home': avg_spread_price_home,
                        'spread_price_away': avg_spread_price_away,
                        'moneyline_home': avg_moneyline_home,
                        'moneyline_away': avg_moneyline_away,
                        'commence_time': game['commence_time'],
                        'num_books': len(game['bookmakers'])
                    }
            
            print(f"✅ Processed {len(processed_odds)} games with complete odds")
            return processed_odds
            
        except FileNotFoundError:
            print("❌ No odds data found. Using simulated lines.")
            return {}

    def decimal_to_american_odds(self, decimal_odds):
        """Convert decimal odds to American odds"""
        if decimal_odds >= 2.0:
            return int((decimal_odds - 1) * 100)
        else:
            return int(-100 / (decimal_odds - 1))

    def american_to_probability(self, american_odds):
        """Convert American odds to implied probability"""
        if american_odds > 0:
            return 100 / (american_odds + 100)
        else:
            return abs(american_odds) / (abs(american_odds) + 100)

    def calculate_edge(self, our_prob, market_prob):
        """Calculate betting edge percentage"""
        return (our_prob - market_prob) / market_prob * 100

    def analyze_game_with_real_odds(self, away_team, home_team):
        """Analyze a single game using real odds"""
        game_id = f"2025_W1_{away_team}_{home_team}"
        
        print(f"\n🏈 {away_team} @ {home_team}")
        
        # Check if we have real odds for this game
        if game_id not in self.odds_data:
            print("❌ No real odds data found for this game")
            return []
        
        odds = self.odds_data[game_id]
        print(f"📊 Real odds from {odds['num_books']} sportsbooks")
        print(f"📅 Game time: {odds['commence_time']}")
        
        # Get our prediction
        prediction = self.engine.predict_game(away_team, home_team, week=1)
        
        edges = []
        
        # Analyze each prediction type
        for target, result in prediction['predictions'].items():
            if 'error' in result:
                continue
                
            our_prob = result['probability']
            confidence = result['confidence']
            
            print(f"\n📊 {target.upper()}:")
            print(f"   Our Prediction: {result['prediction']}")
            print(f"   Our Probability: {our_prob:.1%}")
            print(f"   Confidence: {confidence:.1f}%")
            
            if target == 'home_win':
                # Use real moneyline odds, convert to fair probability (vig removed)
                ml_home = odds['moneyline_home']
                ml_away = odds['moneyline_away']

                raw_prob_home = american_to_prob(ml_home)
                raw_prob_away = american_to_prob(ml_away)
                fair_prob_home, fair_prob_away = remove_vig_two_way(raw_prob_home, raw_prob_away)

                edge = compute_edge(our_prob, fair_prob_home)
                
                print(f"   Market Spread: {home_team} {odds['spread']:+.1f}")
                print(f"   Implied ML Prob: {fair_prob_home:.1%} (estimated)")
                print(f"   Edge: {edge:+.1f}%")
                
                if within_guardrail(edge) and abs(edge) >= 5:
                    edges.append({
                        'type': 'moneyline',
                        'team': home_team if edge > 0 else away_team,
                        'edge': edge,
                        'confidence': confidence,
                        'recommendation': 'BET' if abs(edge) >= 10 else 'LEAN',
                        'market_data': f"Spread: {home_team} {odds['spread']:+.1f}"
                    })
            
            elif target == 'spread_cover':
                # Direct spread comparison
                spread = odds['spread']
                raw_prob_cover = american_to_prob(odds['spread_price_home'])
                raw_prob_opp  = american_to_prob(odds['spread_price_away'])
                fair_prob_cover, fair_prob_opp = remove_vig_two_way(raw_prob_cover, raw_prob_opp)
                market_prob = 0.5 if spread == 0 else fair_prob_cover  # fair prob of home cover

                edge = compute_edge(our_prob, market_prob)
                
                print(f"   Market Spread: {home_team} {spread:+.1f}")
                print(f"   Market Prob: {market_prob:.1%}")
                print(f"   Edge: {edge:+.1f}%")
                
                if within_guardrail(edge) and abs(edge) >= 5:
                    cover_bet = f"{home_team} covers {spread:+.1f}" if edge > 0 else f"{away_team} covers {-spread:+.1f}"
                    edges.append({
                        'type': 'spread',
                        'bet': cover_bet,
                        'edge': edge,
                        'confidence': confidence,
                        'recommendation': 'BET' if abs(edge) >= 10 else 'LEAN',
                        'market_data': f"Spread: {home_team} {spread:+.1f}"
                    })
        
        return edges

    def analyze_all_week1_games(self):
        """Analyze all Week 1 games with real odds"""
        print("🏈 WEEK 1 2025 NFL EDGE DETECTION - REAL ODDS")
        print("=" * 55)
        print("📊 Using real betting lines from The Odds API")
        print("🎯 Comparing XGBoost predictions vs market")
        print("🔍 Looking for 5%+ edges (10%+ = strong bet)")
        
        all_edges = []
        games_analyzed = 0
        
        # Analyze games we have odds for
        for game_id, odds in self.odds_data.items():
            away_team = odds['away_team']
            home_team = odds['home_team']
            
            edges = self.analyze_game_with_real_odds(away_team, home_team)
            all_edges.extend(edges)
            games_analyzed += 1
        
        # Sort edges by size
        all_edges.sort(key=lambda x: abs(x['edge']), reverse=True)
        
        # Display best opportunities
        print(f"\n🎯 BEST BETTING OPPORTUNITIES ({games_analyzed} games analyzed):")
        print("=" * 45)
        
        if not all_edges:
            print("❌ No significant edges found")
            print("💡 This is normal with efficient markets")
            return all_edges
        
        for i, edge in enumerate(all_edges[:5], 1):
            print(f"\n🥇 OPPORTUNITY #{i}:")
            print(f"   Type: {edge['type'].upper()}")
            if 'team' in edge:
                print(f"   Bet: {edge['team']} moneyline")
            else:
                print(f"   Bet: {edge['bet']}")
            print(f"   Edge: {edge['edge']:+.1f}%")
            print(f"   Confidence: {edge['confidence']:.1f}%")
            print(f"   Recommendation: {edge['recommendation']}")
            print(f"   Market: {edge['market_data']}")
        
        return all_edges

    def save_real_edge_results(self, edges):
        """Save real edge detection results"""
        results = {
            "analysis_date": datetime.now().isoformat(),
            "week": 1,
            "season": 2025,
            "data_source": "The Odds API (Real Lines)",
            "total_games_with_odds": len(self.odds_data),
            "edges_found": len(edges),
            "betting_opportunities": edges,
            "summary": {
                "strong_bets": len([e for e in edges if e['recommendation'] == 'BET']),
                "lean_bets": len([e for e in edges if e['recommendation'] == 'LEAN']),
                "avg_edge": sum(abs(e['edge']) for e in edges) / len(edges) if edges else 0,
                "max_edge": max(abs(e['edge']) for e in edges) if edges else 0
            },
            "market_data": {
                "sportsbooks_used": "Multiple (DraftKings, BetMGM, etc.)",
                "line_type": "Average of available lines",
                "last_updated": max([game['commence_time'] for game in self.odds_data.values()]) if self.odds_data else None
            }
        }
        
        # Save to new file for real odds analysis
        with open('data/current/week1_2025_real_edge_analysis.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Real odds analysis saved to: data/current/week1_2025_real_edge_analysis.json")
        return results

def main():
    """Main analysis with real odds"""
    detector = Week1RealEdgeDetector()
    
    if not detector.odds_data:
        print("❌ No real odds data available. Please check your odds API data.")
        return
    
    # Analyze all games with real odds
    edges = detector.analyze_all_week1_games()
    
    # Save results
    results = detector.save_real_edge_results(edges)
    
    # Final summary
    print("\n📋 REAL ODDS ANALYSIS SUMMARY:")
    print("=" * 30)
    print(f"✅ Games with Real Odds: {results['total_games_with_odds']}")
    print(f"🎯 Edges Found: {results['edges_found']}")
    print(f"🔥 Strong Bets: {results['summary']['strong_bets']}")
    print(f"📈 Lean Bets: {results['summary']['lean_bets']}")
    if edges:
        print(f"📊 Average Edge: {results['summary']['avg_edge']:.1f}%")
        print(f"🚀 Max Edge: {results['summary']['max_edge']:.1f}%")
    
    print("\n🎯 ADVANTAGES OF REAL ODDS:")
    print("✅ Actual market lines from multiple sportsbooks")
    print("✅ Real-time pricing from The Odds API")
    print("✅ No simulated data - genuine edge detection")
    print("✅ Ready for real betting decisions")

if __name__ == "__main__":
    main() 