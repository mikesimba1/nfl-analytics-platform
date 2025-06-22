#!/usr/bin/env python3
"""
FIX SPREAD ANALYSIS - Correct spread interpretation
"""

import json
from datetime import datetime

def fix_spread_interpretation():
    print("🔧 FIXING SPREAD ANALYSIS")
    print("=" * 50)
    
    # Load the games and analysis
    with open("data/real-current/upcoming-games.json", 'r') as f:
        games = json.load(f)
    
    print("✅ Fixing spread interpretation for all games...")
    
    # Re-analyze with correct spread logic
    fixed_analyses = []
    
    for game in games:
        home_team = game.get('home_team', '')
        away_team = game.get('away_team', '')
        
        # Get CORRECT betting lines
        home_spread = game.get('home_spread', 0)  # This is the HOME team's spread
        away_spread = game.get('away_spread', 0)  # This is the AWAY team's spread
        total = game.get('total', 0)
        
        # Example: NYG @ WSH, WSH -6.5 means WSH is favored by 6.5
        # So the market line is WSH -6.5 (or NYG +6.5)
        
        # Our prediction (simplified for demo)
        our_home_spread = 2.8  # Basic home field advantage
        
        # Calculate edge CORRECTLY
        if home_spread != 0:
            # Market has home team at home_spread
            # Our prediction has home team at our_home_spread
            spread_edge = our_home_spread - home_spread
            
            # If WSH is -6.5 in market, and we think they should be -3.0
            # Then edge = -3.0 - (-6.5) = +3.5 (bet the underdog NYG)
        else:
            spread_edge = our_home_spread
        
        # Determine bet direction
        if spread_edge > 0:
            # Our prediction is MORE favorable to home team than market
            # Bet the HOME team
            bet_direction = "HOME"
            bet_team = home_team
        else:
            # Our prediction is LESS favorable to home team than market  
            # Bet the AWAY team
            bet_direction = "AWAY" 
            bet_team = away_team
        
        analysis = {
            'matchup': f"{away_team} @ {home_team}",
            'home_team': home_team,
            'away_team': away_team,
            'market_home_spread': home_spread,
            'market_away_spread': away_spread,
            'our_home_spread': round(our_home_spread, 1),
            'spread_edge': round(spread_edge, 1),
            'bet_direction': bet_direction,
            'bet_team': bet_team,
            'total': total
        }
        
        fixed_analyses.append(analysis)
        
        print(f"\n🎯 {away_team} @ {home_team}")
        print(f"   Market: {home_team} {home_spread:+.1f}")
        print(f"   Our Pred: {home_team} {our_home_spread:+.1f}")
        print(f"   Edge: {spread_edge:+.1f}")
        print(f"   Bet: {bet_team} ({bet_direction})")
    
    # Save corrected analysis
    with open("data/real-current/corrected-analysis.json", 'w') as f:
        json.dump(fixed_analyses, f, indent=2)
    
    print(f"\n✅ Fixed analysis saved to corrected-analysis.json")
    
    # Show the WSH game specifically
    wsh_game = next(g for g in fixed_analyses if 'WSH' in g['home_team'])
    print(f"\n🎯 WSH GAME CORRECTED:")
    print(f"   Matchup: {wsh_game['matchup']}")
    print(f"   Market Line: WSH {wsh_game['market_home_spread']:+.1f}")
    print(f"   Our Prediction: WSH {wsh_game['our_home_spread']:+.1f}")
    print(f"   Edge: {wsh_game['spread_edge']:+.1f}")
    print(f"   Recommendation: Bet {wsh_game['bet_team']}")

if __name__ == "__main__":
    fix_spread_interpretation() 