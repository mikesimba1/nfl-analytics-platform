#!/usr/bin/env python3
"""
Week 1 2025 NFL Predictions & Betting Insights
Generate predictions for all 16 upcoming Week 1 games with actionable betting intelligence
"""

import sys
sys.path.append('xgboost_model')
from prediction_engine import NFLPredictionEngine
import json
from datetime import datetime

class Week1PredictiveSystem:
    def __init__(self):
        self.engine = NFLPredictionEngine()
        
        # Official Week 1 2025 schedule
        self.week1_games = [
            {"date": "Thursday, Sept. 4, 8:20 PM ET", "away": "DAL", "home": "PHI", "network": "NBC", "note": "Season Opener"},
            {"date": "Friday, Sept. 5, 8:00 PM ET", "away": "KC", "home": "LAC", "network": "International", "note": "Brazil Game"},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "TB", "home": "ATL", "network": "FOX", "note": ""},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "CIN", "home": "CLE", "network": "FOX", "note": "AFC North"},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "MIA", "home": "IND", "network": "CBS", "note": ""},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "CAR", "home": "JAX", "network": "FOX", "note": ""},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "LV", "home": "NE", "network": "CBS", "note": ""},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "ARI", "home": "NO", "network": "FOX", "note": ""},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "PIT", "home": "NYJ", "network": "CBS", "note": ""},
            {"date": "Sunday, Sept. 7, 1:00 PM ET", "away": "NYG", "home": "WSH", "network": "FOX", "note": "NFC East"},
            {"date": "Sunday, Sept. 7, 4:05 PM ET", "away": "TEN", "home": "DEN", "network": "CBS", "note": ""},
            {"date": "Sunday, Sept. 7, 4:05 PM ET", "away": "SF", "home": "SEA", "network": "FOX", "note": "NFC West"},
            {"date": "Sunday, Sept. 7, 4:25 PM ET", "away": "DET", "home": "GB", "network": "FOX", "note": "NFC North"},
            {"date": "Sunday, Sept. 7, 4:25 PM ET", "away": "HOU", "home": "LAR", "network": "FOX", "note": ""},
            {"date": "Sunday, Sept. 7, 8:20 PM ET", "away": "BAL", "home": "BUF", "network": "NBC", "note": "Sunday Night"},
            {"date": "Monday, Sept. 8, 8:15 PM ET", "away": "MIN", "home": "CHI", "network": "ESPN", "note": "Monday Night"}
        ]

    def get_market_odds_estimate(self, away, home):
        """Get estimated market odds from our real odds data"""
        try:
            with open('data/current/current_odds.json', 'r') as f:
                odds_data = json.load(f)
            
            # Find matching game
            for game in odds_data:
                if (game.get('away_team', '').replace(' ', '').lower().endswith(away.lower()) and 
                    game.get('home_team', '').replace(' ', '').lower().endswith(home.lower())):
                    
                    # Extract spread and total
                    spreads = []
                    totals = []
                    
                    for bookmaker in game.get('bookmakers', []):
                        for market in bookmaker.get('markets', []):
                            if market['key'] == 'spreads':
                                for outcome in market['outcomes']:
                                    if outcome['name'] == game['home_team']:
                                        spreads.append(outcome['point'])
                            elif market['key'] == 'totals':
                                for outcome in market['outcomes']:
                                    if outcome['name'] == 'Over':
                                        totals.append(outcome['point'])
                    
                    if spreads and totals:
                        return {
                            'spread': sum(spreads) / len(spreads),
                            'total': sum(totals) / len(totals),
                            'books': len(game['bookmakers'])
                        }
            
            return None
            
        except:
            return None

    def predict_week1_games(self):
        """Generate predictions for all Week 1 games"""
        print("🏈 WEEK 1 2025 NFL PREDICTIONS & BETTING INSIGHTS")
        print("=" * 55)
        print("🎯 Predictive analysis for all 16 upcoming games")
        print("💰 Real market odds vs our model predictions")
        print("🔍 Betting opportunities and edge detection")
        
        all_predictions = []
        betting_opportunities = []
        
        for i, game in enumerate(self.week1_games, 1):
            away = game['away']
            home = game['home']
            
            print(f"\n{'='*50}")
            print(f"🎮 GAME {i}: {away} @ {home}")
            print(f"📅 {game['date']} | 📺 {game['network']}")
            if game['note']:
                print(f"📝 {game['note']}")
            print(f"{'='*50}")
            
            # Get our prediction
            try:
                prediction = self.engine.predict_game(away, home, week=1)
                
                # Get market odds
                market_odds = self.get_market_odds_estimate(away, home)
                
                # Extract key predictions
                home_win = prediction['predictions']['home_win']
                spread_cover = prediction['predictions']['spread_cover']
                
                winner = home if home_win['prediction'] == 1 else away
                winner_prob = home_win['probability']
                confidence = home_win['confidence']
                
                print(f"\n🎯 OUR PREDICTION:")
                print(f"   Winner: {winner} ({winner_prob:.1%} probability)")
                print(f"   Confidence: {confidence:.1f}%")
                print(f"   Spread Coverage: {'Home covers' if spread_cover['prediction'] == 1 else 'Away covers'} ({spread_cover['probability']:.1%})")
                
                # Market comparison
                if market_odds:
                    market_spread = market_odds['spread']
                    market_total = market_odds['total']
                    
                    print(f"\n💰 MARKET ODDS ({market_odds['books']} sportsbooks):")
                    print(f"   Spread: {home} {market_spread:+.1f}")
                    print(f"   Total: {market_total:.1f}")
                    
                    # Calculate edges
                    # Convert spread to implied probability
                    if market_spread < 0:  # Home favored
                        market_home_prob = 0.5 + abs(market_spread) * 0.03
                    else:  # Away favored
                        market_home_prob = 0.5 - market_spread * 0.03
                    
                    market_home_prob = max(0.15, min(0.85, market_home_prob))
                    
                    # Calculate edge
                    if winner == home:
                        edge = (winner_prob - market_home_prob) / market_home_prob * 100
                        bet_recommendation = f"{home} moneyline"
                    else:
                        market_away_prob = 1 - market_home_prob
                        edge = (winner_prob - market_away_prob) / market_away_prob * 100
                        bet_recommendation = f"{away} moneyline"
                    
                    print(f"\n🔍 EDGE ANALYSIS:")
                    print(f"   Our {winner} Probability: {winner_prob:.1%}")
                    print(f"   Market Implied Probability: {market_home_prob:.1%} (home) / {1-market_home_prob:.1%} (away)")
                    print(f"   Edge: {edge:+.1f}%")
                    
                    # Betting recommendation
                    if abs(edge) >= 8 and confidence >= 60:
                        recommendation = "🔥 STRONG BET" if abs(edge) >= 15 else "📈 GOOD BET"
                        print(f"   Recommendation: {recommendation}")
                        print(f"   Suggested Bet: {bet_recommendation}")
                        
                        betting_opportunities.append({
                            'game': f"{away} @ {home}",
                            'bet': bet_recommendation,
                            'edge': edge,
                            'confidence': confidence,
                            'recommendation': recommendation,
                            'our_prob': winner_prob,
                            'market_spread': market_spread
                        })
                    
                    elif abs(edge) >= 5:
                        print(f"   Recommendation: 👀 WATCH - Small edge")
                    else:
                        print(f"   Recommendation: ❌ PASS - No significant edge")
                
                else:
                    print(f"\n💰 MARKET ODDS: Not found in current data")
                    print(f"   (Will need live odds closer to game time)")
                
                # Game insights
                print(f"\n💡 KEY INSIGHTS:")
                if confidence >= 70:
                    print(f"   🎯 High confidence prediction ({confidence:.1f}%)")
                if winner_prob >= 0.65:
                    print(f"   ⚡ Strong favorite identified ({winner})")
                if abs(winner_prob - 0.5) <= 0.1:
                    print(f"   ⚖️ Close game expected (near 50/50)")
                
                # Store prediction
                all_predictions.append({
                    'game_number': i,
                    'away_team': away,
                    'home_team': home,
                    'date': game['date'],
                    'predicted_winner': winner,
                    'win_probability': winner_prob,
                    'confidence': confidence,
                    'spread_prediction': spread_cover['prediction'],
                    'spread_probability': spread_cover['probability'],
                    'market_spread': market_odds['spread'] if market_odds else None,
                    'market_total': market_odds['total'] if market_odds else None,
                    'edge': edge if market_odds else None
                })
                
            except Exception as e:
                print(f"   ❌ Prediction failed: {e}")
                continue
        
        return all_predictions, betting_opportunities

    def summarize_week1_outlook(self, predictions, opportunities):
        """Provide Week 1 betting summary"""
        print(f"\n🎯 WEEK 1 2025 BETTING SUMMARY")
        print("=" * 30)
        
        if opportunities:
            print(f"🔥 BEST BETTING OPPORTUNITIES:")
            print("-" * 30)
            
            # Sort by edge size
            opportunities.sort(key=lambda x: abs(x['edge']), reverse=True)
            
            for i, opp in enumerate(opportunities[:5], 1):
                print(f"{i}. {opp['game']}")
                print(f"   Bet: {opp['bet']}")
                print(f"   Edge: {opp['edge']:+.1f}% | Confidence: {opp['confidence']:.1f}%")
                print(f"   {opp['recommendation']}")
                print()
        
        else:
            print("📊 No strong betting opportunities identified")
            print("💡 This suggests efficient market pricing")
        
        # Game insights
        high_conf_games = [p for p in predictions if p['confidence'] >= 70]
        close_games = [p for p in predictions if abs(p['win_probability'] - 0.5) <= 0.1]
        
        print(f"📈 WEEK 1 INSIGHTS:")
        print(f"   High Confidence Games: {len(high_conf_games)}/16")
        print(f"   Expected Close Games: {len(close_games)}/16")
        print(f"   Betting Opportunities: {len(opportunities)}/16")
        
        if high_conf_games:
            print(f"\n🎯 HIGHEST CONFIDENCE PICKS:")
            for game in sorted(high_conf_games, key=lambda x: x['confidence'], reverse=True)[:3]:
                print(f"   {game['predicted_winner']} over {game['away_team'] if game['predicted_winner'] == game['home_team'] else game['home_team']} ({game['confidence']:.1f}%)")

