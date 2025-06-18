import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExampleAnalyzer {
    constructor() {
        this.analyticsResultsPath = path.join(__dirname, '../data/advanced-analytics-results.json');
        this.edgeOpportunitiesPath = path.join(__dirname, '../data/edge-opportunities.json');
    }

    showRealExamples() {
        try {
            console.log('🔍 REAL EXAMPLES FROM OUR DATA\n');
            console.log('Let me show you exactly what our predictions look like...\n');

            const results = JSON.parse(fs.readFileSync(this.analyticsResultsPath, 'utf8'));
            const opportunities = JSON.parse(fs.readFileSync(this.edgeOpportunitiesPath, 'utf8'));

            // Show the #1 highest edge opportunity
            this.showDetailedExample(opportunities.tier1[0]);
            
            // Show a moderate example
            this.showDetailedExample(opportunities.tier2[0]);
            
            // Show what a "no bet" looks like
            const noBetExample = results.results.find(r => r.tier === 'no_bet');
            if (noBetExample) {
                this.showDetailedExample(noBetExample);
            }

            // Show validation methodology
            this.explainValidation();

        } catch (error) {
            console.error('❌ Error showing examples:', error.message);
        }
    }

    showDetailedExample(example) {
        console.log('=' .repeat(60));
        console.log(`🎯 EXAMPLE: ${example.matchup} (${example.date})`);
        console.log('=' .repeat(60));

        // Basic game info
        console.log('\n📊 GAME INFORMATION:');
        console.log(`Date: ${example.date}`);
        console.log(`Teams: ${example.matchup}`);
        
        // What Vegas thought
        console.log('\n🎰 VEGAS BETTING LINES:');
        console.log(`Spread: ${example.baseAnalysis.spread.closing} (home team)`);
        console.log(`Total: ${example.baseAnalysis.total.closing}`);
        
        // Our analysis
        console.log('\n🔍 OUR ANALYSIS:');
        
        // Weather factor
        if (example.adjustments.weather.impact !== 'none') {
            console.log(`Weather Impact: ${example.adjustments.weather.impact}`);
            console.log(`  - Spread adjustment: ${example.adjustments.weather.spread} points`);
            console.log(`  - Total adjustment: ${example.adjustments.weather.total} points`);
            if (example.adjustments.weather.factors) {
                console.log(`  - Factors: ${example.adjustments.weather.factors.join(', ')}`);
            }
        }
        
        // Injury factor
        if (example.adjustments.injuries.impact !== 'none') {
            console.log(`Injury Impact: ${example.adjustments.injuries.impact}`);
            console.log(`  - Spread adjustment: ${example.adjustments.injuries.spread} points`);
            console.log(`  - Total adjustment: ${example.adjustments.injuries.total} points`);
            if (example.adjustments.injuries.qbInjuries?.home || example.adjustments.injuries.qbInjuries?.away) {
                console.log(`  - QB Injury detected!`);
            }
        }
        
        // Team strength factor
        if (example.adjustments.teamStrength.impact !== 'none') {
            console.log(`Team Strength Impact: ${example.adjustments.teamStrength.impact}`);
            console.log(`  - Strength differential: ${example.adjustments.teamStrength.strengthDifferential} points`);
            console.log(`  - Spread adjustment: ${example.adjustments.teamStrength.spread} points`);
            console.log(`  - Total adjustment: ${example.adjustments.teamStrength.total} points`);
        }

        // Our prediction
        console.log('\n🎯 OUR PREDICTION:');
        console.log(`Predicted Spread: ${example.finalPrediction.predictedSpread}`);
        console.log(`Predicted Total: ${example.finalPrediction.predictedTotal}`);
        console.log(`Confidence Level: ${Math.round(example.confidence * 100)}%`);
        
        // The edge
        console.log('\n💰 THE BETTING EDGE:');
        console.log(`Spread Edge: ${example.edge.spread} points`);
        console.log(`Total Edge: ${example.edge.total} points`);
        console.log(`Best Bet: ${example.edge.type.toUpperCase()} (${example.edge.maxEdge} point edge)`);
        
        // Recommendation
        console.log('\n📋 RECOMMENDATION:');
        console.log(`Tier: ${example.tier.toUpperCase()}`);
        console.log(`Action: ${example.recommendation.action}`);
        console.log(`Bet Size: ${example.recommendation.betSize}`);
        console.log(`Expected ROI: ${example.recommendation.expectedROI}`);
        
        // Key factors
        console.log('\n🔑 KEY FACTORS:');
        example.factors.forEach(factor => {
            console.log(`  • ${factor}`);
        });

        // What this means in plain English
        console.log('\n🗣️ IN PLAIN ENGLISH:');
        this.explainInPlainEnglish(example);
        
        console.log('\n');
    }

    explainInPlainEnglish(example) {
        const vegasSpread = example.baseAnalysis.spread.closing;
        const ourSpread = example.finalPrediction.predictedSpread;
        const vegasTotal = example.baseAnalysis.total.closing;
        const ourTotal = example.finalPrediction.predictedTotal;
        
        if (example.edge.type === 'spread') {
            if (Math.abs(ourSpread) > Math.abs(vegasSpread)) {
                console.log(`"We think the favorite should win by MORE than Vegas thinks."`);
                console.log(`"Vegas says ${Math.abs(vegasSpread)} points, we say ${Math.abs(ourSpread)} points."`);
                console.log(`"Bet the FAVORITE to cover the spread."`);
            } else {
                console.log(`"We think the game will be CLOSER than Vegas thinks."`);
                console.log(`"Vegas says ${Math.abs(vegasSpread)} points, we say ${Math.abs(ourSpread)} points."`);
                console.log(`"Bet the UNDERDOG to cover the spread."`);
            }
        } else {
            if (ourTotal < vegasTotal) {
                console.log(`"We think this game will be LOWER scoring than Vegas thinks."`);
                console.log(`"Vegas says ${vegasTotal} total points, we say ${ourTotal} total points."`);
                console.log(`"Bet the UNDER."`);
            } else {
                console.log(`"We think this game will be HIGHER scoring than Vegas thinks."`);
                console.log(`"Vegas says ${vegasTotal} total points, we say ${ourTotal} total points."`);
                console.log(`"Bet the OVER."`);
            }
        }
        
        console.log(`"We're ${Math.round(example.confidence * 100)}% confident in this analysis."`);
    }

    explainValidation() {
        console.log('=' .repeat(60));
        console.log('🔬 HOW DO WE KNOW IF THIS ACTUALLY WORKS?');
        console.log('=' .repeat(60));
        
        console.log('\n📊 WHAT WE HAVE:');
        console.log('• Historical data from 2,956 games (2011-2021)');
        console.log('• Patterns showing injuries + weather = predictable outcomes');
        console.log('• Mathematical relationships (QB injuries move lines 4-7 points)');
        console.log('• Large sample size for statistical significance');
        
        console.log('\n❌ WHAT WE DON\'T HAVE:');
        console.log('• Real money betting results');
        console.log('• Current season validation (data is 2011-2021)');
        console.log('• Proof that Vegas hasn\'t adapted to these patterns');
        
        console.log('\n🧪 HOW TO VALIDATE:');
        console.log('1. PAPER TRADE: Track predictions for 2 weeks without betting');
        console.log('2. SMALL BETS: Test with $5-10 bets on highest confidence picks');
        console.log('3. MEASURE RESULTS: Do Tier 1 picks actually win 85%+ of the time?');
        console.log('4. COMPARE TO RANDOM: Are we better than coin flips?');
        
        console.log('\n🎯 SUCCESS CRITERIA:');
        console.log('• Tier 1 picks win 70%+ (vs projected 85-95%)');
        console.log('• Overall profit after 20+ bets');
        console.log('• High-confidence picks outperform low-confidence picks');
        console.log('• Patterns match historical expectations');
        
        console.log('\n🚨 FAILURE CRITERIA:');
        console.log('• Win rate below 55% for 2+ weeks');
        console.log('• Tier 1 picks performing like Tier 3');
        console.log('• Consistent losses on high-confidence bets');
        console.log('• No correlation between confidence and results');
        
        console.log('\n💡 BOTTOM LINE:');
        console.log('This is a TOOL for finding potential edges, not a guarantee.');
        console.log('We need to test it carefully before betting serious money.');
        console.log('The historical patterns are real - but will they continue?');
    }
}

// Main execution
async function main() {
    const analyzer = new ExampleAnalyzer();
    analyzer.showRealExamples();
}

main(); 