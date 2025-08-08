#!/usr/bin/env python3
"""
Week 1 2025 NFL Edge Detection System
Uses real games and our XGBoost predictions to find betting edges
"""

import sys
sys.path.append('xgboost_model')
from prediction_engine import NFLPredictionEngine
import json
from datetime import datetime

class Week1EdgeDetector:
    def __init__(self):
        self.engine = NFLPredictionEngine()
        
        # Real Week 1 2025 games from NFL schedule
        self.week1_games = [
            {
                "game_id": "2025_W1_DAL_PHI",
                "date": "Thursday, Sept. 4, 8:20 PM ET",
                "away_team": "DAL",
                "home_team": "PHI",
                "network": "NBC",
                "note": "Season Opener - Eagles raise Super Bowl banner"
            },
            {
                "game_id": "2025_W1_KC_LAC",
                "date": "Friday, Sept. 5, 8:00 PM ET", 
                "away_team": "KC",
                "home_team": "LAC",
                "network": "International Game",
                "note": "Sao Paulo, Brazil"
            },
            {
                "game_id": "2025_W1_TB_ATL",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "TB",
                "home_team": "ATL",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_CIN_CLE",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "CIN",
                "home_team": "CLE",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_MIA_IND",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "MIA",
                "home_team": "IND",
                "network": "CBS"
            },
            {
                "game_id": "2025_W1_CAR_JAX",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "CAR",
                "home_team": "JAX",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_LV_NE",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "LV",
                "home_team": "NE",
                "network": "CBS"
            },
            {
                "game_id": "2025_W1_ARI_NO",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "ARI",
                "home_team": "NO",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_PIT_NYJ",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "PIT",
                "home_team": "NYJ",
                "network": "CBS"
            },
            {
                "game_id": "2025_W1_NYG_WSH",
                "date": "Sunday, Sept. 7, 1:00 PM ET",
                "away_team": "NYG",
                "home_team": "WSH",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_TEN_DEN",
                "date": "Sunday, Sept. 7, 4:05 PM ET",
                "away_team": "TEN",
                "home_team": "DEN",
                "network": "CBS"
            },
            {
                "game_id": "2025_W1_SF_SEA",
                "date": "Sunday, Sept. 7, 4:05 PM ET",
                "away_team": "SF",
                "home_team": "SEA",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_DET_GB",
                "date": "Sunday, Sept. 7, 4:25 PM ET",
                "away_team": "DET",
                "home_team": "GB",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_HOU_LAR",
                "date": "Sunday, Sept. 7, 4:25 PM ET",
                "away_team": "HOU",
                "home_team": "LAR",
                "network": "FOX"
            },
            {
                "game_id": "2025_W1_BAL_BUF",
                "date": "Sunday, Sept. 7, 8:20 PM ET",
                "away_team": "BAL",
                "home_team": "BUF",
                "network": "NBC"
            },
            {
                "game_id": "2025_W1_MIN_CHI",
                "date": "Monday, Sept. 8, 8:15 PM ET",
                "away_team": "MIN",
                "home_team": "CHI",
                "network": "ESPN"
            }
        ]
        
        # Simulated betting lines (would come from odds API in production)
        self.betting_lines = {
            "2025_W1_DAL_PHI": {"spread": "PHI -3.5", "total": 47.5, "moneyline": {"PHI": -180, "DAL": +155}},
            "2025_W1_KC_LAC": {"spread": "KC -6.5", "total": 48.5, "moneyline": {"KC": -280, "LAC": +230}},
            "2025_W1_TB_ATL": {"spread": "TB -2.5", "total": 44.5, "moneyline": {"TB": -140, "ATL": +120}},
            "2025_W1_CIN_CLE": {"spread": "CIN -4.5", "total": 42.5, "moneyline": {"CIN": -200, "CLE": +170}},
            "2025_W1_MIA_IND": {"spread": "MIA -3.5", "total": 45.5, "moneyline": {"MIA": -175, "IND": +150}},
            "2025_W1_CAR_JAX": {"spread": "JAX -1.5", "total": 41.5, "moneyline": {"JAX": -125, "CAR": +105}},
            "2025_W1_LV_NE": {"spread": "LV -2.5", "total": 40.5, "moneyline": {"LV": -140, "NE": +120}},
            "2025_W1_ARI_NO": {"spread": "NO -4.5", "total": 46.5, "moneyline": {"NO": -200, "ARI": +170}},
            "2025_W1_PIT_NYJ": {"spread": "PIT -1.5", "total": 43.5, "moneyline": {"PIT": -125, "NYJ": +105}},
            "2025_W1_NYG_WSH": {"spread": "WSH -3.5", "total": 44.5, "moneyline": {"WSH": -175, "NYG": +150}},
            "2025_W1_TEN_DEN": {"spread": "DEN -6.5", "total": 42.5, "moneyline": {"DEN": -280, "TEN": +230}},
            "2025_W1_SF_SEA": {"spread": "SF -3.5", "total": 47.5, "moneyline": {"SF": -175, "SEA": +150}},
            "2025_W1_DET_GB": {"spread": "DET -2.5", "total": 49.5, "moneyline": {"DET": -140, "GB": +120}},
            "2025_W1_HOU_LAR": {"spread": "HOU -1.5", "total": 48.5, "moneyline": {"HOU": -125, "LAR": +105}},
            "2025_W1_BAL_BUF": {"spread": "BUF -3.5", "total": 51.5, "moneyline": {"BUF": -175, "BAL": +150}},
            "2025_W1_MIN_CHI": {"spread": "MIN -2.5", "total": 46.5, "moneyline": {"MIN": -140, "CHI": +120}}
        }

    def odds_to_probability(self, odds):
        """Convert American odds to implied probability"""
        if odds > 0:
            return 100 / (odds + 100)
        else:
            return abs(odds) / (abs(odds) + 100)

    def calculate_edge(self, our_prob, market_prob):
        """Calculate betting edge percentage"""
        return (our_prob - market_prob) / market_prob * 100

    def analyze_game(self, game):
        """Analyze a single game for betting edges"""
        game_id = game["game_id"]
        away_team = game["away_team"]
        home_team = game["home_team"]
        
        print(f"\n🏈 {away_team} @ {home_team}")
        print(f"📅 {game['date']}")
        print(f"📺 {game['network']}")
        if 'note' in game:
            print(f"📝 {game['note']}")
        
        # Get our prediction
        prediction = self.engine.predict_game(away_team, home_team, week=1)
        
        # Get betting lines
        lines = self.betting_lines.get(game_id, {})
        
        edges = []
        
        # Analyze each prediction
        for target, result in prediction['predictions'].items():
            if 'error' in result:
                continue
                
            our_prob = result['probability']
            confidence = result['confidence']
            
            print(f"\n📊 {target.upper()}:")
            print(f"   Our Prediction: {result['prediction']}")
            print(f"   Our Probability: {our_prob:.1%}")
            print(f"   Confidence: {confidence:.1f}%")
            
            # Compare to market lines
            if target == 'home_win' and 'moneyline' in lines:
                home_ml = lines['moneyline'][home_team]
                market_prob = self.odds_to_probability(home_ml)
                edge = self.calculate_edge(our_prob, market_prob)
                
                print(f"   Market ML: {home_ml:+d}")
                print(f"   Market Prob: {market_prob:.1%}")
                print(f"   Edge: {edge:+.1f}%")
                
                if abs(edge) >= 5:  # 5%+ edge threshold
                    edges.append({
                        'type': 'moneyline',
                        'team': home_team if edge > 0 else away_team,
                        'edge': edge,
                        'confidence': confidence,
                        'recommendation': 'BET' if abs(edge) >= 10 else 'LEAN'
                    })
            
            elif target == 'spread_cover' and 'spread' in lines:
                # Parse spread line
                spread_line = lines['spread']
                market_prob = 0.5  # Spread implies 50% probability
                edge = self.calculate_edge(our_prob, market_prob)
                
                print(f"   Market Spread: {spread_line}")
                print(f"   Market Prob: {market_prob:.1%}")
                print(f"   Edge: {edge:+.1f}%")
                
                if abs(edge) >= 5:
                    edges.append({
                        'type': 'spread',
                        'bet': f"{home_team} covers" if edge > 0 else f"{home_team} doesn't cover",
                        'edge': edge,
                        'confidence': confidence,
                        'recommendation': 'BET' if abs(edge) >= 10 else 'LEAN'
                    })
        
        return edges

    def find_all_edges(self):
        """Analyze all Week 1 games for betting edges"""
        print("🏈 WEEK 1 2025 NFL EDGE DETECTION")
        print("=" * 50)
        print("🎯 Comparing our XGBoost predictions vs betting markets")
        print("🔍 Looking for 5%+ edges (10%+ = strong bet)")
        
        all_edges = []
        
        for game in self.week1_games:
            edges = self.analyze_game(game)
            all_edges.extend(edges)
        
        # Summarize best opportunities
        print("\n🎯 BEST BETTING OPPORTUNITIES:")
        print("=" * 35)
        
        if not all_edges:
            print("❌ No significant edges found this week")
            print("💡 This is normal - most weeks have 0-3 strong edges")
            return all_edges
        
        # Sort by edge size
        all_edges.sort(key=lambda x: abs(x['edge']), reverse=True)
        
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
        
        return all_edges

    def save_results(self, edges):
        """Save edge detection results"""
        results = {
            "analysis_date": datetime.now().isoformat(),
            "week": 1,
            "season": 2025,
            "total_games": len(self.week1_games),
            "edges_found": len(edges),
            "games_analyzed": [
                {
                    "game_id": game["game_id"],
                    "matchup": f"{game['away_team']} @ {game['home_team']}",
                    "date": game["date"]
                }
                for game in self.week1_games
            ],
            "betting_opportunities": edges,
            "summary": {
                "strong_bets": len([e for e in edges if e['recommendation'] == 'BET']),
                "lean_bets": len([e for e in edges if e['recommendation'] == 'LEAN']),
                "avg_edge": sum(abs(e['edge']) for e in edges) / len(edges) if edges else 0,
                "max_edge": max(abs(e['edge']) for e in edges) if edges else 0
            }
        }
        
        with open('data/current/week1_2025_edge_analysis.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: data/current/week1_2025_edge_analysis.json")
        return results

def main():
    """Main edge detection analysis"""
    detector = Week1EdgeDetector()
    
    # Find all edges
    edges = detector.find_all_edges()
    
    # Save results
    results = detector.save_results(edges)
    
    # Final summary
    print("\n📋 FINAL SUMMARY:")
    print("=" * 20)
    print(f"✅ Games Analyzed: {results['total_games']}")
    print(f"🎯 Edges Found: {results['edges_found']}")
    print(f"🔥 Strong Bets: {results['summary']['strong_bets']}")
    print(f"📈 Lean Bets: {results['summary']['lean_bets']}")
    if edges:
        print(f"📊 Average Edge: {results['summary']['avg_edge']:.1f}%")
        print(f"🚀 Max Edge: {results['summary']['max_edge']:.1f}%")
    
    print("\n🎯 NEXT STEPS:")
    print("1. Wait for real betting lines from odds API")
    print("2. Update with current team EPA ratings")
    print("3. Add injury and weather data")
    print("4. Validate predictions against actual results")

if __name__ == "__main__":
    main() 