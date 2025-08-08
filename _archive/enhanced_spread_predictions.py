#!/usr/bin/env python3
"""
Enhanced NFL Predictions with Spread Confidence
Includes confidence scoring for both win/loss and spread predictions
"""

import sys
sys.path.append('xgboost_model')
from prediction_engine import NFLPredictionEngine
import json
import numpy as np
from datetime import datetime

class EnhancedSpreadPredictor:
    def __init__(self):
        self.engine = NFLPredictionEngine()
        
        # Week 1 2025 games
        self.week1_games = [
            {"away": "DAL", "home": "PHI", "note": "Season Opener"},
            {"away": "KC", "home": "LAC", "note": "Brazil Game"},
            {"away": "TB", "home": "ATL", "note": "NFC South"},
            {"away": "CIN", "home": "CLE", "note": "AFC North"},
            {"away": "MIA", "home": "IND", "note": ""},
            {"away": "CAR", "home": "JAX", "note": ""},
            {"away": "LV", "home": "NE", "note": ""},
            {"away": "ARI", "home": "NO", "note": ""},
            {"away": "PIT", "home": "NYJ", "note": ""},
            {"away": "NYG", "home": "WSH", "note": "NFC East"},
            {"away": "TEN", "home": "DEN", "note": ""},
            {"away": "SF", "home": "SEA", "note": "NFC West"},
            {"away": "DET", "home": "GB", "note": "NFC North"},
            {"away": "HOU", "home": "LAR", "note": ""},
            {"away": "BAL", "home": "BUF", "note": "Sunday Night"},
            {"away": "MIN", "home": "CHI", "note": "Monday Night"}
        ]

    def calibrate_probability(self, raw_prob, confidence_factor=0.7):
        """
        Calibrate overconfident probabilities toward 50/50
        This addresses the model overconfidence issue
        """
        # Pull extreme probabilities toward center
        if raw_prob > 0.5:
            calibrated = 0.5 + (raw_prob - 0.5) * confidence_factor
        else:
            calibrated = 0.5 - (0.5 - raw_prob) * confidence_factor
        
        # Keep within reasonable bounds (15% to 85%)
        return max(0.15, min(0.85, calibrated))

    def calculate_spread_confidence(self, spread_prob, win_prob):
        """
        Calculate confidence for spread predictions based on multiple factors
        """
        # Base confidence from spread probability
        base_confidence = abs(spread_prob - 0.5) * 2 * 100
        
        # Adjust based on win probability alignment
        if (spread_prob > 0.5 and win_prob > 0.5) or (spread_prob < 0.5 and win_prob < 0.5):
            # Predictions align - higher confidence
            alignment_bonus = 10
        else:
            # Predictions don't align - lower confidence
            alignment_bonus = -15
        
        # Final confidence calculation
        final_confidence = base_confidence + alignment_bonus
        
        # Keep within bounds (20% to 90%)
        return max(20, min(90, final_confidence))

    def estimate_point_spread(self, win_prob):
        """
        Convert win probability to estimated point spread
        """
        if win_prob > 0.5:
            # Home team favored
            spread = -(win_prob - 0.5) * 20  # Rough conversion
        else:
            # Away team favored  
            spread = (0.5 - win_prob) * 20
        
        # Round to common spread increments
        spread = round(spread * 2) / 2  # Round to nearest 0.5
        return max(-14, min(14, spread))  # Cap at reasonable range

    def get_realistic_predictions(self):
        """Generate realistic predictions with proper confidence scoring"""
        print("🏈 ENHANCED WEEK 1 PREDICTIONS WITH SPREAD CONFIDENCE")
        print("=" * 60)
        print("🔧 Includes probability calibration to reduce overconfidence")
        print("📊 Spread confidence based on prediction alignment")
        
        all_predictions = []
        
        for i, game in enumerate(self.week1_games, 1):
            away = game['away']
            home = game['home']
            
            print(f"\n{'='*50}")
            print(f"🎮 GAME {i}: {away} @ {home}")
            if game['note']:
                print(f"📝 {game['note']}")
            print(f"{'='*50}")
            
            try:
                # Get raw predictions
                prediction = self.engine.predict_game(away, home, week=1)
                
                # Extract raw probabilities
                raw_win_prob = prediction['predictions']['home_win']['probability']
                raw_spread_prob = prediction['predictions']['spread_cover']['probability']
                
                # Calibrate probabilities
                calibrated_win_prob = self.calibrate_probability(raw_win_prob, 0.6)
                calibrated_spread_prob = self.calibrate_probability(raw_spread_prob, 0.7)
                
                # Determine winners
                predicted_winner = home if calibrated_win_prob > 0.5 else away
                spread_covers = "Home covers" if calibrated_spread_prob > 0.5 else "Away covers"
                
                # Calculate confidence scores
                win_confidence = abs(calibrated_win_prob - 0.5) * 2 * 100
                spread_confidence = self.calculate_spread_confidence(calibrated_spread_prob, calibrated_win_prob)
                
                # Estimate point spread
                estimated_spread = self.estimate_point_spread(calibrated_win_prob)
                
                print(f"\n🎯 WIN/LOSS PREDICTION:")
                print(f"   Winner: {predicted_winner}")
                print(f"   Probability: {calibrated_win_prob:.1%}")
                print(f"   Confidence: {win_confidence:.1f}%")
                print(f"   Raw vs Calibrated: {raw_win_prob:.1%} → {calibrated_win_prob:.1%}")
                
                print(f"\n📊 SPREAD PREDICTION:")
                print(f"   Estimated Spread: {home} {estimated_spread:+.1f}")
                print(f"   {spread_covers} ({calibrated_spread_prob:.1%})")
                print(f"   Spread Confidence: {spread_confidence:.1f}%")
                print(f"   Raw vs Calibrated: {raw_spread_prob:.1%} → {calibrated_spread_prob:.1%}")
                
                # Overall game assessment
                print(f"\n💡 GAME ASSESSMENT:")
                avg_confidence = (win_confidence + spread_confidence) / 2
                
                if avg_confidence >= 70:
                    assessment = "🔥 HIGH CONFIDENCE"
                elif avg_confidence >= 55:
                    assessment = "📈 MODERATE CONFIDENCE"
                else:
                    assessment = "⚖️ LOW CONFIDENCE (Close Game)"
                
                print(f"   Overall Assessment: {assessment}")
                print(f"   Average Confidence: {avg_confidence:.1f}%")
                
                # Betting recommendation
                if win_confidence >= 65 and spread_confidence >= 65:
                    recommendation = "🎯 STRONG BET CANDIDATE"
                elif win_confidence >= 55 or spread_confidence >= 55:
                    recommendation = "👀 MONITOR FOR VALUE"
                else:
                    recommendation = "❌ PASS - Too Uncertain"
                
                print(f"   Betting Recommendation: {recommendation}")
                
                # Store results
                all_predictions.append({
                    'game': f"{away} @ {home}",
                    'predicted_winner': predicted_winner,
                    'win_probability': calibrated_win_prob,
                    'win_confidence': win_confidence,
                    'estimated_spread': estimated_spread,
                    'spread_covers': spread_covers,
                    'spread_probability': calibrated_spread_prob,
                    'spread_confidence': spread_confidence,
                    'overall_confidence': avg_confidence,
                    'assessment': assessment,
                    'recommendation': recommendation,
                    'calibration_applied': True
                })
                
            except Exception as e:
                print(f"   ❌ Prediction failed: {e}")
                continue
        
        return all_predictions

    def analyze_confidence_distribution(self, predictions):
        """Analyze the distribution of confidence scores"""
        print(f"\n📊 CONFIDENCE ANALYSIS")
        print("=" * 25)
        
        win_confidences = [p['win_confidence'] for p in predictions]
        spread_confidences = [p['spread_confidence'] for p in predictions]
        
        print(f"WIN PREDICTION CONFIDENCE:")
        print(f"   Average: {np.mean(win_confidences):.1f}%")
        print(f"   Range: {min(win_confidences):.1f}% - {max(win_confidences):.1f}%")
        print(f"   High Confidence (>65%): {sum(1 for c in win_confidences if c > 65)}/16 games")
        
        print(f"\nSPREAD PREDICTION CONFIDENCE:")
        print(f"   Average: {np.mean(spread_confidences):.1f}%")
        print(f"   Range: {min(spread_confidences):.1f}% - {max(spread_confidences):.1f}%")
        print(f"   High Confidence (>65%): {sum(1 for c in spread_confidences if c > 65)}/16 games")
        
        # Best bets
        strong_bets = [p for p in predictions if "STRONG BET" in p['recommendation']]
        monitor_bets = [p for p in predictions if "MONITOR" in p['recommendation']]
        
        print(f"\n🎯 BETTING OPPORTUNITIES:")
        print(f"   Strong Bet Candidates: {len(strong_bets)}/16")
        print(f"   Monitor for Value: {len(monitor_bets)}/16")
        print(f"   Pass (Too Uncertain): {16 - len(strong_bets) - len(monitor_bets)}/16")
        
        if strong_bets:
            print(f"\n🔥 TOP STRONG BET CANDIDATES:")
            for bet in sorted(strong_bets, key=lambda x: x['overall_confidence'], reverse=True):
                print(f"   {bet['game']}: {bet['predicted_winner']} ({bet['overall_confidence']:.1f}% confidence)")