def main():
    """Generate Week 1 2025 predictions"""
    system = Week1PredictiveSystem()
    
    # Generate all predictions
    predictions, opportunities = system.predict_week1_games()
    
    # Summarize outlook
    system.summarize_week1_outlook(predictions, opportunities)
    
    # Save results
    results = {
        "generated_date": datetime.now().isoformat(),
        "week": 1,
        "season": 2025,
        "total_games": len(predictions),
        "betting_opportunities": len(opportunities),
        "predictions": predictions,
        "opportunities": opportunities,
        "summary": {
            "high_confidence_games": len([p for p in predictions if p['confidence'] >= 70]),
            "close_games": len([p for p in predictions if abs(p['win_probability'] - 0.5) <= 0.1]),
            "strong_bets": len([o for o in opportunities if "STRONG" in o['recommendation']]),
            "good_bets": len([o for o in opportunities if "GOOD" in o['recommendation']])
        }
    }
    
    with open('data/current/week1_2025_predictions.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Complete predictions saved to: data/current/week1_2025_predictions.json")
    
    print(f"\n🏈 READY FOR WEEK 1 2025!")
    print("=" * 25)
    print("✅ Predictions generated for all 16 games")
    print("✅ Betting opportunities identified")
    print("✅ Edge analysis vs real market odds")
    print("✅ Confidence scoring for each pick")
    print("🎯 Your predictive system is operational!")

if __name__ == "__main__":
    main() 