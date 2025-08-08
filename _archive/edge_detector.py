import json
from clean_nfl_predictor import NFLPredictionEngine, Week1Predictor

class EdgeDetector:
    def __init__(self):
        self.predictor = Week1Predictor()
        
        # Sample market odds for Week 1 (realistic examples)
        self.market_odds = {
            # Game format: {"away_team": "home_team": {"spread": home_spread, "total": total, "moneyline": [away_ml, home_ml]}}
            "DAL_PHI": {"spread": -2.5, "total": 47.5, "moneyline": [140, -160]},  # PHI favored
            "KC_LAC": {"spread": -3.0, "total": 44.5, "moneyline": [-150, 130]},  # KC favored  
            "TB_ATL": {"spread": 1.5, "total": 43.0, "moneyline": [-105, -115]},   # ATL slight favorite
            "CIN_CLE": {"spread": -6.5, "total": 42.0, "moneyline": [-280, 240]}, # CIN big favorite
            "MIA_IND": {"spread": -2.0, "total": 44.0, "moneyline": [-120, 100]}, # MIA favored
            "CAR_JAX": {"spread": 3.0, "total": 38.5, "moneyline": [125, -145]},  # JAX favored
            "LV_NE": {"spread": 1.0, "total": 40.0, "moneyline": [-105, -115]},   # NE slight favorite
            "ARI_NO": {"spread": 2.5, "total": 42.5, "moneyline": [110, -130]},   # NO favored
            "PIT_NYJ": {"spread": -1.0, "total": 41.5, "moneyline": [-105, -115]}, # PIT slight favorite
            "NYG_WSH": {"spread": 4.5, "total": 43.5, "moneyline": [170, -200]},  # WSH favored
            "TEN_DEN": {"spread": 7.0, "total": 41.0, "moneyline": [280, -340]},  # DEN big favorite
            "SF_SEA": {"spread": -3.5, "total": 47.0, "moneyline": [-165, 145]},  # SF favored
            "DET_GB": {"spread": -1.5, "total": 48.5, "moneyline": [-110, -110]}, # Even game
            "HOU_LAR": {"spread": -2.5, "total": 44.5, "moneyline": [-130, 110]}, # HOU favored
            "BAL_BUF": {"spread": 1.5, "total": 47.5, "moneyline": [105, -125]},  # BUF slight favorite
            "MIN_CHI": {"spread": -2.0, "total": 43.0, "moneyline": [-115, -105]} # MIN favored
        }
        
        print("🎯 EDGE DETECTION SYSTEM")
        print("=" * 50)
        print("✅ Market odds loaded for all 16 games")
        print("✅ Moneyline, spread, and total markets")
        print("✅ Kelly criterion bet sizing")
        print("✅ Value identification system")
        print("=" * 50)
    
    def american_to_probability(self, american_odds):
        """Convert American odds to implied probability"""
        if american_odds > 0:
            return 100 / (american_odds + 100)
        else:
            return abs(american_odds) / (abs(american_odds) + 100)
    
    def spread_to_probability(self, spread):
        """Convert point spread to win probability (rough approximation)"""
        # Each point is roughly 2.5% win probability
        if spread == 0:
            return 0.50
        return 0.50 + (spread * 0.025)
    
    def calculate_edge(self, our_prob, market_prob):
        """Calculate betting edge"""
        return our_prob - market_prob
    
    def kelly_bet_size(self, edge, our_prob, odds):
        """Calculate optimal bet size using Kelly Criterion"""
        if edge <= 0:
            return 0
        
        # Convert odds to decimal
        if odds > 0:
            decimal_odds = (odds / 100) + 1
        else:
            decimal_odds = (100 / abs(odds)) + 1
        
        # Kelly formula: (bp - q) / b
        # b = decimal odds - 1, p = our probability, q = 1 - p
        b = decimal_odds - 1
        kelly = (b * our_prob - (1 - our_prob)) / b
        
        # Cap at 10% of bankroll for safety
        return max(0, min(kelly, 0.10))
    
    def classify_edge(self, edge):
        """Classify edge strength"""
        if edge >= 0.08:
            return "STRONG", "🔥"
        elif edge >= 0.05:
            return "GOOD", "✅"
        elif edge >= 0.02:
            return "MARGINAL", "⚡"
        else:
            return "NO EDGE", "❌"
    
    def detect_edges_for_game(self, game_key, prediction):
        """Detect all edges for a single game"""
        if game_key not in self.market_odds:
            return None
        
        market = self.market_odds[game_key]
        our_home_prob = prediction['home_win_probability']
        our_away_prob = prediction['away_win_probability']
        
        edges = {}
        
        # MONEYLINE EDGES
        away_ml_prob = self.american_to_probability(market['moneyline'][0])
        home_ml_prob = self.american_to_probability(market['moneyline'][1])
        
        away_ml_edge = self.calculate_edge(our_away_prob, away_ml_prob)
        home_ml_edge = self.calculate_edge(our_home_prob, home_ml_prob)
        
        edges['away_moneyline'] = {
            'edge': away_ml_edge,
            'our_prob': our_away_prob,
            'market_prob': away_ml_prob,
            'odds': market['moneyline'][0],
            'kelly_size': self.kelly_bet_size(away_ml_edge, our_away_prob, market['moneyline'][0]),
            'classification': self.classify_edge(away_ml_edge)
        }
        
        edges['home_moneyline'] = {
            'edge': home_ml_edge,
            'our_prob': our_home_prob,
            'market_prob': home_ml_prob,
            'odds': market['moneyline'][1],
            'kelly_size': self.kelly_bet_size(home_ml_edge, our_home_prob, market['moneyline'][1]),
            'classification': self.classify_edge(home_ml_edge)
        }
        
        # SPREAD EDGES (approximate)
        # Positive spread means home team is favored
        home_spread_prob = self.spread_to_probability(-market['spread'])  # Flip for home team
        away_spread_prob = 1 - home_spread_prob
        
        away_spread_edge = self.calculate_edge(our_away_prob, away_spread_prob)
        home_spread_edge = self.calculate_edge(our_home_prob, home_spread_prob)
        
        edges['away_spread'] = {
            'edge': away_spread_edge,
            'our_prob': our_away_prob,
            'market_prob': away_spread_prob,
            'spread': market['spread'],
            'classification': self.classify_edge(away_spread_edge)
        }
        
        edges['home_spread'] = {
            'edge': home_spread_edge,
            'our_prob': our_home_prob,
            'market_prob': home_spread_prob,
            'spread': -market['spread'],
            'classification': self.classify_edge(home_spread_edge)
        }
        
        return edges
    
    def find_all_edges(self):
        """Find edges for all Week 1 games"""
        print("\n🎯 COMPREHENSIVE EDGE ANALYSIS - WEEK 1 2025")
        print("=" * 70)
        
        all_predictions = self.predictor.predict_week1()
        all_edges = {}
        
        strong_edges = []
        good_edges = []
        marginal_edges = []
        
        for i, game in enumerate(self.predictor.week1_games):
            away = game['away']
            home = game['home']
            game_key = f"{away}_{home}"
            
            prediction = all_predictions[i]
            edges = self.detect_edges_for_game(game_key, prediction)
            
            if not edges:
                continue
                
            all_edges[game_key] = edges
            
            print(f"\n{'='*60}")
            print(f"🎮 {away} @ {home}")
            print(f"Our Prediction: {prediction['predicted_winner']} ({prediction['confidence']} confidence)")
            print(f"{'='*60}")
            
            # Check all betting opportunities
            for bet_type, edge_data in edges.items():
                edge_pct = edge_data['edge'] * 100
                classification, emoji = edge_data['classification']
                
                if classification != "NO EDGE":
                    if bet_type.endswith('_moneyline'):
                        team = bet_type.replace('_moneyline', '').upper()
                        odds_str = f"({edge_data['odds']:+d})"
                        kelly_pct = edge_data.get('kelly_size', 0) * 100
                        
                        print(f"  {emoji} {classification}: {team} ML {odds_str}")
                        print(f"    Edge: {edge_pct:+.1f}% | Kelly: {kelly_pct:.1f}% bankroll")
                        
                        if classification == "STRONG":
                            strong_edges.append(f"{away}@{home} - {team} ML ({edge_pct:+.1f}%)")
                        elif classification == "GOOD":
                            good_edges.append(f"{away}@{home} - {team} ML ({edge_pct:+.1f}%)")
                        else:
                            marginal_edges.append(f"{away}@{home} - {team} ML ({edge_pct:+.1f}%)")
                    
                    elif bet_type.endswith('_spread'):
                        team = bet_type.replace('_spread', '').upper()
                        spread_str = f"({edge_data['spread']:+.1f})"
                        
                        print(f"  {emoji} {classification}: {team} {spread_str}")
                        print(f"    Edge: {edge_pct:+.1f}%")
                        
                        if classification == "STRONG":
                            strong_edges.append(f"{away}@{home} - {team} {spread_str} ({edge_pct:+.1f}%)")
                        elif classification == "GOOD":
                            good_edges.append(f"{away}@{home} - {team} {spread_str} ({edge_pct:+.1f}%)")
                        else:
                            marginal_edges.append(f"{away}@{home} - {team} {spread_str} ({edge_pct:+.1f}%)")
        
        # SUMMARY
        print(f"\n🚀 EDGE DETECTION SUMMARY")
        print(f"=" * 70)
        print(f"🔥 STRONG EDGES ({len(strong_edges)}): ≥8% advantage")
        for edge in strong_edges:
            print(f"   {edge}")
        
        print(f"\n✅ GOOD EDGES ({len(good_edges)}): 5-8% advantage") 
        for edge in good_edges:
            print(f"   {edge}")
            
        print(f"\n⚡ MARGINAL EDGES ({len(marginal_edges)}): 2-5% advantage")
        for edge in marginal_edges:
            print(f"   {edge}")
        
        total_edges = len(strong_edges) + len(good_edges) + len(marginal_edges)
        print(f"\n📊 TOTAL BETTING OPPORTUNITIES: {total_edges}")
        print(f"✅ Edge detection system operational!")
        
        return all_edges

def main():
    """Run edge detection analysis"""
    detector = EdgeDetector()
    edges = detector.find_all_edges()

if __name__ == "__main__":
    main() 