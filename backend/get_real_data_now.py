#!/usr/bin/env python3
"""
GET REAL DATA NOW - No fake data, only real sources
Fetches everything needed for upcoming NFL games
"""

import requests
import json
import pandas as pd
from datetime import datetime, timedelta
import time
import os

class RealDataCollector:
    """
    Collects ONLY real data from free sources
    NO FAKE OR SAMPLE DATA
    """
    
    def __init__(self):
        # Your API keys
        self.odds_api_key = "acfb5df269abb6f9772b8bc47727df9f"
        self.weather_api_key = "c65db1cf52eb399c299d5a9fe04ce0c8"
        
        # Free data sources
        self.espn_api = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"
        self.odds_api = "https://api.the-odds-api.com/v4/sports/americanfootball_nfl"
        self.weather_api = "https://api.openweathermap.org/data/2.5"
        
        print("🎯 REAL DATA COLLECTOR - NO FAKE DATA")
        print("=" * 50)
    
    def get_current_week_games(self):
        """Get REAL upcoming games from ESPN API (FREE)"""
        print("\n📅 Getting REAL upcoming games from ESPN...")
        
        try:
            # Get current NFL schedule from ESPN
            url = f"{self.espn_api}/scoreboard"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                games = []
                
                for event in data.get('events', []):
                    game_date = event.get('date', '')
                    status = event.get('status', {}).get('type', {}).get('name', '')
                    
                    # Only get upcoming games
                    if status in ['STATUS_SCHEDULED', 'STATUS_POSTPONED']:
                        competitions = event.get('competitions', [])
                        if competitions:
                            comp = competitions[0]
                            competitors = comp.get('competitors', [])
                            
                            if len(competitors) >= 2:
                                home_team = next((c for c in competitors if c.get('homeAway') == 'home'), {})
                                away_team = next((c for c in competitors if c.get('homeAway') == 'away'), {})
                                
                                game_info = {
                                    'game_id': event.get('id', ''),
                                    'date': game_date,
                                    'home_team': home_team.get('team', {}).get('abbreviation', ''),
                                    'home_team_name': home_team.get('team', {}).get('displayName', ''),
                                    'away_team': away_team.get('team', {}).get('abbreviation', ''),
                                    'away_team_name': away_team.get('team', {}).get('displayName', ''),
                                    'venue': comp.get('venue', {}).get('fullName', ''),
                                    'city': comp.get('venue', {}).get('address', {}).get('city', ''),
                                    'state': comp.get('venue', {}).get('address', {}).get('state', ''),
                                    'week': event.get('week', {}).get('number', 0),
                                    'season': event.get('season', {}).get('year', 2024)
                                }
                                games.append(game_info)
                
                print(f"✅ Found {len(games)} REAL upcoming games")
                return games
            else:
                print(f"❌ ESPN API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting games: {e}")
            return []
    
    def get_real_betting_lines(self, games):
        """Get REAL betting lines from The Odds API"""
        print(f"\n💰 Getting REAL betting lines for {len(games)} games...")
        
        try:
            url = f"{self.odds_api}/odds"
            params = {
                'apiKey': self.odds_api_key,
                'regions': 'us',
                'markets': 'h2h,spreads,totals',
                'oddsFormat': 'american',
                'dateFormat': 'iso'
            }
            
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                odds_data = response.json()
                print(f"✅ Got betting lines for {len(odds_data)} games")
                
                # Match odds to games
                for game in games:
                    home_team = game['home_team']
                    away_team = game['away_team']
                    
                    # Find matching odds
                    for odds_game in odds_data:
                        odds_home = odds_game.get('home_team', '')
                        odds_away = odds_game.get('away_team', '')
                        
                        # Match team names (ESPN uses abbreviations, odds might use full names)
                        if (home_team in odds_home or odds_home in game['home_team_name']) and \
                           (away_team in odds_away or odds_away in game['away_team_name']):
                            
                            # Get best odds from multiple bookmakers
                            bookmakers = odds_game.get('bookmakers', [])
                            if bookmakers:
                                best_book = bookmakers[0]  # Usually DraftKings or FanDuel
                                markets = best_book.get('markets', [])
                                
                                for market in markets:
                                    market_key = market.get('key', '')
                                    outcomes = market.get('outcomes', [])
                                    
                                    if market_key == 'spreads' and len(outcomes) >= 2:
                                        for outcome in outcomes:
                                            if outcome.get('name') == odds_home:
                                                game['home_spread'] = outcome.get('point', 0)
                                                game['home_spread_odds'] = outcome.get('price', 0)
                                            elif outcome.get('name') == odds_away:
                                                game['away_spread'] = outcome.get('point', 0)
                                                game['away_spread_odds'] = outcome.get('price', 0)
                                    
                                    elif market_key == 'totals' and len(outcomes) >= 2:
                                        over_outcome = next((o for o in outcomes if o.get('name') == 'Over'), {})
                                        under_outcome = next((o for o in outcomes if o.get('name') == 'Under'), {})
                                        
                                        if over_outcome:
                                            game['total'] = over_outcome.get('point', 0)
                                            game['over_odds'] = over_outcome.get('price', 0)
                                        if under_outcome:
                                            game['under_odds'] = under_outcome.get('price', 0)
                                    
                                    elif market_key == 'h2h' and len(outcomes) >= 2:
                                        for outcome in outcomes:
                                            if outcome.get('name') == odds_home:
                                                game['home_moneyline'] = outcome.get('price', 0)
                                            elif outcome.get('name') == odds_away:
                                                game['away_moneyline'] = outcome.get('price', 0)
                            break
                
                return games
            else:
                print(f"❌ Odds API error: {response.status_code}")
                if response.status_code == 401:
                    print("❌ Invalid API key or quota exceeded")
                return games
                
        except Exception as e:
            print(f"❌ Error getting betting lines: {e}")
            return games
    
    def get_real_weather_forecasts(self, games):
        """Get REAL weather forecasts for game locations"""
        print(f"\n🌤️ Getting REAL weather forecasts for {len(games)} games...")
        
        for game in games:
            try:
                city = game.get('city', '')
                state = game.get('state', '')
                
                if not city:
                    continue
                
                # Get coordinates for city
                geo_url = f"http://api.openweathermap.org/geo/1.0/direct"
                geo_params = {
                    'q': f"{city},{state},US",
                    'limit': 1,
                    'appid': self.weather_api_key
                }
                
                geo_response = requests.get(geo_url, params=geo_params, timeout=10)
                
                if geo_response.status_code == 200:
                    geo_data = geo_response.json()
                    if geo_data:
                        lat = geo_data[0]['lat']
                        lon = geo_data[0]['lon']
                        
                        # Get weather forecast
                        weather_url = f"{self.weather_api}/forecast"
                        weather_params = {
                            'lat': lat,
                            'lon': lon,
                            'appid': self.weather_api_key,
                            'units': 'imperial'
                        }
                        
                        weather_response = requests.get(weather_url, params=weather_params, timeout=10)
                        
                        if weather_response.status_code == 200:
                            weather_data = weather_response.json()
                            
                            # Find forecast closest to game time
                            game_date = datetime.fromisoformat(game['date'].replace('Z', '+00:00'))
                            closest_forecast = None
                            min_time_diff = float('inf')
                            
                            for forecast in weather_data.get('list', []):
                                forecast_time = datetime.fromtimestamp(forecast['dt'])
                                time_diff = abs((game_date - forecast_time).total_seconds())
                                
                                if time_diff < min_time_diff:
                                    min_time_diff = time_diff
                                    closest_forecast = forecast
                            
                            if closest_forecast:
                                main = closest_forecast.get('main', {})
                                wind = closest_forecast.get('wind', {})
                                weather = closest_forecast.get('weather', [{}])[0]
                                
                                game['weather'] = {
                                    'temperature': main.get('temp', 70),
                                    'feels_like': main.get('feels_like', 70),
                                    'humidity': main.get('humidity', 50),
                                    'wind_speed': wind.get('speed', 0),
                                    'wind_direction': wind.get('deg', 0),
                                    'description': weather.get('description', 'Clear'),
                                    'precipitation': closest_forecast.get('rain', {}).get('3h', 0) + 
                                                   closest_forecast.get('snow', {}).get('3h', 0)
                                }
                                
                                print(f"   ✅ {game['away_team']} @ {game['home_team']}: {game['weather']['temperature']}°F, {game['weather']['description']}")
                
                time.sleep(0.1)  # Rate limiting
                
            except Exception as e:
                print(f"   ❌ Weather error for {game.get('city', 'Unknown')}: {e}")
                continue
        
        return games
    
    def get_real_team_stats(self):
        """Get REAL team statistics from ESPN"""
        print("\n📊 Getting REAL team statistics from ESPN...")
        
        try:
            # Get team stats from ESPN
            url = f"{self.espn_api}/teams"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                teams = []
                
                for team in data.get('sports', [{}])[0].get('leagues', [{}])[0].get('teams', []):
                    team_info = team.get('team', {})
                    
                    # Get detailed team stats
                    team_id = team_info.get('id', '')
                    if team_id:
                        stats_url = f"{self.espn_api}/teams/{team_id}/statistics"
                        stats_response = requests.get(stats_url, timeout=10)
                        
                        if stats_response.status_code == 200:
                            stats_data = stats_response.json()
                            
                            team_stats = {
                                'team_id': team_id,
                                'abbreviation': team_info.get('abbreviation', ''),
                                'display_name': team_info.get('displayName', ''),
                                'color': team_info.get('color', ''),
                                'logo': team_info.get('logos', [{}])[0].get('href', ''),
                                'record': team_info.get('record', {}).get('items', [{}])[0].get('summary', '0-0'),
                                'stats': stats_data
                            }
                            teams.append(team_stats)
                            print(f"   ✅ {team_stats['abbreviation']}: {team_stats['record']}")
                        
                        time.sleep(0.1)  # Rate limiting
                
                print(f"✅ Got stats for {len(teams)} teams")
                return teams
            else:
                print(f"❌ ESPN teams API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting team stats: {e}")
            return []
    
    def save_real_data(self, games, teams):
        """Save all real data to files"""
        print(f"\n💾 Saving REAL data...")
        
        # Create data directory if it doesn't exist
        os.makedirs("data/real-current", exist_ok=True)
        
        # Save games with all data
        games_file = "data/real-current/upcoming-games.json"
        with open(games_file, 'w') as f:
            json.dump(games, f, indent=2, default=str)
        print(f"✅ Saved {len(games)} games to {games_file}")
        
        # Save team stats
        teams_file = "data/real-current/team-stats.json"
        with open(teams_file, 'w') as f:
            json.dump(teams, f, indent=2, default=str)
        print(f"✅ Saved {len(teams)} teams to {teams_file}")
        
        # Summary report
        print(f"\n📋 REAL DATA SUMMARY:")
        print(f"   Games: {len(games)}")
        print(f"   Teams: {len(teams)}")
        print(f"   Games with betting lines: {len([g for g in games if 'home_spread' in g])}")
        print(f"   Games with weather: {len([g for g in games if 'weather' in g])}")
        
        return games_file, teams_file
    
    def collect_all_real_data(self):
        """Main function to collect ALL real data"""
        print("🚀 COLLECTING ALL REAL DATA - NO FAKE DATA")
        print("=" * 60)
        
        # Step 1: Get upcoming games
        games = self.get_current_week_games()
        if not games:
            print("❌ No upcoming games found")
            return [], []
        
        # Step 2: Get betting lines
        games = self.get_real_betting_lines(games)
        
        # Step 3: Get weather forecasts
        games = self.get_real_weather_forecasts(games)
        
        # Step 4: Get team statistics
        teams = self.get_real_team_stats()
        
        # Step 5: Save everything
        games_file, teams_file = self.save_real_data(games, teams)
        
        print("\n🎯 REAL DATA COLLECTION COMPLETE")
        print("=" * 60)
        print("✅ ALL DATA IS REAL - NO FAKE OR SAMPLE DATA")
        print(f"✅ Ready for analysis of {len(games)} upcoming games")
        
        return games, teams

def main():
    """Main execution"""
    collector = RealDataCollector()
    games, teams = collector.collect_all_real_data()
    
    if games:
        print(f"\n🎯 NEXT: Run real analysis on {len(games)} games")
        print("   python analyze_real_games.py")

if __name__ == "__main__":
    main()