def main():
    """Run enhanced predictions with spread confidence"""
    predictor = EnhancedSpreadPredictor()
    
    # Generate enhanced predictions
    predictions = predictor.get_realistic_predictions()
    
    # Analyze confidence distribution
    predictor.analyze_confidence_distribution(predictions)
    
    # Save results
    results = {
        "generated_date": datetime.now().isoformat(),
        "week": 1,
        "season": 2025,
        "calibration_applied": True,
        "confidence_factor": 0.6,
        "total_games": len(predictions),
        "predictions": predictions,
        "summary": {
            "avg_win_confidence": np.mean([p['win_confidence'] for p in predictions]),
            "avg_spread_confidence": np.mean([p['spread_confidence'] for p in predictions]),
            "strong_bets": len([p for p in predictions if "STRONG BET" in p['recommendation']]),
            "monitor_bets": len([p for p in predictions if "MONITOR" in p['recommendation']]),
            "high_confidence_games": len([p for p in predictions if p['overall_confidence'] > 65])
        }
    }
    
    with open('data/current/enhanced_week1_predictions.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Enhanced predictions saved to: data/current/enhanced_week1_predictions.json")
    
    print(f"\n🎯 KEY IMPROVEMENTS:")
    print("=" * 20)
    print("✅ Probability calibration reduces overconfidence")
    print("✅ Spread confidence based on prediction alignment") 
    print("✅ More realistic win probabilities (closer to 50/50)")
    print("✅ Separate confidence for wins vs spreads")
    print("✅ Better betting recommendations")

if __name__ == "__main__":
    main() 