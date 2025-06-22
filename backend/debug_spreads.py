#!/usr/bin/env python3
"""
DEBUG SPREADS - Check why betting lines are wrong/reversed
"""

import json
import pprint

def debug_spreads():
    print("🔍 DEBUGGING BETTING SPREADS")
    print("=" * 50)
    
    # Load the games data
    try:
        with open("data/real-current/upcoming-games.json", 'r') as f:
            games = json.load(f)
        
        print(f"✅ Loaded {len(games)} games")
        
        # Find the NYG @ WSH game
        wsh_game = None
        for game in games:
            if (game.get('home_team') == 'WSH' and game.get('away_team') == 'NYG') or \
               (game.get('home_team') == 'NYG' and game.get('away_team') == 'WSH'):
                wsh_game = game
                break
        
        if wsh_game:
            print(f"\n🎯 Found game: {wsh_game.get('away_team')} @ {wsh_game.get('home_team')}")
            print("\n📊 RAW BETTING DATA:")
            betting_data = {k: v for k, v in wsh_game.items() if 'spread' in k or 'total' in k or 'moneyline' in k}
            pprint.pprint(betting_data, width=80)
            
            print(f"\n🏈 GAME DETAILS:")
            print(f"   Home Team: {wsh_game.get('home_team')} ({wsh_game.get('home_team_name')})")
            print(f"   Away Team: {wsh_game.get('away_team')} ({wsh_game.get('away_team_name')})")
            print(f"   Date: {wsh_game.get('date')}")
            print(f"   Venue: {wsh_game.get('venue')}")
            
        else:
            print("❌ Could not find NYG @ WSH game")
        
        # Check a few more games to see the pattern
        print(f"\n📊 CHECKING ALL GAMES FOR SPREAD PATTERN:")
        print("-" * 80)
        print(f"{'MATCHUP':<20} {'HOME_SPREAD':<12} {'AWAY_SPREAD':<12} {'TOTAL':<8}")
        print("-" * 80)
        
        for game in games[:10]:  # First 10 games
            matchup = f"{game.get('away_team', '')} @ {game.get('home_team', '')}"
            home_spread = game.get('home_spread', 'N/A')
            away_spread = game.get('away_spread', 'N/A')
            total = game.get('total', 'N/A')
            
            print(f"{matchup:<20} {str(home_spread):<12} {str(away_spread):<12} {str(total):<8}")
        
        print("\n🚨 SPREAD INTERPRETATION ISSUE:")
        print("The problem is likely in how we're interpreting the betting API data.")
        print("We need to check:")
        print("1. Which team the spread is FOR")
        print("2. How positive/negative spreads are assigned")
        print("3. Home vs Away team spread assignment")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_spreads() 